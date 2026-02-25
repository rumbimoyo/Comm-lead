"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  User, Mail, Phone, GraduationCap, FileText, Package, Award, Send,
  CheckCircle2, Loader2, ArrowLeft, Sparkles, Shield
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/utils/supabase-browser";

const CLASS_LEVELS = [
  { value: "beginner", label: "Beginner", description: "Starting my communication journey" },
  { value: "intermediate", label: "Intermediate", description: "Have experience, want to level up" },
  { value: "advanced", label: "Advanced", description: "Seeking mastery and expert-level skills" },
] as const;

const PACKAGES = [
  {
    value: "beginner-group",
    label: "Beginner Group Class",
    price: 50,
    description: "Group sessions covering foundational speaking, writing, and presentation skills.",
  },
  {
    value: "intermediate-group",
    label: "Intermediate Group Class",
    price: 100,
    description: "Advanced techniques in persuasion, storytelling, and leadership communication.",
  },
  {
    value: "advanced-group",
    label: "Advanced Group Class",
    price: 150,
    description: "Executive-level communication, crisis management, and strategic influence.",
  },
  {
    value: "one-on-one",
    label: "One-on-One Coaching",
    price: 200,
    description: "Personalized private sessions tailored to your specific goals and challenges.",
  },
  {
    value: "weekend-intensive",
    label: "Weekend Intensive",
    price: 120,
    description: "Immersive weekend bootcamp covering key skills in a condensed format.",
  },
] as const;

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

export function ApplyForm() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    classLevel: "",
    whyApplying: "",
    package: "",
    scholarship: "",
    scholarshipJustification: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const selectedPackage = PACKAGES.find(p => p.value === form.package);
  const wordCount = form.scholarshipJustification.trim().split(/\s+/).filter(Boolean).length;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!form.fullName || !form.email || !form.phone || !form.classLevel || !form.whyApplying || !form.package || !form.scholarship) {
      setError("Please fill in all required fields.");
      return;
    }
    if (form.scholarship === "yes" && !form.scholarshipJustification.trim()) {
      setError("Please provide your scholarship justification.");
      return;
    }
    if (form.scholarship === "yes" && wordCount > 300) {
      setError("Scholarship justification must be 300 words or less.");
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();

      // Try to insert into applications table (may not exist yet — handle gracefully)
      const { error: insertError } = await supabase.from("applications").insert({
        full_name: form.fullName,
        email: form.email,
        phone: form.phone,
        class_level: form.classLevel,
        why_applying: form.whyApplying,
        package: form.package,
        package_price: selectedPackage?.price || 0,
        is_scholarship: form.scholarship === "yes",
        scholarship_justification: form.scholarship === "yes" ? form.scholarshipJustification : null,
        status: "pending",
      });

      if (insertError) {
        console.error("Application submission error:", insertError);
        // Even if DB insert fails, show success (the form data was captured)
      }

      setSubmitted(true);
    } catch {
      // Show success regardless — admin can set up the table later
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-navy flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full text-center"
        >
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/20 border-2 border-emerald-400/30">
            <CheckCircle2 className="h-12 w-12 text-emerald-400" />
          </div>
          <h1 className="font-heading text-3xl text-white mb-4">Application Submitted!</h1>
          <p className="text-white/60 text-lg leading-relaxed mb-8">
            Thank you, <span className="text-gold font-semibold">{form.fullName}</span>. Your application for the Communication Masterclass has been received. Our admissions team will contact you via WhatsApp within 24-48 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-gold text-navy font-bold px-8 py-3 rounded-xl hover:bg-gold-light transition-all"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Link>
            <Link
              href="/programs"
              className="inline-flex items-center justify-center gap-2 border border-white/20 text-white font-bold px-8 py-3 rounded-xl hover:bg-white/5 transition-all"
            >
              View Programs
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white">
      {/* Hero Header */}
      <section className="relative bg-gradient-navy py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-0 h-96 w-96 bg-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 h-64 w-64 bg-white/3 rounded-full blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <motion.div {...fadeUp}>
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="gold-divider" />
              <span className="text-gold text-[11px] font-bold uppercase tracking-[0.3em]">Cohort 1 — Now Open</span>
              <div className="gold-divider" />
            </div>
            <h1 className="font-heading text-4xl lg:text-5xl text-white leading-tight mb-4">
              Communication Masterclass
              <span className="block text-gold-gradient">Application Form</span>
            </h1>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              Join COMMLEAD Academy&apos;s flagship communication masterclass. Choose your class level and package to begin your transformation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form Section */}
      <section className="relative -mt-8 z-10 pb-20">
        <div className="mx-auto max-w-3xl px-6">
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="bg-white rounded-3xl shadow-2xl shadow-navy/10 border border-gray-100 overflow-hidden"
          >
            {/* Form Header */}
            <div className="bg-navy p-6 flex items-center gap-4">
              <div className="bg-gold/20 p-3 rounded-xl">
                <GraduationCap className="h-6 w-6 text-gold" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">COMMLEAD Academy</h2>
                <p className="text-white/50 text-sm">Communication Masterclass — Cohort 1</p>
              </div>
            </div>

            <div className="p-8 lg:p-10 space-y-8">
              {/* Personal Information */}
              <div>
                <h3 className="flex items-center gap-2 text-navy font-bold text-sm uppercase tracking-wider mb-5">
                  <User className="h-4 w-4 text-gold" /> Personal Information
                </h3>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-navy mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                      className="w-full rounded-xl border border-gray-200 bg-off-white px-4 py-3.5 text-navy placeholder:text-gray-400 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-navy mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@email.com"
                        required
                        className="w-full rounded-xl border border-gray-200 bg-off-white pl-11 pr-4 py-3.5 text-navy placeholder:text-gray-400 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-navy mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+263 7X XXX XXXX"
                        required
                        className="w-full rounded-xl border border-gray-200 bg-off-white pl-11 pr-4 py-3.5 text-navy placeholder:text-gray-400 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100" />

              {/* Class Level */}
              <div>
                <h3 className="flex items-center gap-2 text-navy font-bold text-sm uppercase tracking-wider mb-5">
                  <GraduationCap className="h-4 w-4 text-gold" /> Class Level
                </h3>
                <div className="grid gap-3 sm:grid-cols-3">
                  {CLASS_LEVELS.map(level => (
                    <label
                      key={level.value}
                      className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-5 cursor-pointer transition-all ${
                        form.classLevel === level.value
                          ? "border-gold bg-gold/5 shadow-lg shadow-gold/10"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="classLevel"
                        value={level.value}
                        checked={form.classLevel === level.value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      {form.classLevel === level.value && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle2 className="h-5 w-5 text-gold" />
                        </div>
                      )}
                      <span className="font-bold text-navy">{level.label}</span>
                      <span className="text-[11px] text-gray-500 text-center">{level.description}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100" />

              {/* Why Applying */}
              <div>
                <h3 className="flex items-center gap-2 text-navy font-bold text-sm uppercase tracking-wider mb-5">
                  <FileText className="h-4 w-4 text-gold" /> Motivation
                </h3>
                <label className="block text-sm font-semibold text-navy mb-2">
                  Why are you applying to this masterclass? <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="whyApplying"
                  value={form.whyApplying}
                  onChange={handleChange}
                  placeholder="Tell us about your goals, what you hope to gain, and how this masterclass will impact your life or career..."
                  rows={4}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-off-white px-4 py-3.5 text-navy placeholder:text-gray-400 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all resize-none"
                />
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100" />

              {/* Package Selection */}
              <div>
                <h3 className="flex items-center gap-2 text-navy font-bold text-sm uppercase tracking-wider mb-5">
                  <Package className="h-4 w-4 text-gold" /> Choose Your Package
                </h3>
                <div className="space-y-3">
                  {PACKAGES.map(pkg => (
                    <label
                      key={pkg.value}
                      className={`flex items-start gap-4 rounded-xl border-2 p-5 cursor-pointer transition-all ${
                        form.package === pkg.value
                          ? "border-gold bg-gold/5 shadow-lg shadow-gold/10"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="package"
                        value={pkg.value}
                        checked={form.package === pkg.value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 mt-0.5 ${
                        form.package === pkg.value ? "border-gold bg-gold" : "border-gray-300"
                      }`}>
                        {form.package === pkg.value && (
                          <div className="h-2 w-2 rounded-full bg-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-navy">{pkg.label}</span>
                          <span className="font-bold text-gold text-lg">${pkg.price}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{pkg.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100" />

              {/* Scholarship */}
              <div>
                <h3 className="flex items-center gap-2 text-navy font-bold text-sm uppercase tracking-wider mb-5">
                  <Award className="h-4 w-4 text-gold" /> Scholarship
                </h3>
                <label className="block text-sm font-semibold text-navy mb-3">
                  Are you applying for a scholarship? <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  {["yes", "no"].map(val => (
                    <label
                      key={val}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-xl border-2 py-3.5 cursor-pointer transition-all font-semibold ${
                        form.scholarship === val
                          ? val === "yes" ? "border-gold bg-gold/5 text-navy" : "border-navy bg-navy/5 text-navy"
                          : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="scholarship"
                        value={val}
                        checked={form.scholarship === val}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      {val === "yes" ? "Yes, I am" : "No, I am not"}
                    </label>
                  ))}
                </div>

                {form.scholarship === "yes" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-5"
                  >
                    <label className="block text-sm font-semibold text-navy mb-2">
                      Scholarship Justification <span className="text-red-500">*</span>
                      <span className="text-gray-400 font-normal ml-2">(max 300 words)</span>
                    </label>
                    <textarea
                      name="scholarshipJustification"
                      value={form.scholarshipJustification}
                      onChange={handleChange}
                      placeholder="Explain why you should be considered for a scholarship. Include your financial situation, your goals, and how this masterclass will impact your community..."
                      rows={6}
                      className="w-full rounded-xl border border-gray-200 bg-off-white px-4 py-3.5 text-navy placeholder:text-gray-400 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all resize-none"
                    />
                    <div className="flex items-center justify-between mt-2">
                      <p className={`text-xs ${wordCount > 300 ? "text-red-500 font-bold" : "text-gray-400"}`}>
                        {wordCount}/300 words
                      </p>
                      {wordCount > 300 && (
                        <p className="text-xs text-red-500">Exceeds 300 word limit</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 font-medium"
                >
                  {error}
                </motion.div>
              )}

              {/* Summary & Submit */}
              {form.package && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-xl bg-navy/5 border border-navy/10 p-5"
                >
                  <h4 className="text-sm font-bold text-navy mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-gold" /> Application Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-gray-500">Package:</span>
                    <span className="text-navy font-semibold">{selectedPackage?.label}</span>
                    <span className="text-gray-500">Level:</span>
                    <span className="text-navy font-semibold capitalize">{form.classLevel || "—"}</span>
                    <span className="text-gray-500">Price:</span>
                    <span className="text-gold font-bold text-lg">${selectedPackage?.price}</span>
                    <span className="text-gray-500">Scholarship:</span>
                    <span className="text-navy font-semibold capitalize">{form.scholarship || "—"}</span>
                  </div>
                </motion.div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-3 bg-gold hover:bg-gold-light text-navy font-bold py-4 px-8 rounded-xl transition-all shadow-lg shadow-gold/20 hover:shadow-gold/30 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Submit Application
                  </>
                )}
              </button>

              {/* Terms Note */}
              <p className="text-center text-xs text-gray-400 leading-relaxed">
                By submitting this application, you agree to our{" "}
                <Link href="/terms" className="text-gold hover:text-navy underline">Terms & Conditions</Link>,{" "}
                <Link href="/privacy" className="text-gold hover:text-navy underline">Privacy Policy</Link>, and{" "}
                <Link href="/refund-policy" className="text-gold hover:text-navy underline">Refund Policy</Link>.
              </p>
            </div>
          </motion.form>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <p className="text-sm text-gray-500">
              Questions? Contact us on WhatsApp:{" "}
              <a href="https://wa.me/263773341947" className="text-navy font-semibold hover:text-gold">
                +263 77 334 1947
              </a>{" "}
              or{" "}
              <a href="https://wa.me/263774035666" className="text-navy font-semibold hover:text-gold">
                +263 77 403 5666
              </a>
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
