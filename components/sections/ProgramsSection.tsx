"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SectionWrapper, SectionHeading } from "@/components/ui/SectionWrapper";
import { Button } from "@/components/ui/Button";
import { createSupabaseBrowserClient } from "@/utils/supabase-browser";
import { Clock, MapPin, ArrowRight } from "lucide-react";
import type { Program } from "@/types/database";

// Fallback data when Supabase isn't set up yet
const FALLBACK_PROGRAMS: Partial<Program>[] = [
  {
    id: "1",
    name: "Public Speaking Mastery",
    short_description:
      "Master the art of commanding any stage with confidence, clarity, and charisma.",
    duration: "8 Weeks",
    delivery_mode: "Hybrid",
    level: "beginner",
    price: 150,
    currency: "USD",
  },
  {
    id: "2",
    name: "Executive Communication",
    short_description:
      "Sharpen your boardroom presence and strategic communication for senior leadership roles.",
    duration: "12 Weeks",
    delivery_mode: "Online",
    level: "advanced",
    price: 300,
    currency: "USD",
  },
  {
    id: "3",
    name: "Leadership & Influence",
    short_description:
      "Develop the mindset, habits, and skills of transformative leaders who inspire action.",
    duration: "10 Weeks",
    delivery_mode: "In-Person",
    level: "intermediate",
    price: 200,
    currency: "USD",
  },
];

const levelColors = {
  beginner: "bg-emerald-50 text-emerald-700 border-emerald-200",
  intermediate: "bg-amber-50 text-amber-700 border-amber-200",
  advanced: "bg-purple-50 text-purple-700 border-purple-200",
};

export function ProgramsSection() {
  const [programs, setPrograms] = useState<Partial<Program>[]>(FALLBACK_PROGRAMS);

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
          setPrograms(data);
        }
      } catch {
        // Use fallback data
      }
    }
    fetchPrograms();
  }, []);

  return (
    <SectionWrapper className="bg-off-white" id="programs">
      <SectionHeading
        eyebrow="What We Offer"
        title="Our Programs"
        description="Carefully crafted programs designed to transform you into a confident communicator and inspiring leader."
      />

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {programs.map((program, i) => (
          <motion.div
            key={program.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            className="luxury-card group flex flex-col rounded-2xl overflow-hidden"
          >
            {/* Card Header Image Area */}
            <div className="relative h-48 bg-gradient-to-br from-navy to-navy-light flex items-center justify-center">
              <div className="text-center">
                <span className="text-5xl">🎓</span>
                <p className="mt-2 text-xs text-white/40">📸 Program image</p>
              </div>
              {/* Level Badge */}
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
              <p className="text-sm text-muted-text leading-relaxed mb-6 flex-1">
                {program.short_description}
              </p>

              {/* Meta */}
              <div className="mb-6 flex flex-wrap gap-4 text-xs text-muted-text">
                {program.duration && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-gold-dark" />
                    {program.duration}
                  </span>
                )}
                {program.delivery_mode && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-gold-dark" />
                    {program.delivery_mode}
                  </span>
                )}
              </div>

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

      <div className="mt-12 text-center">
        <Button href="/programs" variant="secondary" size="lg" icon>
          View All Programs
        </Button>
      </div>
    </SectionWrapper>
  );
}
