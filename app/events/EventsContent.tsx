"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Clock,
  MapPin,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { SectionWrapper, SectionHeading } from "@/components/ui/SectionWrapper";
import { Button } from "@/components/ui/Button";
import { CTABanner } from "@/components/ui/CTABanner";
import { createSupabaseBrowserClient } from "@/utils/supabase-browser";
import { FALLBACK_EVENTS } from "@/lib/constants";
import type { Event } from "@/types/database";

export function EventsContent() {
  const [events, setEvents] =
    useState<Partial<Event>[]>([...FALLBACK_EVENTS]);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data } = await supabase
          .from("events")
          .select("*")
          .eq("is_active", true)
          .order("date");
        if (data && data.length > 0) setEvents(data);
      } catch {
        // Use fallback
      }
    }
    fetchEvents();
  }, []);

  const upcoming = events.filter(
    (e) => e.date && new Date(e.date) >= new Date()
  );
  const past = events.filter(
    (e) => e.date && new Date(e.date) < new Date()
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <PageHero
        eyebrow="Events & Happenings"
        title="Join Our"
        highlight="Events"
        description="From open days and masterclasses to student showcases — discover upcoming opportunities to experience CommLead Academy."
        ctaText="Register Now"
        ctaHref="/auth/register"
        backgroundImage="/panneldiscussion.png"
        compact
      />

      {/* Upcoming Events */}
      <SectionWrapper>
        <SectionHeading
          eyebrow="What's Coming Up"
          title="Upcoming Events"
          description="Don't miss these opportunities to learn, connect, and grow."
        />

        {upcoming.length > 0 ? (
          <div className="space-y-8">
            {upcoming.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="premium-card rounded-2xl overflow-hidden"
              >
                <div className="grid md:grid-cols-[280px_1fr] lg:grid-cols-[350px_1fr]">
                  {/* Image / Date */}
                  <div className="relative bg-gradient-to-br from-navy to-navy-light flex items-center justify-center p-10">
                    <div className="text-center">
                      <CalendarDays className="mx-auto h-12 w-12 text-gold/60 mb-3" />
                      {event.date && (
                        <div className="text-white">
                          <div className="text-3xl font-bold font-[family-name:var(--font-heading)]">
                            {new Date(event.date).getDate()}
                          </div>
                          <div className="text-sm text-white/60 uppercase tracking-wider">
                            {new Date(event.date).toLocaleDateString("en-US", {
                              month: "long",
                              year: "numeric",
                            })}
                          </div>
                        </div>
                      )}
                      <p className="mt-3 text-xs text-white/30">📸 Event image</p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8 lg:p-10 flex flex-col justify-center">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                        <Sparkles className="h-3 w-3" />
                        Upcoming
                      </span>
                    </div>

                    <h3 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-navy mb-3">
                      {event.title}
                    </h3>
                    <p className="text-muted-text leading-relaxed mb-6">
                      {event.description}
                    </p>

                    <div className="flex flex-wrap gap-6 text-sm text-muted-text mb-6">
                      {event.date && (
                        <span className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-gold-dark" />
                          {formatDate(event.date)}
                        </span>
                      )}
                      {event.time && (
                        <span className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gold-dark" />
                          {event.time}
                        </span>
                      )}
                      {event.location && (
                        <span className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gold-dark" />
                          {event.location}
                        </span>
                      )}
                    </div>

                    <div>
                      <Button href="/contact" variant="secondary" size="md">
                        RSVP / Learn More
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <CalendarDays className="mx-auto h-12 w-12 text-muted-text/30 mb-4" />
            <p className="text-muted-text">
              No upcoming events at the moment. Check back soon!
            </p>
          </div>
        )}
      </SectionWrapper>

      {/* Past Events */}
      {past.length > 0 && (
        <SectionWrapper className="bg-off-white">
          <SectionHeading
            eyebrow="Past Events"
            title="Event Highlights"
            description="A look back at some of our most impactful events."
          />

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {past.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="premium-card rounded-2xl overflow-hidden opacity-80"
              >
                <div className="h-40 bg-gradient-to-br from-navy/60 to-navy-light/60 flex items-center justify-center">
                  <CalendarDays className="h-8 w-8 text-white/40" />
                </div>
                <div className="p-6">
                  <span className="text-xs text-muted-text">
                    {event.date && formatDate(event.date)}
                  </span>
                  <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-navy mt-2 mb-2">
                    {event.title}
                  </h3>
                  <p className="text-sm text-muted-text line-clamp-2">
                    {event.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </SectionWrapper>
      )}

      <CTABanner
        title="Don't Miss Our Next"
        highlight="Event"
        description="Stay connected with CommLead Academy. Follow us on social media or register to receive event notifications."
        ctaText="Register Now"
        ctaHref="/auth/register"
        secondaryCtaText="Contact Us"
        secondaryCtaHref="/contact"
      />
    </>
  );
}
