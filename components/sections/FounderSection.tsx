"use client";

import { motion } from "framer-motion";
import { SectionWrapper, SectionHeading } from "@/components/ui/SectionWrapper";
import { FOUNDER } from "@/lib/constants";

export function FounderSection() {
  return (
    <SectionWrapper className="bg-gradient-navy" id="founder">
      <SectionHeading
        eyebrow="Meet the Founder"
        title="Founder's Story"
        light
      />

      <div className="grid items-start gap-12 lg:grid-cols-5 lg:gap-16">
        {/* Founder Image – takes 2 of 5 columns */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative lg:col-span-2"
        >
          <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
            <img
              src="/foundersimage.png"
              alt={`${FOUNDER.name} – ${FOUNDER.title}`}
              className="w-full h-auto object-cover"
            />
          </div>
          <div className="mt-6 text-center">
            <h3 className="text-xl font-bold text-white">{FOUNDER.name}</h3>
            <p className="text-sm text-gold">{FOUNDER.title}</p>
          </div>
        </motion.div>

        {/* Founder Story – EXACT text, word for word – takes 3 of 5 columns */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="lg:col-span-3 space-y-6 text-white/75 leading-relaxed sm:text-lg"
        >
          <p>
            I was born and raised in a low-income family in a small village,
            where the prospect of achieving anything beyond the ordinary seemed
            impossible. I remember dropping out of school, believing that my
            life would be limited to looking after my father&apos;s cows,
            marrying young, and remaining &ldquo;just someone from the
            village.&rdquo; Opportunities felt distant, and my dreams even more
            so.
          </p>

          <p>
            But everything changed the day I pitched an idea to a
            stranger&mdash;someone who believed in me and supported my
            education. That moment unlocked a path I had never imagined. I went
            on to become one of the top A-Level students in my country,
            achieving straight As. My teachers encouraged me to step into public
            speaking and debate, ultimately leading me to represent my peers in
            the Zimbabwe Junior Parliament. Later, programs like the United
            States Achievers Program taught me the power of storytelling, how to
            share my journey, and open doors to opportunities I never thought
            possible. These experiences helped me win some of the world&apos;s
            most prestigious scholarships, including the Mandela Centennial
            Scholarship and the Mandela Rhodes Scholarship, at leading
            institutions such as the African Leadership University and the
            University of Cape Town.
          </p>

          <p>
            Today, I am a graduate, a scholar, a leader, an author, and a
            mentor to many aspiring speakers and writers. What changed my life
            was not talent alone, or even hard work&mdash;it was the power of my
            voice, the ability to communicate confidently and authentically. I
            was never poor in spirit or potential&mdash;I was simply
            inarticulate, unable to express the best of what I had to offer.
          </p>

          <p>
            COMMLEAD Academy exists because I do not want anyone else to suffer
            as I did&mdash;not because of a lack of ability, intelligence, or
            dreams, but because they cannot communicate them. This school is my
            life&apos;s mission: to empower every student to speak, write, and
            lead with confidence, so that no talent is wasted, no opportunity is
            missed, and no voice goes unheard.
          </p>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
