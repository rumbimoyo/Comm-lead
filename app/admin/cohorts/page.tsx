"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { DashboardShell, type NavItem } from "@/components/layout/DashboardShell";
import { DataTable, StatusBadge, PageHeader, PageLoader, EmptyState } from "@/components/dashboard";
import { Modal, Button, SearchInput, FormField, Input, Select, ConfirmDialog } from "@/components/dashboard/FormComponents";
import { createSupabaseBrowserClient } from "@/utils/supabase-browser";
import {
  Home, Users, GraduationCap, BookOpen, CreditCard, Calendar,
  FileText, Settings, UserCircle, Megaphone, Plus, Edit, Trash2, Eye
} from "lucide-react";
import type { Cohort, Program } from "@/types/database";

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

interface CohortWithProgram extends Cohort {
  program?: Program;
  _count?: { enrollments: number };
}

export default function CohortsPage() {
  const { profile, isLoading, signOut } = useAuth(["admin", "super_admin"]);
  const [cohorts, setCohorts] = useState<CohortWithProgram[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCohort, setEditingCohort] = useState<Partial<Cohort> | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState<CohortWithProgram | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (!profile) return;
      
      try {
        const supabase = createSupabaseBrowserClient();
        
        const [cohortsResult, programsResult] = await Promise.all([
          supabase
            .from("cohorts")
            .select(`*, program:programs(*)`)
            .order("start_date", { ascending: false }),
          supabase
            .from("programs")
            .select("id, name")
            .eq("is_active", true)
            .order("name")
        ]);

        if (isMounted) {
          if (!cohortsResult.error && cohortsResult.data) {
            setCohorts(cohortsResult.data as CohortWithProgram[]);
          }
          if (!programsResult.error && programsResult.data) {
            setPrograms(programsResult.data as Program[]);
          }
          setDataLoading(false);
        }
      } catch (error) {
        // Ignore AbortError
        if (error instanceof Error && error.name === 'AbortError') return;
        console.error("Error loading cohorts:", error);
        if (isMounted) setDataLoading(false);
      }
    };

    loadData();
    
    return () => { isMounted = false; };
  }, [profile]);

  const fetchCohorts = async () => {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("cohorts")
      .select(`*, program:programs(*)`)
      .order("start_date", { ascending: false });

    if (!error && data) {
      setCohorts(data as CohortWithProgram[]);
    }
    setDataLoading(false);
  };

  const fetchPrograms = async () => {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase
      .from("programs")
      .select("id, name")
      .eq("is_active", true)
      .order("name");
    if (data) setPrograms(data as Program[]);
  };

  const handleOpenAdd = () => {
    setEditingCohort({
      name: "",
      program_id: "",
      start_date: "",
      end_date: "",
      max_students: 30,
      is_active: true,
      is_enrollment_open: true,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editingCohort?.name || !editingCohort.program_id) return;
    setSaving(true);
    const supabase = createSupabaseBrowserClient();

    if (editingCohort.id) {
      await supabase.from("cohorts").update(editingCohort).eq("id", editingCohort.id);
    } else {
      await supabase.from("cohorts").insert(editingCohort);
    }

    setSaving(false);
    setShowModal(false);
    fetchCohorts();
  };

  const handleDelete = async () => {
    if (!selectedCohort) return;
    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.from("cohorts").delete().eq("id", selectedCohort.id);
    setSaving(false);
    setShowDeleteConfirm(false);
    fetchCohorts();
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
        title="Cohorts"
        description="Manage program cohorts and class schedules"
        actions={
          <Button onClick={handleOpenAdd}>
            <Plus size={16} /> Add Cohort
          </Button>
        }
      />

      {cohorts.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No cohorts yet"
          description="Create your first cohort to start organizing students."
          action={{ label: "Add Cohort", onClick: handleOpenAdd }}
        />
      ) : (
        <DataTable
          loading={dataLoading}
          columns={[
            {
              key: "name",
              label: "Cohort",
              render: (item: CohortWithProgram) => (
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.program?.name}</p>
                </div>
              ),
            },
            {
              key: "dates",
              label: "Duration",
              render: (item: CohortWithProgram) => (
                <div className="text-sm">
                  <p>{new Date(item.start_date).toLocaleDateString()}</p>
                  {item.end_date && (
                    <p className="text-gray-500">to {new Date(item.end_date).toLocaleDateString()}</p>
                  )}
                </div>
              ),
            },
            {
              key: "capacity",
              label: "Capacity",
              render: (item: CohortWithProgram) => (
                <span className="text-sm">{item.max_students} students max</span>
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (item: CohortWithProgram) => (
                <div className="flex gap-2">
                  <StatusBadge status={item.is_active ? "Active" : "Inactive"} />
                  {item.is_enrollment_open && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Enrolling</span>
                  )}
                </div>
              ),
            },
            {
              key: "actions",
              label: "Actions",
              render: (item: CohortWithProgram) => (
                <div className="flex gap-2">
                  <Link href={`/admin/cohorts/${item.id}`}>
                    <Button size="sm" variant="ghost" title="Manage Students & Lecturers">
                      <Eye size={14} />
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingCohort(item);
                      setShowModal(true);
                    }}
                  >
                    <Edit size={14} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedCohort(item);
                      setShowDeleteConfirm(true);
                    }}
                  >
                    <Trash2 size={14} className="text-red-500" />
                  </Button>
                </div>
              ),
            },
          ]}
          data={cohorts}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingCohort?.id ? "Edit Cohort" : "Add New Cohort"}
        size="lg"
      >
        {editingCohort && (
          <div className="space-y-4">
            <FormField label="Cohort Name" id="name" required>
              <Input
                id="name"
                value={editingCohort.name || ""}
                onChange={(e) => setEditingCohort({ ...editingCohort, name: e.target.value })}
                placeholder="e.g., January 2026 Cohort"
              />
            </FormField>

            <FormField label="Program" id="program" required>
              <Select
                id="program"
                value={editingCohort.program_id || ""}
                onChange={(e) => setEditingCohort({ ...editingCohort, program_id: e.target.value })}
                placeholder="Select a program"
                options={programs.map((p) => ({ value: p.id, label: p.name }))}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Start Date" id="start" required>
                <Input
                  id="start"
                  type="date"
                  value={editingCohort.start_date || ""}
                  onChange={(e) => setEditingCohort({ ...editingCohort, start_date: e.target.value })}
                />
              </FormField>
              <FormField label="End Date" id="end">
                <Input
                  id="end"
                  type="date"
                  value={editingCohort.end_date || ""}
                  onChange={(e) => setEditingCohort({ ...editingCohort, end_date: e.target.value })}
                />
              </FormField>
            </div>

            <FormField label="Max Students" id="max">
              <Input
                id="max"
                type="number"
                value={editingCohort.max_students || 30}
                onChange={(e) => setEditingCohort({ ...editingCohort, max_students: Number(e.target.value) })}
              />
            </FormField>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingCohort.is_active || false}
                  onChange={(e) => setEditingCohort({ ...editingCohort, is_active: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Active</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingCohort.is_enrollment_open || false}
                  onChange={(e) => setEditingCohort({ ...editingCohort, is_enrollment_open: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Open for Enrollment</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} loading={saving}>
                {editingCohort.id ? "Save Changes" : "Create Cohort"}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Cohort"
        message={`Are you sure you want to delete "${selectedCohort?.name}"?`}
        confirmLabel="Delete"
        variant="danger"
        loading={saving}
      />
    </DashboardShell>
  );
}
