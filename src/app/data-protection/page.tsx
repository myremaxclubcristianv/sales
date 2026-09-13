import React from 'react'
import Link from 'next/link'
import { PublicLayout } from '@/components/layout/public/PublicLayout'
import { SITE_CONFIG } from '@/lib/config/site'
import { FileText, ArrowLeft, Building2, Shield, Landmark, Database } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Data Protection Notice | Notă de Informare Prelucrare Date',
  description: 'Operational data protection notice detailing personal data processing workflows across prime real estate, insurance structuring, and mortgage advisory operations.',
  alternates: {
    canonical: '/data-protection',
  },
}

export default function DataProtectionNoticePage() {
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
            <FileText className="w-3.5 h-3.5 text-purple-600" />
            <span>Operational Data Governance</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-slate-950">
            Data Protection Notice
          </h1>
          <p className="text-sm font-serif italic text-slate-500">
            Notă de Informare privind Prelucrarea Datelor în Cadrul Operațiunilor de Consultanță
          </p>
          <p className="text-xs text-slate-400 font-mono">
            Platform Operator: {SITE_CONFIG.name} · {SITE_CONFIG.location.full}
          </p>
        </div>

        {/* Operational Modules Breakdown */}
        <div className="space-y-8 text-xs sm:text-sm text-slate-700">
          {/* Section 1: Real Estate Module */}
          <div className="p-8 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <h2 className="font-serif text-xl font-bold text-slate-950">
                1. Prime Real Estate Brokerage &amp; Mandate Workflows
              </h2>
            </div>
            <p className="leading-relaxed font-light">
              When engaging our advisory practice for property acquisitions, off-market placements, or listing mandates, personal data is processed through our secure CRM system under strict fiduciary protocols:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>
                <strong>Buyer Mandate Data:</strong> Search criteria (budget ceilings, target neighborhoods, surface requirements) are stored confidentially. Public listings on the Buyer Requests Board display criteria in an anonymized format without revealing individual or family office identities.
              </li>
              <li>
                <strong>Seller Representation &amp; Cadastral Records:</strong> Property title deeds, land registry extracts (extrase de carte funciară), and architectural floorplans are maintained in encrypted private document vaults, accessible only to authorized advisors with a direct transaction need.
              </li>
              <li>
                <strong>Viewings &amp; Negotiations:</strong> Viewing schedules, attendee identity confirmations, and formal written offer records are logged with immutable timestamps to guarantee transaction transparency and legal enforceability.
              </li>
            </ul>
          </div>

          {/* Section 2: Insurance Risk Engineering */}
          <div className="p-8 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <h2 className="font-serif text-xl font-bold text-slate-950">
                2. Insurance &amp; Asset Protection Workflows
              </h2>
            </div>
            <p className="leading-relaxed font-light">
              For insurance portfolio structuring and asset protection advisory:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>
                <strong>Risk Evaluation Parameters:</strong> Asset valuation estimates, building construction specifications, and liability limits are analyzed to identify optimal coverage options from top-tier insurance underwriters.
              </li>
              <li>
                <strong>Proactive 30-Day Renewal Monitoring:</strong> Expiration dates of mandatory (PAD) and optional property policies are tracked to prevent lapses in coverage. Clients receive direct transactional renewal notices prior to expiration dates.
              </li>
              <li>
                <strong>Data Minimization:</strong> Health or sensitive personal factors are never collected through open public website forms. Formal insurance underwriting questionnaires are executed through direct, encrypted channels.
              </li>
            </ul>
          </div>

          {/* Section 3: Mortgage & Credit Structuring */}
          <div className="p-8 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Landmark className="w-5 h-5" />
              </div>
              <h2 className="font-serif text-xl font-bold text-slate-950">
                3. Mortgage &amp; Private Credit Structuring Workflows
              </h2>
            </div>
            <p className="leading-relaxed font-light">
              For structured real estate financing and mortgage consulting:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>
                <strong>Financial Capacity Structuring:</strong> Income brackets, loan-to-value (LTV) limits, and debt-to-income (DTI) metrics are processed solely to formulate viable financing structures.
              </li>
              <li>
                <strong>Bank File Transmission:</strong> Credit dossier documents are submitted to Romanian banking partners strictly upon explicit, written client mandate and under formal institutional confidentiality agreements.
              </li>
              <li>
                <strong>Security:</strong> Credit case documentation is strictly isolated in private CRM document folders with restricted access permissions and automated audit logging.
              </li>
            </ul>
          </div>

          {/* Section 4: Technical Isolation & Row Level Security */}
          <div className="p-8 bg-slate-950 text-white rounded-3xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 text-white flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <h2 className="font-serif text-xl font-bold">
                4. Database Architecture &amp; Row-Level Security (RLS)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
              Our infrastructure separates public website content from private client records through database-level security policies (PostgreSQL Row-Level Security):
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-300">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="font-bold text-white block">Public Zone (Read-Only)</span>
                <p className="text-slate-400">Public property cards and anonymous request parameters. No client identity data is accessible through public endpoints.</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="font-bold text-white block">Private Zone (Authenticated RLS)</span>
                <p className="text-slate-400">All client records, phone numbers, transaction notes, and document vaults require valid JWT auth tokens with role verification.</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 pt-2 mb-0">
              ⚡ <strong>Operational Lead Alerts:</strong> Inbound leads generate a data-minimized notification alert dispatched to the operator&apos;s internal channel. Database persistence remains the isolated source of truth.
            </p>
          </div>
        </div>

        {/* Privacy Inquiries Footer CTA */}
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <strong className="text-slate-900 block font-semibold">Have Questions Regarding Operational Data Safeguards?</strong>
            <span>Contact our privacy desk for technical or operational clarifications.</span>
          </div>
          <a
            href={SITE_CONFIG.contact.publicEmail.mailto}
            className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl font-semibold uppercase tracking-wider text-[11px] whitespace-nowrap transition"
          >
            Email Privacy Desk
          </a>
        </div>
      </div>
    </PublicLayout>
  )
}
