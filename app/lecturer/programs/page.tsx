"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardShell, type NavItem } from "@/components/layout/DashboardShell";
import { PageHeader, PageLoader, EmptyState } from "@/components/dashboard";
import { createSupabaseBrowserClient } from "@/utils/supabase-browser";
import {
  Home, BookOpen, Users, FileText, ClipboardList, Calendar, Settings, CheckSquare
} from "lucide-react";
import Link from "next/link";
import type { Program } from "@/types/database";

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

interface ProgramWithStats extends Program {
  _count?: {
    lessons: number;
    students: number;
  };
}

export default function LecturerProgramsPage() {
  const { profile, isLoading, signOut } = useAuth("lecturer");
  const [programs, setPrograms] = useState<ProgramWithStats[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (profile) fetchPrograms();
  }, [profile]);

  const fetchPrograms = async () => {
    if (!profile) return;
    const supabase = createSupabaseBrowserClient();

    const { data: programLinks } = await supabase
      .from("program_lecturers")
      .select("program_id, is_lead, program:programs(*)")
      .eq("lecturer_id", profile.id);

    // Handle Supabase join which may return array or single object
    const programs = programLinks?.map((p: { program: Program | Program[]; is_lead: boolean }) => {
      const prog = Array.isArray(p.program) ? p.program[0] : p.program;
      return prog ? { ...prog, is_lead: p.is_lead } : null;
    }).filter(Boolean) as ProgramWithStats[] || [];

    setPrograms(programs);
    setDataLoading(false);
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
        title="My Programs"
        description="Programs you are assigned to teach"
      />

      {dataLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl border p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : programs.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No programs assigned"
          description="You haven't been assigned to any programs yet. Contact an administrator to get started."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {programs.map((program) => (
            <Link
              key={program.id}
              href={`/lecturer/programs/${program.id}`}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg group-hover:text-purple-600 transition-colors">
                    {program.name}
                  </h3>
                  <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                    (program as ProgramWithStats & { is_lead?: boolean }).is_lead
                      ? "bg-purple-100 text-purple-700"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {(program as ProgramWithStats & { is_lead?: boolean }).is_lead ? "Lead Lecturer" : "Lecturer"}
                  </span>
                </div>
                <div className="p-2 bg-purple-50 rounded-lg">
                  <BookOpen size={20} className="text-purple-600" />
                </div>
              </div>
              
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                {program.short_description || "No description available"}
              </p>

              <div className="flex items-center gap-4 text-sm text-gray-400 border-t pt-4">
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {program.duration || "TBD"}
                </span>
                <span className="capitalize">{program.level}</span>
                <span>{program.delivery_mode}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
