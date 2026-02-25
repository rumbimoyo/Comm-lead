"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Linkedin, Twitter, Mail } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { SectionWrapper, SectionHeading } from "@/components/ui/SectionWrapper";
import { CTABanner } from "@/components/ui/CTABanner";
import { Button } from "@/components/ui/Button";
import { createSupabaseBrowserClient } from "@/utils/supabase-browser";
import { FOUNDER } from "@/lib/constants";
import type { TeamMember } from "@/types/database";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const FALLBACK_TEAM: Partial<TeamMember>[] = [
  {
    id: "1",
    name: FOUNDER.name,
    role: FOUNDER.title,
    short_bio: FOUNDER.shortBio,
    is_founder: true,
    headshot_url: "/foundersimage.png",
    order_index: 1,
    is_active: true,
  },
];

export function TeamContent() {
  const [team, setTeam] = useState<Partial<TeamMember>[]>(FALLBACK_TEAM);

  useEffect(() => {
    async function fetchTeam() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data } = await supabase
          .from("team_members")
          .select("*")
          .order("order_index");
        if (data && data.length > 0) {
          const mapped = data
            .filter((m: Record<string, unknown>) => m.is_active !== false)
            .map((m: Record<string, unknown>) => ({
              ...m,
              short_bio: (m.bio || m.short_bio || "") as string,
              headshot_url: (m.image_url || m.headshot_url || "") as string,
              is_active: m.is_active !== false,
            } as Partial<TeamMember>));
          if (mapped.length > 0) setTeam(mapped);
        }
      } catch {
        // Use fallback
      }
    }
    fetchTeam();
  }, []);

  const members = team;

  return (
    <>
      {/* ═══ HERO ═══ */}
      <PageHero
        eyebrow="Our Team"
        title="Meet the People Behind"
        highlight="Your Transformation"
        description="Our team of expert instructors, coaches, and mentors are united by one mission — to unlock your communication and leadership potential."
        ctaText="Join Us"
        ctaHref="/auth/register"
        backgroundImage="/paneltalk.jpg"
        compact
      />

      {/* ═══ TEAM IMAGE STRIP ═══ */}
      <section className="py-6">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["/womensmiling.jpg", "/ladiesspeaking.png", "/twomenspeaking.jpg", "/panneldiscussion.png"].map((img, i) => (
              <motion.div
                key={img}
                {...fadeUp}
                transition={{ delay: i * 0.1 }}
                className="image-frame aspect-square shadow-lg"
              >
                <img src={img} alt="CommLead Academy" className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TEAM GRID ═══ */}
      <SectionWrapper id="team">
        <SectionHeading
          eyebrow="The Team"
          title={members.length > 0 ? "Our Expert Instructors & Staff" : "Growing Our Team"}
          description={
            members.length > 0
              ? "Each team member brings real-world experience and a passion for developing the next generation of leaders."
              : "We're building a world-class team of instructors, coaches, and mentors. Interested in joining us?"
          }
        />

        {members.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member, i) => (
              <motion.div
                key={member.id}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="premium-card group rounded-2xl overflow-hidden"
              >
                <div className="relative h-64 bg-gradient-to-br from-navy to-navy-light overflow-hidden">
                  {member.headshot_url ? (
                    <img src={member.headshot_url as string} alt={member.name || ""} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <div className="h-20 w-20 rounded-full bg-gold/10 border-2 border-gold/20 flex items-center justify-center">
                        <Users className="h-8 w-8 text-gold/40" />
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-navy/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    {[Linkedin, Twitter, Mail].map((Icon, idx) => (
                      <a key={idx} href="#" className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-gold/20 hover:text-gold transition-all" aria-label="Social">
                        <Icon className="h-4 w-4" />
                      </a>
                    ))}
                  </div>
                </div>
                <div className="p-6 text-center">
                  <h3 className="font-heading text-lg font-bold text-navy">{member.name}</h3>
                  <p className="text-sm text-gold-dark font-semibold mt-1">{member.role}</p>
                  <p className="text-sm text-muted-text leading-relaxed mt-3 font-light">{member.short_bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div {...fadeUp} className="mx-auto max-w-lg text-center py-12">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-off-white">
              <Users className="h-10 w-10 text-navy/20" />
            </div>
            <p className="text-muted-text text-lg font-light">
              Our team of expert instructors and mentors will be announced soon. Follow us for updates!
            </p>
            <div className="mt-8">
              <Button href="/contact" variant="outline" size="md">Get Notified</Button>
            </div>
          </motion.div>
        )}
      </SectionWrapper>

      {/* ═══ CTA ═══ */}
      <CTABanner
        title="Learn From the"
        highlight="Best"
        description="Our team is ready to guide your transformation. Join the next cohort today."
        ctaText="Register Now"
        ctaHref="/auth/register"
        secondaryCtaText="View Programs"
        secondaryCtaHref="/programs"
      />
    </>
  );
}
