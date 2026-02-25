"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  CreditCard,
  MessageSquare,
  CheckCircle2,
  GraduationCap,
  ChevronDown,
  Wallet,
  Heart,
  Award,
  Users,
  ArrowRight,
} from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { SectionWrapper, SectionHeading } from "@/components/ui/SectionWrapper";
import { Button } from "@/components/ui/Button";
import { CTABanner } from "@/components/ui/CTABanner";
import { ADMISSIONS_FAQ, PAYMENT_INFO } from "@/lib/constants";

const steps = [
  {
    number: "01",
    icon: ClipboardList,
    title: "Fill Out the Application",
    description:
      "Complete our online registration form. Select your preferred program, provide your details, and tell us your motivation.",
  },
  {
    number: "02",
    icon: MessageSquare,
    title: "Application Review",
    description:
      "Our admissions team reviews your application within 24–48 hours. You'll receive a confirmation message via WhatsApp.",
  },
  {
    number: "03",
    icon: CreditCard,
    title: "Payment Instructions",
    description:
      "Once approved, we send you payment details via WhatsApp. Pay via EcoCash, InnBucks, or bank transfer.",
  },
  {
    number: "04",
    icon: CheckCircle2,
    title: "Access Granted",
    description:
      "After payment confirmation, you receive your login credentials and immediate access to your program materials.",
  },
];

export function AdmissionsContent() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <PageHero
        eyebrow="Admissions"
        title="Your Journey to"
        highlight="Greatness Starts Here"
        description="Applying to CommLead Academy is simple, transparent, and designed to get you started fast. Follow our 4-step process and join the next cohort of transformative leaders."
        ctaText="Apply Now"
        ctaHref="/auth/register"
        secondaryCtaText="View Programs"
        secondaryCtaHref="/programs"
        backgroundImage="/womensmiling.jpg"
        compact
      />

      {/* Application Process */}
      <SectionWrapper>
        <SectionHeading
          eyebrow="How to Apply"
          title="Application Process"
          description="From registration to first class — here's exactly what to expect."
        />

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="premium-card relative rounded-2xl p-8 text-center"
            >
              {/* Step Number */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gold px-4 py-1 text-sm font-bold text-navy-dark shadow-lg shadow-gold/25">
                Step {step.number}
              </div>
              <div className="mt-4 mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-navy/5">
                <step.icon className="h-8 w-8 text-navy" />
              </div>
              <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-navy mb-3">
                {step.title}
              </h3>
              <p className="text-sm text-muted-text leading-relaxed">
                {step.description}
              </p>

              {/* Connector Arrow */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 z-10">
                  <ArrowRight className="h-6 w-6 text-gold" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* Fees & Payment */}
      <SectionWrapper className="bg-off-white">
        <SectionHeading
          eyebrow="Fees & Payment"
          title="Investment in Your Future"
          description="Transparent pricing with flexible payment options to make your education accessible."
        />

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* EcoCash */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="premium-card rounded-2xl p-8"
          >
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-50">
              <Wallet className="h-7 w-7 text-emerald-600" />
            </div>
            <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold text-navy mb-3">
              {PAYMENT_INFO.ecocash.name}
            </h3>
            <div className="space-y-2 text-sm text-muted-text">
              <p>
                <span className="font-semibold text-navy">Number:</span>{" "}
                {PAYMENT_INFO.ecocash.number}
              </p>
              <p>
                <span className="font-semibold text-navy">Merchant:</span>{" "}
                {PAYMENT_INFO.ecocash.merchantName}
              </p>
            </div>
          </motion.div>

          {/* InnBucks */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="premium-card rounded-2xl p-8"
          >
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50">
              <CreditCard className="h-7 w-7 text-blue-600" />
            </div>
            <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold text-navy mb-3">
              {PAYMENT_INFO.innbucks.name}
            </h3>
            <div className="space-y-2 text-sm text-muted-text">
              <p>
                <span className="font-semibold text-navy">Number:</span>{" "}
                {PAYMENT_INFO.innbucks.number}
              </p>
            </div>
          </motion.div>

          {/* Bank Transfer */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="premium-card rounded-2xl p-8"
          >
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-amber-50">
              <CreditCard className="h-7 w-7 text-amber-600" />
            </div>
            <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold text-navy mb-3">
              Bank Transfer
            </h3>
            <div className="space-y-2 text-sm text-muted-text">
              <p>
                <span className="font-semibold text-navy">Bank:</span>{" "}
                {PAYMENT_INFO.bank.bankName}
              </p>
              <p>
                <span className="font-semibold text-navy">Account:</span>{" "}
                {PAYMENT_INFO.bank.accountName}
              </p>
              <p>
                <span className="font-semibold text-navy">Acc No:</span>{" "}
                {PAYMENT_INFO.bank.accountNumber}
              </p>
            </div>
          </motion.div>
        </div>

        <div className="mt-8 mx-auto max-w-2xl text-center">
          <p className="text-sm text-muted-text">
            💡 Instalment plans are available for select programs. Contact us for details.
          </p>
        </div>
      </SectionWrapper>

      {/* Scholarships */}
      <SectionWrapper className="bg-gradient-navy">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              Scholarships
            </span>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-white md:text-4xl lg:text-5xl mb-6">
              We Believe in <span className="text-gradient-gold">Equal Access</span>
            </h2>
            <p className="text-lg text-white/60 leading-relaxed mb-8">
              CommLead Academy offers a limited number of scholarships each intake
              for talented individuals who demonstrate exceptional potential but
              face financial barriers. We believe leadership talent knows no
              economic boundary.
            </p>
            <ul className="space-y-4 mb-8">
              {[
                "Full and partial scholarships available",
                "Based on motivation, potential, and need",
                "Open to all programs and levels",
                "Application reviewed within 5 business days",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-white/80">
                  <CheckCircle2 className="h-5 w-5 text-gold flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
            <Button href="/auth/register" variant="primary" size="lg" icon>
              Apply for Scholarship
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { icon: Heart, value: "20+", label: "Scholarships Awarded" },
              { icon: Users, value: "100%", label: "Need-Based Review" },
              { icon: Award, value: "All", label: "Programs Eligible" },
              { icon: GraduationCap, value: "5 Days", label: "Review Time" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="glass rounded-2xl p-6 text-center"
              >
                <stat.icon className="mx-auto mb-3 h-8 w-8 text-gold" />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-white/50 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </SectionWrapper>

      {/* FAQ */}
      <SectionWrapper>
        <SectionHeading
          eyebrow="Common Questions"
          title="Frequently Asked Questions"
          description="Everything you need to know before applying."
        />

        <div className="mx-auto max-w-3xl space-y-4">
          {ADMISSIONS_FAQ.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="premium-card rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between p-6 text-left"
              >
                <span className="font-semibold text-navy pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-gold-dark flex-shrink-0 transition-transform duration-300 ${
                    openFaq === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 text-sm text-muted-text leading-relaxed border-t border-gray-100 pt-4">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      <CTABanner
        title="Ready to"
        highlight="Apply"
        description="Don't let another intake pass you by. Complete your application in just 5 minutes."
        ctaText="Register Now"
        ctaHref="/auth/register"
        secondaryCtaText="Contact Us"
        secondaryCtaHref="/contact"
      />
    </>
  );
}
