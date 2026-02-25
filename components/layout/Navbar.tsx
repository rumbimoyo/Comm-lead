"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Programs", href: "/programs" },
  { label: "Admissions", href: "/admissions" },
  { label: "Team", href: "/team" },
  { label: "Events", href: "/events" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isDashboard = pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  if (isDashboard) return null;

  return (
    <>
      {/* ── NAVIGATION BAR ── */}
      <motion.header
        initial={false}
        className={`sticky top-0 z-50 transition-all duration-500 ${
          isScrolled ? "premium-glass" : "bg-white border-b border-gray-100"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 lg:px-8">
          {/* Shield logo – always visible */}
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/CommLead Academy shield logo.png"
              alt="CommLead"
              className="h-9 w-9 object-contain rounded-full bg-white p-0.5 shadow-sm"
            />
            <span className="hidden sm:inline text-navy font-heading font-bold text-lg">COMMLEAD</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-4 py-2 text-[13px] font-semibold uppercase tracking-wider transition-colors rounded-lg ${
                    isActive
                      ? "text-navy bg-navy/5"
                      : "text-gray-500 hover:text-navy hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-3 right-3 h-[2px] bg-gold rounded-full"
                    />
                  )}
                </Link>
              );
            })}

            {/* CTA Button */}
            <Link
              href="/auth/register"
              className="ml-6 bg-navy text-white px-6 py-2.5 rounded-lg text-[12px] font-bold uppercase tracking-widest hover:bg-navy-light transition-all shadow-lg shadow-navy/10 hover:shadow-xl hover:shadow-navy/15 hover:-translate-y-0.5"
            >
              Enroll Now
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="lg:hidden p-2 rounded-lg hover:bg-gray-50" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-6 w-6 text-navy" /> : <Menu className="h-6 w-6 text-navy" />}
          </button>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-gray-100 bg-white overflow-hidden"
            >
              <div className="px-6 py-4 space-y-1">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      pathname === item.href
                        ? "bg-navy text-white"
                        : "text-gray-600 hover:bg-gray-50 hover:text-navy"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/auth/register"
                  className="block mt-3 bg-gold text-navy text-center px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider"
                >
                  Enroll Now
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}
