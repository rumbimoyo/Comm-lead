"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardShell, type NavItem } from "@/components/layout/DashboardShell";
import { StatCard, DataTable, StatusBadge, PageHeader, PageLoader, EmptyState } from "@/components/dashboard";
import { createSupabaseBrowserClient } from "@/utils/supabase-browser";
import {
  Home, BookOpen, FileText, ClipboardList, Award, User, TrendingUp,
  Calendar, Clock, CheckCircle, AlertCircle
} from "lucide-react";
import type { Enrollment, Program, Cohort, Assignment, Lesson, Announcement, Profile, CohortLecturer } from "@/types/database";
import Link from "next/link";
import { motion } from "framer-motion";
import { Users } from "lucide-react";

const studentNavigation: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/courses", label: "My Courses", icon: BookOpen },
  { href: "/dashboard/cohort", label: "My Cohort", icon: Users },
  { href: "/dashboard/lessons", label: "Lessons", icon: FileText },
  { href: "/dashboard/assignments", label: "Assignments", icon: ClipboardList },
  { href: "/dashboard/progress", label: "Progress", icon: TrendingUp },
  { href: "/dashboard/certificates", label: "Certificates", icon: Award },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

interface CohortWithDetails extends Cohort {
  program?: Program;
  lecturers?: Array<{ lecturer: Profile; is_lead: boolean }>;
}

interface EnrollmentWithRelations extends Enrollment {
  program?: Program;
  cohort?: CohortWithDetails;
}

interface AssignmentWithProgram extends Assignment {
  program?: Program;
}

export default function StudentDashboardPage() {
  const { profile, isLoading, signOut } = useAuth("student");
  const [enrollments, setEnrollments] = useState<EnrollmentWithRelations[]>([]);
  const [pendingAssignments, setPendingAssignments] = useState<AssignmentWithProgram[]>([]);
  const [upcomingLessons, setUpcomingLessons] = useState<Lesson[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [cohortLecturers, setCohortLecturers] = useState<Record<string, Array<{ lecturer: Profile; is_lead: boolean }>>>({});
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchDashboardData();
    }
  }, [profile]);

  const fetchDashboardData = async () => {
    if (!profile) return;
    const supabase = createSupabaseBrowserClient();

    // Fetch enrollments with cohort details
    const { data: enrollmentData } = await supabase
      .from("enrollments")
      .select("*, program:programs(id, name, slug), cohort:cohorts(id, name, start_date, end_date, program_id)")
      .eq("user_id", profile.id)
      .in("status", ["approved", "completed"]);

    setEnrollments((enrollmentData as EnrollmentWithRelations[]) || []);

    // Fetch cohort lecturers for each cohort
    const cohortIds = enrollmentData?.filter((e: EnrollmentWithRelations) => e.cohort?.id).map((e: EnrollmentWithRelations) => e.cohort!.id) || [];
    if (cohortIds.length > 0) {
      const { data: lecturersData } = await supabase
        .from("cohort_lecturers")
        .select("*, lecturer:profiles(id, full_name, avatar_url, email)")
        .in("cohort_id", cohortIds);

      // Group lecturers by cohort_id
      const lecturersByCohort: Record<string, Array<{ lecturer: Profile; is_lead: boolean }>> = {};
      lecturersData?.forEach((cl: any) => {
        if (!lecturersByCohort[cl.cohort_id]) {
          lecturersByCohort[cl.cohort_id] = [];
        }
        lecturersByCohort[cl.cohort_id].push({
          lecturer: cl.lecturer as Profile,
          is_lead: cl.is_lead
        });
      });
      setCohortLecturers(lecturersByCohort);
    }

    const programIds = enrollmentData?.map((e: EnrollmentWithRelations) => e.program_id) || [];

    if (programIds.length > 0) {
      // Fetch pending assignments
      const { data: assignments } = await supabase
        .from("assignments")
        .select("*, program:programs(id, name)")
        .in("program_id", programIds)
        .eq("is_published", true)
        .gte("due_date", new Date().toISOString())
        .order("due_date")
        .limit(5);

      setPendingAssignments((assignments as AssignmentWithProgram[]) || []);

      // Fetch upcoming lessons (recently added published lessons)
      const { data: lessons } = await supabase
        .from("lessons")
        .select("*")
        .in("program_id", programIds)
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(5);

      setUpcomingLessons(lessons || []);
    }

    // Fetch announcements
    const { data: announcementData } = await supabase
      .from("announcements")
      .select("*")
      .eq("is_published", true)
      .or("target_audience.eq.all,target_audience.eq.students")
      .order("created_at", { ascending: false })
      .limit(3);

    setAnnouncements(announcementData || []);

    setDataLoading(false);
  };

  const stats = {
    enrolled: enrollments.filter((e) => e.status === "approved").length,
    completed: enrollments.filter((e) => e.status === "completed").length,
    pendingTasks: pendingAssignments.length,
    avgProgress: enrollments.length > 0
      ? Math.round(enrollments.reduce((acc, e) => acc + (e.progress_percentage || 0), 0) / enrollments.length)
      : 0,
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
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {profile?.full_name?.split(" ")[0] || "Student"}!
        </h1>
        <p className="text-gray-600">Here's an overview of your learning journey.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Active Courses"
          value={stats.enrolled}
          icon={BookOpen}
          color="blue"
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Pending Tasks"
          value={stats.pendingTasks}
          icon={ClipboardList}
          color="yellow"
        />
        <StatCard
          title="Avg Progress"
          value={`${stats.avgProgress}%`}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* My Cohort(s) Section */}
      {enrollments.filter(e => e.cohort).length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users size={20} className="text-blue-600" />
            My Cohort{enrollments.filter(e => e.cohort).length > 1 ? "s" : ""}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enrollments.filter(e => e.cohort).map((enrollment, idx) => {
              const cohort = enrollment.cohort!;
              const lecturers = cohortLecturers[cohort.id] || [];
              const leadLecturer = lecturers.find(l => l.is_lead);
              const otherLecturers = lecturers.filter(l => !l.is_lead);
              
              return (
                <motion.div
                  key={enrollment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{cohort.name}</h3>
                      <p className="text-sm text-blue-600">{enrollment.program?.name}</p>
                    </div>
                    <StatusBadge status={enrollment.status} />
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>
                        {new Date(cohort.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        {cohort.end_date && ` - ${new Date(cohort.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
                      </span>
                    </div>
                  </div>

                  {lecturers.length > 0 && (
                    <div className="border-t border-blue-100 pt-3">
                      <p className="text-xs text-gray-500 mb-2">Your Instructors</p>
                      <div className="space-y-2">
                        {leadLecturer && (
                          <div className="flex items-center gap-2">
                            {leadLecturer.lecturer.avatar_url ? (
                              <img 
                                src={leadLecturer.lecturer.avatar_url} 
                                alt={leadLecturer.lecturer.full_name || "Lead"} 
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium">
                                {leadLecturer.lecturer.full_name?.charAt(0) || "L"}
                              </div>
                            )}
                            <div>
                              <span className="text-sm font-medium text-gray-900">{leadLecturer.lecturer.full_name}</span>
                              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Lead</span>
                            </div>
                          </div>
                        )}
                        {otherLecturers.length > 0 && (
                          <div className="flex items-center gap-1">
                            <div className="flex -space-x-2">
                              {otherLecturers.slice(0, 3).map((l, i) => (
                                l.lecturer.avatar_url ? (
                                  <img 
                                    key={l.lecturer.id}
                                    src={l.lecturer.avatar_url} 
                                    alt={l.lecturer.full_name || ""} 
                                    className="w-6 h-6 rounded-full object-cover border-2 border-white"
                                  />
                                ) : (
                                  <div 
                                    key={l.lecturer.id}
                                    className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs border-2 border-white"
                                  >
                                    {l.lecturer.full_name?.charAt(0) || "?"}
                                  </div>
                                )
                              ))}
                            </div>
                            <span className="text-xs text-gray-600 ml-2">
                              {otherLecturers.map(l => l.lecturer.full_name).join(", ")}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Announcements */}
      {announcements.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Announcements</h2>
          <div className="space-y-3">
            {announcements.map((announcement, idx) => (
              <motion.div
                key={announcement.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-4 rounded-lg border ${
                  announcement.priority === "urgent"
                    ? "bg-red-50 border-red-200"
                    : announcement.priority === "high"
                    ? "bg-amber-50 border-amber-200"
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle
                    size={18}
                    className={
                      announcement.priority === "urgent"
                        ? "text-red-600"
                        : announcement.priority === "high"
                        ? "text-amber-600"
                        : "text-blue-600"
                    }
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">{announcement.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{announcement.content}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(announcement.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My Courses */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">My Courses</h2>
            <Link href="/dashboard/courses" className="text-sm text-blue-600 hover:text-blue-700">
              View all
            </Link>
          </div>
          {enrollments.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No courses yet"
              description="You're not enrolled in any courses."
              action={{ label: "Browse Programs", onClick: () => window.location.href = "/programs" }}
            />
          ) : (
            <div className="space-y-3">
              {enrollments.slice(0, 3).map((enrollment, idx) => (
                <motion.div
                  key={enrollment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{enrollment.program?.name}</h3>
                    <StatusBadge status={enrollment.status} />
                  </div>
                  {enrollment.cohort && (
                    <p className="text-xs text-gray-500 mb-3">{enrollment.cohort.name}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${enrollment.progress_percentage || 0}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600">{enrollment.progress_percentage || 0}%</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Assignments */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Assignments</h2>
            <Link href="/dashboard/assignments" className="text-sm text-blue-600 hover:text-blue-700">
              View all
            </Link>
          </div>
          {pendingAssignments.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No pending assignments"
              description="You're all caught up!"
            />
          ) : (
            <div className="space-y-3">
              {pendingAssignments.map((assignment, idx) => (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{assignment.title}</h3>
                      <p className="text-xs text-gray-500">{assignment.program?.name}</p>
                    </div>
                    <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded">
                      {assignment.points} pts
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                    <Calendar size={12} />
                    <span>Due: {new Date(assignment.due_date!).toLocaleDateString()}</span>
                    <Clock size={12} className="ml-2" />
                    <span>{new Date(assignment.due_date!).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Lessons */}
      {upcomingLessons.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Lessons</h2>
            <Link href="/dashboard/lessons" className="text-sm text-blue-600 hover:text-blue-700">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingLessons.slice(0, 3).map((lesson, idx) => (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`p-1.5 rounded ${
                    lesson.lesson_type === "video" ? "bg-red-100 text-red-600" :
                    lesson.lesson_type === "quiz" ? "bg-purple-100 text-purple-600" :
                    "bg-blue-100 text-blue-600"
                  }`}>
                    <FileText size={14} />
                  </span>
                  <span className="text-xs text-gray-500 capitalize">{lesson.lesson_type}</span>
                </div>
                <h3 className="font-medium text-gray-900">{lesson.title}</h3>
                {lesson.estimated_duration && (
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <Clock size={12} /> {lesson.estimated_duration} min
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
