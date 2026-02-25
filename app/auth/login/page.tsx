"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Award,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/utils/supabase-browser";
import { BRAND } from "@/lib/constants";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const mountedRef = useRef(true);
  
  // Use memoized singleton client - DO NOT create inside handleSubmit
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  // Track mount status
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !mountedRef.current) return;
    
    setLoading(true);
    setError("");

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (authError) {
        if (authError.message.includes("Email not confirmed")) {
          if (mountedRef.current) {
            setError("Please check your email and click the confirmation link first, or contact admin to manually verify your account.");
          }
          return;
        }
        throw authError;
      }

      if (!data.user) {
        if (mountedRef.current) {
          setError("Login failed. Please try again.");
        }
        return;
      }

      // Check user role from profiles table
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, is_approved")
        .eq("id", data.user.id)
        .single();

      if (profileError) {
        // Ignore AbortError
        if (profileError.message?.includes('AbortError') || profileError.message?.includes('aborted')) {
          console.log("AbortError during profile fetch - ignoring");
          return;
        }
        
        // Handle RLS or empty error - redirect to dashboard
        if (profileError.message?.includes('RLS') || profileError.message?.includes('policy') || Object.keys(profileError).length === 0) {
          console.log("RLS/empty error - redirecting to dashboard");
          window.location.href = "/dashboard";
          return;
        }
        
        // Log actual errors
        console.error("Profile error:", profileError);
        if (mountedRef.current) {
          setError(`Database error: ${profileError.message || 'Unable to access profile'}`);
        }
        return;
      }

      if (profile) {
        console.log("Profile data:", profile);
        console.log("User role:", profile.role);
        console.log("Is approved:", profile.is_approved);
        
        if (!profile.is_approved && profile.role !== "admin" && profile.role !== "super_admin") {
          if (mountedRef.current) {
            setError("Your account is pending approval. Please wait for admin confirmation.");
          }
          await supabase.auth.signOut();
          return;
        }

        // Route based on role
        if (profile.role === "admin" || profile.role === "super_admin") {
          console.log("Redirecting to admin dashboard");
          window.location.href = "/admin";
        } else if (profile.role === "lecturer") {
          console.log("Redirecting to lecturer dashboard");
          window.location.href = "/lecturer";
        } else {
          console.log("Redirecting to student dashboard");
          window.location.href = "/dashboard";
        }
      } else {
        console.log("No profile found, redirecting to dashboard");
        window.location.href = "/dashboard";
      }
    } catch (err: unknown) {
      // Ignore AbortError
      if (err instanceof Error && (err.name === 'AbortError' || err.message.includes('aborted'))) {
        console.log("AbortError caught - ignoring");
        return;
      }
      
      const errorMessage = err instanceof Error ? err.message : "Invalid email or password";
      if (mountedRef.current) {
        setError(errorMessage);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-navy relative overflow-hidden flex items-center justify-center px-4">
      {/* Decorative elements */}
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gold/5 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-white/5 blur-3xl" />

      <div className="relative w-full max-w-md">
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
              <span className="block -mt-1 text-xs font-medium uppercase tracking-[0.2em] text-gold">
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
            <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-navy mb-2">
              Welcome Back
            </h1>
            <p className="text-muted-text text-sm">
              Sign in to access your dashboard
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600"
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy/10 transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-medium text-gold-dark hover:text-navy transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-4 pr-12 text-gray-900 placeholder:text-gray-400 focus:border-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy/10 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !form.email || !form.password}
              className="group relative w-full overflow-hidden rounded-xl bg-navy py-4 text-sm font-bold text-white transition-all hover:bg-navy-light disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="mx-auto h-5 w-5 animate-spin" />
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign In
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              )}
            </button>
          </form>

          {/* Registration Options */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-center text-sm text-muted-text mb-4">
              Don&apos;t have an account?
            </p>
            <div className="space-y-3">
              <Link
                href="/auth/register/student"
                className="flex items-center justify-center gap-2 w-full rounded-xl border-2 border-gold bg-gold/5 py-3 text-sm font-semibold text-navy transition-all hover:bg-gold hover:text-navy-dark"
              >
                <span>Register as Student</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/auth/register/lecturer"
                className="flex items-center justify-center gap-2 w-full rounded-xl border-2 border-navy/20 bg-transparent py-3 text-sm font-semibold text-navy transition-all hover:bg-navy hover:text-white"
              >
                <span>Apply as Lecturer/Teacher</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-white/40">
          &quot;{BRAND.tagline}&quot;
        </p>
      </div>
    </div>
  );
}
