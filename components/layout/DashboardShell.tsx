"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, LogOut, Bell, ChevronRight, 
  type LucideIcon
} from "lucide-react";
import type { Profile } from "@/types/database";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

interface DashboardShellProps {
  children: ReactNode;
  profile: Profile | null;
  navigation: NavItem[];
  title: string;
  accentColor?: string;
  onSignOut: () => void;
}

export function DashboardShell({
  children,
  profile,
  navigation,
  title,
  accentColor = "#EBBD48",
  onSignOut,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const initials = profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "??";

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 flex-col bg-[#0D3B7D] text-white fixed inset-y-0 left-0 z-50">
        {/* Logo/Brand */}
        <div className="h-20 flex items-center px-6 border-b border-white/10 bg-black/10">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-[#0D3B7D]"
              style={{ backgroundColor: accentColor }}
            >
              CL
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: accentColor }}>
                {title}
              </p>
              <p className="text-sm font-semibold">CommLead Academy</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group ${
                  isActive
                    ? "bg-white/15 text-white font-semibold"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 w-1 h-6 rounded-r-full"
                    style={{ backgroundColor: accentColor }}
                  />
                )}
                <Icon 
                  size={20} 
                  className={isActive ? "" : "text-gray-400 group-hover:text-white"} 
                  style={isActive ? { color: accentColor } : {}}
                />
                <span className="text-sm flex-1">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight size={14} style={{ color: accentColor }} />}
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-white/10 bg-black/10">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-[#0D3B7D] font-bold text-sm"
              style={{ backgroundColor: accentColor }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">
                {profile?.full_name || "Loading..."}
              </p>
              <p className="text-xs text-gray-400 capitalize">
                {profile?.role?.replace("_", " ") || "User"}
              </p>
            </div>
          </div>
          <button
            onClick={onSignOut}
            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-[#0D3B7D] text-white z-50 lg:hidden flex flex-col"
            >
              <div className="h-20 flex items-center justify-between px-6 border-b border-white/10 bg-black/10">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-[#0D3B7D]"
                    style={{ backgroundColor: accentColor }}
                  >
                    CL
                  </div>
                  <span className="font-semibold">{title}</span>
                </div>
                <button 
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive
                          ? "bg-white/15 text-white font-semibold"
                          : "text-gray-300 hover:bg-white/5"
                      }`}
                    >
                      <Icon size={20} style={isActive ? { color: accentColor } : {}} />
                      <span className="text-sm flex-1">{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-white/10">
                <button
                  onClick={onSignOut}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-400 hover:text-red-400 rounded-lg transition-colors"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 lg:ml-72">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={22} className="text-gray-600" />
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                System Online
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-gray-100 rounded-lg">
              <Bell size={20} className="text-gray-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="lg:hidden flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#0D3B7D] text-xs font-bold"
                style={{ backgroundColor: accentColor }}
              >
                {initials}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
