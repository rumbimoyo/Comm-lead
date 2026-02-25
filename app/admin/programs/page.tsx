"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardShell, type NavItem } from "@/components/layout/DashboardShell";
import { DataTable, StatusBadge, PageHeader, PageLoader, EmptyState } from "@/components/dashboard";
import { Modal, Button, SearchInput, FormField, Input, Textarea, Select, ConfirmDialog } from "@/components/dashboard/FormComponents";
import { createSupabaseBrowserClient } from "@/utils/supabase-browser";
import {
  Home, Users, GraduationCap, BookOpen, CreditCard, Calendar,
  FileText, Settings, UserCircle, Megaphone, Plus, Edit, Trash2, Eye
} from "lucide-react";
import type { Program } from "@/types/database";

const adminNavigation: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/enrollments", label: "Enrollments", icon: GraduationCap },
  { href: "/admin/programs", label: "Programs", icon: BookOpen },
  { href: "/admin/cohorts", label: "Cohorts", icon: Calendar },
  { href: "/admin/lecturers", label: "Lecturers", icon: UserCircle },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { href: "/admin/content", label: "Website", icon: FileText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

const emptyProgram: Partial<Program> = {
  name: "",
  slug: "",
  short_description: "",
  full_description: "",
  duration: "",
  delivery_mode: "hybrid",
  price: 0,
  currency: "USD",
  level: "beginner",
  outcomes: [],
  is_active: true,
  is_featured: false,
};

export default function ProgramsPage() {
  const { profile, isLoading, signOut } = useAuth(["admin", "super_admin"]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [search, setSearch] = useState("");
  const [dataLoading, setDataLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Partial<Program> | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) fetchPrograms();
  }, [profile]);

  const fetchPrograms = async () => {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("programs")
      .select("*")
      .order("order_index", { ascending: true });

    if (!error && data) {
      setPrograms(data as Program[]);
    }
    setDataLoading(false);
  };

  const filteredPrograms = programs.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.short_description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingProgram({ ...emptyProgram });
    setShowModal(true);
  };

  const handleOpenEdit = (program: Program) => {
    setEditingProgram({ ...program });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editingProgram?.name) return;
    setSaving(true);
    const supabase = createSupabaseBrowserClient();

    const slug = editingProgram.slug || editingProgram.name.toLowerCase().replace(/\s+/g, "-");
    const programData = {
      ...editingProgram,
      slug,
      outcomes: editingProgram.outcomes || [],
    };

    if (editingProgram.id) {
      await supabase.from("programs").update(programData).eq("id", editingProgram.id);
    } else {
      await supabase.from("programs").insert(programData);
    }

    setSaving(false);
    setShowModal(false);
    setEditingProgram(null);
    fetchPrograms();
  };

  const handleDelete = async () => {
    if (!selectedProgram) return;
    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.from("programs").delete().eq("id", selectedProgram.id);
    setSaving(false);
    setShowDeleteConfirm(false);
    setSelectedProgram(null);
    fetchPrograms();
  };

  const handleToggleActive = async (program: Program) => {
    const supabase = createSupabaseBrowserClient();
    await supabase.from("programs").update({ is_active: !program.is_active }).eq("id", program.id);
    fetchPrograms();
  };

  if (isLoading) return <PageLoader />;

  return (
    <DashboardShell
      profile={profile}
      navigation={adminNavigation}
      title="Admin Portal"
      accentColor="#EBBD48"
      onSignOut={signOut}
    >
      <PageHeader
        title="Programs"
        description="Manage your academy programs and courses"
        actions={
          <Button onClick={handleOpenAdd}>
            <Plus size={16} /> Add Program
          </Button>
        }
      />

      <div className="mb-6">
        <SearchInput value={search} onChange={setSearch} placeholder="Search programs..." />
      </div>

      {filteredPrograms.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No programs yet"
          description="Create your first program to get started."
          action={{ label: "Add Program", onClick: handleOpenAdd }}
        />
      ) : (
        <DataTable
          loading={dataLoading}
          columns={[
            {
              key: "name",
              label: "Program",
              render: (item: Program) => (
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500 truncate max-w-xs">{item.short_description}</p>
                </div>
              ),
            },
            {
              key: "level",
              label: "Level",
              render: (item: Program) => (
                <span className="capitalize text-sm">{item.level}</span>
              ),
            },
            {
              key: "price",
              label: "Price",
              render: (item: Program) => (
                <span className="font-medium">${item.price}</span>
              ),
            },
            {
              key: "duration",
              label: "Duration",
              render: (item: Program) => (
                <span className="text-sm text-gray-600">{item.duration || "-"}</span>
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (item: Program) => (
                <div className="flex gap-2">
                  <StatusBadge status={item.is_active ? "Active" : "Inactive"} />
                  {item.is_featured && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">Featured</span>
                  )}
                </div>
              ),
            },
            {
              key: "actions",
              label: "Actions",
              render: (item: Program) => (
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => handleOpenEdit(item)}>
                    <Edit size={14} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleToggleActive(item)}
                  >
                    {item.is_active ? "Disable" : "Enable"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedProgram(item);
                      setShowDeleteConfirm(true);
                    }}
                  >
                    <Trash2 size={14} className="text-red-500" />
                  </Button>
                </div>
              ),
            },
          ]}
          data={filteredPrograms}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingProgram?.id ? "Edit Program" : "Add New Program"}
        size="xl"
      >
        {editingProgram && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Program Name" id="name" required>
                <Input
                  id="name"
                  value={editingProgram.name || ""}
                  onChange={(e) => setEditingProgram({ ...editingProgram, name: e.target.value })}
                  placeholder="e.g., Public Relations Fundamentals"
                />
              </FormField>
              <FormField label="Slug (URL)" id="slug">
                <Input
                  id="slug"
                  value={editingProgram.slug || ""}
                  onChange={(e) => setEditingProgram({ ...editingProgram, slug: e.target.value })}
                  placeholder="auto-generated-from-name"
                />
              </FormField>
            </div>

            <FormField label="Short Description" id="short_desc">
              <Input
                id="short_desc"
                value={editingProgram.short_description || ""}
                onChange={(e) => setEditingProgram({ ...editingProgram, short_description: e.target.value })}
                placeholder="Brief summary for cards"
              />
            </FormField>

            <FormField label="Full Description" id="full_desc">
              <Textarea
                id="full_desc"
                rows={4}
                value={editingProgram.full_description || ""}
                onChange={(e) => setEditingProgram({ ...editingProgram, full_description: e.target.value })}
                placeholder="Detailed program description..."
              />
            </FormField>

            <div className="grid grid-cols-3 gap-4">
              <FormField label="Price (USD)" id="price" required>
                <Input
                  id="price"
                  type="number"
                  value={editingProgram.price || 0}
                  onChange={(e) => setEditingProgram({ ...editingProgram, price: Number(e.target.value) })}
                />
              </FormField>
              <FormField label="Duration" id="duration">
                <Input
                  id="duration"
                  value={editingProgram.duration || ""}
                  onChange={(e) => setEditingProgram({ ...editingProgram, duration: e.target.value })}
                  placeholder="e.g., 8 weeks"
                />
              </FormField>
              <FormField label="Level" id="level">
                <Select
                  id="level"
                  value={editingProgram.level || "beginner"}
                  onChange={(e) => setEditingProgram({ ...editingProgram, level: e.target.value as Program["level"] })}
                  options={[
                    { value: "beginner", label: "Beginner" },
                    { value: "intermediate", label: "Intermediate" },
                    { value: "advanced", label: "Advanced" },
                  ]}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Delivery Mode" id="delivery">
                <Select
                  id="delivery"
                  value={editingProgram.delivery_mode || "hybrid"}
                  onChange={(e) => setEditingProgram({ ...editingProgram, delivery_mode: e.target.value })}
                  options={[
                    { value: "online", label: "Online" },
                    { value: "in-person", label: "In-Person" },
                    { value: "hybrid", label: "Hybrid" },
                  ]}
                />
              </FormField>
              <FormField label="Schedule" id="schedule">
                <Input
                  id="schedule"
                  value={editingProgram.schedule || ""}
                  onChange={(e) => setEditingProgram({ ...editingProgram, schedule: e.target.value })}
                  placeholder="e.g., Saturdays 9am-12pm"
                />
              </FormField>
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingProgram.is_active || false}
                  onChange={(e) => setEditingProgram({ ...editingProgram, is_active: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Active (visible on website)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingProgram.is_featured || false}
                  onChange={(e) => setEditingProgram({ ...editingProgram, is_featured: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Featured</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} loading={saving}>
                {editingProgram.id ? "Save Changes" : "Create Program"}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Program"
        message={`Are you sure you want to delete "${selectedProgram?.name}"? This will also affect all enrollments for this program.`}
        confirmLabel="Delete"
        variant="danger"
        loading={saving}
      />
    </DashboardShell>
  );
}
