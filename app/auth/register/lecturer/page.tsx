"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  FileText,
  CheckCircle2,
  Eye,
  EyeOff,
  Award,
  Loader2,
  UserCheck,
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/utils/supabase-browser";

export default function LecturerRegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    specialization: "",
    bio: "",
    experience: "",
    consent: false,
  });

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

      // 1. Create auth user with role in metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.fullName,
            phone: form.phone,
            role: "lecturer",
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

      // 3. Try to update profile - if trigger failed, try UPSERT
      let profileUpdated = false;
      
      // First try UPDATE
      const { error: updateError, data: updateData } = await supabase
        .from("profiles")
        .update({
          full_name: form.fullName,
          phone: form.phone,
          role: "lecturer",
          bio: form.bio,
          specialization: form.specialization,
          is_approved: false,
          is_active: true,
        })
        .eq("id", authData.user.id)
        .select();

      if (!updateError && updateData && updateData.length > 0) {
        profileUpdated = true;
      } else {
        console.warn("Update failed, trying UPSERT:", updateError);
        // Fallback: Try UPSERT (insert with conflict handling)
        const { error: upsertError } = await supabase
          .from("profiles")
          .upsert({
            id: authData.user.id,
            email: form.email,
            full_name: form.fullName,
            phone: form.phone,
            role: "lecturer",
            bio: form.bio,
            specialization: form.specialization,
            is_approved: false,
            is_active: true,
          }, { onConflict: 'id' });

        if (upsertError) {
          console.error("Profile upsert error:", upsertError);
          // Don't throw - auth user is created, admin can fix profile later
        } else {
          profileUpdated = true;
        }
      }

      if (!profileUpdated) {
        console.warn("Profile creation may have failed - admin will need to verify");
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
            Application Submitted!
          </h1>
          <p className="text-white/70 mb-6">
            Thank you for applying to become a lecturer. Please check your email to verify your account.
          </p>
          <p className="text-white/60 text-sm mb-8">
            Our team will review your application and contact you within 3-5 business days with next steps.
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
            <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <UserCheck className="h-4 w-4" />
              Lecturer Registration
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Join Our <span className="text-[#EBBD48]">Teaching Team</span>
            </h2>
            <p className="text-white/60 leading-relaxed mb-8">
              Share your expertise and help shape the next generation of communication leaders.
            </p>

            <div className="space-y-4">
              {[
                "Flexible teaching schedule",
                "Competitive compensation",
                "Professional development",
                "Growing community",
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
            Are you a student?{" "}
            <Link href="/auth/register/student" className="text-[#EBBD48] hover:underline">
              Register as Student →
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
              <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 px-4 py-2 rounded-full text-sm font-medium">
                <UserCheck className="h-4 w-4" />
                Lecturer Registration
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8"
            >
              <h2 className="text-xl font-bold text-white mb-2">Apply as Lecturer</h2>
              <p className="text-white/60 text-sm mb-6">Fill in your details to apply as a lecturer</p>

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
                      placeholder="Dr. Jane Smith"
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
                      placeholder="jane@example.com"
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

                {/* Specialization */}
                <div>
                  <label className="block text-sm text-white/80 mb-1.5">Area of Specialization</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                    <input
                      type="text"
                      name="specialization"
                      value={form.specialization}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/20 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-[#EBBD48]/50 focus:ring-1 focus:ring-[#EBBD48]/50"
                      placeholder="e.g., Public Speaking, Leadership"
                    />
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-sm text-white/80 mb-1.5">Years of Experience</label>
                  <select
                    name="experience"
                    value={form.experience}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#EBBD48]/50 focus:ring-1 focus:ring-[#EBBD48]/50 appearance-none"
                  >
                    <option value="" className="bg-[#0D3B7D]">-- Select experience --</option>
                    <option value="1" className="bg-[#0D3B7D]">0-2 years</option>
                    <option value="3" className="bg-[#0D3B7D]">3-5 years</option>
                    <option value="6" className="bg-[#0D3B7D]">6-10 years</option>
                    <option value="10" className="bg-[#0D3B7D]">10+ years</option>
                  </select>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm text-white/80 mb-1.5">Professional Bio</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                    <textarea
                      name="bio"
                      value={form.bio}
                      onChange={handleChange}
                      rows={3}
                      className="w-full bg-white/5 border border-white/20 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-[#EBBD48]/50 focus:ring-1 focus:ring-[#EBBD48]/50 resize-none"
                      placeholder="Brief summary of your background and expertise..."
                    />
                  </div>
                </div>

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
                      Submitting Application...
                    </>
                  ) : (
                    "Submit Application"
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
              Are you a student?{" "}
              <Link href="/auth/register/student" className="text-[#EBBD48] hover:underline">
                Register as Student
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
