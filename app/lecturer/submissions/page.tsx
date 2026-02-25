"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardShell, type NavItem } from "@/components/layout/DashboardShell";
import { DataTable, StatCard, StatusBadge, PageHeader, PageLoader, EmptyState } from "@/components/dashboard";
import { Modal, Button, SearchInput, Select, FormField, Input, Textarea, Tabs } from "@/components/dashboard/FormComponents";
import { createSupabaseBrowserClient } from "@/utils/supabase-browser";
import {
  Home, BookOpen, Users, FileText, ClipboardList, Calendar, Settings, CheckSquare,
  Clock, CheckCircle, AlertCircle, Eye, Download
} from "lucide-react";
import type { Profile, Submission, Assignment, Program } from "@/types/database";

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

interface SubmissionWithRelations extends Submission {
  student?: Profile;
  assignment?: Assignment & { program?: Program };
}

export default function LecturerSubmissionsPage() {
  const { profile, isLoading, signOut } = useAuth("lecturer");
  const [submissions, setSubmissions] = useState<SubmissionWithRelations[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [search, setSearch] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [dataLoading, setDataLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<SubmissionWithRelations | null>(null);
  const [grading, setGrading] = useState({ grade: "", feedback: "" });
  const [saving, setSaving] = useState(false);

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
      // Get assignments for these programs
      const { data: assignments } = await supabase
        .from("assignments")
        .select("id")
        .in("program_id", programIds);

      const assignmentIds = assignments?.map((a: { id: string }) => a.id) || [];

      if (assignmentIds.length > 0) {
        // Get submissions
        const { data: submissionData } = await supabase
          .from("submissions")
          .select(`
            *,
            student:profiles!submissions_student_id_fkey(id, full_name, email, avatar_url),
            assignment:assignments(id, title, points, program:programs(id, name))
          `)
          .in("assignment_id", assignmentIds)
          .order("submitted_at", { ascending: false });

        setSubmissions((submissionData as SubmissionWithRelations[]) || []);
      }
    }

    setDataLoading(false);
  };

  const filteredSubmissions = submissions.filter((s) => {
    const matchesSearch =
      s.student?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.assignment?.title?.toLowerCase().includes(search.toLowerCase());
    const matchesProgram = !selectedProgram || s.assignment?.program?.id === selectedProgram;
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "pending" && s.status === "submitted") ||
      (activeTab === "graded" && s.status === "graded");
    return matchesSearch && matchesProgram && matchesTab;
  });

  const stats = {
    total: submissions.length,
    pending: submissions.filter((s) => s.status === "submitted").length,
    graded: submissions.filter((s) => s.status === "graded").length,
  };

  const openGrading = (submission: SubmissionWithRelations) => {
    setSelected(submission);
    setGrading({
      grade: submission.grade?.toString() || "",
      feedback: submission.feedback || "",
    });
    setShowModal(true);
  };

  const handleGrade = async () => {
    if (!selected || !profile) return;
    setSaving(true);
    const supabase = createSupabaseBrowserClient();

    await supabase
      .from("submissions")
      .update({
        grade: grading.grade ? Number(grading.grade) : null,
        feedback: grading.feedback,
        status: "graded",
        graded_at: new Date().toISOString(),
        graded_by: profile.id,
      })
      .eq("id", selected.id);

    setSaving(false);
    setShowModal(false);
    fetchData();
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
        title="Submissions"
        description="Review and grade student submissions"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatCard
          title="Total Submissions"
          value={stats.total}
          icon={FileText}
          color="purple"
        />
        <StatCard
          title="Pending Review"
          value={stats.pending}
          icon={Clock}
          color="yellow"
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
          <SearchInput value={search} onChange={setSearch} placeholder="Search submissions..." />
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
            { id: "graded", label: "Graded", count: stats.graded },
            { id: "all", label: "All", count: stats.total },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {filteredSubmissions.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No submissions found"
          description={submissions.length === 0 
            ? "No students have submitted work yet." 
            : "No submissions match your search criteria."}
        />
      ) : (
        <DataTable
          loading={dataLoading}
          columns={[
            {
              key: "student",
              label: "Student",
              render: (item: SubmissionWithRelations) => (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm font-medium text-purple-600">
                    {item.student?.full_name?.charAt(0) || "?"}
                  </div>
                  <span className="font-medium">{item.student?.full_name}</span>
                </div>
              ),
            },
            {
              key: "assignment",
              label: "Assignment",
              render: (item: SubmissionWithRelations) => (
                <div>
                  <p className="text-sm font-medium">{item.assignment?.title}</p>
                  <p className="text-xs text-gray-500">{item.assignment?.program?.name}</p>
                </div>
              ),
            },
            {
              key: "submitted",
              label: "Submitted",
              render: (item: SubmissionWithRelations) => (
                <div>
                  <p className="text-sm">{new Date(item.submitted_at || item.created_at).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(item.submitted_at || item.created_at).toLocaleTimeString()}
                  </p>
                </div>
              ),
            },
            {
              key: "grade",
              label: "Grade",
              render: (item: SubmissionWithRelations) => (
                <span className="text-sm">
                  {item.status === "graded"
                    ? `${item.grade || 0}/${item.assignment?.points || 100}`
                    : "-"}
                </span>
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (item: SubmissionWithRelations) => (
                <StatusBadge
                  status={item.status === "graded" ? "Graded" : "Pending"}
                />
              ),
            },
            {
              key: "actions",
              label: "Actions",
              render: (item: SubmissionWithRelations) => (
                <div className="flex gap-2">
                  {item.file_url && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(item.file_url!, "_blank")}
                    >
                      <Download size={14} />
                    </Button>
                  )}
                  <Button size="sm" onClick={() => openGrading(item)}>
                    <Eye size={14} /> {item.status === "graded" ? "View" : "Grade"}
                  </Button>
                </div>
              ),
            },
          ]}
          data={filteredSubmissions}
        />
      )}

      {/* Grading Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`Grade Submission - ${selected?.student?.full_name}`}
        size="lg"
      >
        {selected && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-1">{selected.assignment?.title}</h4>
              <p className="text-sm text-gray-600">{selected.assignment?.program?.name}</p>
              <p className="text-xs text-gray-500 mt-2">
                Submitted: {new Date(selected.submitted_at || selected.created_at).toLocaleString()}
              </p>
            </div>

            {/* Submission Content */}
            <div className="border rounded-lg p-4">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Submission</h5>
              {selected.content && (
                <div className="prose prose-sm max-w-none bg-white p-3 border rounded">
                  {selected.content}
                </div>
              )}
              {selected.file_url && (
                <a
                  href={selected.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 text-sm mt-2"
                >
                  <Download size={14} /> Download Submitted File
                </a>
              )}
              {selected.link_url && (
                <a
                  href={selected.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 text-sm mt-2"
                >
                  <Eye size={14} /> View Submitted Link
                </a>
              )}
            </div>

            {/* Grading Form */}
            <div className="grid grid-cols-2 gap-4">
              <FormField label={`Grade (out of ${selected.assignment?.points || 100})`} id="grade">
                <Input
                  id="grade"
                  type="number"
                  min={0}
                  max={selected.assignment?.points || 100}
                  value={grading.grade}
                  onChange={(e) => setGrading({ ...grading, grade: e.target.value })}
                  placeholder="0"
                />
              </FormField>
              <div className="flex items-end">
                <p className="text-sm text-gray-500 pb-2">
                  {grading.grade && selected.assignment?.points
                    ? `${Math.round((Number(grading.grade) / selected.assignment.points) * 100)}%`
                    : ""}
                </p>
              </div>
            </div>

            <FormField label="Feedback" id="feedback">
              <Textarea
                id="feedback"
                rows={4}
                value={grading.feedback}
                onChange={(e) => setGrading({ ...grading, feedback: e.target.value })}
                placeholder="Provide feedback for the student..."
              />
            </FormField>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleGrade} loading={saving}>
                {selected.status === "graded" ? "Update Grade" : "Submit Grade"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardShell>
  );
}
