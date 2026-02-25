"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Users, BookOpen, GraduationCap, CreditCard, LogOut, Menu,
  Award, Home, Settings, Bell, X, ShieldCheck, FileText, Calendar, Receipt, UserCircle
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/utils/supabase-browser";

const sidebarLinks = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/enrollments", label: "Enrollments", icon: GraduationCap },
  { href: "/admin/programs", label: "Programs", icon: BookOpen },
  { href: "/admin/events", label: "Events", icon: Calendar },
  { href: "/admin/team", label: "Team", icon: UserCircle },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/receipts", label: "Receipts", icon: Receipt },
  { href: "/admin/content", label: "Website Content", icon: FileText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({ children, title, headerActions }: { children: ReactNode; title?: string; headerActions?: ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <div className="flex min-h-screen bg-[#F4F7FA]">
      {/* Admin Sidebar */}
      <aside className="w-80 bg-[#0D3B7D] text-white hidden lg:flex flex-col relative overflow-hidden border-r border-white/5 shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#EBBD48] shadow-[0_0_15px_#EBBD48]" />
        
        <div className="p-10 border-b border-white/5 flex items-center gap-3 bg-black/5">
          <div className="bg-[#EBBD48] p-2 rounded shadow-lg">
            <ShieldCheck size={24} className="text-[#0D3B7D]" />
          </div>
          <div>
            <p className="text-[10px] font-black text-[#EBBD48] uppercase tracking-tighter">Command Centre</p>
            <p className="text-base font-bold tracking-tight">COMMLEAD ADMIN</p>
          </div>
        </div>

        <nav className="flex-1 p-8 space-y-1.5 mt-4">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-4 px-5 py-4 rounded-xl transition-all relative ${
                  isActive 
                    ? "bg-white/10 text-white font-bold" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="admin-nav-active" 
                    className="absolute left-0 w-1.5 h-8 bg-[#EBBD48] rounded-full shadow-[0_0_10px_#EBBD48]" 
                  />
                )}
                <link.icon size={20} className={isActive ? "text-[#EBBD48]" : ""} />
                <span className="text-sm font-medium tracking-wide">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-8 bg-black/20 mt-auto border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs font-black text-gray-400 hover:text-red-400 transition-colors uppercase tracking-[0.2em]"
          >
            <LogOut size={16} /> Sign Out System
          </button>
        </div>
      </aside>

      {/* Main Canvas */}
      <main className="flex-1 flex flex-col">
        <header className="h-24 bg-white border-b border-gray-200 flex items-center justify-between px-10">
          <div className="flex items-center gap-6">
            <button className="lg:hidden p-2 text-[#0D3B7D]" onClick={() => setSidebarOpen(true)}>
              <Menu size={28} />
            </button>
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-[#EBBD48] animate-pulse"></span>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Platform Operational</span>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
             <button className="relative p-2.5 text-gray-400 hover:text-[#0D3B7D] hover:bg-gray-50 rounded-full transition-all">
               <Bell size={22} />
               <span className="absolute top-0 right-0 h-4 w-4 bg-[#EBBD48] text-[#0D3B7D] text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white">3</span>
             </button>
             <div className="h-10 w-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center font-black text-[#0D3B7D] text-xs">
               AD
             </div>
          </div>
        </header>

        <div className="flex-1 p-10 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}