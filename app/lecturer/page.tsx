"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardShell, type NavItem } from "@/components/layout/DashboardShell";
import { StatCard, DataTable, PageHeader, PageLoader } from "@/components/dashboard";
import { createSupabaseBrowserClient } from "@/utils/supabase-browser";
import {
  Home, BookOpen, Users, FileText, ClipboardList, Calendar,
  Settings, MessageSquare, CheckSquare
} from "lucide-react";
import Link from "next/link";
import type { Program, Cohort, Enrollment, Profile } from "@/types/database";

const lecturerNavigation: NavItem[] = [
  { href: "/lecturer", label: "Dashboard", icon: Home },
  { href: "/lecturer/programs", label: "My Programs", icon: BookOpen },
  { href: "/lecturer/cohorts", label: "My Cohorts", icon: Calendar },
  { href: "/lecturer/lessons", label: "Lessons", icon: FileText },
  { href: "/lecturer/assignments", label: "Assignments", icon: ClipboardList },
  { href: "/lecturer/students", label: "Students", icon: Users },
  { href: "/lecturer/attendance", label: "Attendance", icon: Calendar },
  { href: "/lecturer/submissions", label: "Submissions", icon: CheckSquare },
  { href: "/lecturer/settings", label: "Settings", icon: Settings },
];

interface DashboardStats {
  totalPrograms: number;
  totalStudents: number;
  pendingSubmissions: number;
  upcomingClasses: number;
}

interface RecentStudent {
  id: string;
  user?: Profile;
  program?: Program;
  enrolled_at: string;
}

export default function LecturerDashboardPage() {
  const { profile, isLoading, signOut } = useAuth("lecturer");
  const [stats, setStats] = useState<DashboardStats>({
    totalPrograms: 0,
    totalStudents: 0,
    pendingSubmissions: 0,
    upcomingClasses: 0,
  });
  const [recentStudents, setRecentStudents] = useState<RecentStudent[]>([]);
  const [myPrograms, setMyPrograms] = useState<Program[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchDashboardData();
    }
  }, [profile]);

  const fetchDashboardData = async () => {
    if (!profile) return;
    const supabase = createSupabaseBrowserClient();

    // Fetch programs assigned to this lecturer
    const { data: programLinks } = await supabase
      .from("program_lecturers")
      .select("program_id, program:programs(*)")
      .eq("lecturer_id", profile.id);

    const programIds = programLinks?.map((p: { program_id: string }) => p.program_id) || [];
    // Handle Supabase join which may return array or single object
    const programs = programLinks?.map((p: { program_id: string; program: Program | Program[] }) => {
      const prog = p.program;
      return Array.isArray(prog) ? prog[0] : prog;
    }).filter(Boolean) as Program[] || [];
    setMyPrograms(programs);

    if (programIds.length > 0) {
      // Fetch enrollments first (without joins)
      const { data: enrollmentsRaw, count: studentCount } = await supabase
        .from("enrollments")
        .select("id, enrolled_at, user_id, program_id", { count: "exact" })
        .in("program_id", programIds)
        .eq("status", "approved")
        .order("enrolled_at", { ascending: false })
        .limit(5);

      // Fetch pending submissions
      const { count: pendingCount } = await supabase
        .from("assignment_submissions")
        .select("*", { count: "exact", head: true })
        .eq("status", "submitted");

      setStats({
        totalPrograms: programs.length,
        totalStudents: studentCount || 0,
        pendingSubmissions: pendingCount || 0,
        upcomingClasses: 0, // TODO: Calculate from schedule
      });

      // Enrich enrollments with user and program data
      if (enrollmentsRaw && enrollmentsRaw.length > 0) {
        type EnrollmentRow = { id: string; enrolled_at: string; user_id: string; program_id: string };
        const userIds = [...new Set(enrollmentsRaw.map((e: EnrollmentRow) => e.user_id).filter(Boolean))];
        const enrollmentProgramIds = [...new Set(enrollmentsRaw.map((e: EnrollmentRow) => e.program_id).filter(Boolean))];

        const [usersResult, programsResult] = await Promise.all([
          userIds.length > 0 ? supabase.from("profiles").select("id, full_name, email, avatar_url").in("id", userIds) : Promise.resolve({ data: [] }),
          enrollmentProgramIds.length > 0 ? supabase.from("programs").select("id, name").in("id", enrollmentProgramIds) : Promise.resolve({ data: [] }),
        ]);

        type ProfileRow = { id: string; full_name: string; email: string; avatar_url: string };
        type ProgramRow = { id: string; name: string };
        const usersMap = new Map((usersResult.data || []).map((u: ProfileRow) => [u.id, u]));
        const programsMap = new Map((programsResult.data || []).map((p: ProgramRow) => [p.id, p]));

        const recentStudentsData = enrollmentsRaw.map((e: EnrollmentRow) => ({
          id: e.id,
          enrolled_at: e.enrolled_at,
          user: usersMap.get(e.user_id) || null,
          program: programsMap.get(e.program_id) || null,
        })) as RecentStudent[];
        setRecentStudents(recentStudentsData);
      }
    }

    setDataLoading(false);
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <DashboardShell
      profile={profile}
      navigation={lecturerNavigation}
      title="Lecturer Portal"
      accentColor="#9333EA"
      onSignOut={signOut}
    >
      <PageHeader
        title={`Welcome, ${profile?.full_name?.split(" ")[0] || "Lecturer"}`}
        description="Manage your programs, lessons, and students."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="My Programs"
          value={stats.totalPrograms}
          icon={BookOpen}
          color="purple"
          loading={dataLoading}
        />
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={Users}
          color="blue"
          loading={dataLoading}
        />
        <StatCard
          title="Pending Reviews"
          value={stats.pendingSubmissions}
          icon={ClipboardList}
          color="gold"
          loading={dataLoading}
        />
        <StatCard
          title="This Week"
          value={`${stats.upcomingClasses} classes`}
          icon={Calendar}
          color="green"
          loading={dataLoading}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <Link
          href="/lecturer/lessons"
          className="bg-purple-50 border border-purple-200 rounded-xl p-4 hover:shadow-md transition-shadow flex items-center gap-4"
        >
          <div className="p-3 bg-purple-100 rounded-xl">
            <FileText size={24} className="text-purple-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Create New Lesson</p>
            <p className="text-sm text-gray-500">Add content to your programs</p>
          </div>
        </Link>

        <Link
          href="/lecturer/submissions"
          className="bg-amber-50 border border-amber-200 rounded-xl p-4 hover:shadow-md transition-shadow flex items-center gap-4"
        >
          <div className="p-3 bg-amber-100 rounded-xl">
            <CheckSquare size={24} className="text-amber-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{stats.pendingSubmissions} Submissions to Grade</p>
            <p className="text-sm text-gray-500">Review student work</p>
          </div>
        </Link>

        <Link
          href="/lecturer/attendance"
          className="bg-blue-50 border border-blue-200 rounded-xl p-4 hover:shadow-md transition-shadow flex items-center gap-4"
        >
          <div className="p-3 bg-blue-100 rounded-xl">
            <Calendar size={24} className="text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Mark Attendance</p>
            <p className="text-sm text-gray-500">Record today&apos;s session</p>
          </div>
        </Link>
      </div>

      {/* My Programs */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">My Programs</h2>
          <Link
            href="/lecturer/programs"
            className="text-sm text-purple-600 hover:underline font-medium"
          >
            View all
          </Link>
        </div>
        {myPrograms.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <BookOpen size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No programs assigned yet.</p>
            <p className="text-sm text-gray-400">Contact an admin to be assigned to a program.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myPrograms.slice(0, 3).map((program) => (
              <Link
                key={program.id}
                href={`/lecturer/programs/${program.id}`}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-gray-900 mb-1">{program.name}</h3>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                  {program.short_description}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="capitalize">{program.level}</span>
                  <span>•</span>
                  <span>{program.duration}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Students */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Students</h2>
          <Link
            href="/lecturer/students"
            className="text-sm text-purple-600 hover:underline font-medium"
          >
            View all
          </Link>
        </div>
        <DataTable
          loading={dataLoading}
          emptyMessage="No students enrolled in your programs yet"
          columns={[
            {
              key: "student",
              label: "Student",
              render: (item: RecentStudent) => (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold">
                    {item.user?.full_name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.user?.full_name || "Unknown"}</p>
                    <p className="text-xs text-gray-500">{item.user?.email}</p>
                  </div>
                </div>
              ),
            },
            {
              key: "program",
              label: "Program",
              render: (item: RecentStudent) => (
                <span className="text-sm">{item.program?.name || "N/A"}</span>
              ),
            },
            {
              key: "enrolled",
              label: "Enrolled",
              render: (item: RecentStudent) => (
                <span className="text-sm text-gray-500">
                  {item.enrolled_at ? new Date(item.enrolled_at).toLocaleDateString() : "-"}
                </span>
              ),
            },
          ]}
          data={recentStudents}
        />
      </div>
    </DashboardShell>
  );
}
