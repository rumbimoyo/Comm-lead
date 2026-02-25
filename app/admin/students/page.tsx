"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardShell, type NavItem } from "@/components/layout/DashboardShell";
import { DataTable, StatusBadge, PageHeader, PageLoader, EmptyState } from "@/components/dashboard";
import { Modal, Button, SearchInput, Tabs, FormField, Input, Select } from "@/components/dashboard/FormComponents";
import {
  Home, Users, GraduationCap, BookOpen, CreditCard, Calendar,
  FileText, Settings, UserCircle, Megaphone, Plus, Mail, Phone
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

interface StudentWithEnrollment extends Profile {
  hasEnrollment?: boolean;
}

export default function StudentsPage() {
  const { profile, isLoading, signOut, supabase } = useAuth(["admin", "super_admin"]);
  const [students, setStudents] = useState<StudentWithEnrollment[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Profile | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollForm, setEnrollForm] = useState({ programId: "" });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (profile && supabase) {
      fetchStudents();
      fetchPrograms();
    }
  }, [profile, supabase]);

  const fetchPrograms = async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from("programs")
      .select("*")
      .eq("is_active", true)
      .order("name");
    if (data) setPrograms(data as Program[]);
  };

  const fetchStudents = async () => {
    if (!supabase) return;
    
    // Fetch students
    const { data: studentsData, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "student")
      .order("created_at", { ascending: false });

    if (error || !studentsData) {
      setDataLoading(false);
      return;
    }

    // Fetch enrollments to check which students have them
    const studentIds = studentsData.map((s: Profile) => s.id);
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("user_id")
      .in("user_id", studentIds);

    type EnrollmentRow = { user_id: string };
    const enrolledIds = new Set(enrollments?.map((e: EnrollmentRow) => e.user_id) || []);
    
    const studentsWithEnrollmentStatus = studentsData.map((s: Profile) => ({
      ...s,
      hasEnrollment: enrolledIds.has(s.id),
    }));

    setStudents(studentsWithEnrollmentStatus as StudentWithEnrollment[]);
    setDataLoading(false);
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "approved" && s.is_approved) ||
      (activeTab === "pending" && !s.is_approved);
    return matchesSearch && matchesTab;
  });

  const handleApprove = async (studentId: string) => {
    if (!supabase) return;
    await supabase.from("profiles").update({ is_approved: true }).eq("id", studentId);
    fetchStudents();
  };

  const handleSuspend = async (studentId: string) => {
    if (!supabase) return;
    await supabase.from("profiles").update({ is_active: false }).eq("id", studentId);
    fetchStudents();
  };

  const handleEnrollStudent = async () => {
    if (!supabase || !selectedStudent || !enrollForm.programId) return;
    setActionLoading(true);
    
    const { error } = await supabase.from("enrollments").insert({
      user_id: selectedStudent.id,
      program_id: enrollForm.programId,
      status: "approved",
      payment_status: "pending",
    });

    if (error) {
      console.error("Error enrolling student:", error);
      alert("Error enrolling student: " + error.message);
    } else {
      setShowEnrollModal(false);
      setSelectedStudent(null);
      setEnrollForm({ programId: "" });
      fetchStudents();
    }
    setActionLoading(false);
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
        title="Students"
        description="Manage all registered students"
        actions={
          <Button onClick={() => setShowModal(true)}>
            <Plus size={16} /> Add Student
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="w-full sm:w-64">
          <SearchInput value={search} onChange={setSearch} placeholder="Search students..." />
        </div>
        <Tabs
          tabs={[
            { key: "all", label: "All", count: students.length },
            { key: "approved", label: "Approved", count: students.filter((s) => s.is_approved).length },
            { key: "pending", label: "Pending", count: students.filter((s) => !s.is_approved).length },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {filteredStudents.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No students found"
          description="No students match your current filters."
        />
      ) : (
        <DataTable
          loading={dataLoading}
          columns={[
            {
              key: "name",
              label: "Student",
              render: (item: Profile) => (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0D3B7D] flex items-center justify-center text-white text-sm font-bold">
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
              key: "phone",
              label: "Phone",
              render: (item: Profile) => <span className="text-sm">{item.phone || "-"}</span>,
            },
            {
              key: "city",
              label: "City",
              render: (item: Profile) => <span className="text-sm">{item.city || "-"}</span>,
            },
            {
              key: "status",
              label: "Status",
              render: (item: Profile) => (
                <div className="flex gap-2">
                  <StatusBadge status={item.is_approved ? "Approved" : "Pending"} />
                  {!item.is_active && <StatusBadge status="Suspended" variant="error" />}
                </div>
              ),
            },
            {
              key: "joined",
              label: "Joined",
              render: (item: Profile) => (
                <span className="text-sm text-gray-500">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              ),
            },
            {
              key: "actions",
              label: "Actions",
              render: (item: StudentWithEnrollment) => (
                <div className="flex gap-2">
                  {!item.hasEnrollment && (
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => {
                        setSelectedStudent(item);
                        setShowEnrollModal(true);
                      }}
                    >
                      Enroll
                    </Button>
                  )}
                  {!item.is_approved && (
                    <Button size="sm" onClick={() => handleApprove(item.id)}>
                      Approve
                    </Button>
                  )}
                  {item.is_active && (
                    <Button size="sm" variant="danger" onClick={() => handleSuspend(item.id)}>
                      Suspend
                    </Button>
                  )}
                </div>
              ),
            },
          ]}
          data={filteredStudents}
        />
      )}

      {/* Add Student Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Student" size="lg">
        <p className="text-gray-500 mb-4">
          Students typically register themselves. Use this form only for manual enrollment.
        </p>
        <div className="space-y-4">
          <FormField label="Full Name" id="name" required>
            <Input id="name" placeholder="Enter student name" />
          </FormField>
          <FormField label="Email" id="email" required>
            <Input id="email" type="email" placeholder="student@example.com" />
          </FormField>
          <FormField label="Phone" id="phone">
            <Input id="phone" placeholder="+263 77X XXX XXX" />
          </FormField>
          <FormField label="City" id="city">
            <Input id="city" placeholder="Harare" />
          </FormField>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button>Create Student</Button>
          </div>
        </div>
      </Modal>

      {/* Enroll Student Modal */}
      <Modal 
        isOpen={showEnrollModal} 
        onClose={() => {
          setShowEnrollModal(false);
          setSelectedStudent(null);
          setEnrollForm({ programId: "" });
        }} 
        title="Enroll Student in Program"
      >
        {selectedStudent && (
          <div className="space-y-4">
            <p className="text-gray-600">
              Enrolling <strong>{selectedStudent.full_name}</strong> ({selectedStudent.email})
            </p>
            <FormField label="Select Program" id="program" required>
              <Select
                id="program"
                value={enrollForm.programId}
                onChange={(e) => setEnrollForm({ programId: e.target.value })}
                placeholder="Choose a program..."
                options={programs.map((p) => ({ value: p.id, label: p.name }))}
              />
            </FormField>
            <div className="flex justify-end gap-3 pt-4">
              <Button 
                variant="secondary" 
                onClick={() => {
                  setShowEnrollModal(false);
                  setSelectedStudent(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleEnrollStudent}
                disabled={!enrollForm.programId || actionLoading}
              >
                {actionLoading ? "Enrolling..." : "Enroll Student"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardShell>
  );
}
