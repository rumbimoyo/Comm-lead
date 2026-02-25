"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardShell, type NavItem } from "@/components/layout/DashboardShell";
import { StatCard, StatusBadge, PageHeader, PageLoader, EmptyState } from "@/components/dashboard";
import { Modal, Button, SearchInput, Select, Tabs, FormField, Textarea } from "@/components/dashboard/FormComponents";
import { createSupabaseBrowserClient } from "@/utils/supabase-browser";
import {
  Home, BookOpen, FileText, ClipboardList, Award, User, TrendingUp,
  Clock, CheckCircle, AlertCircle, Upload, Calendar, Send
} from "lucide-react";
import type { Assignment, Program, Submission } from "@/types/database";
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

interface AssignmentWithRelations extends Assignment {
  program?: Program;
  submission?: Submission;
}

export default function StudentAssignmentsPage() {
  const { profile, isLoading, signOut } = useAuth("student");
  const [assignments, setAssignments] = useState<AssignmentWithRelations[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [search, setSearch] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [dataLoading, setDataLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<AssignmentWithRelations | null>(null);
  const [submissionContent, setSubmissionContent] = useState("");
  const [submissionLink, setSubmissionLink] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (profile) {
      fetchData();
    }
  }, [profile]);

  const fetchData = async () => {
    if (!profile) return;
    const supabase = createSupabaseBrowserClient();

    // Get enrolled programs
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("program_id, cohort_id, program:programs(id, name)")
      .eq("user_id", profile.id)
      .in("status", ["approved", "completed"]);

    // Handle Supabase join which may return array or single object
    const progs = enrollments?.map((e: any) => {
      return Array.isArray(e.program) ? e.program[0] : e.program;
    }).filter(Boolean) as Program[] || [];
    setPrograms(progs);
    const programIds = progs.map((p) => p.id);
    const cohortIds = enrollments?.map((e: any) => e.cohort_id).filter(Boolean) || [];

    if (programIds.length > 0) {
      // Get assignments (either for program or specific cohort)
      const { data: assignmentData } = await supabase
        .from("assignments")
        .select("*, program:programs(id, name)")
        .in("program_id", programIds)
        .eq("is_published", true)
        .order("due_date", { ascending: true });

      // Filter assignments for cohort or general
      const filteredAssignments = (assignmentData || []).filter(
        (a: { cohort_id?: string }) => !a.cohort_id || cohortIds.includes(a.cohort_id)
      );

      // Get submissions
      const assignmentIds = filteredAssignments.map((a: { id: string }) => a.id);
      const { data: submissions } = await supabase
        .from("submissions")
        .select("*")
        .eq("student_id", profile.id)
        .in("assignment_id", assignmentIds);

      const submissionMap = new Map(submissions?.map((s: { assignment_id: string }) => [s.assignment_id, s]));

      const assignmentsWithSubmissions = filteredAssignments.map((a: { id: string } & Record<string, unknown>) => ({
        ...a,
        submission: submissionMap.get(a.id),
      }));

      setAssignments(assignmentsWithSubmissions as AssignmentWithRelations[]);
    }

    setDataLoading(false);
  };

  const getStatus = (assignment: AssignmentWithRelations) => {
    if (assignment.submission?.status === "graded") return "graded";
    if (assignment.submission) return "submitted";
    const now = new Date();
    const due = new Date(assignment.due_date || "");
    if (assignment.due_date && due < now) return "overdue";
    return "pending";
  };

  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase());
    const matchesProgram = !selectedProgram || a.program_id === selectedProgram;
    const status = getStatus(a);
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "pending" && (status === "pending" || status === "overdue")) ||
      (activeTab === "submitted" && status === "submitted") ||
      (activeTab === "graded" && status === "graded");
    return matchesSearch && matchesProgram && matchesTab;
  });

  const stats = {
    total: assignments.length,
    pending: assignments.filter((a) => getStatus(a) === "pending" || getStatus(a) === "overdue").length,
    submitted: assignments.filter((a) => getStatus(a) === "submitted").length,
    graded: assignments.filter((a) => getStatus(a) === "graded").length,
  };

  const openSubmission = (assignment: AssignmentWithRelations) => {
    setSelected(assignment);
    setSubmissionContent(assignment.submission?.content || "");
    setSubmissionLink(assignment.submission?.link_url || "");
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!selected || !profile) return;
    setSubmitting(true);
    const supabase = createSupabaseBrowserClient();

    const data = {
      student_id: profile.id,
      assignment_id: selected.id,
      content: submissionContent || null,
      link_url: submissionLink || null,
      status: "submitted" as const,
      submitted_at: new Date().toISOString(),
    };

    if (selected.submission?.id) {
      await supabase.from("submissions").update(data).eq("id", selected.submission.id);
    } else {
      await supabase.from("submissions").insert(data);
    }

    setSubmitting(false);
    setShowModal(false);
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
      <PageHeader
        title="Assignments"
        description="View and submit your assignments"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total"
          value={stats.total}
          icon={ClipboardList}
          color="blue"
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          icon={Clock}
          color="yellow"
        />
        <StatCard
          title="Submitted"
          value={stats.submitted}
          icon={Send}
          color="purple"
        />
        <StatCard
          title="Graded"
          value={stats.graded}
          icon={CheckCircle}
          color="green"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <SearchInput value={search} onChange={setSearch} placeholder="Search assignments..." />
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
            { id: "pending", label: "Pending", count: stats.pending },
            { id: "submitted", label: "Submitted", count: stats.submitted },
            { id: "graded", label: "Graded", count: stats.graded },
            { id: "all", label: "All", count: stats.total },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {filteredAssignments.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No assignments found"
          description={assignments.length === 0 
            ? "No assignments available yet." 
            : "No assignments match your filters."}
        />
      ) : (
        <div className="space-y-4">
          {filteredAssignments.map((assignment, idx) => {
            const status = getStatus(assignment);
            const isOverdue = status === "overdue";
            
            return (
              <motion.div
                key={assignment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`bg-white rounded-lg border p-4 ${
                  isOverdue ? "border-red-200" : "border-gray-200"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg mt-1 ${
                        status === "graded" ? "bg-green-100 text-green-600" :
                        status === "submitted" ? "bg-purple-100 text-purple-600" :
                        isOverdue ? "bg-red-100 text-red-600" :
                        "bg-blue-100 text-blue-600"
                      }`}>
                        {status === "graded" ? <CheckCircle size={18} /> :
                         status === "submitted" ? <Send size={18} /> :
                         isOverdue ? <AlertCircle size={18} /> :
                         <ClipboardList size={18} />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{assignment.title}</h3>
                        <p className="text-sm text-gray-500">{assignment.program?.name}</p>
                        {assignment.description && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{assignment.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                          <span className="flex items-center gap-1 text-gray-500">
                            <Calendar size={14} />
                            Due: {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : "No deadline"}
                          </span>
                          <span className="font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                            {assignment.points} points
                          </span>
                          {status === "graded" && assignment.submission && (
                            <span className="font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">
                              Grade: {assignment.submission.grade}/{assignment.points}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge
                      status={
                        status === "graded" ? "Graded" :
                        status === "submitted" ? "Submitted" :
                        isOverdue ? "Overdue" : "Pending"
                      }
                    />
                    <Button
                      size="sm"
                      variant={status === "graded" ? "secondary" : "primary"}
                      onClick={() => openSubmission(assignment)}
                      disabled={isOverdue && !assignment.submission}
                    >
                      {status === "graded" ? "View" : status === "submitted" ? "Edit" : "Submit"}
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Submission Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selected?.title || "Submit Assignment"}
        size="lg"
      >
        {selected && (
          <div className="space-y-4">
            {/* Assignment Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">{selected.program?.name}</p>
              <h4 className="font-medium text-gray-900">{selected.title}</h4>
              {selected.description && (
                <p className="text-sm text-gray-600 mt-2">{selected.description}</p>
              )}
              {selected.instructions && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-700 mb-1">Instructions:</p>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{selected.instructions}</p>
                </div>
              )}
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                <span>Due: {selected.due_date ? new Date(selected.due_date).toLocaleString() : "No deadline"}</span>
                <span>{selected.points} points</span>
              </div>
            </div>

            {/* Graded Feedback */}
            {selected.submission?.status === "graded" && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-green-800">Grade</h5>
                  <span className="text-lg font-bold text-green-700">
                    {selected.submission.grade}/{selected.points}
                  </span>
                </div>
                {selected.submission.feedback && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-green-700 mb-1">Feedback:</p>
                    <p className="text-sm text-green-800">{selected.submission.feedback}</p>
                  </div>
                )}
              </div>
            )}

            {/* Submission Form */}
            {getStatus(selected) !== "graded" && (
              <>
                {selected.submission_type === "text" || selected.submission_type === "file" ? (
                  <FormField label="Your Answer" id="content">
                    <Textarea
                      id="content"
                      rows={6}
                      value={submissionContent}
                      onChange={(e) => setSubmissionContent(e.target.value)}
                      placeholder="Enter your response..."
                    />
                  </FormField>
                ) : null}

                {selected.submission_type === "link" && (
                  <FormField label="Submission Link" id="link">
                    <input
                      type="url"
                      id="link"
                      value={submissionLink}
                      onChange={(e) => setSubmissionLink(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </FormField>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    loading={submitting}
                    disabled={
                      (selected.submission_type === "text" && !submissionContent) ||
                      (selected.submission_type === "link" && !submissionLink)
                    }
                  >
                    <Send size={16} /> {selected.submission ? "Update" : "Submit"}
                  </Button>
                </div>
              </>
            )}

            {/* View-only for graded */}
            {getStatus(selected) === "graded" && (
              <div className="border rounded-lg p-4">
                <p className="text-xs font-medium text-gray-700 mb-2">Your Submission:</p>
                {selected.submission?.content && (
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{selected.submission.content}</p>
                )}
                {selected.submission?.link_url && (
                  <a
                    href={selected.submission.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    {selected.submission.link_url}
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </DashboardShell>
  );
}
