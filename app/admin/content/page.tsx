"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardShell, type NavItem } from "@/components/layout/DashboardShell";
import { DataTable, PageHeader, PageLoader, EmptyState } from "@/components/dashboard";
import { Modal, Button, Tabs, FormField, Input, Textarea } from "@/components/dashboard/FormComponents";
import { createSupabaseBrowserClient } from "@/utils/supabase-browser";
import {
  Home, Users, GraduationCap, BookOpen, CreditCard, Calendar,
  FileText, Settings, UserCircle, Megaphone, Plus, Edit, Image, Quote, Users2
} from "lucide-react";
import type { WebsiteContent, Testimonial, TeamMember, Event } from "@/types/database";

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

export default function ContentPage() {
  const { profile, isLoading, signOut } = useAuth(["admin", "super_admin"]);
  const [activeTab, setActiveTab] = useState("hero");
  const [content, setContent] = useState<WebsiteContent[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editing, setEditing] = useState<any | null>(null);
  const [editType, setEditType] = useState<"content" | "testimonial" | "team" | "event">("content");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) fetchAll();
  }, [profile]);

  const fetchAll = async () => {
    const supabase = createSupabaseBrowserClient();
    
    const [contentRes, testimonialsRes, teamRes, eventsRes] = await Promise.all([
      supabase.from("website_content").select("*").order("section").order("order_index"),
      supabase.from("testimonials").select("*").order("order_index"),
      supabase.from("team_members").select("*").order("order_index"),
      supabase.from("events").select("*").order("date", { ascending: false }),
    ]);

    if (contentRes.data) setContent(contentRes.data as WebsiteContent[]);
    if (testimonialsRes.data) setTestimonials(testimonialsRes.data as Testimonial[]);
    if (teamRes.data) setTeamMembers(teamRes.data as TeamMember[]);
    if (eventsRes.data) setEvents(eventsRes.data as Event[]);
    
    setDataLoading(false);
  };

  const handleSaveContent = async () => {
    if (!editing || !profile) return;
    setSaving(true);
    const supabase = createSupabaseBrowserClient();

    const data = { ...editing, updated_by: profile.id, updated_at: new Date().toISOString() };

    if (editing.id) {
      await supabase.from("website_content").update(data).eq("id", editing.id);
    } else {
      await supabase.from("website_content").insert(data);
    }

    setSaving(false);
    setShowModal(false);
    fetchAll();
  };

  const handleSaveTestimonial = async () => {
    if (!editing) return;
    setSaving(true);
    const supabase = createSupabaseBrowserClient();

    if (editing.id) {
      await supabase.from("testimonials").update(editing).eq("id", editing.id);
    } else {
      await supabase.from("testimonials").insert(editing);
    }

    setSaving(false);
    setShowModal(false);
    fetchAll();
  };

  const handleSaveTeam = async () => {
    if (!editing) return;
    setSaving(true);
    const supabase = createSupabaseBrowserClient();

    if (editing.id) {
      await supabase.from("team_members").update(editing).eq("id", editing.id);
    } else {
      await supabase.from("team_members").insert(editing);
    }

    setSaving(false);
    setShowModal(false);
    fetchAll();
  };

  const handleSaveEvent = async () => {
    if (!editing) return;
    setSaving(true);
    const supabase = createSupabaseBrowserClient();

    if (editing.id) {
      await supabase.from("events").update(editing).eq("id", editing.id);
    } else {
      await supabase.from("events").insert(editing);
    }

    setSaving(false);
    setShowModal(false);
    fetchAll();
  };

  const handleSave = () => {
    switch (editType) {
      case "content":
        handleSaveContent();
        break;
      case "testimonial":
        handleSaveTestimonial();
        break;
      case "team":
        handleSaveTeam();
        break;
      case "event":
        handleSaveEvent();
        break;
    }
  };

  if (isLoading) return <PageLoader />;

  const heroContent = content.filter((c) => c.section === "hero");
  const aboutContent = content.filter((c) => c.section === "about");

  return (
    <DashboardShell
      profile={profile}
      navigation={adminNavigation}
      title="Admin Portal"
      accentColor="#EBBD48"
      onSignOut={signOut}
    >
      <PageHeader
        title="Website Content"
        description="Manage dynamic content displayed on the public website"
      />

      <Tabs
        tabs={[
          { key: "hero", label: "Hero Section" },
          { key: "testimonials", label: "Testimonials", count: testimonials.length },
          { key: "team", label: "Team", count: teamMembers.length },
          { key: "events", label: "Events", count: events.length },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      <div className="mt-6">
        {activeTab === "hero" && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Hero Section Content</h3>
              <p className="text-sm text-gray-500 mb-4">
                Edit the main headline and description shown on the homepage.
              </p>
              
              {heroContent.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No hero content"
                  description="Add content for the homepage hero section."
                  action={{
                    label: "Add Content",
                    onClick: () => {
                      setEditing({ section: "hero", key: "headline", value: "", order_index: 0 });
                      setEditType("content");
                      setShowModal(true);
                    },
                  }}
                />
              ) : (
                <div className="space-y-3">
                  {heroContent.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium capitalize">{item.key.replace("_", " ")}</p>
                        <p className="text-sm text-gray-500 truncate max-w-md">
                          {item.value || "(empty)"}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditing(item);
                          setEditType("content");
                          setShowModal(true);
                        }}
                      >
                        <Edit size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "testimonials" && (
          <div>
            <div className="flex justify-end mb-4">
              <Button
                onClick={() => {
                  setEditing({
                    name: "",
                    role: "",
                    company: "",
                    content: "",
                    rating: 5,
                    is_active: true,
                    order_index: testimonials.length,
                  });
                  setEditType("testimonial");
                  setShowModal(true);
                }}
              >
                <Plus size={16} /> Add Testimonial
              </Button>
            </div>
            {testimonials.length === 0 ? (
              <EmptyState icon={Quote} title="No testimonials" description="Add student testimonials." />
            ) : (
              <DataTable
                loading={dataLoading}
                columns={[
                  {
                    key: "name",
                    label: "Student",
                    render: (item: Testimonial) => (
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.role} {item.company && `at ${item.company}`}</p>
                      </div>
                    ),
                  },
                  {
                    key: "content",
                    label: "Testimonial",
                    render: (item: Testimonial) => (
                      <p className="text-sm truncate max-w-md">{item.content}</p>
                    ),
                  },
                  {
                    key: "rating",
                    label: "Rating",
                    render: (item: Testimonial) => <span>{"⭐".repeat(item.rating)}</span>,
                  },
                  {
                    key: "actions",
                    label: "",
                    render: (item: Testimonial) => (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditing(item);
                          setEditType("testimonial");
                          setShowModal(true);
                        }}
                      >
                        <Edit size={14} />
                      </Button>
                    ),
                  },
                ]}
                data={testimonials}
              />
            )}
          </div>
        )}

        {activeTab === "team" && (
          <div>
            <div className="flex justify-end mb-4">
              <Button
                onClick={() => {
                  setEditing({
                    name: "",
                    role: "",
                    bio: "",
                    is_founder: false,
                    is_active: true,
                    order_index: teamMembers.length,
                  });
                  setEditType("team");
                  setShowModal(true);
                }}
              >
                <Plus size={16} /> Add Team Member
              </Button>
            </div>
            {teamMembers.length === 0 ? (
              <EmptyState icon={Users2} title="No team members" description="Add your team." />
            ) : (
              <DataTable
                loading={dataLoading}
                columns={[
                  {
                    key: "name",
                    label: "Member",
                    render: (item: TeamMember) => (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#0D3B7D] flex items-center justify-center text-white text-sm font-bold">
                          {item.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.role}</p>
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: "founder",
                    label: "Type",
                    render: (item: TeamMember) => (
                      <span className={`text-xs px-2 py-1 rounded-full ${item.is_founder ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>
                        {item.is_founder ? "Founder" : "Team"}
                      </span>
                    ),
                  },
                  {
                    key: "actions",
                    label: "",
                    render: (item: TeamMember) => (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditing(item);
                          setEditType("team");
                          setShowModal(true);
                        }}
                      >
                        <Edit size={14} />
                      </Button>
                    ),
                  },
                ]}
                data={teamMembers}
              />
            )}
          </div>
        )}

        {activeTab === "events" && (
          <div>
            <div className="flex justify-end mb-4">
              <Button
                onClick={() => {
                  setEditing({
                    title: "",
                    description: "",
                    event_type: "workshop",
                    date: "",
                    location: "",
                    is_virtual: false,
                    is_active: true,
                  });
                  setEditType("event");
                  setShowModal(true);
                }}
              >
                <Plus size={16} /> Add Event
              </Button>
            </div>
            {events.length === 0 ? (
              <EmptyState icon={Calendar} title="No events" description="Add upcoming events." />
            ) : (
              <DataTable
                loading={dataLoading}
                columns={[
                  {
                    key: "title",
                    label: "Event",
                    render: (item: Event) => (
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.event_type}</p>
                      </div>
                    ),
                  },
                  {
                    key: "date",
                    label: "Date",
                    render: (item: Event) => new Date(item.date).toLocaleDateString(),
                  },
                  {
                    key: "location",
                    label: "Location",
                    render: (item: Event) => item.is_virtual ? "Virtual" : item.location || "-",
                  },
                  {
                    key: "actions",
                    label: "",
                    render: (item: Event) => (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditing(item);
                          setEditType("event");
                          setShowModal(true);
                        }}
                      >
                        <Edit size={14} />
                      </Button>
                    ),
                  },
                ]}
                data={events}
              />
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`Edit ${editType.charAt(0).toUpperCase() + editType.slice(1)}`}
        size="lg"
      >
        {editing && (
          <div className="space-y-4">
            {editType === "content" && (
              <>
                <FormField label="Key" id="key">
                  <Input
                    id="key"
                    value={(editing.key as string) || ""}
                    onChange={(e) => setEditing({ ...editing, key: e.target.value })}
                  />
                </FormField>
                <FormField label="Value" id="value">
                  <Textarea
                    id="value"
                    rows={4}
                    value={(editing.value as string) || ""}
                    onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                  />
                </FormField>
              </>
            )}

            {editType === "testimonial" && (
              <>
                <FormField label="Name" id="name" required>
                  <Input
                    id="name"
                    value={(editing.name as string) || ""}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  />
                </FormField>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Role" id="role">
                    <Input
                      id="role"
                      value={(editing.role as string) || ""}
                      onChange={(e) => setEditing({ ...editing, role: e.target.value })}
                    />
                  </FormField>
                  <FormField label="Company" id="company">
                    <Input
                      id="company"
                      value={(editing.company as string) || ""}
                      onChange={(e) => setEditing({ ...editing, company: e.target.value })}
                    />
                  </FormField>
                </div>
                <FormField label="Testimonial" id="content" required>
                  <Textarea
                    id="content"
                    rows={4}
                    value={(editing.content as string) || ""}
                    onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                  />
                </FormField>
                <FormField label="Rating (1-5)" id="rating">
                  <Input
                    id="rating"
                    type="number"
                    min={1}
                    max={5}
                    value={(editing.rating as number) || 5}
                    onChange={(e) => setEditing({ ...editing, rating: Number(e.target.value) })}
                  />
                </FormField>
              </>
            )}

            {editType === "team" && (
              <>
                <FormField label="Full Name" id="name" required>
                  <Input
                    id="name"
                    value={(editing.name as string) || ""}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  />
                </FormField>
                <FormField label="Role/Title" id="role" required>
                  <Input
                    id="role"
                    value={(editing.role as string) || ""}
                    onChange={(e) => setEditing({ ...editing, role: e.target.value })}
                  />
                </FormField>
                <FormField label="Bio" id="bio">
                  <Textarea
                    id="bio"
                    rows={3}
                    value={(editing.bio as string) || ""}
                    onChange={(e) => setEditing({ ...editing, bio: e.target.value })}
                  />
                </FormField>
                <FormField label="Image URL" id="image_url">
                  <Input
                    id="image_url"
                    value={(editing.image_url as string) || ""}
                    onChange={(e) => setEditing({ ...editing, image_url: e.target.value })}
                    placeholder="e.g., /foundersimage.png or https://..."
                  />
                </FormField>
                <FormField label="Display Order" id="order_index">
                  <Input
                    id="order_index"
                    type="number"
                    value={(editing.order_index as number) || 1}
                    onChange={(e) => setEditing({ ...editing, order_index: parseInt(e.target.value) || 1 })}
                    min={1}
                  />
                </FormField>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(editing.is_founder as boolean) || false}
                    onChange={(e) => setEditing({ ...editing, is_founder: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Founder</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(editing.is_active as boolean) !== false}
                    onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Active (visible on website)</span>
                </label>
              </>
            )}

            {editType === "event" && (
              <>
                <FormField label="Event Title" id="title" required>
                  <Input
                    id="title"
                    value={(editing.title as string) || ""}
                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  />
                </FormField>
                <FormField label="Description" id="desc">
                  <Textarea
                    id="desc"
                    rows={3}
                    value={(editing.description as string) || ""}
                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  />
                </FormField>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Date" id="date" required>
                    <Input
                      id="date"
                      type="date"
                      value={(editing.date as string)?.split("T")[0] || ""}
                      onChange={(e) => setEditing({ ...editing, date: e.target.value })}
                    />
                  </FormField>
                  <FormField label="Time" id="time">
                    <Input
                      id="time"
                      type="time"
                      value={(editing.time as string) || ""}
                      onChange={(e) => setEditing({ ...editing, time: e.target.value })}
                    />
                  </FormField>
                </div>
                <FormField label="Location" id="location">
                  <Input
                    id="location"
                    value={(editing.location as string) || ""}
                    onChange={(e) => setEditing({ ...editing, location: e.target.value })}
                  />
                </FormField>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(editing.is_virtual as boolean) || false}
                    onChange={(e) => setEditing({ ...editing, is_virtual: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Virtual Event</span>
                </label>
              </>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} loading={saving}>
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardShell>
  );
}
