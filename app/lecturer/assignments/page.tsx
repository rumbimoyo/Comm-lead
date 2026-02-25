"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardShell, type NavItem } from "@/components/layout/DashboardShell";
import { DataTable, StatusBadge, PageHeader, PageLoader, EmptyState } from "@/components/dashboard";
import { Modal, Button, SearchInput, FormField, Input, Textarea, Select } from "@/components/dashboard/FormComponents";
import { createSupabaseBrowserClient } from "@/utils/supabase-browser";
import {
  Home, BookOpen, Users, FileText, ClipboardList, Calendar, Settings, CheckSquare,
  Plus, Edit
} from "lucide-react";
import type { Assignment, Program, Cohort } from "@/types/database";

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

interface AssignmentWithRelations extends Assignment {
  program?: Program;
  cohort?: Cohort;
  _count?: { submissions: number };
}

export default function LecturerAssignmentsPage() {
  const { profile, isLoading, signOut } = useAuth("lecturer");
  const [assignments, setAssignments] = useState<AssignmentWithRelations[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [search, setSearch] = useState("");
  const [dataLoading, setDataLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Partial<Assignment> | null>(null);
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

    // Fetch cohorts for these programs
    if (programIds.length > 0) {
      const { data: cohortData } = await supabase
        .from("cohorts")
        .select("*")
        .in("program_id", programIds);
      setCohorts(cohortData || []);

      // Fetch assignments
      const { data: assignmentData } = await supabase
        .from("assignments")
        .select("*, program:programs(id, name), cohort:cohorts(id, name)")
        .in("program_id", programIds)
        .order("due_date", { ascending: false });

      setAssignments((assignmentData as AssignmentWithRelations[]) || []);
    }

    setDataLoading(false);
  };

  const filteredAssignments = assignments.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.program?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditing({
      title: "",
      description: "",
      instructions: "",
      program_id: programs[0]?.id || "",
      cohort_id: cohorts[0]?.id || null,
      points: 100,
      due_date: "",
      submission_type: "file",
      is_published: false,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editing?.title || !editing.program_id || !profile) return;
    setSaving(true);
    const supabase = createSupabaseBrowserClient();

    const data = {
      ...editing,
      created_by: profile.id,
      allowed_file_types: editing.allowed_file_types || ["pdf", "doc", "docx"],
    };

    if (editing.id) {
      await supabase.from("assignments").update(data).eq("id", editing.id);
    } else {
      await supabase.from("assignments").insert(data);
    }

    setSaving(false);
    setShowModal(false);
    fetchData();
  };

  const togglePublish = async (assignment: Assignment) => {
    const supabase = createSupabaseBrowserClient();
    await supabase
      .from("assignments")
      .update({ is_published: !assignment.is_published })
      .eq("id", assignment.id);
    fetchData();
  };

  const getStatusLabel = (assignment: Assignment) => {
    if (!assignment.is_published) return "Draft";
    const now = new Date();
    const due = new Date(assignment.due_date || "");
    if (assignment.due_date && due < now) return "Closed";
    return "Active";
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
        title="Assignments"
        description="Create and manage student assignments"
        actions={
          <Button onClick={handleOpenAdd} disabled={programs.length === 0}>
            <Plus size={16} /> Create Assignment
          </Button>
        }
      />

      <div className="mb-6">
        <SearchInput value={search} onChange={setSearch} placeholder="Search assignments..." />
      </div>

      {filteredAssignments.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No assignments yet"
          description={programs.length === 0 
            ? "Get assigned to a program to start creating assignments." 
            : "Create your first assignment to get started."}
          action={programs.length > 0 ? { label: "Create Assignment", onClick: handleOpenAdd } : undefined}
        />
      ) : (
        <DataTable
          loading={dataLoading}
          columns={[
            {
              key: "assignment",
              label: "Assignment",
              render: (item: AssignmentWithRelations) => (
                <div>
                  <p className="font-medium text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.program?.name}</p>
                </div>
              ),
            },
            {
              key: "cohort",
              label: "Cohort",
              render: (item: AssignmentWithRelations) => (
                <span className="text-sm">{item.cohort?.name || "All"}</span>
              ),
            },
            {
              key: "due",
              label: "Due Date",
              render: (item: AssignmentWithRelations) => (
                <span className="text-sm text-gray-600">
                  {item.due_date ? new Date(item.due_date).toLocaleDateString() : "-"}
                </span>
              ),
            },
            {
              key: "points",
              label: "Points",
              render: (item: AssignmentWithRelations) => (
                <span className="text-sm">{item.points}</span>
              ),
            },
            {
              key: "type",
              label: "Type",
              render: (item: AssignmentWithRelations) => (
                <span className="capitalize text-sm">{item.submission_type}</span>
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (item: AssignmentWithRelations) => (
                <StatusBadge status={getStatusLabel(item)} />
              ),
            },
            {
              key: "actions",
              label: "Actions",
              render: (item: AssignmentWithRelations) => (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditing(item);
                      setShowModal(true);
                    }}
                  >
                    <Edit size={14} />
                  </Button>
                  <Button
                    size="sm"
                    variant={item.is_published ? "secondary" : "primary"}
                    onClick={() => togglePublish(item)}
                  >
                    {item.is_published ? "Unpublish" : "Publish"}
                  </Button>
                </div>
              ),
            },
          ]}
          data={filteredAssignments}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing?.id ? "Edit Assignment" : "Create New Assignment"}
        size="xl"
      >
        {editing && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Program" id="program" required>
                <Select
                  id="program"
                  value={editing.program_id || ""}
                  onChange={(e) => setEditing({ ...editing, program_id: e.target.value })}
                  options={programs.map((p) => ({ value: p.id, label: p.name }))}
                />
              </FormField>
              <FormField label="Cohort" id="cohort">
                <Select
                  id="cohort"
                  value={editing.cohort_id || ""}
                  onChange={(e) => setEditing({ ...editing, cohort_id: e.target.value || null })}
                  options={[
                    { value: "", label: "All Cohorts" },
                    ...cohorts
                      .filter((c) => c.program_id === editing.program_id)
                      .map((c) => ({ value: c.id, label: c.name })),
                  ]}
                />
              </FormField>
            </div>

            <FormField label="Assignment Title" id="title" required>
              <Input
                id="title"
                value={editing.title || ""}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                placeholder="e.g., Week 1 PR Strategy Analysis"
              />
            </FormField>

            <FormField label="Description" id="desc">
              <Textarea
                id="desc"
                rows={2}
                value={editing.description || ""}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                placeholder="Brief description for students"
              />
            </FormField>

            <FormField label="Instructions" id="instructions">
              <Textarea
                id="instructions"
                rows={4}
                value={editing.instructions || ""}
                onChange={(e) => setEditing({ ...editing, instructions: e.target.value })}
                placeholder="Detailed instructions for completing this assignment"
              />
            </FormField>

            <div className="grid grid-cols-3 gap-4">
              <FormField label="Due Date" id="due">
                <Input
                  id="due"
                  type="datetime-local"
                  value={editing.due_date?.slice(0, 16) || ""}
                  onChange={(e) => setEditing({ ...editing, due_date: e.target.value })}
                />
              </FormField>
              <FormField label="Points" id="points">
                <Input
                  id="points"
                  type="number"
                  value={editing.points || 100}
                  onChange={(e) => setEditing({ ...editing, points: Number(e.target.value) })}
                />
              </FormField>
              <FormField label="Submission Type" id="subtype">
                <Select
                  id="subtype"
                  value={editing.submission_type || "file"}
                  onChange={(e) => setEditing({ ...editing, submission_type: e.target.value as Assignment["submission_type"] })}
                  options={[
                    { value: "file", label: "File Upload" },
                    { value: "text", label: "Text Entry" },
                    { value: "link", label: "External Link" },
                  ]}
                />
              </FormField>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="secondary" onClick={() => handleSave()} loading={saving}>
                Save as Draft
              </Button>
              <Button onClick={() => { setEditing({ ...editing, is_published: true }); handleSave(); }} loading={saving}>
                Publish
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardShell>
  );
}
