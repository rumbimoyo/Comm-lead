"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  MapPin,
  Users,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Calendar,
  Target,
} from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { SectionWrapper, SectionHeading } from "@/components/ui/SectionWrapper";
import { Button } from "@/components/ui/Button";
import { CTABanner } from "@/components/ui/CTABanner";
import { createSupabaseBrowserClient } from "@/utils/supabase-browser";
import { PROGRAMS_DATA } from "@/lib/constants";

type ProgramData = (typeof PROGRAMS_DATA)[number];

const levelColors = {
  beginner: "bg-emerald-50 text-emerald-700 border-emerald-200",
  intermediate: "bg-amber-50 text-amber-700 border-amber-200",
  advanced: "bg-purple-50 text-purple-700 border-purple-200",
};

const levelLabels = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

type Level = "all" | "beginner" | "intermediate" | "advanced";

export function ProgramsContent() {
  const [programs, setPrograms] = useState<ProgramData[]>([...PROGRAMS_DATA]);
  const [filter, setFilter] = useState<Level>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPrograms() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data } = await supabase
          .from("programs")
          .select("*")
          .eq("is_active", true)
          .order("order_index");
        if (data && data.length > 0) {
          setPrograms(data as unknown as ProgramData[]);
        }
      } catch {
        // Use fallback
      }
    }
    fetchPrograms();
  }, []);

  const filtered =
    filter === "all" ? programs : programs.filter((p) => p.level === filter);

  return (
    <>
      <PageHero
        eyebrow="Our Programs"
        title="Unlock Your"
        highlight="Full Potential"
        description="Choose from our carefully crafted programs designed to transform you into a confident communicator and inspiring leader. Every program includes hands-on practice, expert mentorship, and professional certification."
        ctaText="Register Now"
        ctaHref="/auth/register"
        secondaryCtaText="View Admissions"
        secondaryCtaHref="/admissions"
        backgroundImage="/ladiesspeaking.png"
        compact
      />

      {/* Filter Bar */}
      <SectionWrapper>
        <div className="mb-12 flex flex-wrap items-center justify-center gap-3">
          {(["all", "beginner", "intermediate", "advanced"] as Level[]).map(
            (level) => (
              <button
                key={level}
                onClick={() => setFilter(level)}
                className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-300 ${
                  filter === level
                    ? "bg-navy text-white shadow-lg shadow-navy/20"
                    : "bg-off-white text-muted-text hover:bg-navy/5 hover:text-navy"
                }`}
              >
                {level === "all" ? "All Programs" : levelLabels[level]}
              </button>
            )
          )}
        </div>

        {/* Programs Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((program, i) => (
            <motion.div
              key={program.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              layout
              className="premium-card group flex flex-col rounded-2xl overflow-hidden"
            >
              {/* Card Header */}
              <div className="relative h-48 bg-gradient-to-br from-navy to-navy-light flex items-center justify-center">
                <div className="text-center">
                  <GraduationCap className="mx-auto h-12 w-12 text-gold/60" />
                  <p className="mt-2 text-xs text-white/40">📸 Program image</p>
                </div>
                {program.level && (
                  <span
                    className={`absolute top-4 right-4 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                      levelColors[program.level]
                    }`}
                  >
                    {program.level}
                  </span>
                )}
              </div>

              {/* Card Body */}
              <div className="flex flex-1 flex-col p-7">
                <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold text-navy mb-3 group-hover:text-navy-light transition-colors">
                  {program.name}
                </h3>
                <p className="text-sm text-muted-text leading-relaxed mb-4 flex-1">
                  {expandedId === program.id
                    ? program.full_description
                    : program.short_description}
                </p>
                <button
                  onClick={() =>
                    setExpandedId(
                      expandedId === program.id ? null : program.id
                    )
                  }
                  className="text-xs font-semibold text-gold-dark hover:text-navy transition-colors mb-4 text-left"
                >
                  {expandedId === program.id ? "Show less" : "Read more →"}
                </button>

                {/* Meta */}
                <div className="mb-4 grid grid-cols-2 gap-3 text-xs text-muted-text">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-gold-dark" />
                    {program.duration}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-gold-dark" />
                    {program.delivery_mode}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-gold-dark" />
                    {program.schedule}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5 text-gold-dark" />
                    {program.level}
                  </span>
                </div>

                {/* Outcomes */}
                {expandedId === program.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mb-4"
                  >
                    <h4 className="text-xs font-bold uppercase tracking-wider text-navy mb-2">
                      What You&apos;ll Achieve
                    </h4>
                    <ul className="space-y-1.5">
                      {program.outcomes.map((outcome) => (
                        <li
                          key={outcome}
                          className="flex items-start gap-2 text-xs text-muted-text"
                        >
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                          {outcome}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 rounded-lg bg-off-white p-3">
                      <p className="text-xs text-muted-text">
                        <span className="font-semibold text-navy">Certification:</span>{" "}
                        {program.certification}
                      </p>
                      <p className="text-xs text-muted-text mt-1">
                        <span className="font-semibold text-navy">Audience:</span>{" "}
                        {program.target_audience}
                      </p>
                      <p className="text-xs text-muted-text mt-1">
                        <span className="font-semibold text-navy">Payment:</span>{" "}
                        {program.payment_options}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Price & CTA */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-5">
                  <div>
                    <span className="text-2xl font-bold text-navy">
                      ${program.price}
                    </span>
                    <span className="text-xs text-muted-text ml-1">
                      {program.currency}
                    </span>
                  </div>
                  <Button href="/auth/register" variant="ghost" size="sm">
                    Enroll
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      <CTABanner
        title="Found Your"
        highlight="Program"
        description="Don't wait — secure your place in the next cohort and start your transformation journey."
        ctaText="Register Now"
        ctaHref="/auth/register"
        secondaryCtaText="Apply for Scholarship"
        secondaryCtaHref="/auth/register"
      />
    </>
  );
}
