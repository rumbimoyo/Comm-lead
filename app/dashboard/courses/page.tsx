"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardShell, type NavItem } from "@/components/layout/DashboardShell";
import { StatCard, StatusBadge, PageHeader, PageLoader, EmptyState } from "@/components/dashboard";
import { Tabs, SearchInput } from "@/components/dashboard/FormComponents";
import { createSupabaseBrowserClient } from "@/utils/supabase-browser";
import {
  Home, BookOpen, FileText, ClipboardList, Award, User, TrendingUp,
  Clock, CheckCircle, Play, Calendar
} from "lucide-react";
import type { Enrollment, Program, Cohort } from "@/types/database";
import Link from "next/link";
import { motion } from "framer-motion";

const studentNavigation: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/courses", label: "My Courses", icon: BookOpen },
  { href: "/dashboard/lessons", label: "Lessons", icon: FileText },
  { href: "/dashboard/assignments", label: "Assignments", icon: ClipboardList },
  { href: "/dashboard/progress", label: "Progress", icon: TrendingUp },
  { href: "/dashboard/certificates", label: "Certificates", icon: Award },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

interface EnrollmentWithRelations extends Enrollment {
  program?: Program & { lessons_count?: number };
  cohort?: Cohort;
}

export default function StudentCoursesPage() {
  const { profile, isLoading, signOut } = useAuth("student");
  const [enrollments, setEnrollments] = useState<EnrollmentWithRelations[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchEnrollments();
    }
  }, [profile]);

  const fetchEnrollments = async () => {
    if (!profile) return;
    const supabase = createSupabaseBrowserClient();

    const { data: enrollmentData } = await supabase
      .from("enrollments")
      .select(`
        *,
        program:programs(id, name, slug, description, duration_weeks, cover_image_url),
        cohort:cohorts(id, name, start_date, end_date)
      `)
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false });

    setEnrollments((enrollmentData as EnrollmentWithRelations[]) || []);
    setDataLoading(false);
  };

  const filteredEnrollments = enrollments.filter((e) => {
    const matchesSearch = e.program?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "approved" && e.status === "approved") ||
      (activeTab === "completed" && e.status === "completed");
    return matchesSearch && matchesTab;
  });

  const stats = {
    total: enrollments.length,
    active: enrollments.filter((e) => e.status === "approved").length,
    completed: enrollments.filter((e) => e.status === "completed").length,
  };

  if (isLoading) return <PageLoader />;

  return (
    <DashboardShell
      profile={profile}
      navigation={studentNavigation}
      title="Student Portal"
      accentColor="#2563EB"
      onSignOut={signOut}
    >
      <PageHeader
        title="My Courses"
        description="View and continue your enrolled courses"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatCard
          title="Total Courses"
          value={stats.total}
          icon={BookOpen}
          color="blue"
        />
        <StatCard
          title="In Progress"
          value={stats.active}
          icon={Clock}
          color="yellow"
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={CheckCircle}
          color="green"
        />
      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchInput value={search} onChange={setSearch} placeholder="Search courses..." />
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <Tabs
          tabs={[
            { id: "all", label: "All", count: stats.total },
            { id: "active", label: "In Progress", count: stats.active },
            { id: "completed", label: "Completed", count: stats.completed },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {filteredEnrollments.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses found"
          description={enrollments.length === 0 
            ? "You're not enrolled in any courses yet." 
            : "No courses match your search criteria."}
          action={enrollments.length === 0 ? { label: "Browse Programs", onClick: () => window.location.href = "/programs" } : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEnrollments.map((enrollment, idx) => (
            <motion.div
              key={enrollment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
            >
              {/* Cover Image */}
              <div className="relative h-40 bg-gradient-to-br from-blue-500 to-blue-700">
                {enrollment.program?.cover_image_url && (
                  <img
                    src={enrollment.program.cover_image_url}
                    alt={enrollment.program.name}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-white font-semibold text-lg">{enrollment.program?.name}</h3>
                </div>
                <div className="absolute top-3 right-3">
                  <StatusBadge status={enrollment.status} />
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {enrollment.cohort && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <Calendar size={14} />
                    <span>{enrollment.cohort.name}</span>
                  </div>
                )}

                {enrollment.program?.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {enrollment.program.description}
                  </p>
                )}

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-medium text-gray-900">{enrollment.progress_percentage || 0}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${enrollment.progress_percentage || 0}%` }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      className={`h-full ${
                        enrollment.status === "completed" ? "bg-green-500" : "bg-blue-500"
                      }`}
                    />
                  </div>
                </div>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  {enrollment.program?.duration_weeks && (
                    <span className="flex items-center gap-1">
                      <Clock size={14} /> {enrollment.program.duration_weeks} weeks
                    </span>
                  )}
                  <span className="text-xs">
                    Enrolled: {new Date(enrollment.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Action Button */}
                <Link
                  href={`/dashboard/lessons?program=${enrollment.program_id}`}
                  className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Play size={14} />
                  {enrollment.status === "completed" ? "Review Course" : "Continue Learning"}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
