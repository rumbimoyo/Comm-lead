import type { Metadata } from "next";
import { AdmissionsContent } from "./AdmissionsContent";

export const metadata: Metadata = {
  title: "Admissions",
  description:
    "Learn how to apply to CommLead Academy. Discover our application process, fees, payment options, scholarship opportunities, and FAQs.",
};

export default function AdmissionsPage() {
  return <AdmissionsContent />;
}
