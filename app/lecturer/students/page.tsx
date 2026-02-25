"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardShell, type NavItem } from "@/components/layout/DashboardShell";
import { DataTable, StatCard, StatusBadge, PageHeader, PageLoader, EmptyState } from "@/components/dashboard";
import { SearchInput, Select, Tabs } from "@/components/dashboard/FormComponents";
import { createSupabaseBrowserClient } from "@/utils/supabase-browser";
import {
  Home, BookOpen, Users, FileText, ClipboardList, Calendar, Settings, CheckSquare,
  GraduationCap, Clock, CheckCircle
} from "lucide-react";
import type { Profile, Enrollment, Cohort, Program } from "@/types/database";

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

interface StudentWithEnrollment {
  student: Profile;
  enrollment: Enrollment;
  cohort?: Cohort;
  program?: Program;
}

export default function LecturerStudentsPage() {
  const { profile, isLoading, signOut } = useAuth("lecturer");
  const [students, setStudents] = useState<StudentWithEnrollment[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [search, setSearch] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchData();
    }
  }, [profile]);

  const fetchData = async () => {
    if (!profile) return;
    const supabase = createSupabaseBrowserClient();

    // Fetch programs
    const { data: programLinks } = await supabase
      .from("program_lecturers")
      .select("program:programs(id, name)")
      .eq("lecturer_id", profile.id);

    // Handle Supabase join which may return array or single object
    const progs = programLinks?.map((p: { program: Program | Program[] }) => {
      return Array.isArray(p.program) ? p.program[0] : p.program;
    }).filter(Boolean) as Program[] || [];
    setPrograms(progs);
    const programIds = progs.map((p) => p.id);

    if (programIds.length > 0) {
      // Fetch enrollments (without joins)
      const { data: enrollmentsRaw } = await supabase
        .from("enrollments")
        .select("*")
        .in("program_id", programIds);

      if (enrollmentsRaw && enrollmentsRaw.length > 0) {
        type EnrollmentRow = { user_id: string; cohort_id: string; program_id: string };
        const userIds = [...new Set(enrollmentsRaw.map((e: EnrollmentRow) => e.user_id).filter(Boolean))];
        const cohortIds = [...new Set(enrollmentsRaw.map((e: EnrollmentRow) => e.cohort_id).filter(Boolean))];
        const enrollmentProgramIds = [...new Set(enrollmentsRaw.map((e: EnrollmentRow) => e.program_id).filter(Boolean))];

        const [profilesResult, cohortsResult, programsResult] = await Promise.all([
          userIds.length > 0 ? supabase.from("profiles").select("id, full_name, email, phone, avatar_url").in("id", userIds) : Promise.resolve({ data: [] }),
          cohortIds.length > 0 ? supabase.from("cohorts").select("id, name").in("id", cohortIds) : Promise.resolve({ data: [] }),
          enrollmentProgramIds.length > 0 ? supabase.from("programs").select("id, name").in("id", enrollmentProgramIds) : Promise.resolve({ data: [] }),
        ]);

        type AnyRecord = { id: string };
        const profilesMap = new Map((profilesResult.data || []).map((p: AnyRecord) => [p.id, p]));
        const cohortsMap = new Map((cohortsResult.data || []).map((c: AnyRecord) => [c.id, c]));
        const programsMap = new Map((programsResult.data || []).map((p: AnyRecord) => [p.id, p]));

        const studentData: StudentWithEnrollment[] = enrollmentsRaw.map((e: EnrollmentRow & Record<string, unknown>) => ({
          student: (profilesMap.get(e.user_id) || null) as Profile,
          enrollment: e,
          cohort: (cohortsMap.get(e.cohort_id) || null) as Cohort,
          program: (programsMap.get(e.program_id) || null) as Program,
        }));

        setStudents(studentData);
      }
    }

    setDataLoading(false);
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.student?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.student?.email?.toLowerCase().includes(search.toLowerCase());
    const matchesProgram = !selectedProgram || s.enrollment.program_id === selectedProgram;
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "approved" && s.enrollment.status === "approved") ||
      (activeTab === "completed" && s.enrollment.status === "completed");
    return matchesSearch && matchesProgram && matchesTab;
  });

  const stats = {
    total: students.length,
    active: students.filter((s) => s.enrollment.status === "approved").length,
    completed: students.filter((s) => s.enrollment.status === "completed").length,
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
        title="Students"
        description="View and manage students enrolled in your programs"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatCard
          title="Total Students"
          value={stats.total}
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Active"
          value={stats.active}
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={CheckCircle}
          color="green"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <SearchInput value={search} onChange={setSearch} placeholder="Search students..." />
        </div>
        <div className="w-full sm:w-64">
          <Select
            id="program-filter"
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            options={[
              { value: "", label: "All Programs" },
              ...programs.map((p) => ({ value: p.id, label: p.name })),
            ]}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <Tabs
          tabs={[
            { id: "all", label: "All", count: stats.total },
            { id: "active", label: "Active", count: stats.active },
            { id: "completed", label: "Completed", count: stats.completed },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {filteredStudents.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No students found"
          description={students.length === 0 
            ? "No students enrolled in your programs yet." 
            : "No students match your search criteria."}
        />
      ) : (
        <DataTable
          loading={dataLoading}
          columns={[
            {
              key: "student",
              label: "Student",
              render: (item: StudentWithEnrollment) => (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    {item.student?.avatar_url ? (
                      <img
                        src={item.student.avatar_url}
                        alt={item.student.full_name || ""}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <GraduationCap size={18} className="text-purple-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.student?.full_name}</p>
                    <p className="text-xs text-gray-500">{item.student?.email}</p>
                  </div>
                </div>
              ),
            },
            {
              key: "program",
              label: "Program",
              render: (item: StudentWithEnrollment) => (
                <span className="text-sm">{item.program?.name}</span>
              ),
            },
            {
              key: "cohort",
              label: "Cohort",
              render: (item: StudentWithEnrollment) => (
                <span className="text-sm">{item.cohort?.name || "-"}</span>
              ),
            },
            {
              key: "enrolled",
              label: "Enrolled",
              render: (item: StudentWithEnrollment) => (
                <span className="text-sm text-gray-600">
                  {new Date(item.enrollment.created_at).toLocaleDateString()}
                </span>
              ),
            },
            {
              key: "progress",
              label: "Progress",
              render: (item: StudentWithEnrollment) => (
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500"
                      style={{ width: `${item.enrollment.progress_percentage || 0}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600">{item.enrollment.progress_percentage || 0}%</span>
                </div>
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (item: StudentWithEnrollment) => (
                <StatusBadge status={item.enrollment.status} />
              ),
            },
          ]}
          data={filteredStudents}
        />
      )}
    </DashboardShell>
  );
}
