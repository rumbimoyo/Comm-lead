"use client";

import { motion } from "framer-motion";
import { SectionWrapper, SectionHeading } from "@/components/ui/SectionWrapper";
import {
  GraduationCap,
  Presentation,
  Handshake,
  Trophy,
  BookCheck,
  Sparkles,
} from "lucide-react";

const expectations = [
  {
    icon: GraduationCap,
    title: "First-Class Experience",
    description:
      "From enrollment to certification, every touchpoint is designed to feel premium, intentional, and world-class.",
  },
  {
    icon: Presentation,
    title: "Interactive Teaching",
    description:
      "Our instructors use real-world case studies, live presentations, and dynamic group exercises — not boring lectures.",
  },
  {
    icon: BookCheck,
    title: "Practical Exercises",
    description:
      "You'll practice through role-plays, mock presentations, debates, and real-client communication briefs.",
  },
  {
    icon: Handshake,
    title: "Dedicated Mentorship",
    description:
      "Every student is paired with a mentor who guides them personally through the program journey.",
  },
  {
    icon: Sparkles,
    title: "Powerful Networking",
    description:
      "Connect with fellow leaders, industry professionals, and alumni across Africa in our exclusive community.",
  },
  {
    icon: Trophy,
    title: "Total Transformation",
    description:
      "Walk in uncertain. Walk out commanding rooms, boardrooms, stages, and any conversation with confidence.",
  },
];

export function ExpectationsSection() {
  return (
    <SectionWrapper>
      <SectionHeading
        eyebrow="The Experience"
        title="What Students Can Expect"
        description="CommLead Academy isn't just a course — it's a transformation. Here's what your journey looks like."
      />

      <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center mb-16">
        {/* Panel Discussion Image – clean, no fake overlays */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative order-2 lg:order-1"
        >
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl shadow-xl">
            <img
              src="/panneldiscussion.png"
              alt="CommLead Academy Panel Discussion"
              className="h-full w-full object-cover"
            />
          </div>
          {/* Offset decorative frame */}
          <div className="absolute -bottom-4 -right-4 h-full w-full rounded-2xl bg-gold/10 -z-10" />
        </motion.div>

        {/* Expectations List */}
        <div className="order-1 lg:order-2">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-1">
            {expectations.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group flex gap-5"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gold/10 transition-colors group-hover:bg-navy group-hover:text-white">
                  <item.icon className="h-6 w-6 text-gold-dark group-hover:text-gold transition-colors" />
                </div>
                <div>
                  <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-navy mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-text">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
