"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardShell, type NavItem } from "@/components/layout/DashboardShell";
import { DataTable, StatusBadge, PageHeader, PageLoader, EmptyState } from "@/components/dashboard";
import { Modal, Button, SearchInput, FormField, Input, Textarea, Select } from "@/components/dashboard/FormComponents";
import { createSupabaseBrowserClient } from "@/utils/supabase-browser";
import {
  Home, BookOpen, Users, FileText, ClipboardList, Calendar, Settings, CheckSquare,
  Plus, Edit, Eye, Trash2
} from "lucide-react";
import type { Lesson, Program } from "@/types/database";

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

interface LessonWithProgram extends Lesson {
  program?: Program;
}

export default function LecturerLessonsPage() {
  const { profile, isLoading, signOut } = useAuth("lecturer");
  const [lessons, setLessons] = useState<LessonWithProgram[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [search, setSearch] = useState("");
  const [dataLoading, setDataLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Partial<Lesson> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      fetchPrograms();
      fetchLessons();
    }
  }, [profile]);

  const fetchPrograms = async () => {
    if (!profile) return;
    const supabase = createSupabaseBrowserClient();
    const { data: programLinks } = await supabase
      .from("program_lecturers")
      .select("program:programs(id, name)")
      .eq("lecturer_id", profile.id);

    // Handle Supabase join which may return array or single object
    const programs = programLinks?.map((p: any) => {
      return Array.isArray(p.program) ? p.program[0] : p.program;
    }).filter(Boolean) as Program[] || [];
    setPrograms(programs);
  };

  const fetchLessons = async () => {
    if (!profile) return;
    const supabase = createSupabaseBrowserClient();

    // Get program IDs first
    const { data: programLinks } = await supabase
      .from("program_lecturers")
      .select("program_id")
      .eq("lecturer_id", profile.id);

    const programIds = programLinks?.map((p: { program_id: string }) => p.program_id) || [];

    if (programIds.length > 0) {
      const { data } = await supabase
        .from("lessons")
        .select("*, program:programs(id, name)")
        .in("program_id", programIds)
        .order("program_id")
        .order("order_index");

      setLessons((data as LessonWithProgram[]) || []);
    }
    setDataLoading(false);
  };

  const filteredLessons = lessons.filter(
    (l) =>
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.program?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditing({
      title: "",
      description: "",
      content: "",
      program_id: programs[0]?.id || "",
      lesson_type: "text",
      order_index: lessons.length + 1,
      is_published: false,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editing?.title || !editing.program_id || !profile) return;
    setSaving(true);
    const supabase = createSupabaseBrowserClient();

    const slug = editing.slug || editing.title.toLowerCase().replace(/\s+/g, "-");
    const data = {
      ...editing,
      slug,
      created_by: profile.id,
      attachments: editing.attachments || [],
    };

    if (editing.id) {
      await supabase.from("lessons").update(data).eq("id", editing.id);
    } else {
      await supabase.from("lessons").insert(data);
    }

    setSaving(false);
    setShowModal(false);
    fetchLessons();
  };

  const togglePublish = async (lesson: Lesson) => {
    const supabase = createSupabaseBrowserClient();
    await supabase
      .from("lessons")
      .update({ is_published: !lesson.is_published })
      .eq("id", lesson.id);
    fetchLessons();
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
        title="Lessons"
        description="Create and manage course content"
        actions={
          <Button onClick={handleOpenAdd} disabled={programs.length === 0}>
            <Plus size={16} /> Create Lesson
          </Button>
        }
      />

      {programs.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-amber-800">
            You need to be assigned to a program before you can create lessons.
          </p>
        </div>
      )}

      <div className="mb-6">
        <SearchInput value={search} onChange={setSearch} placeholder="Search lessons..." />
      </div>

      {filteredLessons.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No lessons yet"
          description={programs.length === 0 
            ? "Get assigned to a program to start creating lessons." 
            : "Create your first lesson to get started."}
          action={programs.length > 0 ? { label: "Create Lesson", onClick: handleOpenAdd } : undefined}
        />
      ) : (
        <DataTable
          loading={dataLoading}
          columns={[
            {
              key: "lesson",
              label: "Lesson",
              render: (item: LessonWithProgram) => (
                <div>
                  <p className="font-medium text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.program?.name}</p>
                </div>
              ),
            },
            {
              key: "type",
              label: "Type",
              render: (item: LessonWithProgram) => (
                <span className="capitalize text-sm">{item.lesson_type}</span>
              ),
            },
            {
              key: "duration",
              label: "Duration",
              render: (item: LessonWithProgram) => (
                <span className="text-sm text-gray-600">
                  {item.estimated_duration ? `${item.estimated_duration} min` : "-"}
                </span>
              ),
            },
            {
              key: "order",
              label: "Order",
              render: (item: LessonWithProgram) => (
                <span className="text-sm">{item.order_index}</span>
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (item: LessonWithProgram) => (
                <StatusBadge status={item.is_published ? "Published" : "Draft"} />
              ),
            },
            {
              key: "actions",
              label: "Actions",
              render: (item: LessonWithProgram) => (
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
          data={filteredLessons}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing?.id ? "Edit Lesson" : "Create New Lesson"}
        size="xl"
      >
        {editing && (
          <div className="space-y-4">
            <FormField label="Program" id="program" required>
              <Select
                id="program"
                value={editing.program_id || ""}
                onChange={(e) => setEditing({ ...editing, program_id: e.target.value })}
                options={programs.map((p) => ({ value: p.id, label: p.name }))}
              />
            </FormField>

            <FormField label="Lesson Title" id="title" required>
              <Input
                id="title"
                value={editing.title || ""}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                placeholder="e.g., Introduction to PR Strategy"
              />
            </FormField>

            <FormField label="Description" id="desc">
              <Textarea
                id="desc"
                rows={2}
                value={editing.description || ""}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                placeholder="Brief overview of this lesson"
              />
            </FormField>

            <div className="grid grid-cols-3 gap-4">
              <FormField label="Type" id="type">
                <Select
                  id="type"
                  value={editing.lesson_type || "text"}
                  onChange={(e) => setEditing({ ...editing, lesson_type: e.target.value as Lesson["lesson_type"] })}
                  options={[
                    { value: "text", label: "Text/Reading" },
                    { value: "video", label: "Video" },
                    { value: "quiz", label: "Quiz" },
                    { value: "assignment", label: "Assignment" },
                    { value: "mixed", label: "Mixed" },
                  ]}
                />
              </FormField>
              <FormField label="Duration (mins)" id="duration">
                <Input
                  id="duration"
                  type="number"
                  value={editing.estimated_duration || ""}
                  onChange={(e) => setEditing({ ...editing, estimated_duration: Number(e.target.value) || null })}
                />
              </FormField>
              <FormField label="Order" id="order">
                <Input
                  id="order"
                  type="number"
                  value={editing.order_index || 1}
                  onChange={(e) => setEditing({ ...editing, order_index: Number(e.target.value) })}
                />
              </FormField>
            </div>

            {editing.lesson_type === "video" && (
              <FormField label="Video URL" id="video">
                <Input
                  id="video"
                  value={editing.video_url || ""}
                  onChange={(e) => setEditing({ ...editing, video_url: e.target.value })}
                  placeholder="https://..."
                />
              </FormField>
            )}

            <FormField label="Content" id="content">
              <Textarea
                id="content"
                rows={8}
                value={editing.content || ""}
                onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                placeholder="Lesson content (supports markdown)"
              />
            </FormField>

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
