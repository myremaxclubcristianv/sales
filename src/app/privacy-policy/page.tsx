import React from 'react'
import Link from 'next/link'
import { PublicLayout } from '@/components/layout/public/PublicLayout'
import { SITE_CONFIG } from '@/lib/config/site'
import { Shield, ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Politică de Confidențialitate',
  description: 'Comprehensive disclosure of personal data processing, legal bases under EU GDPR and Romanian Law, retention periods, data subject rights, and security safeguards.',
  alternates: {
    canonical: '/privacy-policy',
  },
}

export default function PrivacyPolicyPage() {
  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        {/* Navigation Breadcrumb */}
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
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Regulation (EU) 2016/679 (GDPR) Compliance</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-slate-950">
            Privacy Policy
          </h1>
          <p className="text-sm font-serif italic text-slate-500">
            Politică de Confidențialitate și Prelucrare a Datelor cu Caracter Personal
          </p>
          <p className="text-xs text-slate-400 font-mono">
            Last Updated: September 13, 2026 · Effective Immediately
          </p>
        </div>

        {/* Document Content */}
        <div className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed text-slate-700 space-y-8">
          {/* Section 1: Data Controller */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-950 border-b border-slate-100 pb-2">
              1. Identity of the Data Controller
            </h2>
            <p>
              This Privacy Policy applies to all personal data collected and processed through the website{' '}
              <strong className="text-slate-950">https://sales.cristianvaduva.com</strong> and associated private advisory operations. The Data Controller responsible for the processing of your personal data under Article 4(7) of the General Data Protection Regulation (EU) 2016/679 (&quot;GDPR&quot;) and Romanian Law No. 190/2018 is:
            </p>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 not-prose font-sans">
              <p><strong className="text-slate-900 font-semibold">Operator:</strong> {SITE_CONFIG.name}</p>
              <p><strong className="text-slate-900 font-semibold">Professional Role:</strong> {SITE_CONFIG.positioning.role}</p>
              <p><strong className="text-slate-900 font-semibold">Location / Jurisdiction:</strong> {SITE_CONFIG.location.full}</p>
              <p><strong className="text-slate-900 font-semibold">Privacy Inquiries Email:</strong>{' '}
                <a href={SITE_CONFIG.contact.publicEmail.mailto} className="text-blue-600 underline hover:text-blue-800">
                  {SITE_CONFIG.contact.publicEmail.address}
                </a>
              </p>
              <p><strong className="text-slate-900 font-semibold">Direct Email:</strong>{' '}
                <a href={SITE_CONFIG.contact.primaryEmail.mailto} className="text-blue-600 underline hover:text-blue-800">
                  {SITE_CONFIG.contact.primaryEmail.address}
                </a>
              </p>
              <p><strong className="text-slate-900 font-semibold">Primary Contact Phone:</strong> {SITE_CONFIG.contact.primaryPhone.display}</p>
            </div>
            <p className="text-slate-500 text-xs">
              Given the nature and scale of the private practice, a formal Data Protection Officer (DPO) is not mandated under Article 37 GDPR. All privacy matters and data subject requests are handled directly by the Controller.
            </p>
          </section>

          {/* Section 2: Categories of Data */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-950 border-b border-slate-100 pb-2">
              2. Categories of Personal Data Collected
            </h2>
            <p>
              We collect and process only the minimum necessary personal data required to fulfill advisory requests, real estate mandates, insurance coverage structuring, and mortgage credit consulting:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-slate-900">Identification &amp; Contact Data:</strong> Full name, email address, telephone/WhatsApp number, legal entity representation details.
              </li>
              <li>
                <strong className="text-slate-900">Mandate &amp; Search Specifications:</strong> Target property parameters, surface requirements, budget limits, location preferences, inquiry type (buyer representation, property sale, private consultation).
              </li>
              <li>
                <strong className="text-slate-900">Credit &amp; Mortgage Parameters (Optional / Mandate-Specific):</strong> Target loan amount, financing status, debt-to-income (DTI) metrics, bank preferences (provided only when initiating a formal credit structuring engagement).
              </li>
              <li>
                <strong className="text-slate-900">Insurance Risk Engineering Data (Optional / Mandate-Specific):</strong> Insured asset specifications, building characteristics, existing policy expiration dates (provided only when requesting insurance policy reviews).
              </li>
              <li>
                <strong className="text-slate-900">Technical &amp; Security Metadata:</strong> IP address (utilized strictly for rate limiting, DDoS mitigation, and spam bot prevention), browser user-agent header, request timestamps, and authentication session tokens (for authorized staff access).
              </li>
            </ul>
          </section>

          {/* Section 3: Purposes & Legal Bases */}
          <section className="space-y-4">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-950 border-b border-slate-100 pb-2">
              3. Purposes and Legal Bases for Processing
            </h2>
            <p>
              In accordance with Article 6(1) of the GDPR, personal data is processed under the following lawful bases:
            </p>

            <div className="space-y-3 not-prose font-sans text-xs">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">A. Inquiry Response &amp; Pre-contractual Mandate Handling</span>
                <p className="text-slate-600">
                  <strong>Purpose:</strong> Processing inbound inquiries from the contact form, property viewing requests, and buyer search matching.
                </p>
                <p className="text-slate-600">
                  <strong>Legal Basis:</strong> Article 6(1)(b) GDPR — processing is necessary for the performance of a contract or to take steps at the request of the data subject prior to entering into a contract.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">B. Advisory Execution &amp; Transaction Management</span>
                <p className="text-slate-600">
                  <strong>Purpose:</strong> Coordinating property acquisitions, viewing schedules, formal offer negotiations, insurance underwriting, and mortgage file structuring.
                </p>
                <p className="text-slate-600">
                  <strong>Legal Basis:</strong> Article 6(1)(b) GDPR (Contractual execution) and Article 6(1)(f) GDPR (Legitimate interest in ensuring professional transaction integrity).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">C. Platform Security &amp; Abuse Prevention</span>
                <p className="text-slate-600">
                  <strong>Purpose:</strong> Preventing automated bot spam (honeypot validation), IP-based rate limiting (10 requests/minute), and unauthorized server probing.
                </p>
                <p className="text-slate-600">
                  <strong>Legal Basis:</strong> Article 6(1)(f) GDPR — legitimate interest in safeguarding website availability and server infrastructure.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">D. Legal, Tax &amp; Regulatory Compliance</span>
                <p className="text-slate-600">
                  <strong>Purpose:</strong> Fulfilling statutory accounting, cadastral recording, anti-money laundering (AML/KYC) obligations, and responding to judicial authorities.
                </p>
                <p className="text-slate-600">
                  <strong>Legal Basis:</strong> Article 6(1)(c) GDPR — compliance with legal obligations under applicable Romanian and European laws.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">E. Optional Direct Marketing &amp; Market Intelligence</span>
                <p className="text-slate-600">
                  <strong>Purpose:</strong> Transmitting off-market property releases, investment briefings, or newsletter bulletins.
                </p>
                <p className="text-slate-600">
                  <strong>Legal Basis:</strong> Article 6(1)(a) GDPR — explicit, freely given prior consent, which may be withdrawn at any time without affecting prior processing legality.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Data Recipients */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-950 border-b border-slate-100 pb-2">
              4. Data Recipients &amp; Processors
            </h2>
            <p>
              We do not sell, rent, or trade personal data. Data is shared exclusively with authorized third-party service providers (processors) under strict Article 28 GDPR Data Processing Agreements, or institutional co-controllers strictly necessary for transaction completion:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-slate-900">Hosting &amp; Edge Infrastructure:</strong> Vercel Inc. (hosting and edge compute, operating under Standard Contractual Clauses and EU-US Data Privacy Framework).
              </li>
              <li>
                <strong className="text-slate-900">Database &amp; Storage Vaults:</strong> Supabase Inc. (PostgreSQL database architecture with Row-Level Security, AES-256 encrypted at-rest storage in EU regions).
              </li>
              <li>
                <strong className="text-slate-900">Transaction Partners (Upon Explicit Mandate Only):</strong> Licensed Public Notaries (Notari Publici), Romanian banking institutions (for credit brokerage applications), and registered insurance underwriting partners (for policy issuance).
              </li>
            </ul>
          </section>

          {/* Section 5: Retention Periods */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-950 border-b border-slate-100 pb-2">
              5. Retention Periods &amp; Criteria
            </h2>
            <p>
              Personal data is retained only for the duration strictly necessary to fulfill the purposes for which it was collected:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-slate-900">General Inquiries &amp; Non-Contractual Leads:</strong> Retained for a maximum of 24 months from the last active communication, after which records are permanently deleted or anonymized.
              </li>
              <li>
                <strong className="text-slate-900">Contractual &amp; Completed Transactions:</strong> Retained for 5 to 10 years in compliance with statutory Romanian fiscal, accounting, and cadastral statutory retention obligations.
              </li>
              <li>
                <strong className="text-slate-900">Security Logs &amp; IP Rate Limits:</strong> Held in transient server memory / rolling cache for a maximum of 30 days.
              </li>
              <li>
                <strong className="text-slate-900">Marketing Consents:</strong> Retained until consent is revoked by the data subject.
              </li>
            </ul>
          </section>

          {/* Section 6: Data Subject Rights */}
          <section className="space-y-4">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-950 border-b border-slate-100 pb-2">
              6. Your Rights Under the GDPR
            </h2>
            <p>
              As a data subject under Chapter III of the GDPR, you are entitled to the following rights:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 not-prose font-sans text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 block">Right of Access (Art. 15)</span>
                <p className="text-slate-600 mt-1">Request confirmation of processing and obtain a copy of your personal data.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 block">Right to Rectification (Art. 16)</span>
                <p className="text-slate-600 mt-1">Request correction of inaccurate or incomplete personal information.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 block">Right to Erasure (Art. 17)</span>
                <p className="text-slate-600 mt-1">Request deletion of data where legal retention grounds no longer apply (&quot;Right to be Forgotten&quot;).</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 block">Right to Restriction (Art. 18)</span>
                <p className="text-slate-600 mt-1">Request suspension of processing while data accuracy or objection claims are verified.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 block">Right to Portability (Art. 20)</span>
                <p className="text-slate-600 mt-1">Receive your personal data in a structured, commonly used, machine-readable format.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 block">Right to Object (Art. 21)</span>
                <p className="text-slate-600 mt-1">Object to processing based on legitimate interests or direct marketing at any time.</p>
              </div>
            </div>
            <p>
              For detailed instructions on exercising each right, review our dedicated{' '}
              <Link href="/gdpr" className="text-blue-600 underline font-semibold hover:text-blue-800">
                GDPR Rights Guide
              </Link>
              .
            </p>
          </section>

          {/* Section 7: Security Measures */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-950 border-b border-slate-100 pb-2">
              7. Technical &amp; Organizational Security Safeguards
            </h2>
            <p>
              Under Article 32 GDPR, we maintain robust security measures to protect personal data against accidental loss, destruction, alteration, or unauthorized disclosure:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>End-to-end transport encryption via TLS 1.3 / HTTPS with Strict Transport Security (HSTS).</li>
              <li>Granular Row-Level Security (RLS) policies isolating private client records from public queries.</li>
              <li>Strict private document vault access controls with time-limited signed download URLs.</li>
              <li>Continuous bot detection, honeypot filters, and automated rate limiting on public intake endpoints.</li>
            </ul>
          </section>

          {/* Section 8: How to Exercise Rights & Complaints */}
          <section className="space-y-4">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-950 border-b border-slate-100 pb-2">
              8. How to Submit Privacy Requests &amp; Complaints
            </h2>
            <p>
              To exercise any of your data protection rights, transmit a written request to the Controller via email:
            </p>
            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-2 not-prose font-sans text-xs">
              <p className="font-bold text-sm text-white">Privacy Request Desk:</p>
              <p className="text-slate-300">
                Email:{' '}
                <a href={SITE_CONFIG.contact.publicEmail.mailto} className="text-blue-400 underline font-mono">
                  {SITE_CONFIG.contact.publicEmail.address}
                </a>
              </p>
              <p className="text-slate-400 text-[11px]">
                Requests are processed free of charge within 30 calendar days as stipulated by Article 12(3) GDPR.
              </p>
            </div>
            <p>
              If you consider that the processing of your personal data infringes the GDPR, you have the right to lodge a complaint with the competent supervisory authority:
            </p>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs not-prose font-sans space-y-1">
              <strong className="text-slate-900 block font-semibold">Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP)</strong>
              <p className="text-slate-600">B-dul G-ral. Gheorghe Magheru 28-30, Sector 1, cod poștal 010336, București, România</p>
              <p className="text-slate-600">Email: anspdcp@dataprotection.ro | Website:{' '}
                <a href="https://www.dataprotection.ro" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  www.dataprotection.ro
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </PublicLayout>
  )
}
