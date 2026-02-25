import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Attendance Policy — CommLead Academy",
  description: "CommLead Academy attendance requirements and expectations for all programs.",
};

export default function AttendancePolicyPage() {
  return (
    <div className="min-h-screen bg-off-white">
      {/* Header */}
      <section className="bg-gradient-navy py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-gold text-[11px] font-bold uppercase tracking-[0.3em] mb-4">Academy Policy</p>
          <h1 className="font-heading text-3xl lg:text-4xl text-white">Attendance Policy</h1>
          <p className="text-white/40 text-sm mt-3">Your presence is the foundation of your transformation</p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="prose prose-navy max-w-none space-y-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-navy mb-4">Why Attendance Matters</h2>
            <p className="text-gray-600 leading-relaxed">
              At COMMLEAD Academy, we believe that transformation happens through consistent practice, participation, and engagement. Our programs are designed as progressive learning journeys — each session builds on the previous one. Missing sessions significantly impacts your learning outcomes and the experience of your fellow students. Your presence matters — not just for you, but for the entire class.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-navy mb-4">1. Minimum Attendance Requirement</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Students must attend a minimum of <strong>80% of all scheduled sessions</strong> to be eligible for certification.</li>
              <li>For a 6-session program, this means attending at least 5 sessions.</li>
              <li>For an 8-session program, this means attending at least 7 sessions.</li>
              <li>For a 10-12 session program, this means attending at least 9 sessions.</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-navy mb-4">2. Punctuality</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Students are expected to arrive <strong>on time</strong> for every session.</li>
              <li>Arrival more than <strong>15 minutes</strong> after the scheduled start time will be recorded as a <strong>late arrival</strong>.</li>
              <li><strong>Three late arrivals</strong> will count as one absence.</li>
              <li>Leaving a session before it ends without prior approval will be treated as an absence.</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-navy mb-4">3. Excused Absences</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              If you must miss a session, please notify your instructor or Academy admin <strong>at least 24 hours in advance</strong>. The following are considered excused absences:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Medical emergencies (documentation may be required).</li>
              <li>Family emergencies.</li>
              <li>Work obligations that cannot be rescheduled (pre-approved by admin).</li>
              <li>Religious observances.</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-3">
              Excused absences still count toward your attendance record but will be considered when evaluating certification eligibility on a case-by-case basis.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-navy mb-4">4. Unexcused Absences</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Failure to attend without prior notification is an <strong>unexcused absence</strong>.</li>
              <li><strong>Two consecutive unexcused absences</strong> will trigger a check-in from Academy staff.</li>
              <li><strong>Three or more unexcused absences</strong> may result in loss of certification eligibility.</li>
              <li>Students with excessive unexcused absences may be withdrawn from the program. No refund will be issued in this case.</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-navy mb-4">5. Online/Virtual Sessions</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>The same attendance policies apply to online and virtual sessions.</li>
              <li>Students must have their <strong>cameras on</strong> during virtual sessions to be marked as present.</li>
              <li>Logging in without active participation (e.g., camera off, no engagement) may not count as attendance.</li>
              <li>Technical difficulties should be reported immediately to the instructor.</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-navy mb-4">6. Make-Up Sessions</h2>
            <p className="text-gray-600 leading-relaxed">
              COMMLEAD Academy may offer make-up sessions or alternative assignments for excused absences, at the sole discretion of the instructor. Make-up sessions are not guaranteed and depend on instructor availability and program structure. Students are responsible for catching up on missed material.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-navy mb-4">7. Impact on Certification</h2>
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-5 mb-4">
              <p className="text-amber-800 font-semibold text-sm">
                ⚠️ Students who do not meet the 80% attendance requirement will not receive a certificate of completion, regardless of assessment performance.
              </p>
            </div>
            <p className="text-gray-600 leading-relaxed">
              In exceptional circumstances (e.g., medical emergencies with documentation), the Academy may grant certification on a case-by-case basis with completion of all assessments and make-up work.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-navy mb-4">8. Weekend Intensive &amp; Bootcamp Programs</h2>
            <p className="text-gray-600 leading-relaxed">
              For weekend intensive and bootcamp programs, <strong>100% attendance is required</strong> for certification due to the condensed nature of these programs. Missing any portion of an intensive program will result in loss of certification eligibility. Students may request to join a future intensive cohort at no additional cost (one-time deferral only).
            </p>
          </div>

          {/* Contact */}
          <div className="bg-navy rounded-2xl p-8 text-center">
            <p className="text-white/60 text-sm mb-2">Questions about attendance?</p>
            <p className="text-white font-semibold">
              Contact us at{" "}
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
