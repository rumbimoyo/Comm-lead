"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardShell, type NavItem } from "@/components/layout/DashboardShell";
import { DataTable, StatusBadge, PageHeader, PageLoader, EmptyState } from "@/components/dashboard";
import { Modal, Button, SearchInput, Tabs, ConfirmDialog } from "@/components/dashboard/FormComponents";
import { createSupabaseBrowserClient } from "@/utils/supabase-browser";
import {
  Home, Users, GraduationCap, BookOpen, CreditCard, Calendar,
  FileText, Settings, UserCircle, Megaphone, Eye, CheckCircle, XCircle
} from "lucide-react";
import type { Enrollment, Profile, Program } from "@/types/database";

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

interface EnrollmentWithRelations extends Enrollment {
  student?: Profile;
  program?: Program;
}

export default function EnrollmentsPage() {
  const { profile, isLoading, signOut } = useAuth(["admin", "super_admin"]);
  const [enrollments, setEnrollments] = useState<EnrollmentWithRelations[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedEnrollment, setSelectedEnrollment] = useState<EnrollmentWithRelations | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"approve" | "reject" | "suspend" | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (profile) fetchEnrollments();
  }, [profile]);

  const fetchEnrollments = async () => {
    const supabase = createSupabaseBrowserClient();
    
    // First get enrollments
    const { data: enrollmentData, error: enrollmentError } = await supabase
      .from("enrollments")
      .select("*")
      .order("created_at", { ascending: false });

    if (enrollmentError) {
      console.error("Error fetching enrollments:", enrollmentError);
      setDataLoading(false);
      return;
    }

    if (!enrollmentData || enrollmentData.length === 0) {
      setEnrollments([]);
      setDataLoading(false);
      return;
    }

    // Get unique user_ids and program_ids
    type EnrollmentRow = { user_id: string; program_id: string };
    const userIds = [...new Set(enrollmentData.map((e: EnrollmentRow) => e.user_id).filter(Boolean))];
    const programIds = [...new Set(enrollmentData.map((e: EnrollmentRow) => e.program_id).filter(Boolean))];

    // Fetch profiles and programs in parallel
    const [profilesResult, programsResult] = await Promise.all([
      userIds.length > 0 
        ? supabase.from("profiles").select("*").in("id", userIds)
        : Promise.resolve({ data: [], error: null }),
      programIds.length > 0
        ? supabase.from("programs").select("*").in("id", programIds)
        : Promise.resolve({ data: [], error: null })
    ]);

    const profilesMap = new Map((profilesResult.data || []).map((p: Profile) => [p.id, p]));
    const programsMap = new Map((programsResult.data || []).map((p: Program) => [p.id, p]));

    // Combine data
    const enrichedEnrollments = enrollmentData.map((enrollment: EnrollmentRow & Record<string, unknown>) => ({
      ...enrollment,
      student: profilesMap.get(enrollment.user_id) || null,
      program: programsMap.get(enrollment.program_id) || null,
    }));

    setEnrollments(enrichedEnrollments as EnrollmentWithRelations[]);
    setDataLoading(false);
  };

  const filteredEnrollments = enrollments.filter((e) => {
    const matchesSearch =
      e.student?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      e.program?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === "all" || e.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const handleApprove = async () => {
    if (!selectedEnrollment) return;
    setActionLoading(true);
    const supabase = createSupabaseBrowserClient();
    
    // Get user_id from enrollment (could be in user_id field or from joined student object)
    const userId = (selectedEnrollment as unknown as { user_id?: string }).user_id || selectedEnrollment.student?.id;
    
    const { error: enrollError } = await supabase
      .from("enrollments")
      .update({ status: "approved", enrolled_at: new Date().toISOString() })
      .eq("id", selectedEnrollment.id);

    if (enrollError) {
      console.error("Error approving enrollment:", enrollError);
      alert("Error approving enrollment: " + enrollError.message);
      setActionLoading(false);
      return;
    }

    if (userId) {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ is_approved: true })
        .eq("id", userId);
      
      if (profileError) {
        console.error("Error updating profile:", profileError);
      }
    }

    setActionLoading(false);
    setShowConfirm(false);
    setShowDetailModal(false);
    fetchEnrollments();
  };

  const handleReject = async () => {
    if (!selectedEnrollment) return;
    setActionLoading(true);
    const supabase = createSupabaseBrowserClient();
    
    const { error } = await supabase
      .from("enrollments")
      .update({ status: "rejected" })
      .eq("id", selectedEnrollment.id);

    if (error) {
      console.error("Error rejecting enrollment:", error);
      alert("Error rejecting enrollment: " + error.message);
    }

    setActionLoading(false);
    setShowConfirm(false);
    setShowDetailModal(false);
    fetchEnrollments();
  };

  const handleSuspend = async () => {
    if (!selectedEnrollment) return;
    setActionLoading(true);
    const supabase = createSupabaseBrowserClient();
    
    const { error } = await supabase
      .from("enrollments")
      .update({ status: "suspended" })
      .eq("id", selectedEnrollment.id);

    if (error) {
      console.error("Error suspending enrollment:", error);
      alert("Error suspending enrollment: " + error.message);
    }

    setActionLoading(false);
    setShowConfirm(false);
    setShowDetailModal(false);
    fetchEnrollments();
  };

  const openConfirm = (enrollment: EnrollmentWithRelations, action: "approve" | "reject" | "suspend") => {
    setSelectedEnrollment(enrollment);
    setConfirmAction(action);
    setShowConfirm(true);
  };

  const tabCounts = {
    all: enrollments.length,
    pending: enrollments.filter((e) => e.status === "pending").length,
    approved: enrollments.filter((e) => e.status === "approved").length,
    rejected: enrollments.filter((e) => e.status === "rejected").length,
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
        title="Enrollments"
        description="Review and manage program enrollments"
      />

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="w-full sm:w-64">
          <SearchInput value={search} onChange={setSearch} placeholder="Search enrollments..." />
        </div>
        <Tabs
          tabs={[
            { key: "pending", label: "Pending", count: tabCounts.pending },
            { key: "approved", label: "Approved", count: tabCounts.approved },
            { key: "rejected", label: "Rejected", count: tabCounts.rejected },
            { key: "all", label: "All", count: tabCounts.all },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {filteredEnrollments.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No enrollments found"
          description={activeTab === "pending" ? "No pending enrollments to review." : "No enrollments match your filters."}
        />
      ) : (
        <DataTable
          loading={dataLoading}
          columns={[
            {
              key: "student",
              label: "Student",
              render: (item: EnrollmentWithRelations) => (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0D3B7D] flex items-center justify-center text-white text-sm font-bold">
                    {item.student?.full_name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.student?.full_name || "Unknown"}</p>
                    <p className="text-xs text-gray-500">{item.student?.email}</p>
                  </div>
                </div>
              ),
            },
            {
              key: "program",
              label: "Program",
              render: (item: EnrollmentWithRelations) => (
                <div>
                  <p className="font-medium text-gray-900">{item.program?.name || "N/A"}</p>
                  <p className="text-xs text-gray-500">${item.program?.price || 0}</p>
                </div>
              ),
            },
            {
              key: "scholarship",
              label: "Type",
              render: (item: EnrollmentWithRelations) => (
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  item.is_scholarship ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"
                }`}>
                  {item.is_scholarship ? "Scholarship" : "Regular"}
                </span>
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (item: EnrollmentWithRelations) => <StatusBadge status={item.status} />,
            },
            {
              key: "payment",
              label: "Payment",
              render: (item: EnrollmentWithRelations) => <StatusBadge status={item.payment_status} />,
            },
            {
              key: "date",
              label: "Applied",
              render: (item: EnrollmentWithRelations) => (
                <span className="text-sm text-gray-500">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              ),
            },
            {
              key: "actions",
              label: "Actions",
              render: (item: EnrollmentWithRelations) => (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedEnrollment(item);
                      setShowDetailModal(true);
                    }}
                  >
                    <Eye size={14} />
                  </Button>
                  {item.status === "pending" && (
                    <>
                      <Button size="sm" onClick={() => openConfirm(item, "approve")}>
                        <CheckCircle size={14} />
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => openConfirm(item, "reject")}>
                        <XCircle size={14} />
                      </Button>
                    </>
                  )}
                  {item.status === "approved" && (
                    <Button size="sm" variant="danger" onClick={() => openConfirm(item, "suspend")}>
                      Suspend
                    </Button>
                  )}
                </div>
              ),
            },
          ]}
          data={filteredEnrollments}
        />
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Enrollment Details"
        size="lg"
      >
        {selectedEnrollment && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b">
              <div className="w-16 h-16 rounded-full bg-[#0D3B7D] flex items-center justify-center text-white text-xl font-bold">
                {selectedEnrollment.student?.full_name?.charAt(0) || "?"}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{selectedEnrollment.student?.full_name}</h3>
                <p className="text-gray-500">{selectedEnrollment.student?.email}</p>
                <p className="text-sm text-gray-400">{selectedEnrollment.student?.phone}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Program</p>
                <p className="font-medium">{selectedEnrollment.program?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Price</p>
                <p className="font-medium">${selectedEnrollment.program?.price}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <StatusBadge status={selectedEnrollment.status} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment</p>
                <StatusBadge status={selectedEnrollment.payment_status} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="font-medium">{selectedEnrollment.is_scholarship ? "Scholarship Application" : "Regular Enrollment"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Applied</p>
                <p className="font-medium">{new Date(selectedEnrollment.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            {selectedEnrollment.motivation && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Motivation</p>
                <p className="bg-gray-50 p-4 rounded-lg text-sm">{selectedEnrollment.motivation}</p>
              </div>
            )}

            {selectedEnrollment.status === "pending" && (
              <div className="flex gap-3 pt-4 border-t">
                <Button className="flex-1" onClick={() => openConfirm(selectedEnrollment, "approve")}>
                  <CheckCircle size={16} /> Approve Enrollment
                </Button>
                <Button variant="danger" className="flex-1" onClick={() => openConfirm(selectedEnrollment, "reject")}>
                  <XCircle size={16} /> Reject
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={
          confirmAction === "approve" 
            ? handleApprove 
            : confirmAction === "suspend" 
            ? handleSuspend 
            : handleReject
        }
        title={
          confirmAction === "approve" 
            ? "Approve Enrollment" 
            : confirmAction === "suspend" 
            ? "Suspend Enrollment" 
            : "Reject Enrollment"
        }
        message={
          confirmAction === "approve"
            ? `Are you sure you want to approve ${selectedEnrollment?.student?.full_name}'s enrollment?`
            : confirmAction === "suspend"
            ? `Are you sure you want to suspend ${selectedEnrollment?.student?.full_name}'s enrollment?`
            : `Are you sure you want to reject ${selectedEnrollment?.student?.full_name}'s enrollment? This action cannot be undone.`
        }
        confirmLabel={confirmAction === "approve" ? "Approve" : confirmAction === "suspend" ? "Suspend" : "Reject"}
        variant={confirmAction === "approve" ? "info" : confirmAction === "suspend" ? "warning" : "danger"}
        loading={actionLoading}
      />
    </DashboardShell>
  );
}
