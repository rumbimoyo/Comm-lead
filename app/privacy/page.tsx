import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — CommLead Academy",
  description: "How CommLead Academy collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-off-white">
      {/* Header */}
      <section className="bg-gradient-navy py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-gold text-[11px] font-bold uppercase tracking-[0.3em] mb-4">Legal</p>
          <h1 className="font-heading text-3xl lg:text-4xl text-white">Privacy Policy</h1>
          <p className="text-white/40 text-sm mt-3">Last updated: January 2025</p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="prose prose-navy max-w-none space-y-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-navy mb-4">1. Information We Collect</h2>
            <p className="text-gray-600 leading-relaxed mb-3">We collect the following types of personal information:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li><strong>Personal Details:</strong> Full name, email address, phone number, and city/location.</li>
              <li><strong>Application Data:</strong> Class level preference, motivation statement, package selection, and scholarship requests.</li>
              <li><strong>Payment Information:</strong> Transaction references and payment confirmations (we do not store card numbers).</li>
              <li><strong>Academic Records:</strong> Attendance, assessment scores, and certification status.</li>
              <li><strong>Usage Data:</strong> How you interact with our website, including pages visited and time spent.</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-navy mb-4">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>To process and manage your application and enrollment.</li>
              <li>To deliver educational programs and communicate with you about your courses.</li>
              <li>To process payments and issue receipts.</li>
              <li>To send important updates about schedules, events, and Academy news.</li>
              <li>To evaluate scholarship applications.</li>
              <li>To improve our programs, website, and student experience.</li>
              <li>To comply with legal and regulatory requirements.</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-navy mb-4">3. Communication Channels</h2>
            <p className="text-gray-600 leading-relaxed">
              By providing your phone number, you consent to receiving communications from COMMLEAD Academy via WhatsApp, SMS, or phone calls. These communications may include application updates, payment reminders, class notifications, and Academy announcements. You may opt out of non-essential communications at any time by contacting us.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-navy mb-4">4. Data Sharing</h2>
            <p className="text-gray-600 leading-relaxed mb-3">We do not sell your personal information. We may share your data with:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li><strong>Service Providers:</strong> Hosting, payment processing, and communication platforms that help us operate.</li>
              <li><strong>Instructors:</strong> Names and relevant academic information for program delivery.</li>
              <li><strong>Legal Authorities:</strong> When required by law or to protect our rights.</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-navy mb-4">5. Data Security</h2>
            <p className="text-gray-600 leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encrypted data transmission, secure storage, and access controls. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-navy mb-4">6. Data Retention</h2>
            <p className="text-gray-600 leading-relaxed">
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, including maintaining academic records, complying with legal obligations, and resolving disputes. You may request deletion of your data by contacting us, subject to our legal retention requirements.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-navy mb-4">7. Your Rights</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li><strong>Access:</strong> You may request a copy of the personal information we hold about you.</li>
              <li><strong>Correction:</strong> You may request that we correct inaccurate or incomplete data.</li>
              <li><strong>Deletion:</strong> You may request deletion of your data, subject to legal requirements.</li>
              <li><strong>Opt-out:</strong> You may opt out of marketing communications at any time.</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-navy mb-4">8. Cookies &amp; Analytics</h2>
            <p className="text-gray-600 leading-relaxed">
              Our website may use cookies and similar technologies to enhance your browsing experience and collect usage statistics. You can manage cookie preferences through your browser settings. Essential cookies required for website functionality cannot be disabled.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-navy mb-4">9. Changes to This Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date. Continued use of our services after changes constitutes acceptance of the updated policy.
            </p>
          </div>

          {/* Contact */}
          <div className="bg-navy rounded-2xl p-8 text-center">
            <p className="text-white/60 text-sm mb-2">Questions about your privacy?</p>
            <p className="text-white font-semibold">
              Contact us at{" "}
              <a href="mailto:info@commleadacademy.com" className="text-gold hover:underline">info@commleadacademy.com</a>
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
