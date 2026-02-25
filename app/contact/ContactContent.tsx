"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Send,
  CheckCircle2,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Clock,
} from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { Button } from "@/components/ui/Button";
import { CTABanner } from "@/components/ui/CTABanner";
import { CONTACT_INFO } from "@/lib/constants";
import { createSupabaseBrowserClient } from "@/utils/supabase-browser";

export function ContactContent() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: dbError } = await supabase
        .from("contact_submissions")
        .insert({
          name: form.name,
          email: form.email,
          phone: form.phone || null,
          subject: form.subject,
          message: form.message,
        });

      if (dbError) throw dbError;
      setSubmitted(true);
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch {
      setError(
        "Something went wrong. Please try again or contact us directly via WhatsApp."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Get in Touch"
        title="We'd Love to"
        highlight="Hear From You"
        description="Have a question about our programs, admissions, or events? Reach out to us and we'll respond within 24 hours."
        backgroundImage="/twomenspeaking.jpg"
        compact
      />

      <SectionWrapper>
        <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-navy mb-2">
              Send Us a Message
            </h2>
            <p className="text-muted-text mb-8">
              Fill out the form below and our team will get back to you promptly.
            </p>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="premium-card rounded-2xl p-12 text-center"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </div>
                <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold text-navy mb-2">
                  Message Sent!
                </h3>
                <p className="text-muted-text">
                  Thank you for reaching out. We'll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 text-sm font-semibold text-gold-dark hover:text-navy transition-colors"
                >
                  Send another message →
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-semibold text-navy mb-2"
                    >
                      Full Name *
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-dark-text placeholder-muted-text/50 transition-all focus:border-gold focus:ring-2 focus:ring-gold/20 focus:outline-none"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-navy mb-2"
                    >
                      Email Address *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-dark-text placeholder-muted-text/50 transition-all focus:border-gold focus:ring-2 focus:ring-gold/20 focus:outline-none"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-semibold text-navy mb-2"
                    >
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-dark-text placeholder-muted-text/50 transition-all focus:border-gold focus:ring-2 focus:ring-gold/20 focus:outline-none"
                      placeholder="+263 XX XXX XXXX"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-semibold text-navy mb-2"
                    >
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={form.subject}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-dark-text transition-all focus:border-gold focus:ring-2 focus:ring-gold/20 focus:outline-none"
                    >
                      <option value="">Select a subject</option>
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Programs">Programs</option>
                      <option value="Admissions">Admissions</option>
                      <option value="Payments">Payments</option>
                      <option value="Scholarships">Scholarships</option>
                      <option value="Partnerships">Partnerships</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-semibold text-navy mb-2"
                  >
                    Your Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={form.message}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-dark-text placeholder-muted-text/50 transition-all focus:border-gold focus:ring-2 focus:ring-gold/20 focus:outline-none resize-none"
                    placeholder="Tell us how we can help..."
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-gold px-8 py-4 font-semibold text-navy-dark shadow-lg shadow-gold/25 transition-all hover:bg-gold-light hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    "Sending..."
                  ) : (
                    <>
                      Send Message
                      <Send className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>

          {/* Contact Info Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Contact Cards */}
            {[
              {
                icon: Phone,
                title: "Call Us",
                detail: CONTACT_INFO.phone,
                sub: "Mon-Fri, 8AM - 5PM",
              },
              {
                icon: Mail,
                title: "Email Us",
                detail: CONTACT_INFO.email,
                sub: "We respond within 24 hours",
              },
              {
                icon: MessageCircle,
                title: "WhatsApp",
                detail: CONTACT_INFO.whatsapp,
                sub: "Quick response guaranteed",
              },
              {
                icon: MapPin,
                title: "Visit Us",
                detail: CONTACT_INFO.address,
                sub: "By appointment",
              },
              {
                icon: Clock,
                title: "Office Hours",
                detail: "Mon - Fri: 8AM - 5PM",
                sub: "Sat: 9AM - 1PM",
              },
            ].map((item, i) => (
              <div
                key={item.title}
                className="luxury-card rounded-xl p-5 flex items-start gap-4"
              >
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-navy/5">
                  <item.icon className="h-5 w-5 text-navy" />
                </div>
                <div>
                  <h4 className="font-semibold text-navy text-sm">
                    {item.title}
                  </h4>
                  <p className="text-sm text-dark-text mt-0.5">{item.detail}</p>
                  <p className="text-xs text-muted-text mt-0.5">{item.sub}</p>
                </div>
              </div>
            ))}

            {/* Social Links */}
            <div className="luxury-card rounded-xl p-5">
              <h4 className="font-semibold text-navy text-sm mb-4">
                Follow Us
              </h4>
              <div className="flex gap-3">
                {[
                  { icon: Facebook, href: CONTACT_INFO.socials.facebook },
                  { icon: Instagram, href: CONTACT_INFO.socials.instagram },
                  { icon: Linkedin, href: CONTACT_INFO.socials.linkedin },
                  { icon: Twitter, href: CONTACT_INFO.socials.twitter },
                ].map(({ icon: Icon, href }, i) => (
                  <a
                    key={i}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy/5 text-navy transition-all hover:bg-gold/10 hover:text-gold-dark"
                    aria-label="Social media link"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </SectionWrapper>

      <CTABanner
        title="Ready to Start Your"
        highlight="Journey"
        description="Don't wait — apply today and take the first step toward mastering communication and leadership."
        ctaText="Register Now"
        ctaHref="/auth/register"
        secondaryCtaText="View Programs"
        secondaryCtaHref="/programs"
      />
    </>
  );
}
