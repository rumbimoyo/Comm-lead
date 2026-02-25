"use client";

import { motion } from "framer-motion";
import { SectionWrapper, SectionHeading } from "@/components/ui/SectionWrapper";
import { BRAND } from "@/lib/constants";
import { Eye, Crosshair } from "lucide-react";

export function VisionMissionSection() {
  return (
    <SectionWrapper className="bg-off-white">
      <SectionHeading
        eyebrow="Our Purpose"
        title="Vision & Mission"
        description="Driving excellence in communication and leadership across Africa and beyond."
      />

      <div className="grid gap-8 md:grid-cols-2">
        {/* Vision */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="luxury-card rounded-2xl p-10"
        >
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-navy/5">
            <Eye className="h-7 w-7 text-navy" />
          </div>
          <h3 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-navy mb-4">
            Our Vision
          </h3>
          <p className="text-muted-text leading-relaxed text-lg">{BRAND.vision}</p>
          <div className="mt-6 h-1 w-16 rounded-full bg-gradient-to-r from-gold to-gold-light" />
        </motion.div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="luxury-card rounded-2xl p-10"
        >
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gold/10">
            <Crosshair className="h-7 w-7 text-gold-dark" />
          </div>
          <h3 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-navy mb-4">
            Our Mission
          </h3>
          <p className="text-muted-text leading-relaxed text-lg">{BRAND.mission}</p>
          <div className="mt-6 h-1 w-16 rounded-full bg-gradient-to-r from-navy to-navy-light" />
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
