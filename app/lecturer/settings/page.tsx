"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardShell, type NavItem } from "@/components/layout/DashboardShell";
import { PageHeader, PageLoader } from "@/components/dashboard";
import { Button, FormField, Input, Textarea } from "@/components/dashboard/FormComponents";
import { createSupabaseBrowserClient } from "@/utils/supabase-browser";
import {
  Home, BookOpen, Users, FileText, ClipboardList, Calendar, Settings, CheckSquare,
  User, Lock, Bell, Save
} from "lucide-react";
import type { Profile } from "@/types/database";
import { motion } from "framer-motion";

const lecturerNavigation: NavItem[] = [
  { href: "/lecturer", label: "Dashboard", icon: Home },
  { href: "/lecturer/programs", label: "My Programs", icon: BookOpen },
  { href: "/lecturer/lessons", label: "Lessons", icon: FileText },
  { href: "/lecturer/assignments", label: "Assignments", icon: ClipboardList },
  { href: "/lecturer/students", label: "Students", icon: Users },
  { href: "/lecturer/attendance", label: "Attendance", icon: Calendar },
  { href: "/lecturer/submissions", label: "Submissions", icon: CheckSquare },
  { href: "/lecturer/settings", label: "Settings", icon: Settings },
];

export default function LecturerSettingsPage() {
  const { profile, isLoading, signOut } = useAuth("lecturer");
  const [activeSection, setActiveSection] = useState("profile");
  const [profileData, setProfileData] = useState<Partial<Profile>>({});
  const [passwordData, setPasswordData] = useState({ current: "", new: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (profile) {
      setProfileData({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
        linkedin_url: profile.linkedin_url || "",
        twitter_url: profile.twitter_url || "",
      });
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    setMessage(null);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profileData.full_name,
        phone: profileData.phone,
        bio: profileData.bio,
        linkedin_url: profileData.linkedin_url,
        twitter_url: profileData.twitter_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    setSaving(false);
    if (error) {
      setMessage({ type: "error", text: "Failed to update profile. Please try again." });
    } else {
      setMessage({ type: "success", text: "Profile updated successfully!" });
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (passwordData.new.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }

    setSaving(true);
    setMessage(null);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({
      password: passwordData.new,
    });

    setSaving(false);
    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "Password updated successfully!" });
      setPasswordData({ current: "", new: "", confirm: "" });
    }
  };

  const sections = [
    { id: "profile", label: "Profile", icon: User },
    { id: "password", label: "Password", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  if (isLoading) return <PageLoader />;

  return (
    <DashboardShell
      profile={profile}
      navigation={lecturerNavigation}
      title="Lecturer Portal"
      accentColor="#9333EA"
      onSignOut={signOut}
    >
      <PageHeader
        title="Settings"
        description="Manage your account and preferences"
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full lg:w-64 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    isActive
                      ? "bg-purple-50 text-purple-700 border-l-4 border-purple-600"
                      : "text-gray-600 hover:bg-gray-50 border-l-4 border-transparent"
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-medium">{section.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-4 p-4 rounded-lg ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message.text}
            </motion.div>
          )}

          {activeSection === "profile" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h3>

              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name || ""}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <User size={32} className="text-purple-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{profile?.full_name}</p>
                    <p className="text-sm text-gray-500">{profile?.email}</p>
                    <p className="text-xs text-purple-600 font-medium mt-1">Lecturer</p>
                  </div>
                </div>

                <FormField label="Full Name" id="name">
                  <Input
                    id="name"
                    value={profileData.full_name || ""}
                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                  />
                </FormField>

                <FormField label="Phone" id="phone">
                  <Input
                    id="phone"
                    value={profileData.phone || ""}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  />
                </FormField>

                <FormField label="Bio" id="bio">
                  <Textarea
                    id="bio"
                    rows={4}
                    value={profileData.bio || ""}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    placeholder="Tell students a bit about yourself..."
                  />
                </FormField>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="LinkedIn URL" id="linkedin">
                    <Input
                      id="linkedin"
                      value={profileData.linkedin_url || ""}
                      onChange={(e) => setProfileData({ ...profileData, linkedin_url: e.target.value })}
                      placeholder="https://linkedin.com/in/..."
                    />
                  </FormField>
                  <FormField label="Twitter URL" id="twitter">
                    <Input
                      id="twitter"
                      value={profileData.twitter_url || ""}
                      onChange={(e) => setProfileData({ ...profileData, twitter_url: e.target.value })}
                      placeholder="https://twitter.com/..."
                    />
                  </FormField>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleSaveProfile} loading={saving}>
                    <Save size={16} /> Save Changes
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === "password" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h3>

              <div className="space-y-4 max-w-md">
                <FormField label="Current Password" id="current">
                  <Input
                    id="current"
                    type="password"
                    value={passwordData.current}
                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                  />
                </FormField>

                <FormField label="New Password" id="new">
                  <Input
                    id="new"
                    type="password"
                    value={passwordData.new}
                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                  />
                </FormField>

                <FormField label="Confirm New Password" id="confirm">
                  <Input
                    id="confirm"
                    type="password"
                    value={passwordData.confirm}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                  />
                </FormField>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleChangePassword} loading={saving}>
                    <Lock size={16} /> Update Password
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === "notifications" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h3>

              <div className="space-y-4">
                {[
                  { id: "new_submission", label: "New Assignment Submissions", desc: "Get notified when students submit work" },
                  { id: "student_enrolled", label: "New Student Enrollments", desc: "Get notified when new students join your programs" },
                  { id: "announcements", label: "Academy Announcements", desc: "Receive important announcements from the academy" },
                ].map((notif) => (
                  <div key={notif.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{notif.label}</p>
                      <p className="text-sm text-gray-500">{notif.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                ))}

                <p className="text-sm text-gray-500 mt-4">
                  Email notifications will be sent to: <span className="font-medium">{profile?.email}</span>
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
