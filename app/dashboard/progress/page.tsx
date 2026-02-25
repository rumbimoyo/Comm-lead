"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardShell, type NavItem } from "@/components/layout/DashboardShell";
import { StatCard, PageHeader, PageLoader, EmptyState } from "@/components/dashboard";
import { Select } from "@/components/dashboard/FormComponents";
import { createSupabaseBrowserClient } from "@/utils/supabase-browser";
import {
  Home, BookOpen, FileText, ClipboardList, Award, User, TrendingUp,
  CheckCircle, Clock, Target, Trophy, Star
} from "lucide-react";
import type { Enrollment, Program, Lesson, Assignment, LessonProgress, Submission } from "@/types/database";
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

interface ProgramProgress {
  program: Program;
  enrollment: Enrollment;
  lessonsTotal: number;
  lessonsCompleted: number;
  assignmentsTotal: number;
  assignmentsSubmitted: number;
  assignmentsGraded: number;
  totalPoints: number;
  earnedPoints: number;
}

export default function StudentProgressPage() {
  const { profile, isLoading, signOut } = useAuth("student");
  const [programProgress, setProgramProgress] = useState<ProgramProgress[]>([]);
  const [selectedProgram, setSelectedProgram] = useState("");
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchProgress();
    }
  }, [profile]);

  const fetchProgress = async () => {
    if (!profile) return;
    const supabase = createSupabaseBrowserClient();

    // Get enrollments
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("*, program:programs(*)")
      .eq("user_id", profile.id)
      .in("status", ["approved", "completed"]);

    if (!enrollments || enrollments.length === 0) {
      setDataLoading(false);
      return;
    }

    const progress: ProgramProgress[] = [];

    for (const enrollment of enrollments) {
      const program = enrollment.program as Program;
      if (!program) continue;

      // Get lessons count and completed
      const { data: lessons } = await supabase
        .from("lessons")
        .select("id")
        .eq("program_id", program.id)
        .eq("is_published", true);

      const lessonIds = lessons?.map((l: { id: string }) => l.id) || [];

      const { data: completedLessons } = await supabase
        .from("lesson_progress")
        .select("id")
        .eq("student_id", profile.id)
        .eq("status", "completed")
        .in("lesson_id", lessonIds);

      // Get assignments
      const { data: assignments } = await supabase
        .from("assignments")
        .select("id, points")
        .eq("program_id", program.id)
        .eq("is_published", true);

      const assignmentIds = assignments?.map((a: { id: string }) => a.id) || [];
      const totalPoints = assignments?.reduce((sum: number, a: { points?: number }) => sum + (a.points || 0), 0) || 0;

      // Get submissions
      const { data: submissions } = await supabase
        .from("submissions")
        .select("id, status, grade")
        .eq("student_id", profile.id)
        .in("assignment_id", assignmentIds);

      const gradedSubmissions = submissions?.filter((s: { status: string }) => s.status === "graded") || [];
      const earnedPoints = gradedSubmissions.reduce((sum: number, s: { grade?: number }) => sum + (s.grade || 0), 0);

      progress.push({
        program,
        enrollment,
        lessonsTotal: lessons?.length || 0,
        lessonsCompleted: completedLessons?.length || 0,
        assignmentsTotal: assignments?.length || 0,
        assignmentsSubmitted: submissions?.length || 0,
        assignmentsGraded: gradedSubmissions.length,
        totalPoints,
        earnedPoints,
      });
    }

    setProgramProgress(progress);
    setDataLoading(false);
  };

  const overallStats = {
    totalCourses: programProgress.length,
    completedCourses: programProgress.filter((p) => p.enrollment.status === "completed").length,
    totalLessons: programProgress.reduce((sum, p) => sum + p.lessonsTotal, 0),
    completedLessons: programProgress.reduce((sum, p) => sum + p.lessonsCompleted, 0),
    totalAssignments: programProgress.reduce((sum, p) => sum + p.assignmentsTotal, 0),
    submittedAssignments: programProgress.reduce((sum, p) => sum + p.assignmentsSubmitted, 0),
    totalPoints: programProgress.reduce((sum, p) => sum + p.totalPoints, 0),
    earnedPoints: programProgress.reduce((sum, p) => sum + p.earnedPoints, 0),
  };

  const selectedProgramData = selectedProgram
    ? programProgress.find((p) => p.program.id === selectedProgram)
    : null;

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
        title="Progress"
        description="Track your learning journey"
      />

      {programProgress.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No progress to show"
          description="Enroll in a course to start tracking your progress."
          action={{ label: "Browse Programs", onClick: () => window.location.href = "/programs" }}
        />
      ) : (
        <>
          {/* Overall Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Courses"
              value={`${overallStats.completedCourses}/${overallStats.totalCourses}`}
              icon={BookOpen}
              color="blue"
            />
            <StatCard
              title="Lessons"
              value={`${overallStats.completedLessons}/${overallStats.totalLessons}`}
              icon={FileText}
              color="green"
            />
            <StatCard
              title="Assignments"
              value={`${overallStats.submittedAssignments}/${overallStats.totalAssignments}`}
              icon={ClipboardList}
              color="purple"
            />
            <StatCard
              title="Points Earned"
              value={overallStats.earnedPoints}
              icon={Trophy}
              color="yellow"
              description={`of ${overallStats.totalPoints} possible`}
            />
          </div>

          {/* Program Filter */}
          <div className="mb-6">
            <Select
              id="program"
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              options={[
                { value: "", label: "All Programs Overview" },
                ...programProgress.map((p) => ({ value: p.program.id, label: p.program.name })),
              ]}
            />
          </div>

          {selectedProgram && selectedProgramData ? (
            // Detailed Program View
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{selectedProgramData.program.name}</h3>
                    <p className="text-gray-500">Enrolled: {new Date(selectedProgramData.enrollment.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedProgramData.enrollment.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-700"
                  }`}>
                    {selectedProgramData.enrollment.status === "completed" ? "Completed" : "In Progress"}
                  </span>
                </div>

                {/* Progress Circle */}
                <div className="flex items-center justify-center mb-8">
                  <div className="relative w-40 h-40">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="#E5E7EB"
                        strokeWidth="12"
                        fill="none"
                      />
                      <motion.circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="#2563EB"
                        strokeWidth="12"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ strokeDasharray: "0 440" }}
                        animate={{
                          strokeDasharray: `${(selectedProgramData.enrollment.progress_percentage || 0) * 4.4} 440`,
                        }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-gray-900">
                        {selectedProgramData.enrollment.progress_percentage || 0}%
                      </span>
                      <span className="text-sm text-gray-500">Complete</span>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedProgramData.lessonsCompleted}/{selectedProgramData.lessonsTotal}
                    </p>
                    <p className="text-sm text-gray-500">Lessons</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      {selectedProgramData.assignmentsSubmitted}/{selectedProgramData.assignmentsTotal}
                    </p>
                    <p className="text-sm text-gray-500">Assignments</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {selectedProgramData.assignmentsGraded}
                    </p>
                    <p className="text-sm text-gray-500">Graded</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-amber-600">
                      {selectedProgramData.earnedPoints}
                    </p>
                    <p className="text-sm text-gray-500">Points</p>
                  </div>
                </div>
              </div>

              {/* Grade Summary */}
              {selectedProgramData.totalPoints > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Grade Summary</h4>
                  <div className="flex items-center gap-6">
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.round((selectedProgramData.earnedPoints / selectedProgramData.totalPoints) * 100)}%`,
                          }}
                          transition={{ duration: 0.5 }}
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {Math.round((selectedProgramData.earnedPoints / selectedProgramData.totalPoints) * 100)}%
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedProgramData.earnedPoints} / {selectedProgramData.totalPoints} pts
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            // All Programs Overview
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {programProgress.map((prog, idx) => {
                const lessonProgress = prog.lessonsTotal > 0
                  ? Math.round((prog.lessonsCompleted / prog.lessonsTotal) * 100)
                  : 0;
                const assignmentProgress = prog.assignmentsTotal > 0
                  ? Math.round((prog.assignmentsSubmitted / prog.assignmentsTotal) * 100)
                  : 0;

                return (
                  <motion.div
                    key={prog.program.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white rounded-xl border border-gray-200 p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">{prog.program.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        prog.enrollment.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {prog.enrollment.status === "completed" ? "Completed" : "Active"}
                      </span>
                    </div>

                    {/* Overall Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-500">Overall Progress</span>
                        <span className="font-medium">{prog.enrollment.progress_percentage || 0}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${prog.enrollment.progress_percentage || 0}%` }}
                          className="h-full bg-blue-500"
                        />
                      </div>
                    </div>

                    {/* Lessons */}
                    <div className="flex items-center justify-between text-sm py-2 border-t border-gray-100">
                      <span className="text-gray-500 flex items-center gap-2">
                        <FileText size={14} /> Lessons
                      </span>
                      <span className="font-medium">
                        {prog.lessonsCompleted} / {prog.lessonsTotal}
                      </span>
                    </div>

                    {/* Assignments */}
                    <div className="flex items-center justify-between text-sm py-2 border-t border-gray-100">
                      <span className="text-gray-500 flex items-center gap-2">
                        <ClipboardList size={14} /> Assignments
                      </span>
                      <span className="font-medium">
                        {prog.assignmentsSubmitted} / {prog.assignmentsTotal}
                      </span>
                    </div>

                    {/* Points */}
                    <div className="flex items-center justify-between text-sm py-2 border-t border-gray-100">
                      <span className="text-gray-500 flex items-center gap-2">
                        <Star size={14} /> Points
                      </span>
                      <span className="font-medium text-amber-600">
                        {prog.earnedPoints} / {prog.totalPoints}
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedProgram(prog.program.id)}
                      className="mt-4 w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View Details →
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}
    </DashboardShell>
  );
}
