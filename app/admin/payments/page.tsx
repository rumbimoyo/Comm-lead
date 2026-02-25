"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardShell, type NavItem } from "@/components/layout/DashboardShell";
import { DataTable, StatusBadge, PageHeader, PageLoader, EmptyState, StatCard } from "@/components/dashboard";
import { Modal, Button, SearchInput, Tabs, FormField, Textarea, ConfirmDialog } from "@/components/dashboard/FormComponents";
import { createSupabaseBrowserClient } from "@/utils/supabase-browser";
import {
  Home, Users, GraduationCap, BookOpen, CreditCard, Calendar,
  FileText, Settings, UserCircle, Megaphone, Eye, CheckCircle, XCircle, DollarSign
} from "lucide-react";
import type { PaymentLog, Profile, Enrollment, Program } from "@/types/database";

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

interface PaymentWithRelations extends PaymentLog {
  user?: Profile;
  enrollment?: Enrollment & { program?: Program };
}

export default function PaymentsPage() {
  const { profile, isLoading, signOut } = useAuth(["admin", "super_admin"]);
  const [payments, setPayments] = useState<PaymentWithRelations[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithRelations | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"confirm" | "reject" | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notes, setNotes] = useState("");

  const [stats, setStats] = useState({
    totalConfirmed: 0,
    totalPending: 0,
    pendingCount: 0,
  });

  useEffect(() => {
    if (profile) fetchPayments();
  }, [profile]);

  const fetchPayments = async () => {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("payment_logs")
      .select(`
        *,
        user:profiles!payment_logs_user_id_fkey(*),
        enrollment:enrollments(*, program:programs(*))
      `)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPayments(data as PaymentWithRelations[]);

      // Calculate stats
      const confirmed = data.filter((p: PaymentWithRelations) => p.status === "confirmed");
      const pending = data.filter((p: PaymentWithRelations) => p.status === "pending");
      setStats({
        totalConfirmed: confirmed.reduce((sum: number, p: PaymentWithRelations) => sum + (p.amount || 0), 0),
        totalPending: pending.reduce((sum: number, p: PaymentWithRelations) => sum + (p.amount || 0), 0),
        pendingCount: pending.length,
      });
    }
    setDataLoading(false);
  };

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.user?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.reference?.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === "all" || p.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const handleConfirmPayment = async () => {
    if (!selectedPayment || !profile) return;
    setActionLoading(true);
    const supabase = createSupabaseBrowserClient();

    await supabase
      .from("payment_logs")
      .update({
        status: "confirmed",
        confirmed_by: profile.id,
        confirmed_at: new Date().toISOString(),
        notes,
      })
      .eq("id", selectedPayment.id);

    // Update enrollment payment status
    if (selectedPayment.enrollment_id) {
      await supabase
        .from("enrollments")
        .update({ payment_status: "confirmed" })
        .eq("id", selectedPayment.enrollment_id);
    }

    setActionLoading(false);
    setShowConfirm(false);
    setShowDetailModal(false);
    setNotes("");
    fetchPayments();
  };

  const handleRejectPayment = async () => {
    if (!selectedPayment) return;
    setActionLoading(true);
    const supabase = createSupabaseBrowserClient();

    await supabase
      .from("payment_logs")
      .update({
        status: "failed",
        notes,
      })
      .eq("id", selectedPayment.id);

    setActionLoading(false);
    setShowConfirm(false);
    setShowDetailModal(false);
    setNotes("");
    fetchPayments();
  };

  const tabCounts = {
    all: payments.length,
    pending: payments.filter((p) => p.status === "pending").length,
    confirmed: payments.filter((p) => p.status === "confirmed").length,
    failed: payments.filter((p) => p.status === "failed").length,
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
        title="Payments"
        description="Review and confirm payment proofs"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Total Confirmed"
          value={`$${stats.totalConfirmed.toLocaleString()}`}
          icon={DollarSign}
          color="green"
          loading={dataLoading}
        />
        <StatCard
          title="Pending Verification"
          value={`$${stats.totalPending.toLocaleString()}`}
          icon={CreditCard}
          color="gold"
          loading={dataLoading}
        />
        <StatCard
          title="Payments to Review"
          value={stats.pendingCount}
          icon={Eye}
          color="blue"
          loading={dataLoading}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="w-full sm:w-64">
          <SearchInput value={search} onChange={setSearch} placeholder="Search payments..." />
        </div>
        <Tabs
          tabs={[
            { key: "pending", label: "Pending", count: tabCounts.pending },
            { key: "confirmed", label: "Confirmed", count: tabCounts.confirmed },
            { key: "failed", label: "Rejected", count: tabCounts.failed },
            { key: "all", label: "All", count: tabCounts.all },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {filteredPayments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No payments found"
          description={activeTab === "pending" ? "No pending payments to review." : "No payments match your filters."}
        />
      ) : (
        <DataTable
          loading={dataLoading}
          columns={[
            {
              key: "student",
              label: "Student",
              render: (item: PaymentWithRelations) => (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0D3B7D] flex items-center justify-center text-white text-sm font-bold">
                    {item.user?.full_name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.user?.full_name || "Unknown"}</p>
                    <p className="text-xs text-gray-500">{item.user?.email}</p>
                  </div>
                </div>
              ),
            },
            {
              key: "amount",
              label: "Amount",
              render: (item: PaymentWithRelations) => (
                <span className="font-semibold text-gray-900">
                  ${item.amount} {item.currency}
                </span>
              ),
            },
            {
              key: "method",
              label: "Method",
              render: (item: PaymentWithRelations) => (
                <span className="text-sm capitalize">{item.method?.replace("_", " ") || "-"}</span>
              ),
            },
            {
              key: "reference",
              label: "Reference",
              render: (item: PaymentWithRelations) => (
                <span className="text-sm text-gray-600 font-mono">{item.reference || "-"}</span>
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (item: PaymentWithRelations) => <StatusBadge status={item.status} />,
            },
            {
              key: "date",
              label: "Date",
              render: (item: PaymentWithRelations) => (
                <span className="text-sm text-gray-500">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              ),
            },
            {
              key: "actions",
              label: "Actions",
              render: (item: PaymentWithRelations) => (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedPayment(item);
                      setShowDetailModal(true);
                    }}
                  >
                    <Eye size={14} />
                  </Button>
                  {item.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedPayment(item);
                          setConfirmAction("confirm");
                          setShowConfirm(true);
                        }}
                      >
                        <CheckCircle size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          setSelectedPayment(item);
                          setConfirmAction("reject");
                          setShowConfirm(true);
                        }}
                      >
                        <XCircle size={14} />
                      </Button>
                    </>
                  )}
                </div>
              ),
            },
          ]}
          data={filteredPayments}
        />
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Payment Details"
        size="lg"
      >
        {selectedPayment && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Student</p>
                <p className="font-medium">{selectedPayment.user?.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Amount</p>
                <p className="font-medium text-lg">
                  ${selectedPayment.amount} {selectedPayment.currency}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="font-medium capitalize">{selectedPayment.method?.replace("_", " ")}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Reference</p>
                <p className="font-medium font-mono">{selectedPayment.reference || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Program</p>
                <p className="font-medium">{selectedPayment.enrollment?.program?.name || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <StatusBadge status={selectedPayment.status} />
              </div>
            </div>

            {selectedPayment.pop_description && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Proof Description</p>
                <p className="bg-gray-50 p-4 rounded-lg text-sm">{selectedPayment.pop_description}</p>
              </div>
            )}

            {selectedPayment.notes && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Admin Notes</p>
                <p className="bg-gray-50 p-4 rounded-lg text-sm">{selectedPayment.notes}</p>
              </div>
            )}

            {selectedPayment.status === "pending" && (
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  className="flex-1"
                  onClick={() => {
                    setConfirmAction("confirm");
                    setShowConfirm(true);
                  }}
                >
                  <CheckCircle size={16} /> Confirm Payment
                </Button>
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={() => {
                    setConfirmAction("reject");
                    setShowConfirm(true);
                  }}
                >
                  <XCircle size={16} /> Reject
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Confirm Dialog */}
      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title={confirmAction === "confirm" ? "Confirm Payment" : "Reject Payment"}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            {confirmAction === "confirm"
              ? `Confirm payment of $${selectedPayment?.amount} from ${selectedPayment?.user?.full_name}?`
              : `Reject payment from ${selectedPayment?.user?.full_name}? Please provide a reason.`}
          </p>

          <FormField label="Notes (optional)" id="notes">
            <Textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={confirmAction === "confirm" ? "Add any notes..." : "Reason for rejection..."}
            />
          </FormField>

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="secondary" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant={confirmAction === "confirm" ? "primary" : "danger"}
              loading={actionLoading}
              onClick={confirmAction === "confirm" ? handleConfirmPayment : handleRejectPayment}
            >
              {confirmAction === "confirm" ? "Confirm Payment" : "Reject Payment"}
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardShell>
  );
}
