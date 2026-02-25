"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardShell, type NavItem } from "@/components/layout/DashboardShell";
import { PageHeader, PageLoader, EmptyState } from "@/components/dashboard";
import { Modal, Button, FormField, Input, Textarea, Select } from "@/components/dashboard/FormComponents";
import { createSupabaseBrowserClient } from "@/utils/supabase-browser";
import {
  Home, BookOpen, Users, FileText, ClipboardList, Calendar,
  Settings, CheckSquare, Megaphone, Plus, Edit, Trash2, 
  FileUp, Link as LinkIcon, Video, File, ExternalLink, Clock, Star
} from "lucide-react";
import type { Cohort, CohortAnnouncement, CohortMaterial, CohortTask, Profile } from "@/types/database";
import { motion } from "framer-motion";

const lecturerNavigation: NavItem[] = [
  { href: "/lecturer", label: "Dashboard", icon: Home },
  { href: "/lecturer/programs", label: "My Programs", icon: BookOpen },
  { href: "/lecturer/cohorts", label: "My Cohorts", icon: Calendar },
  { href: "/lecturer/lessons", label: "Lessons", icon: FileText },
  { href: "/lecturer/assignments", label: "Assignments", icon: ClipboardList },
  { href: "/lecturer/students", label: "Students", icon: Users },
  { href: "/lecturer/attendance", label: "Attendance", icon: Calendar },
  { href: "/lecturer/submissions", label: "Submissions", icon: CheckSquare },
  { href: "/lecturer/settings", label: "Settings", icon: Settings },
];

type CohortWithDetails = Omit<Cohort, 'program'> & {
  program?: { id: string; name: string };
  _studentCount?: number;
};

export default function LecturerCohortsPage() {
  const { profile, isLoading, signOut } = useAuth("lecturer");
  const [cohorts, setCohorts] = useState<CohortWithDetails[]>([]);
  const [selectedCohort, setSelectedCohort] = useState<CohortWithDetails | null>(null);
  const [announcements, setAnnouncements] = useState<CohortAnnouncement[]>([]);
  const [materials, setMaterials] = useState<CohortMaterial[]>([]);
  const [tasks, setTasks] = useState<CohortTask[]>([]);
  const [activeTab, setActiveTab] = useState<"announcements" | "materials" | "tasks">("announcements");
  const [dataLoading, setDataLoading] = useState(true);
  
  // Modals
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  
  // Editing states
  const [editingAnnouncement, setEditingAnnouncement] = useState<Partial<CohortAnnouncement> | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<Partial<CohortMaterial> | null>(null);
  const [editingTask, setEditingTask] = useState<Partial<CohortTask> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) fetchCohorts();
  }, [profile]);

  useEffect(() => {
    if (selectedCohort) fetchCohortContent();
  }, [selectedCohort]);

  const fetchCohorts = async () => {
    if (!profile) return;
    const supabase = createSupabaseBrowserClient();

    // Fetch cohorts where this lecturer is assigned
    const { data: cohortLinks } = await supabase
      .from("cohort_lecturers")
      .select("cohort_id, cohort:cohorts(*, program:programs(id, name))")
      .eq("lecturer_id", profile.id);

    const cohortList = cohortLinks?.map((cl: any) => cl.cohort).filter(Boolean) || [];
    setCohorts(cohortList as CohortWithDetails[]);
    
    if (cohortList.length > 0 && !selectedCohort) {
      setSelectedCohort(cohortList[0]);
    }
    setDataLoading(false);
  };

  const fetchCohortContent = async () => {
    if (!selectedCohort) return;
    const supabase = createSupabaseBrowserClient();

    // Fetch announcements
    const { data: announcementData } = await supabase
      .from("cohort_announcements")
      .select("*")
      .eq("cohort_id", selectedCohort.id)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });

    setAnnouncements((announcementData as CohortAnnouncement[]) || []);

    // Fetch materials
    const { data: materialData } = await supabase
      .from("cohort_materials")
      .select("*")
      .eq("cohort_id", selectedCohort.id)
      .order("order_index")
      .order("created_at", { ascending: false });

    setMaterials((materialData as CohortMaterial[]) || []);

    // Fetch tasks
    const { data: taskData } = await supabase
      .from("cohort_tasks")
      .select("*")
      .eq("cohort_id", selectedCohort.id)
      .order("due_date", { ascending: true });

    setTasks((taskData as CohortTask[]) || []);
  };

  // ─── ANNOUNCEMENT HANDLERS ─────────────────────────────────────────────────

  const handleAddAnnouncement = () => {
    setEditingAnnouncement({
      title: "",
      content: "",
      priority: "normal",
      is_pinned: false,
    });
    setShowAnnouncementModal(true);
  };

  const handleSaveAnnouncement = async () => {
    if (!editingAnnouncement?.title || !selectedCohort || !profile) return;
    setSaving(true);
    const supabase = createSupabaseBrowserClient();

    const payload = {
      ...editingAnnouncement,
      cohort_id: selectedCohort.id,
      lecturer_id: profile.id,
    };

    if (editingAnnouncement.id) {
      await supabase.from("cohort_announcements").update(payload).eq("id", editingAnnouncement.id);
    } else {
      await supabase.from("cohort_announcements").insert(payload);
    }

    setSaving(false);
    setShowAnnouncementModal(false);
    fetchCohortContent();
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    const supabase = createSupabaseBrowserClient();
    await supabase.from("cohort_announcements").delete().eq("id", id);
    fetchCohortContent();
  };

  // ─── MATERIAL HANDLERS ─────────────────────────────────────────────────────

  const handleAddMaterial = () => {
    setEditingMaterial({
      title: "",
      description: "",
      material_type: "document",
      file_url: "",
      external_url: "",
      is_published: false,
    });
    setShowMaterialModal(true);
  };

  const handleSaveMaterial = async () => {
    if (!editingMaterial?.title || !selectedCohort || !profile) return;
    setSaving(true);
    const supabase = createSupabaseBrowserClient();

    const payload = {
      ...editingMaterial,
      cohort_id: selectedCohort.id,
      lecturer_id: profile.id,
    };

    if (editingMaterial.id) {
      await supabase.from("cohort_materials").update(payload).eq("id", editingMaterial.id);
    } else {
      await supabase.from("cohort_materials").insert(payload);
    }

    setSaving(false);
    setShowMaterialModal(false);
    fetchCohortContent();
  };

  const handleDeleteMaterial = async (id: string) => {
    if (!confirm("Delete this material?")) return;
    const supabase = createSupabaseBrowserClient();
    await supabase.from("cohort_materials").delete().eq("id", id);
    fetchCohortContent();
  };

  const handleTogglePublish = async (material: CohortMaterial) => {
    const supabase = createSupabaseBrowserClient();
    await supabase.from("cohort_materials").update({ is_published: !material.is_published }).eq("id", material.id);
    fetchCohortContent();
  };

  // ─── TASK HANDLERS ─────────────────────────────────────────────────────────

  const handleAddTask = () => {
    setEditingTask({
      title: "",
      description: "",
      instructions: "",
      due_date: "",
      points: 0,
      is_published: false,
    });
    setShowTaskModal(true);
  };

  const handleSaveTask = async () => {
    if (!editingTask?.title || !selectedCohort || !profile) return;
    setSaving(true);
    const supabase = createSupabaseBrowserClient();

    const payload = {
      ...editingTask,
      cohort_id: selectedCohort.id,
      lecturer_id: profile.id,
    };

    if (editingTask.id) {
      await supabase.from("cohort_tasks").update(payload).eq("id", editingTask.id);
    } else {
      await supabase.from("cohort_tasks").insert(payload);
    }

    setSaving(false);
    setShowTaskModal(false);
    fetchCohortContent();
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm("Delete this task?")) return;
    const supabase = createSupabaseBrowserClient();
    await supabase.from("cohort_tasks").delete().eq("id", id);
    fetchCohortContent();
  };

  const handleToggleTaskPublish = async (task: CohortTask) => {
    const supabase = createSupabaseBrowserClient();
    await supabase.from("cohort_tasks").update({ is_published: !task.is_published }).eq("id", task.id);
    fetchCohortContent();
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case "notes": return FileText;
      case "slides": return File;
      case "video": return Video;
      case "link": return LinkIcon;
      default: return File;
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <DashboardShell
      profile={profile}
      navigation={lecturerNavigation}
      title="Lecturer Portal"
      accentColor="#7C3AED"
      onSignOut={signOut}
    >
      <PageHeader
        title="My Cohorts"
        description="Manage content for your assigned cohorts"
      />

      {cohorts.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No cohorts assigned"
          description="You haven't been assigned to any cohorts yet. Contact an administrator."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Cohort Selector */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border shadow-sm p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Select Cohort</h3>
              <div className="space-y-2">
                {cohorts.map((cohort) => (
                  <button
                    key={cohort.id}
                    onClick={() => setSelectedCohort(cohort)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedCohort?.id === cohort.id
                        ? "bg-purple-50 border-2 border-purple-500"
                        : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                    }`}
                  >
                    <p className="font-medium text-gray-900">{cohort.name}</p>
                    <p className="text-xs text-gray-500">{cohort.program?.name}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {selectedCohort && (
              <>
                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setActiveTab("announcements")}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                      activeTab === "announcements"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Megaphone size={16} />
                    Announcements ({announcements.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("materials")}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                      activeTab === "materials"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <FileText size={16} />
                    Materials ({materials.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("tasks")}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                      activeTab === "tasks"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <ClipboardList size={16} />
                    Tasks ({tasks.length})
                  </button>
                </div>

                {/* Announcements Tab */}
                {activeTab === "announcements" && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold">Announcements</h2>
                      <Button onClick={handleAddAnnouncement}>
                        <Plus size={16} /> New Announcement
                      </Button>
                    </div>
                    {announcements.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        No announcements yet. Create one to inform your students.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {announcements.map((item, idx) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`bg-white rounded-lg border p-4 ${
                              item.is_pinned ? "border-purple-300 bg-purple-50" : ""
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex items-start gap-3">
                                {item.is_pinned && <Star size={16} className="text-purple-600 mt-1" />}
                                <div>
                                  <h3 className="font-medium text-gray-900">{item.title}</h3>
                                  <p className="text-sm text-gray-600 mt-1">{item.content}</p>
                                  <p className="text-xs text-gray-400 mt-2">
                                    {new Date(item.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <span className={`text-xs px-2 py-1 rounded ${
                                  item.priority === "urgent" ? "bg-red-100 text-red-700" :
                                  item.priority === "high" ? "bg-amber-100 text-amber-700" :
                                  "bg-gray-100 text-gray-600"
                                }`}>
                                  {item.priority}
                                </span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingAnnouncement(item);
                                    setShowAnnouncementModal(true);
                                  }}
                                >
                                  <Edit size={14} />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteAnnouncement(item.id)}
                                >
                                  <Trash2 size={14} className="text-red-500" />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Materials Tab */}
                {activeTab === "materials" && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold">Learning Materials</h2>
                      <Button onClick={handleAddMaterial}>
                        <Plus size={16} /> Add Material
                      </Button>
                    </div>
                    {materials.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        No materials yet. Upload notes, slides, or other resources.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {materials.map((item, idx) => {
                          const MaterialIcon = getMaterialIcon(item.material_type);
                          return (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="bg-white rounded-lg border p-4"
                            >
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${
                                  item.material_type === "notes" ? "bg-blue-100 text-blue-600" :
                                  item.material_type === "slides" ? "bg-amber-100 text-amber-600" :
                                  item.material_type === "video" ? "bg-red-100 text-red-600" :
                                  "bg-gray-100 text-gray-600"
                                }`}>
                                  <MaterialIcon size={20} />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-medium text-gray-900">{item.title}</h3>
                                  {item.description && (
                                    <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                                  )}
                                  <div className="flex items-center gap-3 mt-2">
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded capitalize">
                                      {item.material_type}
                                    </span>
                                    <span className={`text-xs px-2 py-1 rounded ${
                                      item.is_published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                                    }`}>
                                      {item.is_published ? "Published" : "Draft"}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleTogglePublish(item)}
                                    title={item.is_published ? "Unpublish" : "Publish"}
                                  >
                                    {item.is_published ? "Unpublish" : "Publish"}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setEditingMaterial(item);
                                      setShowMaterialModal(true);
                                    }}
                                  >
                                    <Edit size={14} />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteMaterial(item.id)}
                                  >
                                    <Trash2 size={14} className="text-red-500" />
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Tasks Tab */}
                {activeTab === "tasks" && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold">Tasks & Assignments</h2>
                      <Button onClick={handleAddTask}>
                        <Plus size={16} /> Add Task
                      </Button>
                    </div>
                    {tasks.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        No tasks yet. Create assignments for your students.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {tasks.map((item, idx) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white rounded-lg border p-4"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium text-gray-900">{item.title}</h3>
                                {item.description && (
                                  <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                                )}
                                <div className="flex items-center gap-3 mt-2">
                                  {item.due_date && (
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                      <Clock size={12} />
                                      Due: {new Date(item.due_date).toLocaleDateString()}
                                    </span>
                                  )}
                                  {item.points > 0 && (
                                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                      {item.points} pts
                                    </span>
                                  )}
                                  <span className={`text-xs px-2 py-1 rounded ${
                                    item.is_published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                                  }`}>
                                    {item.is_published ? "Published" : "Draft"}
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleToggleTaskPublish(item)}
                                >
                                  {item.is_published ? "Unpublish" : "Publish"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingTask(item);
                                    setShowTaskModal(true);
                                  }}
                                >
                                  <Edit size={14} />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteTask(item.id)}
                                >
                                  <Trash2 size={14} className="text-red-500" />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Announcement Modal */}
      <Modal
        isOpen={showAnnouncementModal}
        onClose={() => setShowAnnouncementModal(false)}
        title={editingAnnouncement?.id ? "Edit Announcement" : "New Announcement"}
        size="lg"
      >
        {editingAnnouncement && (
          <div className="space-y-4">
            <FormField label="Title" id="title" required>
              <Input
                id="title"
                value={editingAnnouncement.title || ""}
                onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, title: e.target.value })}
                placeholder="Announcement title"
              />
            </FormField>
            <FormField label="Content" id="content" required>
              <Textarea
                id="content"
                rows={4}
                value={editingAnnouncement.content || ""}
                onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, content: e.target.value })}
                placeholder="Write your announcement..."
              />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Priority" id="priority">
                <Select
                  id="priority"
                  value={editingAnnouncement.priority || "normal"}
                  onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, priority: e.target.value as any })}
                  options={[
                    { value: "low", label: "Low" },
                    { value: "normal", label: "Normal" },
                    { value: "high", label: "High" },
                    { value: "urgent", label: "Urgent" },
                  ]}
                />
              </FormField>
              <FormField label="Pin" id="pinned">
                <label className="flex items-center gap-2 h-10">
                  <input
                    type="checkbox"
                    checked={editingAnnouncement.is_pinned || false}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, is_pinned: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Pin to top</span>
                </label>
              </FormField>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="secondary" onClick={() => setShowAnnouncementModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveAnnouncement} loading={saving}>
                {editingAnnouncement.id ? "Save Changes" : "Post Announcement"}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Material Modal */}
      <Modal
        isOpen={showMaterialModal}
        onClose={() => setShowMaterialModal(false)}
        title={editingMaterial?.id ? "Edit Material" : "Add Material"}
        size="lg"
      >
        {editingMaterial && (
          <div className="space-y-4">
            <FormField label="Title" id="mat-title" required>
              <Input
                id="mat-title"
                value={editingMaterial.title || ""}
                onChange={(e) => setEditingMaterial({ ...editingMaterial, title: e.target.value })}
                placeholder="Material title"
              />
            </FormField>
            <FormField label="Description" id="mat-desc">
              <Textarea
                id="mat-desc"
                rows={2}
                value={editingMaterial.description || ""}
                onChange={(e) => setEditingMaterial({ ...editingMaterial, description: e.target.value })}
                placeholder="Brief description (optional)"
              />
            </FormField>
            <FormField label="Type" id="mat-type">
              <Select
                id="mat-type"
                value={editingMaterial.material_type || "document"}
                onChange={(e) => setEditingMaterial({ ...editingMaterial, material_type: e.target.value as any })}
                options={[
                  { value: "notes", label: "Lecture Notes" },
                  { value: "slides", label: "Slides" },
                  { value: "video", label: "Video" },
                  { value: "document", label: "Document" },
                  { value: "link", label: "External Link" },
                  { value: "other", label: "Other" },
                ]}
              />
            </FormField>
            <FormField label="File URL (upload to storage first)" id="mat-file">
              <Input
                id="mat-file"
                value={editingMaterial.file_url || ""}
                onChange={(e) => setEditingMaterial({ ...editingMaterial, file_url: e.target.value })}
                placeholder="https://.../file.pdf"
              />
            </FormField>
            <FormField label="External Link" id="mat-link">
              <Input
                id="mat-link"
                value={editingMaterial.external_url || ""}
                onChange={(e) => setEditingMaterial({ ...editingMaterial, external_url: e.target.value })}
                placeholder="https://youtube.com/..."
              />
            </FormField>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editingMaterial.is_published || false}
                onChange={(e) => setEditingMaterial({ ...editingMaterial, is_published: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm">Publish immediately (students can view)</span>
            </label>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="secondary" onClick={() => setShowMaterialModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveMaterial} loading={saving}>
                {editingMaterial.id ? "Save Changes" : "Add Material"}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Task Modal */}
      <Modal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        title={editingTask?.id ? "Edit Task" : "Add Task"}
        size="lg"
      >
        {editingTask && (
          <div className="space-y-4">
            <FormField label="Title" id="task-title" required>
              <Input
                id="task-title"
                value={editingTask.title || ""}
                onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                placeholder="Task title"
              />
            </FormField>
            <FormField label="Description" id="task-desc">
              <Textarea
                id="task-desc"
                rows={2}
                value={editingTask.description || ""}
                onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                placeholder="Brief overview"
              />
            </FormField>
            <FormField label="Instructions" id="task-inst">
              <Textarea
                id="task-inst"
                rows={4}
                value={editingTask.instructions || ""}
                onChange={(e) => setEditingTask({ ...editingTask, instructions: e.target.value })}
                placeholder="Detailed instructions for students..."
              />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Due Date" id="task-due">
                <Input
                  id="task-due"
                  type="datetime-local"
                  value={editingTask.due_date?.slice(0, 16) || ""}
                  onChange={(e) => setEditingTask({ ...editingTask, due_date: e.target.value })}
                />
              </FormField>
              <FormField label="Points" id="task-pts">
                <Input
                  id="task-pts"
                  type="number"
                  min="0"
                  value={editingTask.points || 0}
                  onChange={(e) => setEditingTask({ ...editingTask, points: parseInt(e.target.value) || 0 })}
                />
              </FormField>
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editingTask.is_published || false}
                onChange={(e) => setEditingTask({ ...editingTask, is_published: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm">Publish immediately (students can view and submit)</span>
            </label>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="secondary" onClick={() => setShowTaskModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveTask} loading={saving}>
                {editingTask.id ? "Save Changes" : "Create Task"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardShell>
  );
}
