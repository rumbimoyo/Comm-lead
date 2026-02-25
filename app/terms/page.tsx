import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions — CommLead Academy",
  description: "Terms and Conditions for CommLead Academy programs and services.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-off-white">
      {/* Header */}
      <section className="bg-gradient-navy py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-gold text-[11px] font-bold uppercase tracking-[0.3em] mb-4">Legal</p>
          <h1 className="font-heading text-3xl lg:text-4xl text-white">Terms &amp; Conditions</h1>
          <p className="text-white/40 text-sm mt-3">Last updated: January 2025</p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="prose prose-navy max-w-none space-y-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-navy mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              By enrolling in any COMMLEAD Academy program, accessing our website, or using our services, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services. These terms constitute a legally binding agreement between you and COMMLEAD Academy.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-navy mb-4">2. Enrollment &amp; Admission</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Enrollment is subject to availability and at the sole discretion of COMMLEAD Academy.</li>
              <li>Applications are reviewed on a rolling basis. Submission does not guarantee admission.</li>
              <li>Admitted students will receive confirmation via WhatsApp or email with payment instructions.</li>
              <li>Your enrollment is only confirmed upon receipt of full payment or an approved instalment plan.</li>
              <li>COMMLEAD Academy reserves the right to decline any application without providing a reason.</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-navy mb-4">3. Payment Terms</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>All fees are quoted in United States Dollars (USD) unless otherwise stated.</li>
              <li>Payment must be made via the accepted methods: EcoCash, InnBucks, or bank transfer.</li>
              <li>Full payment is due before the start of the program unless an instalment plan is agreed upon.</li>
              <li>Late payments may result in restricted access to program materials and sessions.</li>
              <li>COMMLEAD Academy reserves the right to adjust fees for future cohorts without notice.</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-navy mb-4">4. Program Delivery</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Programs are delivered in-person, online, or in hybrid format as specified.</li>
              <li>COMMLEAD Academy reserves the right to change instructors, schedules, or delivery methods if necessary.</li>
              <li>Minimum enrollment numbers may apply. If a program does not meet minimum enrollment, it may be postponed or cancelled with a full refund issued.</li>
              <li>Recorded sessions may be made available at the discretion of the Academy.</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-navy mb-4">5. Intellectual Property</h2>
            <p className="text-gray-600 leading-relaxed">
              All course materials, content, recordings, and resources provided by COMMLEAD Academy are the intellectual property of the Academy. Students may not reproduce, distribute, share, or sell any materials without express written permission. Violation may result in immediate dismissal from the program without refund.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-navy mb-4">6. Student Conduct</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              Students are expected to conduct themselves professionally and respectfully at all times. COMMLEAD Academy reserves the right to dismiss any student who:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Engages in disruptive, abusive, or disrespectful behavior</li>
              <li>Violates the Code of Conduct</li>
              <li>Fails to meet attendance requirements</li>
              <li>Engages in academic dishonesty or plagiarism</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-navy mb-4">7. Certificates</h2>
            <p className="text-gray-600 leading-relaxed">
              Certificates are awarded only to students who complete the full program requirements, including attendance and assessment criteria. Certificates remain the property of COMMLEAD Academy and may be revoked in cases of fraud or misrepresentation.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-navy mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed">
              COMMLEAD Academy provides educational services in good faith but makes no guarantees regarding specific outcomes, employment, or career advancement. The Academy shall not be liable for any indirect, incidental, or consequential damages arising from participation in our programs.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-navy mb-4">9. Amendments</h2>
            <p className="text-gray-600 leading-relaxed">
              COMMLEAD Academy reserves the right to update these Terms and Conditions at any time. Students will be notified of significant changes via email or WhatsApp. Continued enrollment after changes constitutes acceptance of the updated terms.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-navy mb-4">10. Governing Law</h2>
            <p className="text-gray-600 leading-relaxed">
              These Terms and Conditions are governed by and construed in accordance with the laws of the Republic of Zimbabwe. Any disputes shall be resolved through negotiation and, if necessary, through the courts of Zimbabwe.
            </p>
          </div>

          {/* Contact */}
          <div className="bg-navy rounded-2xl p-8 text-center">
            <p className="text-white/60 text-sm mb-2">Questions about our terms?</p>
            <p className="text-white font-semibold">
              Contact us at{" "}
              <a href="mailto:info@commleadacademy.com" className="text-gold hover:underline">info@commleadacademy.com</a>
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-12 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-navy">
            ← Back to Home
          </Link>
        </div>
      </section>
    </div>
  );
}
