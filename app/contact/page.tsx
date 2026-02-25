import type { Metadata } from "next";
import { ContactContent } from "./ContactContent";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with CommLead Academy. Send us a message, call us, or visit our campus. We'd love to hear from you.",
};

export default function ContactPage() {
  return <ContactContent />;
}
