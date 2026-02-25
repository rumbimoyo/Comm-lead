import type { Metadata } from "next";
import { AboutContent } from "./AboutContent";

export const metadata: Metadata = {
  title: "Our Story | COMMLEAD Academy",
  description: "Learn about the mission, vision, and the transformative story behind COMMLEAD Academy — Africa's premier institution for communication and leadership.",
};

export default function AboutPage() {
  return <AboutContent />;
}