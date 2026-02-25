import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Code of Conduct — CommLead Academy",
  description: "CommLead Academy Code of Conduct for students, instructors, and all participants.",
};

export default function CodeOfConductPage() {
  return (
    <div className="min-h-screen bg-off-white">
      {/* Header */}
      <section className="bg-gradient-navy py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-gold text-[11px] font-bold uppercase tracking-[0.3em] mb-4">Community Standards</p>
          <h1 className="font-heading text-3xl lg:text-4xl text-white">Code of Conduct</h1>
          <p className="text-white/40 text-sm mt-3">Building a respectful, inclusive, and transformative learning environment</p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="prose prose-navy max-w-none space-y-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-navy mb-4">Our Commitment</h2>
            <p className="text-gray-600 leading-relaxed">
              COMMLEAD Academy is dedicated to providing a safe, inclusive, and supportive learning environment for all students, instructors, staff, and guests. We believe that effective communication starts with mutual respect, and we expect every member of our community to uphold the highest standards of conduct.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-navy mb-4">1. Respect &amp; Professionalism</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Treat all students, instructors, staff, and guests with respect and dignity.</li>
              <li>Listen actively when others are speaking. Every voice matters.</li>
              <li>Communicate constructively — offer feedback that builds up, not tears down.</li>
              <li>Respect differing opinions, backgrounds, cultures, and perspectives.</li>
              <li>Use professional and appropriate language at all times.</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-navy mb-4">2. Integrity &amp; Honesty</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Submit only original work. Plagiarism and academic dishonesty are strictly prohibited.</li>
              <li>Give proper credit when referencing others&apos; ideas, speeches, or written works.</li>
              <li>Be truthful in all communications with the Academy, including applications and assessments.</li>
              <li>Do not misrepresent your qualifications, credentials, or Academy affiliation.</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-navy mb-4">3. Inclusive Environment</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>COMMLEAD Academy does not tolerate discrimination based on race, gender, age, religion, ethnicity, disability, sexual orientation, or any other protected characteristic.</li>
              <li>Bullying, harassment, intimidation, or any form of abuse — verbal, physical, or online — is strictly prohibited.</li>
              <li>Create space for quieter voices. Encourage participation from all members.</li>
              <li>Report any incidents of discrimination or harassment to Academy leadership immediately.</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-navy mb-4">4. Commitment to Learning</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Come prepared to every session. Complete pre-work and assignments on time.</li>
              <li>Participate actively in discussions, exercises, and group activities.</li>
              <li>Be open to feedback — it is a gift that accelerates your growth.</li>
              <li>Support your fellow students in their learning journey.</li>
              <li>Keep your phone on silent during sessions unless otherwise instructed.</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-navy mb-4">5. Confidentiality</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Respect the privacy of fellow students. What is shared in class stays in class.</li>
              <li>Do not record sessions without explicit permission from the instructor and all participants.</li>
              <li>Do not share course materials, assessments, or proprietary content outside the Academy.</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-navy mb-4">6. Digital Conduct</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Apply the same standards of respect and professionalism in online sessions and communications.</li>
              <li>Keep your camera on during virtual sessions when possible — presence matters.</li>
              <li>Use Academy communication channels responsibly and appropriately.</li>
              <li>Do not post defamatory, offensive, or misleading content about the Academy or its community.</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-navy mb-4">7. Consequences of Violations</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              Violations of this Code of Conduct may result in:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li><strong>First offense:</strong> Verbal or written warning from Academy leadership.</li>
              <li><strong>Second offense:</strong> Mandatory meeting with the Academy Founder and written action plan.</li>
              <li><strong>Third offense or serious violations:</strong> Immediate dismissal from the program without refund.</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-3">
              Serious violations including harassment, violence, or threats may result in immediate dismissal without prior warning.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-navy mb-4">8. Reporting</h2>
            <p className="text-gray-600 leading-relaxed">
              If you witness or experience a violation of this Code of Conduct, please report it to COMMLEAD Academy leadership immediately via email at <strong>info@commleadacademy.com</strong> or in person to any instructor. All reports will be treated confidentially and investigated promptly.
            </p>
          </div>

          {/* Contact */}
          <div className="bg-navy rounded-2xl p-8 text-center">
            <p className="text-white/60 text-sm mb-2">Need to report a concern?</p>
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
