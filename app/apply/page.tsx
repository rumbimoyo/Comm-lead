import { Metadata } from "next";
import { ApplyForm } from "./ApplyForm";

export const metadata: Metadata = {
  title: "Apply — Communication Masterclass | CommLead Academy",
  description: "Apply for the COMMLEAD Academy Communication Masterclass Cohort 1. Classes for beginners, intermediate, and advanced levels.",
};

export default function ApplyPage() {
  return <ApplyForm />;
}
