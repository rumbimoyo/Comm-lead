"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardShell, type NavItem } from "@/components/layout/DashboardShell";
import { PageHeader, PageLoader } from "@/components/dashboard";
import { Button, FormField, Input, Textarea } from "@/components/dashboard/FormComponents";
import {
  Home, Users, GraduationCap, BookOpen, CreditCard, Calendar,
  FileText, Settings, UserCircle, Megaphone, Save, Shield, Bell, Globe
} from "lucide-react";

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

export default function SettingsPage() {
  const { profile, isLoading, signOut, refreshProfile } = useAuth(["admin", "super_admin"]);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: "",
    phone: "",
    bio: "",
  });

  useState(() => {
    if (profile) {
      setProfileData({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
      });
    }
  });

  const handleSaveProfile = async () => {
    // Profile save logic would go here
    setSaving(true);
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    refreshProfile();
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
        title="Settings"
        description="Manage your account and system settings"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <UserCircle size={20} /> Profile Settings
            </h3>
            <div className="space-y-4">
              <FormField label="Full Name" id="name">
                <Input
                  id="name"
                  value={profileData.full_name}
                  onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                />
              </FormField>
              <FormField label="Email" id="email">
                <Input id="email" value={profile?.email || ""} disabled />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </FormField>
              <FormField label="Phone" id="phone">
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                />
              </FormField>
              <FormField label="Bio" id="bio">
                <Textarea
                  id="bio"
                  rows={3}
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                />
              </FormField>
              <div className="pt-4">
                <Button onClick={handleSaveProfile} loading={saving}>
                  <Save size={16} /> Save Changes
                </Button>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield size={20} /> Security
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Change Password</p>
                  <p className="text-sm text-gray-500">Update your account password</p>
                </div>
                <Button variant="secondary">Change</Button>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-500">Add an extra layer of security</p>
                </div>
                <Button variant="secondary">Enable</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Side Settings */}
        <div className="space-y-6">
          {/* Role Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Info</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="font-medium capitalize">{profile?.role?.replace("_", " ")}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="font-medium">
                  {profile?.created_at && new Date(profile.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                  profile?.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                  {profile?.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Bell size={20} /> Notifications
            </h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm">Email notifications</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm">New enrollment alerts</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm">Payment notifications</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </label>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 rounded-xl border border-red-200 p-6">
            <h3 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h3>
            <p className="text-sm text-red-700 mb-4">
              These actions are irreversible. Please proceed with caution.
            </p>
            <Button variant="danger" className="w-full">
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
