"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { DashboardShell, type NavItem } from "@/components/layout/DashboardShell";
import { StatusBadge, PageHeader, PageLoader, EmptyState } from "@/components/dashboard";
import { SearchInput, Select, Tabs } from "@/components/dashboard/FormComponents";
import { createSupabaseBrowserClient } from "@/utils/supabase-browser";
import {
  Home, BookOpen, FileText, ClipboardList, Award, User, TrendingUp,
  Play, Clock, CheckCircle, Video, FileQuestion, File
} from "lucide-react";
import type { Lesson, Program, LessonProgress } from "@/types/database";
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

interface LessonWithRelations extends Lesson {
  program?: Program;
  progress?: LessonProgress;
}

function StudentLessonsContent() {
  const { profile, isLoading, signOut } = useAuth("student");
  const searchParams = useSearchParams();
  const programFilter = searchParams.get("program") || "";
  
  const [lessons, setLessons] = useState<LessonWithRelations[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [search, setSearch] = useState("");
  const [selectedProgram, setSelectedProgram] = useState(programFilter);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedLesson, setSelectedLesson] = useState<LessonWithRelations | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchData();
    }
  }, [profile]);

  const fetchData = async () => {
    if (!profile) return;
    const supabase = createSupabaseBrowserClient();

    // Get enrolled program IDs
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("program_id, program:programs(id, name)")
      .eq("user_id", profile.id)
      .in("status", ["approved", "completed"]);

    // Handle Supabase join which may return array or single object
    const progs = enrollments?.map((e: any) => {
      return Array.isArray(e.program) ? e.program[0] : e.program;
    }).filter(Boolean) as Program[] || [];
    setPrograms(progs);
    const programIds = progs.map((p) => p.id);

    if (programIds.length > 0) {
      // Get lessons
      const { data: lessonData } = await supabase
        .from("lessons")
        .select("*, program:programs(id, name)")
        .in("program_id", programIds)
        .eq("is_published", true)
        .order("program_id")
        .order("order_index");

      // Get progress
      const { data: progressData } = await supabase
        .from("lesson_progress")
        .select("*")
        .eq("student_id", profile.id);

      const progressMap = new Map(progressData?.map((p: { lesson_id: string }) => [p.lesson_id, p]));

      const lessonsWithProgress = (lessonData || []).map((lesson: { id: string } & Record<string, unknown>) => ({
        ...lesson,
        progress: progressMap.get(lesson.id),
      }));

      setLessons(lessonsWithProgress as LessonWithRelations[]);
    }

    setDataLoading(false);
  };

  const filteredLessons = lessons.filter((l) => {
    const matchesSearch = l.title.toLowerCase().includes(search.toLowerCase());
    const matchesProgram = !selectedProgram || l.program_id === selectedProgram;
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "completed" && l.progress?.status === "completed") ||
      (activeTab === "in-progress" && l.progress?.status === "in_progress") ||
      (activeTab === "not-started" && !l.progress);
    return matchesSearch && matchesProgram && matchesTab;
  });

  const stats = {
    total: lessons.length,
    completed: lessons.filter((l) => l.progress?.status === "completed").length,
    inProgress: lessons.filter((l) => l.progress?.status === "in_progress").length,
    notStarted: lessons.filter((l) => !l.progress).length,
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case "video":
        return Video;
      case "quiz":
        return FileQuestion;
      default:
        return File;
    }
  };

  const markLessonComplete = async (lesson: LessonWithRelations) => {
    if (!profile) return;
    const supabase = createSupabaseBrowserClient();

    if (lesson.progress?.id) {
      await supabase
        .from("lesson_progress")
        .update({ status: "completed", completed_at: new Date().toISOString(), progress_percentage: 100 })
        .eq("id", lesson.progress.id);
    } else {
      await supabase.from("lesson_progress").insert({
        student_id: profile.id,
        lesson_id: lesson.id,
        status: "completed",
        completed_at: new Date().toISOString(),
        progress_percentage: 100,
      });
    }

    fetchData();
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
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Lessons List */}
        <div className={`flex-1 ${selectedLesson ? "hidden lg:block" : ""}`}>
          <PageHeader
            title="Lessons"
            description="Access your course materials"
          />

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <SearchInput value={search} onChange={setSearch} placeholder="Search lessons..." />
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
                { id: "in-progress", label: "In Progress", count: stats.inProgress },
                { id: "not-started", label: "Not Started", count: stats.notStarted },
                { id: "completed", label: "Completed", count: stats.completed },
              ]}
              activeTab={activeTab}
              onChange={setActiveTab}
            />
          </div>

          {filteredLessons.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No lessons found"
              description={lessons.length === 0 
                ? "No lessons available in your enrolled courses." 
                : "No lessons match your filters."}
            />
          ) : (
            <div className="space-y-2">
              {filteredLessons.map((lesson, idx) => {
                const Icon = getLessonIcon(lesson.lesson_type);
                const isCompleted = lesson.progress?.status === "completed";
                const isInProgress = lesson.progress?.status === "in_progress";
                
                return (
                  <motion.button
                    key={lesson.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => setSelectedLesson(lesson)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      selectedLesson?.id === lesson.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 bg-white hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        isCompleted ? "bg-green-100 text-green-600" :
                        isInProgress ? "bg-blue-100 text-blue-600" :
                        "bg-gray-100 text-gray-500"
                      }`}>
                        {isCompleted ? <CheckCircle size={18} /> : <Icon size={18} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900 truncate">{lesson.title}</h3>
                          {isCompleted && (
                            <CheckCircle size={14} className="text-green-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{lesson.program?.name}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs text-gray-500 capitalize">{lesson.lesson_type}</span>
                        {lesson.estimated_duration && (
                          <p className="text-xs text-gray-400 flex items-center gap-1 justify-end">
                            <Clock size={10} /> {lesson.estimated_duration}m
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        {/* Lesson Content */}
        {selectedLesson && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 lg:max-w-2xl"
          >
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <button
                  onClick={() => setSelectedLesson(null)}
                  className="lg:hidden text-blue-600 text-sm mb-4"
                >
                  ← Back to lessons
                </button>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-blue-600 mb-1">{selectedLesson.program?.name}</p>
                    <h2 className="text-xl font-semibold text-gray-900">{selectedLesson.title}</h2>
                    {selectedLesson.description && (
                      <p className="text-gray-600 mt-2">{selectedLesson.description}</p>
                    )}
                  </div>
                  <StatusBadge
                    status={
                      selectedLesson.progress?.status === "completed"
                        ? "Completed"
                        : selectedLesson.progress?.status === "in_progress"
                        ? "In Progress"
                        : "Not Started"
                    }
                  />
                </div>
                <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1 capitalize">
                    {(() => { const I = getLessonIcon(selectedLesson.lesson_type); return <I size={14} />; })()}
                    {selectedLesson.lesson_type}
                  </span>
                  {selectedLesson.estimated_duration && (
                    <span className="flex items-center gap-1">
                      <Clock size={14} /> {selectedLesson.estimated_duration} min
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {selectedLesson.video_url && (
                  <div className="mb-6">
                    <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                      <iframe
                        src={selectedLesson.video_url}
                        className="w-full h-full"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}

                {selectedLesson.content && (
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap">{selectedLesson.content}</div>
                  </div>
                )}

                {!selectedLesson.content && !selectedLesson.video_url && (
                  <p className="text-gray-500 text-center py-8">
                    No content available for this lesson yet.
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 bg-gray-50 border-t border-gray-200">
                {selectedLesson.progress?.status === "completed" ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle size={18} />
                    <span className="font-medium">Lesson completed!</span>
                  </div>
                ) : (
                  <button
                    onClick={() => markLessonComplete(selectedLesson)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    <CheckCircle size={18} />
                    Mark as Complete
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardShell>
  );
}

export default function StudentLessonsPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <StudentLessonsContent />
    </Suspense>
  );
}
