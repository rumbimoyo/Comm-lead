"use client";

import { motion } from "framer-motion";
import { SectionWrapper, SectionHeading } from "@/components/ui/SectionWrapper";
import { BRAND } from "@/lib/constants";
import {
  Mic,
  Flame,
  Globe,
  Target,
  Heart,
  Key,
  Award,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  Mic,
  Flame,
  Globe,
  Target,
  Heart,
  Key,
  Award,
};

export function ValuesSection() {
  return (
    <SectionWrapper>
      <SectionHeading
        eyebrow="What We Stand For"
        title="Our Core Values"
        description="The principles that guide every lesson, every mentorship, and every transformation at CommLead Academy."
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {BRAND.values.map((value, i) => {
          const Icon = iconMap[value.icon] || Award;
          return (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="luxury-card group rounded-2xl p-8 text-center"
            >
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-navy/5 transition-colors group-hover:bg-gold/10">
                <Icon className="h-8 w-8 text-navy transition-colors group-hover:text-gold-dark" />
              </div>
              <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold text-navy mb-3">
                {value.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-text">
                {value.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
