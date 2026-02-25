import type { Metadata } from "next";
import { ProgramsContent } from "./ProgramsContent";

export const metadata: Metadata = {
  title: "Programs",
  description:
    "Explore CommLead Academy's world-class programs in public speaking, executive communication, leadership, media skills, and more.",
};

export default function ProgramsPage() {
  return <ProgramsContent />;
}
