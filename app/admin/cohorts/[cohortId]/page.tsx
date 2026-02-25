"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { DashboardShell, type NavItem } from "@/components/layout/DashboardShell";
import { DataTable, StatusBadge, PageHeader, PageLoader, EmptyState } from "@/components/dashboard";
import { Modal, Button, SearchInput, FormField, Select, ConfirmDialog } from "@/components/dashboard/FormComponents";
import { createSupabaseBrowserClient } from "@/utils/supabase-browser";
import {
  Home, Users, GraduationCap, BookOpen, CreditCard, Calendar,
  FileText, Settings, UserCircle, Megaphone, ArrowLeft, Plus,
  UserPlus, Trash2, Crown, CheckCircle, XCircle
} from "lucide-react";
import type { Cohort, Program, Profile, Enrollment, CohortLecturer } from "@/types/database";

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
}

interface EnrollmentWithStudent extends Enrollment {
  student?: Profile;
  program?: Program;
}

interface CohortLecturerWithProfile extends CohortLecturer {
  lecturer?: Profile;
}

export default function CohortDetailPage() {
  const params = useParams();
  const router = useRouter();
  const cohortId = params.cohortId as string;

  const { profile, isLoading, signOut } = useAuth(["admin", "super_admin"]);
  const [cohort, setCohort] = useState<CohortWithProgram | null>(null);
  const [students, setStudents] = useState<EnrollmentWithStudent[]>([]);
  const [lecturers, setLecturers] = useState<CohortLecturerWithProfile[]>([]);
  const [availableStudents, setAvailableStudents] = useState<EnrollmentWithStudent[]>([]);
  const [availableLecturers, setAvailableLecturers] = useState<Profile[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Modals
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddLecturer, setShowAddLecturer] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<EnrollmentWithStudent | null>(null);
  const [selectedLecturer, setSelectedLecturer] = useState<CohortLecturerWithProfile | null>(null);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string>("");
  const [selectedLecturerId, setSelectedLecturerId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [removeType, setRemoveType] = useState<"student" | "lecturer">("student");

  const supabase = createSupabaseBrowserClient();

  const fetchStudents = useCallback(async () => {
    try {
      // Only query for 'approved' status ("active" doesn't exist in database enum)
      const { data: enrollmentsRaw, error } = await supabase
        .from("enrollments")
        .select("*")
        .eq("cohort_id", cohortId)
        .eq("status", "approved");

      if (error) {
        console.error("Error fetching enrollments:", error);
        return;
      }

      if (enrollmentsRaw && enrollmentsRaw.length > 0) {
        type EnrollmentRow = { user_id: string; program_id: string };
        const userIds = [...new Set(enrollmentsRaw.map((e: EnrollmentRow) => e.user_id).filter(Boolean))];
        const programIds = [...new Set(enrollmentsRaw.map((e: EnrollmentRow) => e.program_id).filter(Boolean))];

        const [profilesResult, programsResult] = await Promise.all([
          userIds.length > 0 ? supabase.from("profiles").select("*").in("id", userIds) : Promise.resolve({ data: [] }),
          programIds.length > 0 ? supabase.from("programs").select("*").in("id", programIds) : Promise.resolve({ data: [] }),
        ]);

        const profilesMap = new Map((profilesResult.data || []).map((p: Profile) => [p.id, p]));
        const programsMap = new Map((programsResult.data || []).map((p: Program) => [p.id, p]));

        const enriched = enrollmentsRaw.map((e: EnrollmentRow & Record<string, unknown>) => ({
          ...e,
          student: profilesMap.get(e.user_id) || null,
          program: programsMap.get(e.program_id) || null,
        }));

        setStudents(enriched as EnrollmentWithStudent[]);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cohortId]);

  const fetchLecturers = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("cohort_lecturers")
        .select("*, lecturer:profiles(*)")
        .eq("cohort_id", cohortId);

      setLecturers((data as CohortLecturerWithProfile[]) || []);
    } catch (error) {
      console.error("Error fetching lecturers:", error);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cohortId]);

  const fetchAvailableStudents = useCallback(async () => {
    console.log("fetchAvailableStudents called, cohort:", cohort?.id);
    if (!cohort) return;
    
    try {
      // Get all enrollments without a cohort assigned (pending or approved)
      const { data: unassignedEnrollments, error } = await supabase
        .from("enrollments")
        .select("*")
        .is("cohort_id", null)
        .in("status", ["pending", "approved"]);

      console.log("Available enrollments query result:", { count: unassignedEnrollments?.length, error });

      if (error) {
        console.error("Error fetching unassigned enrollments:", error);
        return;
      }

      const uniqueEnrollments = unassignedEnrollments || [];

      if (uniqueEnrollments.length > 0) {
        type EnrollmentRow = { user_id: string; program_id: string };
        const userIds = [...new Set(uniqueEnrollments.map((e: EnrollmentRow) => e.user_id).filter(Boolean))];
        const programIds = [...new Set(uniqueEnrollments.map((e: EnrollmentRow) => e.program_id).filter(Boolean))];

        const [profilesResult, programsResult] = await Promise.all([
          userIds.length > 0 ? supabase.from("profiles").select("*").in("id", userIds) : Promise.resolve({ data: [] }),
          programIds.length > 0 ? supabase.from("programs").select("*").in("id", programIds) : Promise.resolve({ data: [] }),
        ]);

        const profilesMap = new Map((profilesResult.data || []).map((p: Profile) => [p.id, p]));
        const programsMap = new Map((programsResult.data || []).map((p: Program) => [p.id, p]));

        const enriched = uniqueEnrollments
          .map((e: EnrollmentRow & Record<string, unknown>) => ({
            ...e,
            student: profilesMap.get(e.user_id) || null,
            program: programsMap.get(e.program_id) || null,
          }));

        setAvailableStudents(enriched as EnrollmentWithStudent[]);
      } else {
        setAvailableStudents([]);
      }
    } catch (error) {
      console.error("Error fetching available students:", error);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cohort?.id]);

  const fetchAvailableLecturers = useCallback(async () => {
    try {
      const { data: allLecturers } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "lecturer")
        .eq("is_active", true);

      const assignedIds = lecturers.map(l => l.lecturer_id);
      const available = (allLecturers || []).filter((l: Profile) => !assignedIds.includes(l.id));
      setAvailableLecturers(available as Profile[]);
    } catch (error) {
      console.error("Error fetching available lecturers:", error);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lecturers.length]);

  // Main data fetch - simplified approach without AbortController
  useEffect(() => {
    let isMounted = true;
    
    async function loadData() {
      if (!profile || !cohortId) return;
      
      try {
        // Fetch cohort first
        const { data: cohortData, error: cohortError } = await supabase
          .from("cohorts")
          .select("*, program:programs(*)")
          .eq("id", cohortId)
          .single();

        if (cohortError || !cohortData) {
          if (isMounted) router.push("/admin/cohorts");
          return;
        }
        
        if (isMounted) setCohort(cohortData as CohortWithProgram);

        // Fetch students for this cohort (only approved status)
        const { data: enrollmentsRaw } = await supabase
          .from("enrollments")
          .select("*")
          .eq("cohort_id", cohortId)
          .eq("status", "approved");

        if (enrollmentsRaw && enrollmentsRaw.length > 0 && isMounted) {
          type EnrollmentRow = { user_id: string; program_id: string };
          const userIds = [...new Set(enrollmentsRaw.map((e: EnrollmentRow) => e.user_id).filter(Boolean))];
          const programIds = [...new Set(enrollmentsRaw.map((e: EnrollmentRow) => e.program_id).filter(Boolean))];

          const profilesPromise = userIds.length > 0 ? 
            supabase.from("profiles").select("*").in("id", userIds) : 
            Promise.resolve({ data: [] });
          const programsPromise = programIds.length > 0 ? 
            supabase.from("programs").select("*").in("id", programIds) : 
            Promise.resolve({ data: [] });

          const [profilesResult, programsResult] = await Promise.all([profilesPromise, programsPromise]);

          if (isMounted) {
            const profilesMap = new Map((profilesResult.data || []).map((p: Profile) => [p.id, p]));
            const programsMap = new Map((programsResult.data || []).map((p: Program) => [p.id, p]));

            const enriched = enrollmentsRaw.map((e: EnrollmentRow & Record<string, unknown>) => ({
              ...e,
              student: profilesMap.get(e.user_id) || null,
              program: programsMap.get(e.program_id) || null,
            }));

            setStudents(enriched as EnrollmentWithStudent[]);
          }
        } else if (isMounted) {
          setStudents([]);
        }

        // Fetch lecturers for this cohort
        const { data: lecturersData } = await supabase
          .from("cohort_lecturers")
          .select("*, lecturer:profiles(*)")
          .eq("cohort_id", cohortId);

        if (isMounted) setLecturers((lecturersData as CohortLecturerWithProfile[]) || []);

      } catch (error) {
        if (isMounted) console.error("Error loading cohort data:", error);
      } finally {
        if (isMounted) setDataLoading(false);
      }
    }

    loadData();
    
    return () => { isMounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, cohortId]);

  // Fetch available students when cohort changes - simplified
  useEffect(() => {
    let isMounted = true;

    async function loadAvailableStudents() {
      if (!cohort) return;
      
      try {
        // Get all enrollments without a cohort assigned (pending or approved)
        const { data: unassignedEnrollments } = await supabase
          .from("enrollments")
          .select("*")
          .is("cohort_id", null)
          .in("status", ["pending", "approved"]);

        if (!isMounted) return;

        const uniqueEnrollments = unassignedEnrollments || [];

        if (uniqueEnrollments.length > 0) {
          type EnrollmentRow = { user_id: string; program_id: string };
          const userIds = [...new Set(uniqueEnrollments.map((e: EnrollmentRow) => e.user_id).filter(Boolean))];
          const programIds = [...new Set(uniqueEnrollments.map((e: EnrollmentRow) => e.program_id).filter(Boolean))];

          const [profilesResult, programsResult] = await Promise.all([
            userIds.length > 0 ? supabase.from("profiles").select("*").in("id", userIds) : Promise.resolve({ data: [] }),
            programIds.length > 0 ? supabase.from("programs").select("*").in("id", programIds) : Promise.resolve({ data: [] }),
          ]);

          if (isMounted) {
            const profilesMap = new Map((profilesResult.data || []).map((p: Profile) => [p.id, p]));
            const programsMap = new Map((programsResult.data || []).map((p: Program) => [p.id, p]));

            const enriched = uniqueEnrollments
              .map((e: EnrollmentRow & Record<string, unknown>) => ({
                ...e,
                student: profilesMap.get(e.user_id) || null,
                program: programsMap.get(e.program_id) || null,
              }));

            setAvailableStudents(enriched as EnrollmentWithStudent[]);
          }
        } else if (isMounted) {
          setAvailableStudents([]);
        }
      } catch (error) {
        if (isMounted) console.error("Error loading available students:", error);
      }
    }

    loadAvailableStudents();

    return () => { isMounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cohort?.id]);

  // Fetch available lecturers when assigned lecturers change - simplified
  useEffect(() => {
    let isMounted = true;

    async function loadAvailableLecturers() {
      try {
        const { data: allLecturers } = await supabase
          .from("profiles")
          .select("*")
          .eq("role", "lecturer")
          .eq("is_active", true);

        if (isMounted) {
          const assignedIds = lecturers.map(l => l.lecturer_id);
          const available = (allLecturers || []).filter((l: Profile) => !assignedIds.includes(l.id));
          setAvailableLecturers(available as Profile[]);
        }
      } catch (error) {
        if (isMounted) console.error("Error loading available lecturers:", error);
      }
    }

    loadAvailableLecturers();

    return () => { isMounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lecturers.length]);

  // Add student to cohort
  const handleAddStudent = async () => {
    console.log("handleAddStudent called, selectedEnrollmentId:", selectedEnrollmentId);
    if (!selectedEnrollmentId) {
      console.log("No enrollment selected");
      return;
    }
    setSaving(true);

    try {
      console.log("Updating enrollment to cohort:", cohortId);
      // Update the enrollment to assign to cohort and approve if pending
      const { error, data } = await supabase
        .from("enrollments")
        .update({ cohort_id: cohortId, status: "approved" })
        .eq("id", selectedEnrollmentId)
        .select();

      console.log("Student add result:", { error, data });

      if (error) {
        console.error("Supabase error adding student:", error);
        alert(`Error adding student: ${error.message}`);
        setSaving(false);
        return;
      }

      setSaving(false);
      setShowAddStudent(false);
      setSelectedEnrollmentId("");
      fetchStudents();
      fetchAvailableStudents();
    } catch (error) {
      setSaving(false);
      console.error("Error adding student to cohort:", error);
      alert("Error adding student to cohort");
    }
  };

  // Remove student from cohort
  const handleRemoveStudent = async () => {
    if (!selectedStudent) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from("enrollments")
        .update({ cohort_id: null })
        .eq("id", selectedStudent.id);

      if (error) {
        console.error("Supabase error removing student:", error);
        alert(`Error removing student: ${error.message}`);
        setSaving(false);
        return;
      }

      setSaving(false);
      setShowRemoveConfirm(false);
      setSelectedStudent(null);
      fetchStudents();
      fetchAvailableStudents();
    } catch (error) {
      setSaving(false);
      console.error("Error removing student from cohort:", error);
    }
  };

  // Add lecturer to cohort
  const handleAddLecturer = async () => {
    console.log("handleAddLecturer called, selectedLecturerId:", selectedLecturerId);
    if (!selectedLecturerId) {
      console.log("No lecturer selected");
      return;
    }
    setSaving(true);

    try {
      console.log("Inserting cohort_lecturer:", { cohort_id: cohortId, lecturer_id: selectedLecturerId });
      const { error, data } = await supabase
        .from("cohort_lecturers")
        .insert({
          cohort_id: cohortId,
          lecturer_id: selectedLecturerId,
          is_lead: lecturers.length === 0, // First lecturer is lead
        })
        .select();

      console.log("Lecturer add result:", { error, data });

      if (error) {
        console.error("Supabase error adding lecturer:", error);
        alert(`Error adding lecturer: ${error.message}`);
        setSaving(false);
        return;
      }

      setSaving(false);
      setShowAddLecturer(false);
      setSelectedLecturerId("");
      fetchLecturers();
    } catch (error) {
      setSaving(false);
      console.error("Error adding lecturer to cohort:", error);
      alert("Error adding lecturer to cohort");
    }
  };

  // Remove lecturer from cohort
  const handleRemoveLecturer = async () => {
    if (!selectedLecturer) return;
    setSaving(true);

    try {
      await supabase
        .from("cohort_lecturers")
        .delete()
        .eq("id", selectedLecturer.id);

      setSaving(false);
      setShowRemoveConfirm(false);
      setSelectedLecturer(null);
      fetchLecturers();
    } catch (error) {
      setSaving(false);
      console.error("Error removing lecturer from cohort:", error);
    }
  };

  // Toggle lead lecturer
  const toggleLeadLecturer = async (lecturerId: string, currentLead: boolean) => {
    try {
      // First, remove lead from all lecturers in this cohort
      await supabase
        .from("cohort_lecturers")
        .update({ is_lead: false })
        .eq("cohort_id", cohortId);

      // Then set the new lead if toggling on
      if (!currentLead) {
        await supabase
          .from("cohort_lecturers")
          .update({ is_lead: true })
          .eq("cohort_id", cohortId)
          .eq("lecturer_id", lecturerId);
      }

      fetchLecturers();
    } catch (error) {
      console.error("Error toggling lead lecturer:", error);
    }
  };

  if (isLoading || dataLoading) return <PageLoader />;
  if (!cohort) return null;

  return (
    <DashboardShell
      profile={profile}
      navigation={adminNavigation}
      title="Admin Portal"
      accentColor="#EBBD48"
      onSignOut={signOut}
    >
      {/* Back Link */}
      <Link
        href="/admin/cohorts"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft size={16} />
        Back to Cohorts
      </Link>

      <PageHeader
        title={cohort.name}
        description={`${cohort.program?.name} • ${new Date(cohort.start_date).toLocaleDateString()} - ${cohort.end_date ? new Date(cohort.end_date).toLocaleDateString() : "Ongoing"}`}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-gray-500">Students</p>
          <p className="text-2xl font-bold">{students.length} / {cohort.max_students}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-gray-500">Lecturers</p>
          <p className="text-2xl font-bold">{lecturers.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-gray-500">Status</p>
          <StatusBadge status={cohort.is_active ? "Active" : "Inactive"} />
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-gray-500">Enrollment</p>
          <StatusBadge status={cohort.is_enrollment_open ? "Open" : "Closed"} />
        </div>
      </div>

      {/* Lecturers Section */}
      <div className="bg-white rounded-xl border mb-8">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <UserCircle size={20} />
            Assigned Lecturers ({lecturers.length})
          </h2>
          <Button size="sm" onClick={() => setShowAddLecturer(true)}>
            <Plus size={14} /> Assign Lecturer
          </Button>
        </div>
        {lecturers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <UserCircle size={40} className="mx-auto mb-2 opacity-50" />
            <p>No lecturers assigned yet</p>
            <Button size="sm" variant="secondary" className="mt-2" onClick={() => setShowAddLecturer(true)}>
              Assign Lecturer
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {lecturers.map((item) => (
              <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0D3B7D] text-white flex items-center justify-center font-semibold">
                    {item.lecturer?.full_name?.charAt(0) || "L"}
                  </div>
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      {item.lecturer?.full_name}
                      {item.is_lead && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Crown size={12} /> Lead
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">{item.lecturer?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleLeadLecturer(item.lecturer_id, item.is_lead)}
                    title={item.is_lead ? "Remove as lead" : "Set as lead"}
                  >
                    <Crown size={14} className={item.is_lead ? "text-yellow-500" : "text-gray-300"} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedLecturer(item);
                      setRemoveType("lecturer");
                      setShowRemoveConfirm(true);
                    }}
                  >
                    <Trash2 size={14} className="text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Students Section */}
      <div className="bg-white rounded-xl border">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Users size={20} />
            Enrolled Students ({students.length})
          </h2>
          <Button size="sm" onClick={() => { fetchAvailableStudents(); setShowAddStudent(true); }}>
            <UserPlus size={14} /> Add Student
          </Button>
        </div>
        {students.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Users size={40} className="mx-auto mb-2 opacity-50" />
            <p>No students in this cohort yet</p>
            <Button size="sm" variant="secondary" className="mt-2" onClick={() => { fetchAvailableStudents(); setShowAddStudent(true); }}>
              Add Student
            </Button>
          </div>
        ) : (
          <DataTable
            loading={false}
            columns={[
              {
                key: "student",
                label: "Student",
                render: (item: EnrollmentWithStudent) => (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#EBBD48] text-white flex items-center justify-center font-semibold text-sm">
                      {item.student?.full_name?.charAt(0) || "S"}
                    </div>
                    <div>
                      <p className="font-medium">{item.student?.full_name}</p>
                      <p className="text-xs text-gray-500">{item.student?.email}</p>
                    </div>
                  </div>
                ),
              },
              {
                key: "phone",
                label: "Phone",
                render: (item: EnrollmentWithStudent) => (
                  <span className="text-sm">{item.student?.phone || "—"}</span>
                ),
              },
              {
                key: "status",
                label: "Status",
                render: (item: EnrollmentWithStudent) => (
                  <StatusBadge status={item.status} />
                ),
              },
              {
                key: "payment",
                label: "Payment",
                render: (item: EnrollmentWithStudent) => (
                  <StatusBadge status={item.payment_status} />
                ),
              },
              {
                key: "actions",
                label: "Actions",
                render: (item: EnrollmentWithStudent) => (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedStudent(item);
                      setRemoveType("student");
                      setShowRemoveConfirm(true);
                    }}
                  >
                    <Trash2 size={14} className="text-red-500" />
                  </Button>
                ),
              },
            ]}
            data={students}
          />
        )}
      </div>

      {/* Add Student Modal */}
      <Modal
        isOpen={showAddStudent}
        onClose={() => setShowAddStudent(false)}
        title="Add Student to Cohort"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Select a student enrolled in {cohort?.program?.name} to add to this cohort.
          </p>
          <div className="text-xs text-gray-500">
            Available students: {availableStudents.length} | 
            Selected: {selectedEnrollmentId || 'None'}
          </div>
          {availableStudents.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-700 text-sm">
              <p className="font-medium mb-2">No students available for this cohort</p>
              <p>To add students to this cohort, you need to:</p>
              <ol className="list-decimal list-inside ml-2 mt-2 space-y-1">
                <li>Go to <Link href="/admin/students" className="underline font-medium text-amber-800">Students page</Link></li>
                <li>Click &quot;Enroll&quot; button next to a student</li>
                <li>Select a program to enroll them in</li>
                <li>Then return here to add them to this cohort</li>
              </ol>
              <p className="mt-3 text-xs">
                Students must be enrolled in a program before they can be added to cohorts.
              </p>
            </div>
          ) : (
            <div>
              <FormField label="Select Student" id="student" required>
                <Select
                  id="student"
                  value={selectedEnrollmentId}
                  onChange={(e) => setSelectedEnrollmentId(e.target.value)}
                  placeholder="Choose a student"
                  options={availableStudents.map((e) => ({
                    value: e.id,
                    label: `${e.student?.full_name} (${e.student?.email}) - ${e.status}`,
                  }))}
                />
              </FormField>
              <div className="mt-2 text-xs text-gray-500">
                Debug: {availableStudents.map(s => `${s.student?.full_name}:${s.status}`).join(', ')}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => {
                console.log("Manual refresh triggered");
                fetchAvailableStudents();
              }}
            >
              Refresh Students
            </Button>
            <Button variant="secondary" onClick={() => setShowAddStudent(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddStudent}
              loading={saving}
              disabled={!selectedEnrollmentId}
            >
              Add to Cohort
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Lecturer Modal */}
      <Modal
        isOpen={showAddLecturer}
        onClose={() => setShowAddLecturer(false)}
        title="Assign Lecturer to Cohort"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Select a lecturer to assign to {cohort?.name}.
          </p>
          <div className="text-xs text-gray-500">
            Available lecturers: {availableLecturers.length} | 
            Currently assigned: {lecturers.length}
          </div>
          {availableLecturers.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-700 text-sm">
              <p className="font-medium mb-2">No lecturers available</p>
              <p>All active lecturers are already assigned to this cohort.</p>
              <Button 
                size="sm" 
                variant="secondary"
                className="mt-2"
                onClick={() => {
                  console.log("Refreshing available lecturers");
                  fetchAvailableLecturers();
                }}
              >
                Refresh Lecturers
              </Button>
            </div>
          ) : (
            <div>
              <FormField label="Select Lecturer" id="lecturer" required>
                <Select
                  id="lecturer"
                  value={selectedLecturerId}
                  onChange={(e) => setSelectedLecturerId(e.target.value)}
                  placeholder="Choose a lecturer"
                  options={availableLecturers.map((l) => ({
                    value: l.id,
                    label: `${l.full_name} (${l.specialization || "No specialization"})`,
                  }))}
                />
              </FormField>
              <div className="mt-2 text-xs text-gray-500">
                Debug: {availableLecturers.map(l => l.full_name).join(', ')}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => {
                console.log("Manual lecturer refresh triggered");
                fetchAvailableLecturers();
              }}
            >
              Refresh Lecturers
            </Button>
            <Button variant="secondary" onClick={() => setShowAddLecturer(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddLecturer}
              loading={saving}
              disabled={!selectedLecturerId}
            >
              Assign Lecturer
            </Button>
          </div>
        </div>
      </Modal>

      {/* Remove Confirmation */}
      <ConfirmDialog
        isOpen={showRemoveConfirm}
        onClose={() => {
          setShowRemoveConfirm(false);
          setSelectedStudent(null);
          setSelectedLecturer(null);
        }}
        onConfirm={removeType === "student" ? handleRemoveStudent : handleRemoveLecturer}
        title={removeType === "student" ? "Remove Student from Cohort" : "Remove Lecturer from Cohort"}
        message={
          removeType === "student"
            ? `Are you sure you want to remove ${selectedStudent?.student?.full_name} from this cohort? They will remain enrolled in the program.`
            : `Are you sure you want to remove ${selectedLecturer?.lecturer?.full_name} from this cohort?`
        }
        confirmLabel="Remove"
        variant="danger"
        loading={saving}
      />
    </DashboardShell>
  );
}
