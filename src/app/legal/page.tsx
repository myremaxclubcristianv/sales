import React from 'react'
import Link from 'next/link'
import { PublicLayout } from '@/components/layout/public/PublicLayout'
import { SITE_CONFIG } from '@/lib/config/site'
import { Shield, FileText, Lock, Cookie, Scale, Megaphone, Info, Eye, AlertCircle, ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Legal, GDPR & Compliance Hub',
  description: 'Official legal documentation, privacy policy, GDPR rights, cookie policy, terms of use, and data protection notices for Cristian Văduva advisory practice.',
  alternates: {
    canonical: '/legal',
  },
}

const LEGAL_DOCUMENTS = [
  {
    title: 'Privacy Policy',
    titleRo: 'Politică de Confidențialitate',
    href: '/privacy-policy',
    icon: Shield,
    badge: 'Core Policy',
    description: 'Comprehensive disclosure of personal data categories, processing purposes, legal bases under EU GDPR & Romanian law, retention criteria, and security safeguards.',
  },
  {
    title: 'GDPR Rights & Procedures',
    titleRo: 'Drepturile Persoanelor Vizate',
    href: '/gdpr',
    icon: Lock,
    badge: 'EU Regulation',
    description: 'Practical guide and direct contact instructions for exercising your rights of access, rectification, erasure, restriction, objection, and data portability.',
  },
  {
    title: 'Data Protection Notice',
    titleRo: 'Notă de Informare Date',
    href: '/data-protection',
    icon: FileText,
    badge: 'Operations',
    description: 'Detailed operational breakdown of how client personal data is processed across Real Estate transactions, Insurance structuring, and Credit advisory.',
  },
  {
    title: 'Cookie Policy',
    titleRo: 'Politică de Cookie-uri',
    href: '/cookie-policy',
    icon: Cookie,
    badge: 'Technical',
    description: 'Technical inventory of strictly necessary cookies, preference storage, analytics classification, and instructions for managing consent.',
  },
  {
    title: 'Terms of Use',
    titleRo: 'Termeni și Condiții',
    href: '/terms',
    icon: Scale,
    badge: 'Legal Agreement',
    description: 'Conditions governing access to this portal, intellectual property rights, user-submitted information, and limitation of liability.',
  },
  {
    title: 'Marketing & Communications Consent',
    titleRo: 'Consimțământ Marketing',
    href: '/marketing-consent',
    icon: Megaphone,
    badge: 'Communications',
    description: 'Clear distinction between transactional service communications and optional direct marketing, with instant withdrawal mechanisms.',
  },
  {
    title: 'Legal Imprint / Operator Information',
    titleRo: 'Date de Identificare',
    href: '/imprint',
    icon: Info,
    badge: 'Identification',
    description: 'Official legal identification of the data controller and practice operator, verified contact channels, and professional positioning.',
  },
  {
    title: 'Accessibility Statement',
    titleRo: 'Declarație de Accesibilitate',
    href: '/accessibility',
    icon: Eye,
    badge: 'Standards',
    description: 'Our commitment to digital accessibility, keyboard navigability, high-contrast typography, and channels for accessibility assistance.',
  },
  {
    title: 'Privacy Complaints & Authority Escalation',
    titleRo: 'Reclamații și ANSPDCP',
    href: '/complaints',
    icon: AlertCircle,
    badge: 'Supervisory',
    description: 'Procedures for lodging privacy inquiries directly with the controller or escalating formal complaints to the Romanian Supervisory Authority (ANSPDCP).',
  },
]

export default function LegalHubPage() {
  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-800 tracking-wide uppercase">
            <span>Regulatory &amp; Legal Framework</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-slate-950">
            Legal, GDPR &amp; Compliance Hub
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-light">
            Transparent governance, personal data protection, and terms of engagement for the private advisory practice of {SITE_CONFIG.name}.
          </p>
        </div>

        {/* Legal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {LEGAL_DOCUMENTS.map((doc) => {
            const Icon = doc.icon
            return (
              <Link
                key={doc.href}
                href={doc.href}
                className="group p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/80 hover:border-slate-900 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-950 flex items-center justify-center group-hover:bg-slate-950 group-hover:text-white transition">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-1 bg-slate-50 text-slate-600 text-[10px] font-bold rounded-md uppercase tracking-wider border border-slate-200/60">
                      {doc.badge}
                    </span>
                  </div>

                  <div>
                    <h2 className="font-serif text-xl font-bold text-slate-950 group-hover:text-blue-600 transition">
                      {doc.title}
                    </h2>
                    <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                      {doc.titleRo}
                    </span>
                    <p className="text-xs text-slate-600 mt-2.5 leading-relaxed font-light">
                      {doc.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-950 group-hover:text-blue-600 transition">
                  <span>Review Document</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            )
          })}
        </div>

        {/* Data Controller Quick Summary */}
        <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-12 space-y-6">
          <div className="max-w-3xl space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Data Controller Summary
            </span>
            <h3 className="font-serif text-2xl font-bold">
              Personal Data Governance &amp; Contact Desk
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
              All personal data collected through this portal is processed under the responsibility of {SITE_CONFIG.name}, adhering strictly to Regulation (EU) 2016/679 (General Data Protection Regulation) and Romanian Law No. 190/2018.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-800 text-xs text-slate-300">
            <div>
              <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">Controller</span>
              <p className="font-bold text-white mt-0.5">{SITE_CONFIG.name}</p>
              <p className="text-slate-400 text-[11px]">{SITE_CONFIG.location.full}</p>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">Privacy Contact</span>
              <a href={SITE_CONFIG.contact.publicEmail.mailto} className="font-semibold text-white hover:text-slate-300 transition">
                {SITE_CONFIG.contact.publicEmail.address}
              </a>
              <p className="text-slate-400 text-[11px]">Direct Data Subject Requests</p>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">Supervisory Authority</span>
              <p className="font-bold text-white mt-0.5">ANSPDCP (Romania)</p>
              <a href="https://www.dataprotection.ro" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-[11px]">
                www.dataprotection.ro
              </a>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
