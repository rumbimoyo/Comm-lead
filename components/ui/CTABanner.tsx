"use client";

import { motion } from "framer-motion";
import { SectionWrapper } from "./SectionWrapper";
import { Button } from "./Button";
import { Sparkles } from "lucide-react";

interface CTABannerProps {
  title?: string;
  highlight?: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
}

export function CTABanner({
  title = "Ready to Transform Your",
  highlight = "Future",
  description = "Take the first step toward becoming the leader you were meant to be. Secure your place at COMMLEAD Academy today.",
  ctaText = "Register Now",
  ctaHref = "/auth/register",
  secondaryCtaText = "View Programs",
  secondaryCtaHref = "/programs",
}: CTABannerProps) {
  return (
    <section className="bg-gradient-navy relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 h-80 w-80 rounded-full bg-gold/8 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-white/3 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(rgba(212,168,67,0.4) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-24 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10 border border-gold/20">
            <Sparkles className="h-7 w-7 text-gold" />
          </div>

          <h2 className="mx-auto max-w-3xl font-heading text-3xl md:text-5xl lg:text-6xl text-white leading-tight tracking-tight">
            {title}{" "}
            <span className="text-gold-gradient">{highlight}</span>
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-lg text-white/50 font-light leading-relaxed">
            {description}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button href={ctaHref} variant="primary" size="lg" icon>
              {ctaText}
            </Button>
            {secondaryCtaText && secondaryCtaHref && (
              <Button href={secondaryCtaHref} variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/5 hover:border-white/30">
                {secondaryCtaText}
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
