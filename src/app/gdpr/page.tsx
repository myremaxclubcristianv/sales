import React from 'react'
import Link from 'next/link'
import { PublicLayout } from '@/components/layout/public/PublicLayout'
import { SITE_CONFIG } from '@/lib/config/site'
import { Lock, ArrowLeft, AlertCircle } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GDPR Rights & Procedures | Drepturile Persoanelor Vizate',
  description: 'Practical guide and instructions for exercising your GDPR data protection rights: access, rectification, erasure, restriction, objection, and data portability.',
  alternates: {
    canonical: '/gdpr',
  },
}

export default function GdprRightsPage() {
  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        {/* Breadcrumb */}
        <div>
          <Link
            href="/legal"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-950 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Legal Hub</span>
          </Link>
        </div>

        {/* Title Header */}
        <div className="space-y-4 border-b border-slate-200 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-800 uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5 text-blue-600" />
            <span>EU Regulation 2016/679 · Chapter III</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-slate-950">
            GDPR Data Subject Rights &amp; Procedures
          </h1>
          <p className="text-sm font-serif italic text-slate-500">
            Ghidul și Procedurile pentru Exercitarea Drepturilor GDPR
          </p>
          <p className="text-xs text-slate-400 font-mono">
            Direct Data Protection Contact: {SITE_CONFIG.contact.publicEmail.address}
          </p>
        </div>

        {/* Introduction & Limitations Note */}
        <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-700 space-y-2">
          <div className="flex items-center gap-2 text-slate-950 font-bold">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Scope &amp; Circumstantial Application of Rights</span>
          </div>
          <p className="leading-relaxed font-light text-slate-600">
            Under European data protection law, data subject rights are fundamental but not absolute. The applicability and extent of each right depend directly on the legal basis upon which personal data is processed (e.g., legal statutory obligations vs. contractual performance vs. consent) and applicable statutory retention duties under Romanian legislation.
          </p>
        </div>

        {/* Detailed Rights Breakdown */}
        <div className="space-y-8 text-xs sm:text-sm text-slate-700">
          {/* Right 1: Access */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center">1</span>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-slate-950">
                Right of Access (Article 15 GDPR)
              </h2>
            </div>
            <p className="leading-relaxed">
              You have the right to obtain confirmation as to whether or not your personal data is being processed by the Controller, and where that is the case, access to the personal data and the specific processing parameters (purposes, categories, recipients, retention period, and source).
            </p>
            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600">
              <strong>How to request:</strong> Send an email to{' '}
              <a href={SITE_CONFIG.contact.publicEmail.mailto} className="text-blue-600 underline">
                {SITE_CONFIG.contact.publicEmail.address}
              </a>{' '}
              with the subject &quot;GDPR Data Access Request&quot;. We will provide an electronic copy of your records free of charge.
            </div>
          </div>

          {/* Right 2: Rectification */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center">2</span>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-slate-950">
                Right to Rectification (Article 16 GDPR)
              </h2>
            </div>
            <p className="leading-relaxed">
              You have the right to obtain without undue delay the rectification of inaccurate personal data concerning you, including the right to have incomplete personal data completed (such as updated contact numbers, changed address, or revised mandate parameters).
            </p>
            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600">
              <strong>How to request:</strong> Provide the updated details in writing via email. Corrections are implemented in the CRM within 48 hours.
            </div>
          </div>

          {/* Right 3: Erasure */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center">3</span>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-slate-950">
                Right to Erasure / &quot;Right to be Forgotten&quot; (Article 17 GDPR)
              </h2>
            </div>
            <p className="leading-relaxed">
              You have the right to request the permanent deletion of your personal data where the data is no longer necessary in relation to the original purposes, where you have withdrawn consent, or where you object to processing based on legitimate interest.
            </p>
            <p className="text-xs text-slate-500 italic">
              <strong>Important legal limitation:</strong> Erasure cannot be granted if continued processing is strictly required by statutory Romanian accounting, fiscal, or anti-money laundering (AML/KYC) compliance laws (Article 17(3)(b) GDPR).
            </p>
          </div>

          {/* Right 4: Restriction */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center">4</span>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-slate-950">
                Right to Restriction of Processing (Article 18 GDPR)
              </h2>
            </div>
            <p className="leading-relaxed">
              You have the right to request restriction of processing where you contest the accuracy of the data, where processing is unlawful but you oppose erasure, or where we no longer need the data but you require it for the establishment, exercise, or defense of legal claims.
            </p>
          </div>

          {/* Right 5: Data Portability */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center">5</span>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-slate-950">
                Right to Data Portability (Article 20 GDPR)
              </h2>
            </div>
            <p className="leading-relaxed">
              Where processing is carried out by automated means and based on your consent or on a contract, you have the right to receive your personal data in a structured, commonly used, and machine-readable format (e.g. JSON or CSV), and have the right to transmit that data to another controller.
            </p>
          </div>

          {/* Right 6: Right to Object */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center">6</span>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-slate-950">
                Right to Object &amp; Marketing Withdrawal (Article 21 &amp; Article 7(3) GDPR)
              </h2>
            </div>
            <p className="leading-relaxed">
              You have the absolute, unconditional right to object at any time to the processing of your personal data for direct marketing purposes. Furthermore, where processing is based on consent, you may withdraw your consent at any time with immediate effect.
            </p>
          </div>

          {/* Right 7: Automated Profiling */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center">7</span>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-slate-950">
                Automated Decision-Making &amp; Profiling (Article 22 GDPR)
              </h2>
            </div>
            <p className="leading-relaxed">
              Our buyer request matching algorithms perform mathematical relevance scoring (criteria matching) strictly as an advisory assistance tool. We do not make any legal or significant decisions based solely on automated processing without human advisor review.
            </p>
          </div>
        </div>

        {/* Operational Request Submission Box */}
        <div className="p-8 bg-slate-950 text-white rounded-3xl space-y-4">
          <h3 className="font-serif text-2xl font-bold">
            How to Submit a Data Protection Request
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
            All requests are processed without undue delay and at the latest within <strong>one month (30 calendar days)</strong> of receipt under Article 12(3) GDPR. In complex cases, this period may be extended by two further months, with prior notification explaining the delay reasons.
          </p>

          <div className="pt-2 text-xs space-y-2 text-slate-300">
            <p>
              <strong>Email:</strong>{' '}
              <a href={SITE_CONFIG.contact.publicEmail.mailto} className="text-blue-400 underline font-mono">
                {SITE_CONFIG.contact.publicEmail.address}
              </a>
            </p>
            <p>
              <strong>Identity Verification:</strong> To protect client confidentiality and prevent unauthorized disclosures, we may request reasonable proof of identity before releasing sensitive files.
            </p>
            <p>
              <strong>Fee:</strong> Requests are processed free of charge. Where requests are manifestly unfounded or excessive, we may charge a reasonable administrative fee or refuse to act.
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
