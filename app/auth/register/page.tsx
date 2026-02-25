"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  GraduationCap,
  UserCheck,
  ArrowRight,
} from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D3B7D] to-[#061E3E] relative overflow-hidden flex items-center justify-center px-4">
      {/* Decorative elements */}
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-[#EBBD48]/5 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-white/5 blur-3xl" />

      <div className="relative w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center">
              <img
                src="/CommLead Academy shield logo.png"
                alt="CommLead Academy Logo"
                className="h-14 w-14 object-contain bg-white rounded-full p-2"
              />
            </div>
            <div className="text-left">
              <span className="text-2xl font-bold text-white font-[family-name:var(--font-heading)]">
                CommLead
              </span>
              <span className="block -mt-1 text-xs font-medium uppercase tracking-[0.2em] text-[#EBBD48]">
                Academy
              </span>
            </div>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-2xl p-8 lg:p-10"
        >
          <div className="text-center mb-8">
            <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#0D3B7D] mb-2">
              Join CommLead Academy
            </h1>
            <p className="text-gray-600 text-sm">
              Choose how you'd like to join our community
            </p>
          </div>

          <div className="space-y-4">
            {/* Student Registration */}
            <Link
              href="/auth/register/student"
              className="group block p-6 rounded-xl border-2 border-[#EBBD48]/30 bg-[#EBBD48]/5 hover:bg-[#EBBD48]/10 hover:border-[#EBBD48] transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EBBD48]/20 text-[#EBBD48] group-hover:bg-[#EBBD48] group-hover:text-white transition-colors">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-[#0D3B7D] mb-1 flex items-center gap-2">
                    Register as Student
                    <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </h2>
                  <p className="text-sm text-gray-600">
                    Enroll in our programs and start your leadership journey. Access courses, resources, and mentorship.
                  </p>
                </div>
              </div>
            </Link>

            {/* Lecturer Registration */}
            <Link
              href="/auth/register/lecturer"
              className="group block p-6 rounded-xl border-2 border-[#0D3B7D]/20 bg-[#0D3B7D]/5 hover:bg-[#0D3B7D]/10 hover:border-[#0D3B7D] transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0D3B7D]/20 text-[#0D3B7D] group-hover:bg-[#0D3B7D] group-hover:text-white transition-colors">
                  <UserCheck className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-[#0D3B7D] mb-1 flex items-center gap-2">
                    Apply as Lecturer
                    <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </h2>
                  <p className="text-sm text-gray-600">
                    Share your expertise with our students. Join our team of educators and make an impact.
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="font-semibold text-[#0D3B7D] hover:text-[#EBBD48] transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Bottom text */}
        <p className="mt-8 text-center text-xs text-white/40">
          "Transforming lives through leadership and communication"
        </p>
      </div>
    </div>
  );
}
