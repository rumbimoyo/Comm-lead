import type { Metadata } from "next";
import { TeamContent } from "./TeamContent";

export const metadata: Metadata = {
  title: "Our Team",
  description:
    "Meet the passionate instructors, mentors, and leadership behind CommLead Academy.",
};

export default function TeamPage() {
  return <TeamContent />;
}
