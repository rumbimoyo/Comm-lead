import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Refund Policy — CommLead Academy",
  description: "CommLead Academy refund policy for programs, courses, and masterclasses.",
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-off-white">
      {/* Header */}
      <section className="bg-gradient-navy py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-gold text-[11px] font-bold uppercase tracking-[0.3em] mb-4">Legal</p>
          <h1 className="font-heading text-3xl lg:text-4xl text-white">Refund Policy</h1>
          <p className="text-white/40 text-sm mt-3">Last updated: January 2025</p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="prose prose-navy max-w-none space-y-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-navy mb-4">Overview</h2>
            <p className="text-gray-600 leading-relaxed">
              COMMLEAD Academy is committed to delivering exceptional value in every program. We understand that circumstances may change, and we have established a fair and transparent refund policy. Please read this policy carefully before making payment.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-navy mb-4">1. Full Refund Eligibility</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              You are eligible for a <strong>full refund</strong> (minus a 15% administrative fee) if:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Your refund request is made <strong>within 7 days of payment</strong>.</li>
              <li>You have <strong>not attended more than one (1) class</strong> session.</li>
              <li>You submit your request in writing via email to <strong>info@commleadacademy.com</strong>.</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-navy mb-4">2. Partial Refund</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              A <strong>50% refund</strong> (minus the 15% administrative fee) may be considered if:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>The request is made within <strong>14 days of payment</strong>.</li>
              <li>You have attended no more than <strong>two (2) class sessions</strong>.</li>
              <li>Documented extenuating circumstances are provided (medical emergency, relocation, etc.).</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-navy mb-4">3. No Refund</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              Refunds will <strong>not be issued</strong> in the following cases:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Requests made after 14 days of payment.</li>
              <li>Attendance of three (3) or more class sessions.</li>
              <li>Dismissal from the program for violation of the Code of Conduct.</li>
              <li>Failure to attend classes without prior notification (no-show).</li>
              <li>Scholarship recipients (scholarships are non-refundable).</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-navy mb-4">4. Program Cancellation by Academy</h2>
            <p className="text-gray-600 leading-relaxed">
              If COMMLEAD Academy cancels a program before it begins (e.g., due to insufficient enrollment), all enrolled students will receive a <strong>full 100% refund</strong> with no administrative fee deducted. Alternatively, students may choose to defer their enrollment to the next available cohort.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-navy mb-4">5. Transfer &amp; Deferral</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Students may <strong>defer their enrollment once</strong> to a future cohort at no additional cost, provided the request is made before the program begins.</li>
              <li>Transfers between programs may be accommodated on a case-by-case basis, subject to availability and any fee differences.</li>
              <li>Deferrals and transfers are not available after the program has started.</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-navy mb-4">6. Refund Processing</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Approved refunds will be processed within <strong>14 business days</strong> of approval.</li>
              <li>Refunds will be issued via the <strong>original payment method</strong> (EcoCash, InnBucks, or bank transfer).</li>
              <li>Processing fees charged by payment providers are non-refundable.</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-navy mb-4">7. How to Request a Refund</h2>
            <ol className="list-decimal pl-6 space-y-2 text-gray-600">
              <li>Send an email to <strong>info@commleadacademy.com</strong> with the subject line &ldquo;Refund Request — [Your Full Name]&rdquo;.</li>
              <li>Include your full name, program enrolled in, date of payment, payment reference, and reason for the request.</li>
              <li>Our team will review your request and respond within <strong>5 business days</strong>.</li>
            </ol>
          </div>

          {/* Contact */}
          <div className="bg-navy rounded-2xl p-8 text-center">
            <p className="text-white/60 text-sm mb-2">Need to discuss a refund?</p>
            <p className="text-white font-semibold">
              Email us at{" "}
              <a href="mailto:info@commleadacademy.com" className="text-gold hover:underline">info@commleadacademy.com</a>
              {" "}or WhatsApp{" "}
              <a href="https://wa.me/263773341947" className="text-gold hover:underline">+263 77 334 1947</a>
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-navy">
            ← Back to Home
          </Link>
        </div>
      </section>
    </div>
  );
}
