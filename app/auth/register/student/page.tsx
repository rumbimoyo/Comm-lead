"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  BookOpen,
  MessageSquare,
  CheckCircle2,
  Eye,
  EyeOff,
  Award,
  Loader2,
  GraduationCap,
} from "lucide-react";
import { PROGRAMS_DATA } from "@/lib/constants";
import { createSupabaseBrowserClient } from "@/utils/supabase-browser";

export default function StudentRegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [programs, setPrograms] = useState<Array<{ id: string; name: string; price: number }>>([]);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    city: "",
    programId: "",
    motivation: "",
    isScholarship: false,
    consent: false,
  });

  useEffect(() => {
    const fetchPrograms = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.from("programs").select("id, name, price").eq("is_active", true);
      if (data) setPrograms(data);
    };
    fetchPrograms();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm({ ...form, [name]: checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      const supabase = createSupabaseBrowserClient();

      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.fullName,
            phone: form.phone,
            role: "student",
          },
        },
      });

      if (authError) {
        console.error("Auth signup error:", authError);
        throw new Error(authError.message);
      }
      if (!authData.user) throw new Error("Registration failed - no user returned");

      // 2. Wait for trigger to create profile
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 3. Try UPDATE, fallback to UPSERT
      const { error: updateError, data: updateData } = await supabase
        .from("profiles")
        .update({
          full_name: form.fullName,
          phone: form.phone,
          city: form.city,
          role: "student",
          is_approved: false,
          is_active: true,
        })
        .eq("id", authData.user.id)
        .select();

      if (updateError || !updateData || updateData.length === 0) {
        console.warn("Update failed, trying UPSERT:", updateError);
        const { error: upsertError } = await supabase
          .from("profiles")
          .upsert({
            id: authData.user.id,
            email: form.email,
            full_name: form.fullName,
            phone: form.phone,
            city: form.city,
            role: "student",
            is_approved: false,
            is_active: true,
          }, { onConflict: 'id' });

        if (upsertError) {
          console.error("Profile upsert error:", upsertError);
        }
      }

      // 4. Create enrollment
      if (form.programId) {
        const { error: enrollError } = await supabase.from("enrollments").insert({
          user_id: authData.user.id,
          program_id: form.programId,
          city: form.city,
          motivation: form.motivation,
          is_scholarship: form.isScholarship,
          status: "pending",
          payment_status: "pending",
        });

        if (enrollError) {
          console.error("Enrollment error:", enrollError);
          // Don't fail - the user is registered, enrollment can be added later
        }
      }

      setSuccess(true);
    } catch (err: unknown) {
      console.error("Registration error:", err);
      const errorMessage = err instanceof Error ? err.message : "Registration failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = form.fullName && form.email && form.password && form.phone && form.consent;

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0D3B7D] to-[#061E3E] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-12 max-w-lg w-full text-center"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20">
            <CheckCircle2 className="h-10 w-10 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">
            Registration Successful!
          </h1>
          <p className="text-white/70 mb-6">
            Thank you for registering as a student. Please check your email to verify your account.
          </p>
          <p className="text-white/60 text-sm mb-8">
            Our admissions team will review your application and contact you within 24-48 hours.
          </p>
          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full rounded-xl bg-[#EBBD48] px-6 py-3 text-sm font-bold text-[#0D3B7D] transition-all hover:bg-[#d9ab3d]"
            >
              Return to Home
            </Link>
            <Link
              href="/auth/login"
              className="block text-sm text-white/60 hover:text-[#EBBD48] transition-colors"
            >
              Already verified? Sign In →
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D3B7D] to-[#061E3E] relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-[#EBBD48]/5 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-white/5 blur-3xl" />

      <div className="relative flex min-h-screen">
        {/* Left Panel */}
        <div className="hidden lg:flex lg:w-2/5 flex-col justify-between p-12">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EBBD48]/20">
              <Award className="h-6 w-6 text-[#EBBD48]" />
            </div>
            <div>
              <span className="text-xl font-bold text-white">CommLead</span>
              <span className="block -mt-1 text-[10px] font-medium uppercase tracking-[0.2em] text-[#EBBD48]">
                Academy
              </span>
            </div>
          </Link>

          <div>
            <div className="inline-flex items-center gap-2 bg-[#EBBD48]/20 text-[#EBBD48] px-4 py-2 rounded-full text-sm font-medium mb-6">
              <GraduationCap className="h-4 w-4" />
              Student Registration
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Begin Your <span className="text-[#EBBD48]">Learning Journey</span>
            </h2>
            <p className="text-white/60 leading-relaxed mb-8">
              Join hundreds of ambitious communicators and leaders who have transformed their careers.
            </p>

            <div className="space-y-4">
              {[
                "Access to premium courses",
                "Expert-led training",
                "Professional certification",
                "Career advancement support",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EBBD48]/20">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#EBBD48]" />
                  </div>
                  <span className="text-sm text-white/70">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-white/40 text-sm">
            Are you a lecturer?{" "}
            <Link href="/auth/register/lecturer" className="text-[#EBBD48] hover:underline">
              Register as Lecturer →
            </Link>
          </p>
        </div>

        {/* Right Panel - Form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            <div className="lg:hidden mb-8 text-center">
              <Link href="/" className="inline-flex items-center gap-2 mb-4">
                <Award className="h-8 w-8 text-[#EBBD48]" />
                <span className="text-xl font-bold text-white">CommLead Academy</span>
              </Link>
              <div className="inline-flex items-center gap-2 bg-[#EBBD48]/20 text-[#EBBD48] px-4 py-2 rounded-full text-sm font-medium">
                <GraduationCap className="h-4 w-4" />
                Student Registration
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8"
            >
              <h2 className="text-xl font-bold text-white mb-2">Create Student Account</h2>
              <p className="text-white/60 text-sm mb-6">Fill in your details to register as a student</p>

              {error && (
                <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm text-white/80 mb-1.5">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                    <input
                      type="text"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      required
                      className="w-full bg-white/5 border border-white/20 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-[#EBBD48]/50 focus:ring-1 focus:ring-[#EBBD48]/50"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm text-white/80 mb-1.5">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full bg-white/5 border border-white/20 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-[#EBBD48]/50 focus:ring-1 focus:ring-[#EBBD48]/50"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm text-white/80 mb-1.5">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                      className="w-full bg-white/5 border border-white/20 rounded-lg pl-4 pr-10 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-[#EBBD48]/50 focus:ring-1 focus:ring-[#EBBD48]/50"
                      placeholder="Min. 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm text-white/80 mb-1.5">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      required
                      className="w-full bg-white/5 border border-white/20 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-[#EBBD48]/50 focus:ring-1 focus:ring-[#EBBD48]/50"
                      placeholder="+263 77 123 4567"
                    />
                  </div>
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm text-white/80 mb-1.5">City</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/20 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-[#EBBD48]/50 focus:ring-1 focus:ring-[#EBBD48]/50"
                      placeholder="Harare"
                    />
                  </div>
                </div>

                {/* Program Selection */}
                <div>
                  <label className="block text-sm text-white/80 mb-1.5">Select Program</label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                    <select
                      name="programId"
                      value={form.programId}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/20 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-[#EBBD48]/50 focus:ring-1 focus:ring-[#EBBD48]/50 appearance-none"
                    >
                      <option value="" className="bg-[#0D3B7D]">-- Select a program --</option>
                      {programs.map((program) => (
                        <option key={program.id} value={program.id} className="bg-[#0D3B7D]">
                          {program.name} (${program.price})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Motivation */}
                <div>
                  <label className="block text-sm text-white/80 mb-1.5">Why do you want to join?</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                    <textarea
                      name="motivation"
                      value={form.motivation}
                      onChange={handleChange}
                      rows={3}
                      className="w-full bg-white/5 border border-white/20 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-[#EBBD48]/50 focus:ring-1 focus:ring-[#EBBD48]/50 resize-none"
                      placeholder="Tell us about your goals..."
                    />
                  </div>
                </div>

                {/* Scholarship checkbox */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isScholarship"
                    checked={form.isScholarship}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-white/30 bg-white/5 text-[#EBBD48] focus:ring-[#EBBD48]/50"
                  />
                  <span className="text-sm text-white/70">Apply for scholarship</span>
                </label>

                {/* Consent checkbox */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="consent"
                    checked={form.consent}
                    onChange={handleChange}
                    required
                    className="h-4 w-4 mt-0.5 rounded border-white/30 bg-white/5 text-[#EBBD48] focus:ring-[#EBBD48]/50"
                  />
                  <span className="text-sm text-white/70">
                    I agree to the{" "}
                    <Link href="/terms" className="text-[#EBBD48] hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-[#EBBD48] hover:underline">
                      Privacy Policy
                    </Link>
                  </span>
                </label>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!isFormValid || loading}
                  className="w-full bg-[#EBBD48] text-[#0D3B7D] font-bold py-3 rounded-lg transition-all hover:bg-[#d9ab3d] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Student Account"
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-white/10 text-center">
                <p className="text-white/60 text-sm">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="text-[#EBBD48] hover:underline font-medium">
                    Sign In
                  </Link>
                </p>
              </div>
            </motion.div>

            <p className="lg:hidden mt-6 text-center text-white/40 text-sm">
              Are you a lecturer?{" "}
              <Link href="/auth/register/lecturer" className="text-[#EBBD48] hover:underline">
                Register as Lecturer
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
