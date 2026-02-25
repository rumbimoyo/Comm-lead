import type { Metadata } from "next";
import { EventsContent } from "./EventsContent";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Upcoming events, masterclasses, open days, and student showcases from CommLead Academy.",
};

export default function EventsPage() {
  return <EventsContent />;
}
