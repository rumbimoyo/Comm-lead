"use client";

import { motion } from "framer-motion";
import {
  Eye, Crosshair, Mic, Flame, Key, Quote, Heart, Target, Globe,
} from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { SectionWrapper, SectionHeading } from "@/components/ui/SectionWrapper";
import { CTABanner } from "@/components/ui/CTABanner";
import { FOUNDER } from "@/lib/constants";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

export function AboutContent() {
  return (
    <>
      {/* 1. HERO */}
      <PageHero
        eyebrow="About COMMLEAD Academy"
        title="Transforming the Power"
        highlight="of the Human Voice"
        description="COMMLEAD Academy exists to equip, empower, and transform a new generation of communicators, leaders, and professionals."
        ctaText="Enroll Now"
        ctaHref="/auth/register"
        secondaryCtaText="View Programs"
        secondaryCtaHref="/programs"
        backgroundImage="/panneldiscussion.png"
        compact
      />

      {/* 2. WHY WE EXIST */}
      <SectionWrapper>
        <div className="max-w-4xl mx-auto text-center">
          <SectionHeading
            eyebrow="The Manifesto"
            title="Why We Exist"
            description="In a world overflowing with information but starved of clarity, ideas fail and leaders falter — not because of a lack of vision, but because they cannot communicate it effectively."
          />
          <motion.div
            {...fadeUp}
            className="mt-8 p-10 bg-off-white rounded-2xl border border-gray-100 shadow-sm"
          >
            <Quote className="h-8 w-8 text-gold/30 mx-auto mb-4" />
            <p className="text-navy text-lg leading-loose italic font-light">
              &ldquo;We believe that a single well-spoken or well-written word can inspire movements, a well-led team can transform nations, and a visionary leader can shape the course of history. Our purpose is to ensure that the next generation doesn&apos;t just watch the world happen — they shape it.&rdquo;
            </p>
          </motion.div>
        </div>
      </SectionWrapper>

      {/* 3. VISION & MISSION */}
      <section className="bg-off-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeading eyebrow="Our Foundation" title="Vision & Mission" />
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div {...fadeUp} className="premium-card p-10 rounded-2xl group">
              <Eye className="text-gold mb-5" size={36} />
              <h3 className="font-heading text-2xl font-bold text-navy mb-4">Our Vision</h3>
              <p className="text-muted-text leading-relaxed text-[15px] italic font-light">
                &ldquo;To raise the most influential and transformative communicators, leaders, and professionals — whose voices define eras, transform communities and nations, and inspire humanity to achieve its highest potential.&rdquo;
              </p>
            </motion.div>

            <motion.div {...fadeUp} transition={{ delay: 0.15 }} className="bg-gradient-navy p-10 rounded-2xl relative overflow-hidden group">
              <div className="absolute -right-10 -bottom-10 opacity-[0.04] group-hover:scale-110 transition-transform duration-700">
                <img src="/CommLead Academy shield logo.png" className="w-64" alt="" />
              </div>
              <Crosshair className="text-gold mb-5 relative" size={36} />
              <h3 className="font-heading text-2xl font-bold text-gold mb-4 relative">Our Mission</h3>
              <p className="text-white/70 leading-relaxed text-[15px] relative font-light">
                COMMLEAD Academy exists to equip, empower, and transform a new generation of communicators, leaders, and professionals by providing world-class training in advanced communication, leadership, and influence.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. CORE VALUES */}
      <section className="bg-off-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeading eyebrow="Our DNA" title="Core Values" />
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Voice Above All", icon: Mic, text: "Your ability to speak clearly is the bridge between potential and opportunity." },
              { title: "Boldness in Action", icon: Flame, text: "True leadership requires the courage to think fearlessly and lead without hesitation." },
              { title: "Words that Change Worlds", icon: Globe, text: "Communication is only valuable when it sparks action and transforms ideas into influence." },
              { title: "Mastery in Motion", icon: Target, text: "Excellence is a habit. We cultivate relentless growth, integrity, and mastery." },
              { title: "Empathy as Strength", icon: Heart, text: "Leadership is about listening, understanding, and connecting with care." },
              { title: "Opportunity Unlocked", icon: Key, text: "No talent should go unheard. We empower every student to seize their moment." },
            ].map((v, i) => (
              <motion.div
                key={v.title}
                {...fadeUp}
                transition={{ delay: i * 0.08 }}
                className="premium-card p-8 rounded-2xl group"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 group-hover:bg-navy transition-all mb-5">
                  <v.icon className="h-6 w-6 text-gold-dark group-hover:text-gold transition-colors" />
                </div>
                <h4 className="font-heading text-lg font-bold text-navy mb-2">{v.title}</h4>
                <p className="text-sm text-muted-text leading-relaxed font-light">{v.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. ACTION IMAGE STRIP */}
      <section className="py-4">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="image-frame aspect-[21/6] shadow-xl rounded-3xl overflow-hidden">
            <img src="/ladiesspeaking.png" className="w-full h-full object-cover" alt="Academy in Action" />
          </div>
        </div>
      </section>

      {/* 7. CTA */}
      <CTABanner
        title="Ready to Unleash Your"
        highlight="Superpower?"
        description="Join COMMLEAD Academy today and ensure your voice is heard, your ideas are acted upon, and your potential is realized."
        ctaText="Begin Enrollment"
        ctaHref="/auth/register"
        secondaryCtaText="View Programs"
        secondaryCtaHref="/programs"
      />
    </>
  );
}
