"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen, GraduationCap, User, CreditCard, LogOut, Menu,
  Award, Home, Bell, X, ChevronRight
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/utils/supabase-browser";

const sidebarLinks = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/courses", label: "My Courses", icon: BookOpen },
  { href: "/dashboard/progress", label: "Progress", icon: GraduationCap },
  { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
  { href: "/dashboard/certificates", label: "Certificates", icon: Award },
  { href: "/dashboard/profile", label: "My Profile", icon: User },
];

export function StudentShell({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <div className="flex min-h-screen bg-[#FDFDFD]">
      {/* Sidebar for Desktop */}
      <aside className="w-72 bg-[#0D3B7D] text-white hidden lg:flex flex-col border-r border-[#EBBD48]/20 shadow-2xl">
        <div className="p-8 border-b border-white/5 bg-black/10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-2 bg-[#EBBD48] rounded-lg shadow-lg shadow-[#EBBD48]/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="text-[#0D3B7D] h-6 w-6" />
            </div>
            <span className="font-bold tracking-tight text-lg uppercase">COMMLEAD</span>
          </Link>
        </div>
        
        <nav className="flex-1 p-6 space-y-2 mt-4">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-all group ${
                  isActive 
                    ? "bg-[#EBBD48] text-[#0D3B7D] font-bold shadow-xl shadow-[#EBBD48]/10 translate-x-1" 
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <link.icon size={20} className={isActive ? "text-[#0D3B7D]" : "text-[#EBBD48]/70"} />
                  <span className="text-sm tracking-wide">{link.label}</span>
                </div>
                {isActive && <ChevronRight size={14} />}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 mt-auto">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3.5 text-gray-400 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all text-sm font-bold uppercase tracking-widest"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen">
        <header className="h-20 border-b border-gray-100 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 lg:px-10 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-[#0D3B7D] hover:bg-gray-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-sm font-black text-[#0D3B7D] uppercase tracking-widest">Student Portal</h2>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="p-2.5 text-gray-400 hover:text-[#0D3B7D] relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#0D3B7D] to-[#1e5ab3] flex items-center justify-center text-[#EBBD48] font-black text-sm shadow-lg shadow-[#0D3B7D]/20">
              RM
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 lg:p-10 bg-[#F8FAFC]">
          {children}
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="absolute inset-0 bg-[#0D3B7D]/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              className="absolute left-0 top-0 bottom-0 w-80 bg-[#0D3B7D] shadow-2xl p-6"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#EBBD48] rounded-lg">
                    <GraduationCap className="text-[#0D3B7D] h-6 w-6" />
                  </div>
                  <span className="text-white font-bold uppercase tracking-tight">COMMLEAD</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="text-white/50 hover:text-white"><X size={24}/></button>
              </div>
              <nav className="space-y-3">
                {sidebarLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-4 p-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all ${
                      pathname === link.href ? "bg-[#EBBD48] text-[#0D3B7D]" : "text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    <link.icon size={22} /> {link.label}
                  </Link>
                ))}
              </nav>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}