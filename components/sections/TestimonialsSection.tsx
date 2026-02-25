"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SectionWrapper, SectionHeading } from "@/components/ui/SectionWrapper";
import { createSupabaseBrowserClient } from "@/utils/supabase-browser";
import { Quote } from "lucide-react";
import type { Testimonial } from "@/types/database";

const FALLBACK_TESTIMONIALS: Partial<Testimonial>[] = [
  {
    id: "1",
    student_name: "Tatenda M.",
    program: "Public Speaking Mastery",
    quote:
      "CommLead Academy completely transformed the way I communicate. I went from dreading presentations to being invited to speak at conferences.",
  },
  {
    id: "2",
    student_name: "Nyasha K.",
    program: "Leadership & Influence",
    quote:
      "The mentorship I received was unlike anything else. My confidence as a leader has grown exponentially.",
  },
  {
    id: "3",
    student_name: "Rumbidzai C.",
    program: "Executive Communication",
    quote:
      "This program gave me the edge I needed to step into my executive role with clarity and authority.",
  },
];

export function TestimonialsSection() {
  const [testimonials, setTestimonials] =
    useState<Partial<Testimonial>[]>(FALLBACK_TESTIMONIALS);

  useEffect(() => {
    async function fetch() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data } = await supabase
          .from("testimonials")
          .select("*")
          .eq("is_active", true)
          .order("order_index");
        if (data && data.length > 0) setTestimonials(data);
      } catch {}
    }
    fetch();
  }, []);

  return (
    <SectionWrapper className="bg-off-white">
      <SectionHeading
        eyebrow="Student Voices"
        title="What Our Students Say"
        description="Hear from real people who've experienced the CommLead transformation."
      />

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            className="luxury-card rounded-2xl p-8"
          >
            <Quote className="h-8 w-8 text-gold/30 mb-4" />
            <p className="text-muted-text leading-relaxed italic mb-6">
              &quot;{t.quote}&quot;
            </p>
            <div className="flex items-center gap-3 border-t border-gray-100 pt-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-white text-sm font-bold">
                {t.student_name?.charAt(0)}
              </div>
              <div>
                <h4 className="text-sm font-bold text-navy">
                  {t.student_name}
                </h4>
                {t.program && (
                  <p className="text-xs text-gold-dark">{t.program}</p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}
