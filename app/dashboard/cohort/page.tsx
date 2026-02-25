"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardShell, type NavItem } from "@/components/layout/DashboardShell";
import { PageHeader, PageLoader, EmptyState } from "@/components/dashboard";
import { Modal, Button, FormField, Textarea } from "@/components/dashboard/FormComponents";
import { createSupabaseBrowserClient } from "@/utils/supabase-browser";
import {
  Home, BookOpen, FileText, ClipboardList, Award, User, TrendingUp,
  Calendar, Megaphone, Download, ExternalLink, Clock, CheckCircle,
  Video, File, Link as LinkIcon, Upload
} from "lucide-react";
import type { Cohort, CohortAnnouncement, CohortMaterial, CohortTask, TaskSubmission, Profile, Enrollment } from "@/types/database";
import Link from "next/link";
import { motion } from "framer-motion";

const studentNavigation: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/courses", label: "My Courses", icon: BookOpen },
  { href: "/dashboard/cohort", label: "My Cohort", icon: Calendar },
  { href: "/dashboard/lessons", label: "Lessons", icon: FileText },
  { href: "/dashboard/assignments", label: "Assignments", icon: ClipboardList },
  { href: "/dashboard/progress", label: "Progress", icon: TrendingUp },
  { href: "/dashboard/certificates", label: "Certificates", icon: Award },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

type CohortWithDetails = Omit<Cohort, 'program'> & {
  program?: { id: string; name: string };
  lecturers?: Array<{ lecturer: Profile; is_lead: boolean }>;
};

type EnrollmentWithCohort = Omit<Enrollment, 'program'> & {
  cohort?: CohortWithDetails;
  program?: { id: string; name: string };
};

export default function StudentCohortPage() {
  const { profile, isLoading, signOut } = useAuth("student");
  const [enrollments, setEnrollments] = useState<EnrollmentWithCohort[]>([]);
  const [selectedCohort, setSelectedCohort] = useState<CohortWithDetails | null>(null);
  const [announcements, setAnnouncements] = useState<(CohortAnnouncement & { lecturer?: Profile })[]>([]);
  const [materials, setMaterials] = useState<CohortMaterial[]>([]);
  const [tasks, setTasks] = useState<(CohortTask & { lecturer?: Profile; submission?: TaskSubmission })[]>([]);
  const [activeTab, setActiveTab] = useState<"announcements" | "materials" | "tasks">("announcements");
  const [dataLoading, setDataLoading] = useState(true);
  
  // Task submission
  const [selectedTask, setSelectedTask] = useState<CohortTask | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submissionContent, setSubmissionContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (profile) fetchEnrollments();
  }, [profile]);

  useEffect(() => {
    if (selectedCohort) fetchCohortContent();
  }, [selectedCohort]);

  const fetchEnrollments = async () => {
    if (!profile) return;
    const supabase = createSupabaseBrowserClient();

    // Fetch enrollments with cohort details
    const { data: enrollmentData } = await supabase
      .from("enrollments")
      .select("*, cohort:cohorts(*, program:programs(id, name)), program:programs(id, name)")
      .eq("user_id", profile.id)
      .in("status", ["approved", "completed"]);

    const enrollmentsWithCohorts = (enrollmentData || []).filter((e: any) => e.cohort);
    setEnrollments(enrollmentsWithCohorts as EnrollmentWithCohort[]);
    
    if (enrollmentsWithCohorts.length > 0 && !selectedCohort) {
      setSelectedCohort(enrollmentsWithCohorts[0].cohort);
    }
    setDataLoading(false);
  };

  const fetchCohortContent = async () => {
    if (!selectedCohort || !profile) return;
    const supabase = createSupabaseBrowserClient();

    // Fetch announcements with lecturer info
    const { data: announcementData } = await supabase
      .from("cohort_announcements")
      .select("*, lecturer:profiles(id, full_name, avatar_url)")
      .eq("cohort_id", selectedCohort.id)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });

    setAnnouncements(announcementData || []);

    // Fetch published materials
    const { data: materialData } = await supabase
      .from("cohort_materials")
      .select("*")
      .eq("cohort_id", selectedCohort.id)
      .eq("is_published", true)
      .order("order_index")
      .order("created_at", { ascending: false });

    setMaterials(materialData || []);

    // Fetch published tasks with submissions
    const { data: taskData } = await supabase
      .from("cohort_tasks")
      .select("*, lecturer:profiles(id, full_name)")
      .eq("cohort_id", selectedCohort.id)
      .eq("is_published", true)
      .order("due_date", { ascending: true });

    // Fetch student's submissions
    const { data: submissions } = await supabase
      .from("task_submissions")
      .select("*")
      .eq("student_id", profile.id);

    // Merge submissions with tasks
    const tasksWithSubmissions = (taskData || []).map((task: any) => ({
      ...task,
      submission: submissions?.find((s: { task_id: string }) => s.task_id === task.id),
    }));

    setTasks(tasksWithSubmissions);
  };

  const handleSubmitTask = async () => {
    if (!selectedTask || !profile) return;
    setSubmitting(true);
    const supabase = createSupabaseBrowserClient();

    const existing = tasks.find((t) => t.id === selectedTask.id)?.submission;

    if (existing) {
      // Update existing submission
      await supabase
        .from("task_submissions")
        .update({
          content: submissionContent,
          status: "resubmitted",
          submitted_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      // Create new submission
      await supabase.from("task_submissions").insert({
        task_id: selectedTask.id,
        student_id: profile.id,
        content: submissionContent,
        status: "submitted",
      });
    }

    setSubmitting(false);
    setShowSubmitModal(false);
    setSubmissionContent("");
    fetchCohortContent();
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case "notes": return FileText;
      case "slides": return File;
      case "video": return Video;
      case "link": return LinkIcon;
      default: return File;
    }
  };

  const getTaskStatus = (task: CohortTask & { submission?: TaskSubmission }) => {
    if (task.submission) {
      if (task.submission.status === "graded") {
        return { label: "Graded", color: "bg-green-100 text-green-700" };
      }
      return { label: "Submitted", color: "bg-blue-100 text-blue-700" };
    }
    if (task.due_date && new Date(task.due_date) < new Date()) {
      return { label: "Overdue", color: "bg-red-100 text-red-700" };
    }
    return { label: "Pending", color: "bg-amber-100 text-amber-700" };
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
        title="My Cohort"
        description="Access announcements, materials, and tasks from your instructors"
      />

      {enrollments.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="Not enrolled in a cohort"
          description="You haven't been assigned to a cohort yet. Contact an administrator."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Cohort Selector */}
          {enrollments.length > 1 && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border shadow-sm p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Your Cohorts</h3>
                <div className="space-y-2">
                  {enrollments.map((enrollment) => (
                    <button
                      key={enrollment.id}
                      onClick={() => setSelectedCohort(enrollment.cohort!)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedCohort?.id === enrollment.cohort?.id
                          ? "bg-blue-50 border-2 border-blue-500"
                          : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                      }`}
                    >
                      <p className="font-medium text-gray-900">{enrollment.cohort?.name}</p>
                      <p className="text-xs text-gray-500">{enrollment.program?.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Content Area */}
          <div className={enrollments.length > 1 ? "lg:col-span-3" : "lg:col-span-4"}>
            {selectedCohort && (
              <>
                {/* Cohort Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6 mb-6">
                  <h2 className="text-xl font-bold">{selectedCohort.name}</h2>
                  <p className="text-blue-100">{selectedCohort.program?.name}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-blue-100">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(selectedCohort.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      {selectedCohort.end_date && ` - ${new Date(selectedCohort.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
                    </span>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto">
                  <button
                    onClick={() => setActiveTab("announcements")}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                      activeTab === "announcements"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Megaphone size={16} />
                    Announcements ({announcements.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("materials")}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                      activeTab === "materials"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <FileText size={16} />
                    Materials ({materials.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("tasks")}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                      activeTab === "tasks"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <ClipboardList size={16} />
                    Tasks ({tasks.length})
                  </button>
                </div>

                {/* Announcements Tab */}
                {activeTab === "announcements" && (
                  <div>
                    {announcements.length === 0 ? (
                      <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                        No announcements from your instructors yet.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {announcements.map((item, idx) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`bg-white rounded-lg border p-5 ${
                              item.is_pinned ? "border-blue-300 bg-blue-50" : ""
                            } ${
                              item.priority === "urgent" ? "border-l-4 border-l-red-500" :
                              item.priority === "high" ? "border-l-4 border-l-amber-500" : ""
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              {item.lecturer?.avatar_url ? (
                                <img 
                                  src={item.lecturer.avatar_url} 
                                  alt="" 
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                                  {item.lecturer?.full_name?.charAt(0) || "?"}
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-gray-900">{item.lecturer?.full_name}</span>
                                  {item.priority === "urgent" && (
                                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Urgent</span>
                                  )}
                                  {item.priority === "high" && (
                                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">Important</span>
                                  )}
                                </div>
                                <h3 className="font-semibold text-gray-900 text-lg">{item.title}</h3>
                                <p className="text-gray-600 mt-2 whitespace-pre-wrap">{item.content}</p>
                                <p className="text-xs text-gray-400 mt-3">
                                  {new Date(item.created_at).toLocaleDateString("en-US", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Materials Tab */}
                {activeTab === "materials" && (
                  <div>
                    {materials.length === 0 ? (
                      <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                        No learning materials available yet.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {materials.map((item, idx) => {
                          const MaterialIcon = getMaterialIcon(item.material_type);
                          return (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${
                                  item.material_type === "notes" ? "bg-blue-100 text-blue-600" :
                                  item.material_type === "slides" ? "bg-amber-100 text-amber-600" :
                                  item.material_type === "video" ? "bg-red-100 text-red-600" :
                                  "bg-gray-100 text-gray-600"
                                }`}>
                                  <MaterialIcon size={20} />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-medium text-gray-900">{item.title}</h3>
                                  {item.description && (
                                    <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                                  )}
                                  <div className="flex items-center gap-3 mt-3">
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded capitalize">
                                      {item.material_type}
                                    </span>
                                    {(item.file_url || item.external_url) && (
                                      <a
                                        href={item.file_url || item.external_url || "#"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                      >
                                        {item.file_url ? (
                                          <><Download size={12} /> Download</>
                                        ) : (
                                          <><ExternalLink size={12} /> Open Link</>
                                        )}
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Tasks Tab */}
                {activeTab === "tasks" && (
                  <div>
                    {tasks.length === 0 ? (
                      <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                        No tasks or assignments yet.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {tasks.map((item, idx) => {
                          const status = getTaskStatus(item);
                          return (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="bg-white rounded-lg border p-5"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                                    <span className={`text-xs px-2 py-0.5 rounded ${status.color}`}>
                                      {status.label}
                                    </span>
                                  </div>
                                  {item.description && (
                                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                  )}
                                  {item.instructions && (
                                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                      <p className="text-xs font-medium text-gray-500 mb-1">Instructions:</p>
                                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.instructions}</p>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-4 mt-3">
                                    {item.due_date && (
                                      <span className="text-sm text-gray-500 flex items-center gap-1">
                                        <Clock size={14} />
                                        Due: {new Date(item.due_date).toLocaleDateString("en-US", {
                                          month: "short",
                                          day: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </span>
                                    )}
                                    {item.points > 0 && (
                                      <span className="text-sm text-purple-600 font-medium">
                                        {item.points} points
                                      </span>
                                    )}
                                  </div>
                                  
                                  {/* Submission status */}
                                  {item.submission && (
                                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                      <div className="flex items-center gap-2 text-sm text-blue-700">
                                        <CheckCircle size={16} />
                                        <span>
                                          Submitted on {new Date(item.submission.submitted_at).toLocaleDateString()}
                                        </span>
                                      </div>
                                      {item.submission.grade !== null && (
                                        <p className="mt-2 text-sm">
                                          <span className="font-medium">Grade:</span> {item.submission.grade}/{item.points}
                                        </p>
                                      )}
                                      {item.submission.feedback && (
                                        <p className="mt-2 text-sm">
                                          <span className="font-medium">Feedback:</span> {item.submission.feedback}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="ml-4">
                                  {!item.submission || item.submission.status === "returned" ? (
                                    <Button
                                      onClick={() => {
                                        setSelectedTask(item);
                                        setSubmissionContent(item.submission?.content || "");
                                        setShowSubmitModal(true);
                                      }}
                                    >
                                      <Upload size={16} className="mr-1" />
                                      {item.submission ? "Resubmit" : "Submit"}
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="secondary"
                                      onClick={() => {
                                        setSelectedTask(item);
                                        setSubmissionContent(item.submission?.content || "");
                                        setShowSubmitModal(true);
                                      }}
                                    >
                                      Edit Submission
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Submit Task Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title={`Submit: ${selectedTask?.title}`}
        size="lg"
      >
        {selectedTask && (
          <div className="space-y-4">
            {selectedTask.instructions && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-500 mb-1">Task Instructions:</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedTask.instructions}</p>
              </div>
            )}
            <FormField label="Your Submission" id="submission" required>
              <Textarea
                id="submission"
                rows={6}
                value={submissionContent}
                onChange={(e) => setSubmissionContent(e.target.value)}
                placeholder="Enter your answer or submission here..."
              />
            </FormField>
            <p className="text-xs text-gray-500">
              Note: For file uploads, please use the file sharing provided by your instructor.
            </p>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="secondary" onClick={() => setShowSubmitModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitTask} loading={submitting} disabled={!submissionContent.trim()}>
                Submit Task
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardShell>
  );
}
