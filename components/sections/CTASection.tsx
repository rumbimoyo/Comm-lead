"use client";

import { motion } from "framer-motion";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { Button } from "@/components/ui/Button";
import { Sparkles } from "lucide-react";

export function CTASection() {
  return (
    <SectionWrapper className="bg-gradient-navy relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-gold/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="relative text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/10">
            <Sparkles className="h-8 w-8 text-gold" />
          </div>

          <h2 className="mx-auto max-w-3xl font-[family-name:var(--font-heading)] text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            Ready to Transform Your{" "}
            <span className="text-gradient-gold">Communication</span> and{" "}
            <span className="text-gradient-gold">Leadership</span>?
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-lg text-white/60">
            Take the first step toward becoming the leader you were meant to be.
            Spaces are limited — secure your spot today.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button href="/auth/register" variant="primary" size="lg" icon>
              Register Now
            </Button>
            <Button href="/admissions" variant="outline" size="lg">
              Apply for Scholarship
            </Button>
          </div>

          <p className="mt-8 text-xs text-white/30">
            No commitment required • Flexible payment options • Scholarship available
          </p>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
