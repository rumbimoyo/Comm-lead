"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardShell, type NavItem } from "@/components/layout/DashboardShell";
import { PageHeader, PageLoader, EmptyState } from "@/components/dashboard";
import { createSupabaseBrowserClient } from "@/utils/supabase-browser";
import {
  Home, BookOpen, FileText, ClipboardList, Award, User, TrendingUp,
  Download, Eye, Calendar, CheckCircle
} from "lucide-react";
import type { Certificate, Program } from "@/types/database";
import { motion } from "framer-motion";

const studentNavigation: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/courses", label: "My Courses", icon: BookOpen },
  { href: "/dashboard/lessons", label: "Lessons", icon: FileText },
  { href: "/dashboard/assignments", label: "Assignments", icon: ClipboardList },
  { href: "/dashboard/progress", label: "Progress", icon: TrendingUp },
  { href: "/dashboard/certificates", label: "Certificates", icon: Award },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

interface CertificateWithProgram extends Certificate {
  program?: Program;
}

export default function StudentCertificatesPage() {
  const { profile, isLoading, signOut } = useAuth("student");
  const [certificates, setCertificates] = useState<CertificateWithProgram[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchCertificates();
    }
  }, [profile]);

  const fetchCertificates = async () => {
    if (!profile) return;
    const supabase = createSupabaseBrowserClient();

    const { data } = await supabase
      .from("certificates")
      .select("*, program:programs(id, name, slug)")
      .eq("user_id", profile.id)
      .order("issued_at", { ascending: false });

    setCertificates((data as CertificateWithProgram[]) || []);
    setDataLoading(false);
  };

  if (isLoading) return <PageLoader />;

  return (
    <DashboardShell
      profile={profile}
      navigation={studentNavigation}
      title="Student Portal"
      accentColor="#2563EB"
      onSignOut={signOut}
    >
      <PageHeader
        title="Certificates"
        description="View and download your earned certificates"
      />

      {certificates.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No certificates yet"
          description="Complete a course to earn your certificate."
          action={{ label: "View Courses", onClick: () => window.location.href = "/dashboard/courses" }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert, idx) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Certificate Preview */}
              <div className="relative aspect-[4/3] bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-6">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-0 w-full h-full" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  }} />
                </div>
                <div className="relative h-full flex flex-col items-center justify-center text-center text-white">
                  <Award size={48} className="mb-3 opacity-90" />
                  <p className="text-xs uppercase tracking-wider opacity-75 mb-1">Certificate of Completion</p>
                  <h3 className="text-lg font-semibold leading-tight">{cert.program?.name}</h3>
                </div>
                {/* Gold seal */}
                <div className="absolute bottom-3 right-3 w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg">
                  <CheckCircle size={24} className="text-white" />
                </div>
              </div>

              {/* Certificate Info */}
              <div className="p-4">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <Calendar size={14} />
                  <span>Issued: {cert.issued_at ? new Date(cert.issued_at).toLocaleDateString() : "Pending"}</span>
                </div>

                <div className="text-xs text-gray-400 mb-4">
                  Certificate ID: <span className="font-mono">{cert.certificate_number}</span>
                </div>

                <div className="flex gap-2">
                  {cert.certificate_url && (
                    <>
                      <button
                        onClick={() => window.open(cert.certificate_url!, "_blank")}
                        className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        <Eye size={14} /> View
                      </button>
                      <button
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = cert.certificate_url!;
                          link.download = `certificate-${cert.certificate_number}.pdf`;
                          link.click();
                        }}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        <Download size={14} /> Download
                      </button>
                    </>
                  )}
                  {!cert.certificate_url && (
                    <p className="text-sm text-gray-500 text-center w-full py-2">
                      Certificate being generated...
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Info Section */}
      {certificates.length > 0 && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">About Your Certificates</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Certificates are issued upon successful completion of a program</li>
            <li>• Each certificate has a unique verification number</li>
            <li>• Certificates can be verified through our verification portal</li>
            <li>• Share your certificates on LinkedIn or other professional networks</li>
          </ul>
        </div>
      )}
    </DashboardShell>
  );
}
