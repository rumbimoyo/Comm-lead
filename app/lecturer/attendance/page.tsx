"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardShell, type NavItem } from "@/components/layout/DashboardShell";
import { StatCard, PageHeader, PageLoader, EmptyState } from "@/components/dashboard";
import { Button, Select, FormField } from "@/components/dashboard/FormComponents";
import { createSupabaseBrowserClient } from "@/utils/supabase-browser";
import {
  Home, BookOpen, Users, FileText, ClipboardList, Calendar, Settings, CheckSquare,
  Check, X, Clock, UserCheck, UserX, AlertCircle, Save
} from "lucide-react";
import type { Profile, Cohort, Program, Attendance } from "@/types/database";
import { motion } from "framer-motion";

const lecturerNavigation: NavItem[] = [
  { href: "/lecturer", label: "Dashboard", icon: Home },
  { href: "/lecturer/programs", label: "My Programs", icon: BookOpen },
  { href: "/lecturer/lessons", label: "Lessons", icon: FileText },
  { href: "/lecturer/assignments", label: "Assignments", icon: ClipboardList },
  { href: "/lecturer/students", label: "Students", icon: Users },
  { href: "/lecturer/attendance", label: "Attendance", icon: Calendar },
  { href: "/lecturer/submissions", label: "Submissions", icon: CheckSquare },
  { href: "/lecturer/settings", label: "Settings", icon: Settings },
];

interface StudentAttendance {
  student: Profile;
  attendance?: Attendance;
  status: "present" | "absent" | "late" | "excused" | null;
}

export default function LecturerAttendancePage() {
  const { profile, isLoading, signOut } = useAuth("lecturer");
  const [programs, setPrograms] = useState<Program[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedCohort, setSelectedCohort] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (profile) {
      fetchPrograms();
    }
  }, [profile]);

  useEffect(() => {
    if (selectedCohort && selectedDate) {
      fetchStudents();
    }
  }, [selectedCohort, selectedDate]);

  const fetchPrograms = async () => {
    if (!profile) return;
    const supabase = createSupabaseBrowserClient();

    const { data: programLinks } = await supabase
      .from("program_lecturers")
      .select("program:programs(id, name)")
      .eq("lecturer_id", profile.id);

    // Handle Supabase join which may return array or single object
    const progs = programLinks?.map((p: { program: Program | Program[] }) => {
      return Array.isArray(p.program) ? p.program[0] : p.program;
    }).filter(Boolean) as Program[] || [];
    setPrograms(progs);
    
    if (progs.length > 0) {
      setSelectedProgram(progs[0].id);
      // Fetch cohorts for first program
      const { data: cohortData } = await supabase
        .from("cohorts")
        .select("*")
        .eq("program_id", progs[0].id)
        .eq("is_active", true);
      setCohorts(cohortData || []);
      if (cohortData && cohortData.length > 0) {
        setSelectedCohort(cohortData[0].id);
      }
    }
    setDataLoading(false);
  };

  const handleProgramChange = async (programId: string) => {
    setSelectedProgram(programId);
    setSelectedCohort("");
    setStudents([]);
    
    const supabase = createSupabaseBrowserClient();
    const { data: cohortData } = await supabase
      .from("cohorts")
      .select("*")
      .eq("program_id", programId)
      .eq("is_active", true);
    setCohorts(cohortData || []);
    if (cohortData && cohortData.length > 0) {
      setSelectedCohort(cohortData[0].id);
    }
  };

  const fetchStudents = async () => {
    if (!selectedCohort || !profile) return;
    setDataLoading(true);
    const supabase = createSupabaseBrowserClient();

    // Get enrolled students (without joins)
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("user_id")
      .eq("cohort_id", selectedCohort)
      .eq("status", "approved");

    type EnrollmentRow = { user_id: string };
    const userIds = (enrollments || []).map((e: EnrollmentRow) => e.user_id).filter(Boolean);

    if (userIds.length === 0) {
      setStudents([]);
      setDataLoading(false);
      return;
    }

    // Fetch profiles for these students
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url")
      .in("id", userIds);

    type ProfileRow = { id: string; full_name: string; email: string; avatar_url: string };
    const studentIds = (profiles || []).map((p: ProfileRow) => p.id);

    // Fetch attendance records for this date
    const { data: attendanceRecords } = await supabase
      .from("attendance")
      .select("*")
      .eq("session_date", selectedDate)
      .eq("cohort_id", selectedCohort)
      .in("student_id", studentIds);

    const attendanceMap = new Map(attendanceRecords?.map((a: { student_id: string; status: string; id: string }) => [a.student_id, a]));

    const studentData: StudentAttendance[] = (profiles || []).map((student: ProfileRow) => {
      const attendance = attendanceMap.get(student.id) as { status: string; id?: string } | undefined;
      return {
        student: student as Profile,
        attendance,
        status: attendance?.status || null,
      };
    });

    setStudents(studentData);
    setHasChanges(false);
    setDataLoading(false);
  };

  const updateStatus = (studentId: string, status: StudentAttendance["status"]) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.student.id === studentId ? { ...s, status } : s
      )
    );
    setHasChanges(true);
  };

  const markAll = (status: StudentAttendance["status"]) => {
    setStudents((prev) => prev.map((s) => ({ ...s, status })));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!profile || !selectedCohort) return;
    setSaving(true);
    const supabase = createSupabaseBrowserClient();

    for (const s of students) {
      if (s.status) {
        const data = {
          student_id: s.student.id,
          cohort_id: selectedCohort,
          session_date: selectedDate,
          status: s.status,
          marked_by: profile.id,
        };

        if (s.attendance?.id) {
          await supabase.from("attendance").update(data).eq("id", s.attendance.id);
        } else {
          await supabase.from("attendance").insert(data);
        }
      }
    }

    setSaving(false);
    setHasChanges(false);
    fetchStudents(); // Refresh
  };

  const stats = {
    present: students.filter((s) => s.status === "present").length,
    absent: students.filter((s) => s.status === "absent").length,
    late: students.filter((s) => s.status === "late").length,
    unmarked: students.filter((s) => !s.status).length,
  };

  if (isLoading) return <PageLoader />;

  return (
    <DashboardShell
      profile={profile}
      navigation={lecturerNavigation}
      title="Lecturer Portal"
      accentColor="#9333EA"
      onSignOut={signOut}
    >
      <PageHeader
        title="Attendance"
        description="Mark and manage student attendance"
        actions={
          hasChanges ? (
            <Button onClick={handleSave} loading={saving}>
              <Save size={16} /> Save Attendance
            </Button>
          ) : undefined
        }
      />

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Program" id="program">
            <Select
              id="program"
              value={selectedProgram}
              onChange={(e) => handleProgramChange(e.target.value)}
              options={programs.map((p) => ({ value: p.id, label: p.name }))}
            />
          </FormField>
          <FormField label="Cohort" id="cohort">
            <Select
              id="cohort"
              value={selectedCohort}
              onChange={(e) => setSelectedCohort(e.target.value)}
              options={cohorts.map((c) => ({ value: c.id, label: c.name }))}
              disabled={cohorts.length === 0}
            />
          </FormField>
          <FormField label="Date" id="date">
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </FormField>
        </div>
      </div>

      {programs.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No programs assigned"
          description="You need to be assigned to a program to mark attendance."
        />
      ) : cohorts.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No active cohorts"
          description="No active cohorts found for this program."
        />
      ) : students.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No students enrolled"
          description="No students are enrolled in this cohort yet."
        />
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Present"
              value={stats.present}
              icon={UserCheck}
              color="green"
            />
            <StatCard
              title="Absent"
              value={stats.absent}
              icon={UserX}
              color="red"
            />
            <StatCard
              title="Late"
              value={stats.late}
              icon={Clock}
              color="yellow"
            />
            <StatCard
              title="Unmarked"
              value={stats.unmarked}
              icon={AlertCircle}
              color="gray"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 mb-6">
            <Button size="sm" variant="secondary" onClick={() => markAll("present")}>
              <Check size={14} /> Mark All Present
            </Button>
            <Button size="sm" variant="secondary" onClick={() => markAll("absent")}>
              <X size={14} /> Mark All Absent
            </Button>
          </div>

          {/* Student List */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {students.map((s, idx) => (
                <motion.div
                  key={s.student.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="flex items-center justify-between p-4 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      {s.student?.avatar_url ? (
                        <img
                          src={s.student.avatar_url}
                          alt={s.student.full_name || ""}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium text-purple-600">
                          {s.student?.full_name?.charAt(0) || "?"}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{s.student?.full_name}</p>
                      <p className="text-xs text-gray-500">{s.student?.email}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {(["present", "late", "absent", "excused"] as const).map((status) => {
                      const isActive = s.status === status;
                      const colors = {
                        present: isActive ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-green-100",
                        late: isActive ? "bg-yellow-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-yellow-100",
                        absent: isActive ? "bg-red-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-red-100",
                        excused: isActive ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-blue-100",
                      };
                      const labels = { present: "P", late: "L", absent: "A", excused: "E" };
                      return (
                        <button
                          key={status}
                          onClick={() => updateStatus(s.student.id, status)}
                          className={`w-10 h-10 rounded-lg font-medium text-sm transition-colors ${colors[status]}`}
                          title={status.charAt(0).toUpperCase() + status.slice(1)}
                        >
                          {labels[status]}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-green-500" /> Present (P)
            </span>
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-yellow-500" /> Late (L)
            </span>
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-red-500" /> Absent (A)
            </span>
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-blue-500" /> Excused (E)
            </span>
          </div>
        </>
      )}
    </DashboardShell>
  );
}
