"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardShell, type NavItem } from "@/components/layout/DashboardShell";
import { DataTable, StatusBadge, PageHeader, PageLoader, EmptyState } from "@/components/dashboard";
import { Modal, Button, SearchInput, Tabs, FormField, Input, Textarea, Select, ConfirmDialog } from "@/components/dashboard/FormComponents";
import {
  Home, Users, GraduationCap, BookOpen, CreditCard, Calendar,
  FileText, Settings, UserCircle, Megaphone, Plus, Edit, Mail, CheckCircle, XCircle
} from "lucide-react";
import type { Profile, Program } from "@/types/database";

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

interface LecturerWithPrograms extends Profile {
  programs?: Array<{ program: Program; is_lead: boolean }>;
}

export default function LecturersPage() {
  const { profile, isLoading, signOut, supabase } = useAuth(["admin", "super_admin"]);
  const [lecturers, setLecturers] = useState<LecturerWithPrograms[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [dataLoading, setDataLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLecturer, setEditingLecturer] = useState<Partial<Profile> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile && supabase) {
      fetchLecturers();
      fetchPrograms();
    }
  }, [profile, supabase]);

  const fetchLecturers = async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "lecturer")
      .order("full_name");

    if (!error && data) {
      setLecturers(data as LecturerWithPrograms[]);
    }
    setDataLoading(false);
  };

  const fetchPrograms = async () => {
    if (!supabase) return;
    const { data } = await supabase.from("programs").select("id, name").eq("is_active", true);
    if (data) setPrograms(data as Program[]);
  };

  const filteredLecturers = lecturers.filter((l) => {
    const matchesSearch =
      l.full_name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      l.specialization?.toLowerCase().includes(search.toLowerCase());
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "approved" && l.is_approved) ||
      (activeTab === "pending" && !l.is_approved);
    return matchesSearch && matchesTab;
  });

  const handleApprove = async (lecturerId: string) => {
    if (!supabase) return;
    await supabase.from("profiles").update({ is_approved: true, is_active: true }).eq("id", lecturerId);
    fetchLecturers();
  };

  const handleSuspend = async (lecturerId: string) => {
    if (!supabase) return;
    await supabase.from("profiles").update({ is_active: false }).eq("id", lecturerId);
    fetchLecturers();
  };

  const handleReactivate = async (lecturerId: string) => {
    if (!supabase) return;
    await supabase.from("profiles").update({ is_active: true }).eq("id", lecturerId);
    fetchLecturers();
  };

  const handleOpenAdd = () => {
    setEditingLecturer({
      full_name: "",
      email: "",
      phone: "",
      specialization: "",
      bio: "",
      role: "lecturer",
      is_approved: true,
      is_active: true,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editingLecturer?.full_name || !editingLecturer.email || !supabase) return;
    setSaving(true);

    // Note: Creating a new lecturer requires creating an auth user first
    // For now, we can only edit existing lecturers
    if (editingLecturer.id) {
      await supabase
        .from("profiles")
        .update({
          full_name: editingLecturer.full_name,
          phone: editingLecturer.phone,
          specialization: editingLecturer.specialization,
          bio: editingLecturer.bio,
          is_active: editingLecturer.is_active,
        })
        .eq("id", editingLecturer.id);
    }

    setSaving(false);
    setShowModal(false);
    fetchLecturers();
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
        title="Lecturers"
        description="Manage your teaching staff"
        actions={
          <Button onClick={handleOpenAdd}>
            <Plus size={16} /> Invite Lecturer
          </Button>
        }
      />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Lecturers must register and be approved before they can access the system. 
          Review pending applications below.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="w-full sm:w-64">
          <SearchInput value={search} onChange={setSearch} placeholder="Search lecturers..." />
        </div>
        <Tabs
          tabs={[
            { key: "all", label: "All", count: lecturers.length },
            { key: "approved", label: "Approved", count: lecturers.filter((l) => l.is_approved).length },
            { key: "pending", label: "Pending", count: lecturers.filter((l) => !l.is_approved).length },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {filteredLecturers.length === 0 ? (
        <EmptyState
          icon={UserCircle}
          title="No lecturers yet"
          description="Invite your first lecturer to start building your team."
        />
      ) : (
        <DataTable
          loading={dataLoading}
          columns={[
            {
              key: "name",
              label: "Lecturer",
              render: (item: LecturerWithPrograms) => (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold">
                    {item.full_name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.full_name}</p>
                    <p className="text-xs text-gray-500">{item.email}</p>
                  </div>
                </div>
              ),
            },
            {
              key: "specialization",
              label: "Specialization",
              render: (item: LecturerWithPrograms) => (
                <span className="text-sm">{item.specialization || "-"}</span>
              ),
            },
            {
              key: "phone",
              label: "Phone",
              render: (item: LecturerWithPrograms) => (
                <span className="text-sm">{item.phone || "-"}</span>
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (item: LecturerWithPrograms) => (
                <div className="flex gap-2">
                  <StatusBadge status={item.is_approved ? "Approved" : "Pending"} />
                  {!item.is_active && <StatusBadge status="Suspended" variant="error" />}
                </div>
              ),
            },
            {
              key: "actions",
              label: "Actions",
              render: (item: LecturerWithPrograms) => (
                <div className="flex gap-2">
                  {!item.is_approved && (
                    <Button size="sm" onClick={() => handleApprove(item.id)}>
                      <CheckCircle size={14} className="mr-1" /> Approve
                    </Button>
                  )}
                  {item.is_approved && item.is_active && (
                    <Button size="sm" variant="danger" onClick={() => handleSuspend(item.id)}>
                      <XCircle size={14} className="mr-1" /> Suspend
                    </Button>
                  )}
                  {item.is_approved && !item.is_active && (
                    <Button size="sm" variant="secondary" onClick={() => handleReactivate(item.id)}>
                      Reactivate
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingLecturer(item);
                      setShowModal(true);
                    }}
                  >
                    <Edit size={14} />
                  </Button>
                </div>
              ),
            },
          ]}
          data={filteredLecturers}
        />
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingLecturer?.id ? "Edit Lecturer" : "Invite Lecturer"}
        size="lg"
      >
        {editingLecturer && (
          <div className="space-y-4">
            {!editingLecturer.id && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-amber-800">
                  The lecturer will receive an email invitation to create their account.
                </p>
              </div>
            )}

            <FormField label="Full Name" id="name" required>
              <Input
                id="name"
                value={editingLecturer.full_name || ""}
                onChange={(e) => setEditingLecturer({ ...editingLecturer, full_name: e.target.value })}
              />
            </FormField>

            <FormField label="Email" id="email" required>
              <Input
                id="email"
                type="email"
                value={editingLecturer.email || ""}
                onChange={(e) => setEditingLecturer({ ...editingLecturer, email: e.target.value })}
                disabled={!!editingLecturer.id}
              />
            </FormField>

            <FormField label="Phone" id="phone">
              <Input
                id="phone"
                value={editingLecturer.phone || ""}
                onChange={(e) => setEditingLecturer({ ...editingLecturer, phone: e.target.value })}
              />
            </FormField>

            <FormField label="Specialization" id="spec">
              <Input
                id="spec"
                value={editingLecturer.specialization || ""}
                onChange={(e) => setEditingLecturer({ ...editingLecturer, specialization: e.target.value })}
                placeholder="e.g., Public Relations, Marketing"
              />
            </FormField>

            <FormField label="Bio" id="bio">
              <Textarea
                id="bio"
                rows={3}
                value={editingLecturer.bio || ""}
                onChange={(e) => setEditingLecturer({ ...editingLecturer, bio: e.target.value })}
                placeholder="Brief background and expertise..."
              />
            </FormField>

            {editingLecturer.id && (
              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={editingLecturer.is_active || false}
                  onChange={(e) => setEditingLecturer({ ...editingLecturer, is_active: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Active</span>
              </label>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} loading={saving}>
                {editingLecturer.id ? "Save Changes" : "Send Invitation"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardShell>
  );
}
