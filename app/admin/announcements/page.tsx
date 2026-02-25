"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardShell, type NavItem } from "@/components/layout/DashboardShell";
import { DataTable, StatusBadge, PageHeader, PageLoader, EmptyState } from "@/components/dashboard";
import { Modal, Button, FormField, Input, Textarea, Select, ConfirmDialog } from "@/components/dashboard/FormComponents";
import { createSupabaseBrowserClient } from "@/utils/supabase-browser";
import {
  Home, Users, GraduationCap, BookOpen, CreditCard, Calendar,
  FileText, Settings, UserCircle, Megaphone, Plus, Edit, Trash2, Pin
} from "lucide-react";
import type { Announcement, Program } from "@/types/database";

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

export default function AnnouncementsPage() {
  const { profile, isLoading, signOut } = useAuth(["admin", "super_admin"]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Partial<Announcement> | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selected, setSelected] = useState<Announcement | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      fetchAnnouncements();
      fetchPrograms();
    }
  }, [profile]);

  const fetchAnnouncements = async () => {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setAnnouncements(data as Announcement[]);
    }
    setDataLoading(false);
  };

  const fetchPrograms = async () => {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.from("programs").select("id, name").eq("is_active", true);
    if (data) setPrograms(data as Program[]);
  };

  const handleOpenAdd = () => {
    setEditing({
      title: "",
      content: "",
      target_audience: "all",
      is_pinned: false,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editing?.title || !editing.content || !profile) return;
    setSaving(true);
    const supabase = createSupabaseBrowserClient();

    const data = {
      ...editing,
      created_by: profile.id,
    };

    if (editing.id) {
      await supabase.from("announcements").update(data).eq("id", editing.id);
    } else {
      await supabase.from("announcements").insert(data);
    }

    setSaving(false);
    setShowModal(false);
    fetchAnnouncements();
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.from("announcements").delete().eq("id", selected.id);
    setSaving(false);
    setShowDeleteConfirm(false);
    fetchAnnouncements();
  };

  const togglePin = async (announcement: Announcement) => {
    const supabase = createSupabaseBrowserClient();
    await supabase
      .from("announcements")
      .update({ is_pinned: !announcement.is_pinned })
      .eq("id", announcement.id);
    fetchAnnouncements();
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
        title="Announcements"
        description="Broadcast messages to students and lecturers"
        actions={
          <Button onClick={handleOpenAdd}>
            <Plus size={16} /> New Announcement
          </Button>
        }
      />

      {announcements.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No announcements yet"
          description="Create your first announcement to share with users."
          action={{ label: "Create Announcement", onClick: handleOpenAdd }}
        />
      ) : (
        <DataTable
          loading={dataLoading}
          columns={[
            {
              key: "title",
              label: "Announcement",
              render: (item: Announcement) => (
                <div className="max-w-md">
                  <div className="flex items-center gap-2">
                    {item.is_pinned && <Pin size={14} className="text-amber-500" />}
                    <p className="font-medium text-gray-900">{item.title}</p>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{item.content}</p>
                </div>
              ),
            },
            {
              key: "audience",
              label: "Audience",
              render: (item: Announcement) => (
                <span className="text-sm capitalize">{item.target_audience}</span>
              ),
            },
            {
              key: "date",
              label: "Created",
              render: (item: Announcement) => (
                <span className="text-sm text-gray-500">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              ),
            },
            {
              key: "expires",
              label: "Expires",
              render: (item: Announcement) => (
                <span className="text-sm text-gray-500">
                  {item.expires_at ? new Date(item.expires_at).toLocaleDateString() : "Never"}
                </span>
              ),
            },
            {
              key: "actions",
              label: "Actions",
              render: (item: Announcement) => (
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => togglePin(item)}>
                    <Pin size={14} className={item.is_pinned ? "text-amber-500" : ""} />
                  </Button>
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
                    variant="ghost"
                    onClick={() => {
                      setSelected(item);
                      setShowDeleteConfirm(true);
                    }}
                  >
                    <Trash2 size={14} className="text-red-500" />
                  </Button>
                </div>
              ),
            },
          ]}
          data={announcements}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing?.id ? "Edit Announcement" : "New Announcement"}
        size="lg"
      >
        {editing && (
          <div className="space-y-4">
            <FormField label="Title" id="title" required>
              <Input
                id="title"
                value={editing.title || ""}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                placeholder="Announcement title..."
              />
            </FormField>

            <FormField label="Content" id="content" required>
              <Textarea
                id="content"
                rows={5}
                value={editing.content || ""}
                onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                placeholder="Write your announcement..."
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Target Audience" id="audience">
                <Select
                  id="audience"
                  value={editing.target_audience || "all"}
                  onChange={(e) => setEditing({ ...editing, target_audience: e.target.value })}
                  options={[
                    { value: "all", label: "Everyone" },
                    { value: "students", label: "Students Only" },
                    { value: "lecturers", label: "Lecturers Only" },
                  ]}
                />
              </FormField>
              <FormField label="Program (Optional)" id="program">
                <Select
                  id="program"
                  value={editing.program_id || ""}
                  onChange={(e) => setEditing({ ...editing, program_id: e.target.value || null })}
                  placeholder="All programs"
                  options={programs.map((p) => ({ value: p.id, label: p.name }))}
                />
              </FormField>
            </div>

            <FormField label="Expires At (Optional)" id="expires">
              <Input
                id="expires"
                type="date"
                value={editing.expires_at?.split("T")[0] || ""}
                onChange={(e) => setEditing({ ...editing, expires_at: e.target.value || null })}
              />
            </FormField>

            <label className="flex items-center gap-2 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={editing.is_pinned || false}
                onChange={(e) => setEditing({ ...editing, is_pinned: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm">Pin to top</span>
            </label>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} loading={saving}>
                {editing.id ? "Save Changes" : "Publish Announcement"}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Announcement"
        message={`Are you sure you want to delete "${selected?.title}"?`}
        confirmLabel="Delete"
        variant="danger"
        loading={saving}
      />
    </DashboardShell>
  );
}
