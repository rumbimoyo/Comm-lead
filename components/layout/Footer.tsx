import Link from "next/link";
import { Mail, MapPin, Phone, Linkedin, Instagram, Facebook, ArrowRight } from "lucide-react";

const footerLinks = [
  {
    title: "Academy",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Our Programs", href: "/programs" },
      { label: "Admissions", href: "/admissions" },
      { label: "Events", href: "/events" },
      { label: "Apply Now", href: "/apply" },
    ],
  },
  {
    title: "Quick Links",
    links: [
      { label: "Meet the Team", href: "/team" },
      { label: "Contact Us", href: "/contact" },
      { label: "Student Login", href: "/auth/login" },
      { label: "Register", href: "/auth/register" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-gradient-navy text-white relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 h-64 w-64 rounded-full bg-gold/5 blur-3xl" />
      </div>

      <div className="relative">
        {/* Main Footer */}
        <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-20 pb-12">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            {/* Brand Column */}
            <div className="lg:col-span-1 space-y-6">
              <img
                src="/CommLead Academy shield logo.png"
                alt="CommLead Academy"
                className="h-16 w-auto object-contain bg-white rounded-full p-1 shadow-lg"
              />
              <p className="text-white/50 text-sm leading-relaxed max-w-xs font-light">
                Equipping a new generation of communicators and leaders whose voices define eras and transform nations.
              </p>
              <div className="flex items-center gap-3">
                {[
                  { icon: Linkedin, href: "#" },
                  { icon: Instagram, href: "#" },
                  { icon: Facebook, href: "#" },
                ].map(({ icon: Icon, href }, i) => (
                  <a
                    key={i}
                    href={href}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/50 hover:bg-gold/15 hover:text-gold border border-white/5 hover:border-gold/20 transition-all"
                    aria-label="Social"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Link Columns */}
            {footerLinks.map((group) => (
              <div key={group.title}>
                <h4 className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold mb-6">
                  {group.title}
                </h4>
                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-white/50 hover:text-white transition-colors inline-flex items-center gap-1 group font-light"
                      >
                        {link.label}
                        <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Contact Column */}
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold mb-6">
                Get in Touch
              </h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-sm text-white/50">
                  <Phone className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
                  <div>
                    <a href="https://wa.me/263773341947" className="hover:text-white transition-colors block">+263 77 334 1947</a>
                    <a href="https://wa.me/263774035666" className="hover:text-white transition-colors block">+263 77 403 5666</a>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-sm text-white/50">
                  <Mail className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
                  <span>info@commleadacademy.com</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-white/50">
                  <MapPin className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
                  <span>Harare, Zimbabwe</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-6">
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-4">
              <Link href="/terms" className="text-[11px] text-white/30 hover:text-white/60 transition-colors">Terms & Conditions</Link>
              <Link href="/privacy" className="text-[11px] text-white/30 hover:text-white/60 transition-colors">Privacy Policy</Link>
              <Link href="/refund-policy" className="text-[11px] text-white/30 hover:text-white/60 transition-colors">Refund Policy</Link>
              <Link href="/code-of-conduct" className="text-[11px] text-white/30 hover:text-white/60 transition-colors">Code of Conduct</Link>
              <Link href="/attendance-policy" className="text-[11px] text-white/30 hover:text-white/60 transition-colors">Attendance Policy</Link>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-[11px] text-white/30 uppercase tracking-widest">
                © {new Date().getFullYear()} COMMLEAD Academy. All rights reserved.
              </p>
              <p className="text-[11px] text-white/20 uppercase tracking-widest">
                Master the Word, Shape the World.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
