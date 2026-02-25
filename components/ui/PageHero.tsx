"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface PageHeroProps {
  eyebrow?: string;
  title?: string;
  highlight?: string;
  titleSuffix?: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  backgroundImage?: string;
  compact?: boolean;
}

export function PageHero({
  eyebrow = "COMMLEAD ACADEMY",
  title = "Master the Word.",
  highlight = "Shape the World.",
  titleSuffix,
  description = "The premier institution for high-impact communication and transformative leadership. Your voice starts here.",
  ctaText = "Enroll Now",
  ctaHref = "/auth/register",
  secondaryCtaText,
  secondaryCtaHref,
  backgroundImage = "/paneltalk.jpg",
  compact = false,
}: PageHeroProps) {
  return (
    <section className={`relative ${compact ? "min-h-[50vh]" : "min-h-[85vh]"} flex items-center overflow-hidden`}>
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={backgroundImage}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="hero-overlay absolute inset-0" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 h-72 w-72 rounded-full bg-gold/5 blur-3xl" />
        <div className="absolute bottom-20 left-20 h-96 w-96 rounded-full bg-white/3 blur-3xl" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(rgba(212,168,67,0.4) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 w-full py-24 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
          className="max-w-3xl"
        >
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="gold-divider" />
            <span className="text-gold text-[11px] font-bold uppercase tracking-[0.3em]">
              {eyebrow}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className={`font-heading ${compact ? "text-4xl md:text-5xl lg:text-6xl" : "text-5xl md:text-6xl lg:text-7xl"} text-white leading-[1.08] mb-6 tracking-tight`}
          >
            {title}
            {highlight && (
              <>
                <br />
                <span className="text-gold-gradient">{highlight}</span>
              </>
            )}
            {titleSuffix && (
              <>
                {" "}
                <span className="text-white">{titleSuffix}</span>
              </>
            )}
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="text-white/60 text-lg md:text-xl max-w-xl leading-relaxed mb-10 font-light"
          >
            {description}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex flex-wrap items-center gap-4"
          >
            <Link
              href={ctaHref}
              className="group inline-flex items-center gap-2 bg-gold text-navy px-8 py-4 rounded-xl text-sm font-bold uppercase tracking-wider shadow-xl shadow-gold/20 hover:shadow-2xl hover:shadow-gold/30 hover:-translate-y-0.5 transition-all"
            >
              {ctaText}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            {secondaryCtaText && secondaryCtaHref && (
              <Link
                href={secondaryCtaHref}
                className="inline-flex items-center gap-2 text-white/80 text-sm font-semibold uppercase tracking-wider border border-white/20 px-7 py-4 rounded-xl hover:bg-white/5 hover:border-white/30 transition-all"
              >
                {secondaryCtaText}
              </Link>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}
