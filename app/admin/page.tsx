"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardShell, type NavItem } from "@/components/layout/DashboardShell";
import { StatCard, DataTable, StatusBadge, PageHeader, PageLoader } from "@/components/dashboard";
import { createSupabaseBrowserClient } from "@/utils/supabase-browser";
import {
  Home, Users, GraduationCap, BookOpen, CreditCard, Calendar,
  FileText, Settings, UserCircle, Megaphone, Clock
} from "lucide-react";
import Link from "next/link";
import type { Enrollment, Program, Profile } from "@/types/database";

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

interface DashboardStats {
  totalStudents: number;
  pendingEnrollments: number;
  activePrograms: number;
  totalRevenue: number;
  pendingPayments: number;
}

interface RecentEnrollment extends Enrollment {
  user?: Profile;
  program?: Program;
}

export default function AdminDashboardPage() {
  const { profile, isLoading, signOut } = useAuth(["admin", "super_admin"]);
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    pendingEnrollments: 0,
    activePrograms: 0,
    totalRevenue: 0,
    pendingPayments: 0,
  });
  const [recentEnrollments, setRecentEnrollments] = useState<RecentEnrollment[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchDashboardData();
    }
  }, [profile]);

  const fetchDashboardData = async () => {
    const supabase = createSupabaseBrowserClient();

    const [
      { count: studentCount },
      { count: pendingCount },
      { count: programCount },
      { data: payments },
      { data: enrollmentsRaw },
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "student"),
      supabase
        .from("enrollments")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("programs")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true),
      supabase
        .from("payment_logs")
        .select("amount, status")
        .eq("status", "confirmed"),
      supabase
        .from("enrollments")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    const totalRevenue = payments?.reduce((sum: number, p: { amount?: number }) => sum + (p.amount || 0), 0) || 0;
    const pendingPaymentsResult = await supabase
      .from("payment_logs")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    setStats({
      totalStudents: studentCount || 0,
      pendingEnrollments: pendingCount || 0,
      activePrograms: programCount || 0,
      totalRevenue,
      pendingPayments: pendingPaymentsResult.count || 0,
    });

    // Enrich enrollments with user and program data
    if (enrollmentsRaw && enrollmentsRaw.length > 0) {
      type EnrollmentRow = { user_id: string; program_id: string };
      const userIds = [...new Set(enrollmentsRaw.map((e: EnrollmentRow) => e.user_id).filter(Boolean))];
      const programIds = [...new Set(enrollmentsRaw.map((e: EnrollmentRow) => e.program_id).filter(Boolean))];

      const [usersResult, programsResult] = await Promise.all([
        userIds.length > 0 ? supabase.from("profiles").select("*").in("id", userIds) : Promise.resolve({ data: [] }),
        programIds.length > 0 ? supabase.from("programs").select("*").in("id", programIds) : Promise.resolve({ data: [] }),
      ]);

      const usersMap = new Map((usersResult.data || []).map((u: Profile) => [u.id, u]));
      const programsMap = new Map((programsResult.data || []).map((p: Program) => [p.id, p]));

      const enriched = enrollmentsRaw.map((e: EnrollmentRow & Record<string, unknown>) => ({
        ...e,
        user: usersMap.get(e.user_id) || null,
        program: programsMap.get(e.program_id) || null,
      }));

      setRecentEnrollments(enriched as RecentEnrollment[]);
    } else {
      setRecentEnrollments([]);
    }

    setDataLoading(false);
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <DashboardShell
      profile={profile}
      navigation={adminNavigation}
      title="Admin Portal"
      accentColor="#EBBD48"
      onSignOut={signOut}
    >
      <PageHeader
        title={`Welcome back, ${profile?.full_name?.split(" ")[0] || "Admin"}`}
        description="Here&apos;s what&apos;s happening with your academy today."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={Users}
          color="blue"
          loading={dataLoading}
        />
        <StatCard
          title="Pending Enrollments"
          value={stats.pendingEnrollments}
          icon={Clock}
          color="gold"
          loading={dataLoading}
        />
        <StatCard
          title="Active Programs"
          value={stats.activePrograms}
          icon={BookOpen}
          color="green"
          loading={dataLoading}
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={CreditCard}
          color="purple"
          loading={dataLoading}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <Link
          href="/admin/enrollments?status=pending"
          className="bg-amber-50 border border-amber-200 rounded-xl p-4 hover:shadow-md transition-shadow flex items-center gap-4"
        >
          <div className="p-3 bg-amber-100 rounded-xl">
            <Clock size={24} className="text-amber-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{stats.pendingEnrollments} Pending Approvals</p>
            <p className="text-sm text-gray-500">Review and approve enrollments</p>
          </div>
        </Link>

        <Link
          href="/admin/payments?status=pending"
          className="bg-blue-50 border border-blue-200 rounded-xl p-4 hover:shadow-md transition-shadow flex items-center gap-4"
        >
          <div className="p-3 bg-blue-100 rounded-xl">
            <CreditCard size={24} className="text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{stats.pendingPayments} Payment Confirmations</p>
            <p className="text-sm text-gray-500">Verify payment proofs</p>
          </div>
        </Link>

        <Link
          href="/admin/programs"
          className="bg-green-50 border border-green-200 rounded-xl p-4 hover:shadow-md transition-shadow flex items-center gap-4"
        >
          <div className="p-3 bg-green-100 rounded-xl">
            <BookOpen size={24} className="text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Manage Programs</p>
            <p className="text-sm text-gray-500">Add or edit courses</p>
          </div>
        </Link>
      </div>

      {/* Recent Enrollments */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Enrollments</h2>
          <Link
            href="/admin/enrollments"
            className="text-sm text-[#0D3B7D] hover:underline font-medium"
          >
            View all
          </Link>
        </div>
        <DataTable
          loading={dataLoading}
          emptyMessage="No enrollments yet"
          columns={[
            {
              key: "user",
              label: "Student",
              render: (item: RecentEnrollment) => (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#0D3B7D] flex items-center justify-center text-white text-xs font-bold">
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
              key: "program",
              label: "Program",
              render: (item: RecentEnrollment) => (
                <span className="text-sm">{item.program?.name || "N/A"}</span>
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (item: RecentEnrollment) => <StatusBadge status={item.status} />,
            },
            {
              key: "payment_status",
              label: "Payment",
              render: (item: RecentEnrollment) => <StatusBadge status={item.payment_status} />,
            },
            {
              key: "created_at",
              label: "Applied",
              render: (item: RecentEnrollment) => (
                <span className="text-sm text-gray-500">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              ),
            },
          ]}
          data={recentEnrollments}
        />
      </div>
    </DashboardShell>
  );
}
