"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Mic,
  Users,
  Trophy,
  Quote,
  GraduationCap,
  Sparkles,
  BookOpen,
  Target,
  Star,
  CheckCircle2,
} from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { SectionWrapper, SectionHeading } from "@/components/ui/SectionWrapper";
import { CTABanner } from "@/components/ui/CTABanner";
import { Button } from "@/components/ui/Button";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { FOUNDER, TESTIMONIALS } from "@/lib/constants";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

export default function HomePage() {
  return (
    <main className="overflow-hidden">
      {/* ═══════════════════ 1. HERO ═══════════════════ */}
      <PageHero
        eyebrow="School of Advanced Communication & Leadership"
        title="Master the Word."
        highlight="Shape the World."
        description="We equip, empower, and transform a new generation of communicators, leaders, and professionals through world-class training in advanced communication, leadership, and influence."
        ctaText="Begin Your Journey"
        ctaHref="/auth/register"
        secondaryCtaText="Explore Programs"
        secondaryCtaHref="/programs"
        backgroundImage="/paneltalk.jpg"
      />

      {/* ═══════════════════ 2. IMPACT STRIP ═══════════════════ */}
      <section className="relative -mt-12 z-10">
        <div className="mx-auto max-w-5xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-0 bg-white rounded-2xl shadow-2xl shadow-navy/8 border border-gray-100 overflow-hidden"
          >
            {[
              { icon: Mic, label: "Speaking Programs", value: "9+" },
              { icon: Users, label: "Active Students", value: "100+" },
              { icon: Trophy, label: "Scholarships Given", value: "20+" },
              { icon: GraduationCap, label: "Certifications", value: "9" },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={`flex flex-col items-center py-8 px-4 text-center ${
                  i < 3 ? "border-r border-gray-100" : ""
                } group hover:bg-navy hover:text-white transition-all duration-500`}
              >
                <stat.icon className="h-6 w-6 text-gold mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-2xl font-heading font-bold text-navy group-hover:text-white transition-colors">
                  {stat.value}
                </span>
                <span className="text-[11px] text-muted-text uppercase tracking-wider mt-1 group-hover:text-white/60 transition-colors">
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ 3. CURRICULUM TIERS ═══════════════════ */}
      <SectionWrapper>
        <SectionHeading
          eyebrow="Our Programs"
          title="Designed for Every Stage of Your Journey"
          description="From foundational confidence to executive-level mastery — choose your path to transformation."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
          {[
            {
              img: "/womensmiling.jpg",
              level: "Beginner",
              title: "Foundations",
              desc: "Build unshakeable confidence and master the fundamentals of powerful communication.",
              color: "from-emerald-600 to-emerald-800",
            },
            {
              img: "/ladiesspeaking.png",
              level: "Intermediate",
              title: "Influence",
              desc: "Advance your skills with storytelling mastery, persuasion, and leadership communication.",
              color: "from-blue-600 to-blue-800",
            },
            {
              img: "/panneldiscussion.png",
              level: "Advanced",
              title: "Legacy",
              desc: "Executive-level rhetoric, corporate strategy, and the skills to define your era.",
              color: "from-purple-600 to-purple-800",
            },
          ].map((tier, i) => (
            <motion.div
              key={tier.title}
              {...fadeUp}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="group cursor-pointer"
            >
              <Link href="/programs">
                <div className="relative image-frame aspect-[4/5] shadow-xl glow-navy">
                  <img
                    src={tier.img}
                    className="w-full h-full object-cover"
                    alt={tier.title}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/90 via-navy/30 to-transparent" />

                  {/* Level Badge */}
                  <div className={`absolute top-5 left-5 bg-gradient-to-r ${tier.color} text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg`}>
                    {tier.level}
                  </div>

                  {/* Bottom Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-7">
                    <h3 className="font-heading text-2xl lg:text-3xl text-white mb-2">
                      {tier.title}
                    </h3>
                    <p className="text-white/60 text-sm leading-relaxed mb-4 line-clamp-2">
                      {tier.desc}
                    </p>
                    <span className="inline-flex items-center gap-2 text-gold text-[11px] font-bold uppercase tracking-widest group-hover:gap-3 transition-all">
                      Explore Track <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* ═══════════════════ 4. WHY COMMLEAD ═══════════════════ */}
      <section className="bg-off-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Image Side */}
            <motion.div {...fadeUp} className="relative">
              <div className="image-frame aspect-[4/3] shadow-2xl glow-gold">
                <img
                  src="/twomenspeaking.jpg"
                  alt="Students in conversation"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Floating accent card */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="absolute -bottom-6 -right-6 p-6 bg-navy text-white rounded-2xl shadow-2xl max-w-[240px] hidden lg:block"
              >
                <Quote className="h-6 w-6 text-gold mb-3" />
                <p className="text-sm text-white/80 italic leading-relaxed">
                  &ldquo;Your voice is the bridge between your potential and your opportunities.&rdquo;
                </p>
              </motion.div>
            </motion.div>

            {/* Content Side */}
            <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="gold-divider" />
                <span className="text-gold-dark text-[11px] font-bold uppercase tracking-[0.3em]">Why CommLead</span>
              </div>
              <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-navy leading-tight tracking-tight mb-6">
                Where Voices Become <span className="text-gold-gradient">Leaders</span>
              </h2>
              <p className="text-muted-text text-lg leading-relaxed mb-8 font-light">
                In a world overflowing with information but starved of clarity, the power of words has never been more critical. We exist to train communicators who can speak with confidence, think with courage, and act with impact.
              </p>

              <div className="space-y-5">
                {[
                  { icon: BookOpen, text: "World-class curriculum designed by industry experts" },
                  { icon: Target, text: "Practical exercises, live presentations, and real-world briefs" },
                  { icon: Star, text: "Dedicated mentorship from experienced professionals" },
                  { icon: Users, text: "Powerful alumni network across Africa and beyond" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    {...fadeUp}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-start gap-4 group"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gold/10 group-hover:bg-navy group-hover:text-white transition-all">
                      <item.icon className="h-5 w-5 text-gold-dark group-hover:text-gold transition-colors" />
                    </div>
                    <p className="text-muted-text text-[15px] leading-relaxed pt-2">{item.text}</p>
                  </motion.div>
                ))}
              </div>

              <div className="mt-10">
                <Button href="/about" variant="secondary" size="lg" icon>
                  Learn More About Us
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ 5. FOUNDER SECTION ═══════════════════ */}
      <section className="bg-gradient-navy py-20 lg:py-28 relative overflow-hidden">
        {/* Decorative shield watermark */}
        <div className="absolute -right-20 -bottom-20 opacity-[0.03]">
          <img src="/CommLead Academy shield logo.png" alt="" className="w-96" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-start">
            {/* Founder Image */}
            <motion.div {...fadeUp} className="lg:col-span-2">
              <div className="relative">
                <div className="image-frame aspect-[3/4] shadow-2xl glow-gold">
                  <img
                    src="/foundersimage.png"
                    alt={FOUNDER.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Name Card */}
                <div className="mt-6 text-center">
                  <h3 className="font-heading text-xl font-bold text-white">{FOUNDER.name}</h3>
                  <p className="text-gold text-sm mt-1">{FOUNDER.title}</p>
                </div>
              </div>
            </motion.div>

            {/* Founder Story */}
            <motion.div
              {...fadeUp}
              transition={{ delay: 0.2 }}
              className="lg:col-span-3"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="gold-divider" />
                <span className="text-gold text-[11px] font-bold uppercase tracking-[0.3em]">The Founder&apos;s Story</span>
              </div>
              <h2 className="font-heading text-3xl md:text-4xl text-white leading-tight tracking-tight mb-8">
                From Village to <span className="text-gold-gradient">World Stage</span>
              </h2>

              <div className="space-y-5 text-white/65 text-[16px] leading-relaxed font-light">
                <p>
                  I was born and raised in a low-income family in a small village,
                  where the prospect of achieving anything beyond the ordinary seemed
                  impossible. I remember dropping out of school, believing that my
                  life would be limited to looking after my father&apos;s cows,
                  marrying young, and remaining &ldquo;just someone from the
                  village.&rdquo; Opportunities felt distant, and my dreams even more so.
                </p>
                <p>
                  But everything changed the day I pitched an idea to a
                  stranger&mdash;someone who believed in me and supported my
                  education. That moment unlocked a path I had never imagined. I went
                  on to become one of the top A-Level students in my country,
                  achieving straight As. My teachers encouraged me to step into public
                  speaking and debate, ultimately leading me to represent my peers in
                  the Zimbabwe Junior Parliament.
                </p>
                <p className="text-white/80 font-normal border-l-2 border-gold/30 pl-6 italic">
                  &ldquo;I was never poor in spirit or potential&mdash;I was simply
                  inarticulate, unable to express the best of what I had to offer.&rdquo;
                </p>
                <p>
                  COMMLEAD Academy exists because I do not want anyone else to suffer
                  as I did&mdash;not because of a lack of ability, intelligence, or
                  dreams, but because they cannot communicate them. This school is my
                  life&apos;s mission: to empower every student to speak, write, and
                  lead with confidence, so that no talent is wasted, no opportunity is
                  missed, and no voice goes unheard.
                </p>
              </div>

              <div className="mt-8">
                <Button href="/about" variant="outline" size="md" className="border-white/20 text-white hover:bg-white/5 hover:border-white/30" icon>
                  Read Full Story
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ 6. WHAT STUDENTS CAN EXPECT ═══════════════════ */}
      <SectionWrapper>
        <SectionHeading
          eyebrow="The Experience"
          title="What Students Can Expect"
          description="COMMLEAD Academy isn't just a course — it's a complete transformation."
        />

        <div className="grid gap-16 lg:grid-cols-2 items-center">
          {/* Image */}
          <motion.div {...fadeUp} className="order-2 lg:order-1">
            <div className="relative">
              <div className="image-frame aspect-[16/10] shadow-2xl">
                <img
                  src="/panneldiscussion.png"
                  alt="Panel discussion at CommLead Academy"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 h-full w-full rounded-3xl bg-gold/8 -z-10" />
            </div>
          </motion.div>

          {/* Expectation Items */}
          <div className="order-1 lg:order-2 space-y-6">
            {[
              { icon: Sparkles, title: "First-Class Experience", desc: "From enrollment to certification, every touchpoint is designed to feel premium, intentional, and world-class." },
              { icon: Mic, title: "Interactive Teaching", desc: "Real-world case studies, live presentations, and dynamic group exercises — not boring lectures." },
              { icon: BookOpen, title: "Practical Exercises", desc: "Role-plays, mock presentations, debates, and real-client communication briefs." },
              { icon: Users, title: "Dedicated Mentorship", desc: "Every student is paired with a mentor who guides them personally through the program." },
              { icon: Star, title: "Powerful Networking", desc: "Connect with fellow leaders, industry professionals, and alumni across Africa." },
              { icon: Trophy, title: "Total Transformation", desc: "Walk in uncertain. Walk out commanding rooms, boardrooms, stages, and any conversation." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                {...fadeUp}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex gap-5 group"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-navy/5 group-hover:bg-navy transition-all duration-300">
                  <item.icon className="h-5 w-5 text-gold-dark group-hover:text-gold transition-colors" />
                </div>
                <div>
                  <h4 className="font-heading text-lg font-bold text-navy mb-1">
                    {item.title}
                  </h4>
                  <p className="text-sm text-muted-text leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* ═══════════════════ 7. TESTIMONIALS ═══════════════════ */}
      <section className="bg-off-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeading
            eyebrow="Student Voices"
            title="What Our Students Say"
            description="Real stories from real students whose lives were transformed at COMMLEAD Academy."
          />

          <div className="grid gap-8 md:grid-cols-2">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.id}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="premium-card rounded-2xl p-8 lg:p-10"
              >
                <Quote className="h-8 w-8 text-gold/30 mb-5" />
                <p className="text-navy text-[15px] leading-relaxed mb-6 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-4 pt-5 border-t border-gray-100">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-navy to-navy-light flex items-center justify-center text-gold font-bold text-sm">
                    {t.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="font-bold text-navy text-sm">{t.name}</p>
                    <p className="text-[12px] text-muted-text">{t.role}, {t.company}</p>
                  </div>
                  <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-gold-dark bg-gold/10 px-3 py-1 rounded-full">
                    {t.program}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ 8. ACTION IMAGE ═══════════════════ */}
      <section className="py-4">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="image-frame aspect-[21/7] shadow-xl overflow-hidden rounded-3xl">
            <img
              src="/ladiesspeaking.png"
              alt="CommLead Academy students speaking"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-navy/80 via-navy/40 to-transparent flex items-center">
              <div className="px-10 lg:px-16 max-w-xl">
                <h3 className="font-heading text-2xl lg:text-4xl text-white mb-3">
                  Your Voice. <span className="text-gold-gradient">Your Power.</span>
                </h3>
                <p className="text-white/60 text-sm lg:text-base mb-5 font-light">
                  Join hundreds of students who&apos;ve discovered the power of their voice.
                </p>
                <Button href="/admissions" variant="primary" size="md" icon>
                  Start Your Application
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ 9. CTA ═══════════════════ */}
      <CTABanner
        title="Ready to Unleash Your"
        highlight="Superpower?"
        description="Take the first step toward becoming the leader you were meant to be. Enroll today and let your voice be heard."
        ctaText="Apply Now"
        ctaHref="/auth/register"
        secondaryCtaText="View Programs"
        secondaryCtaHref="/programs"
      />
    </main>
  );
}
