import { PublicLayout } from '@/components/layout/public/PublicLayout'
import { ContactFormClient } from './ContactFormClient'
import { MapPin, Phone, Mail, Clock, ShieldCheck, Award } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Advisory Practice | Vaduva & Partners',
  description: 'Initiate a confidential advisory engagement for luxury real estate acquisitions, property sales, insurance asset protection, or mortgage credit structuring.',
}

export default function ContactPage() {
  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-800 tracking-wide uppercase">
            <span>Confidential Engagement</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-slate-950">
            Initiate Advisory Discussion
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Direct access to dedicated partners across prime real estate transactions, insurance portfolio structuring, and private credit financing.
          </p>
        </div>

        {/* 2-Column Contact Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-xs space-y-8">
            <div>
              <h2 className="font-serif text-2xl font-bold text-slate-950">
                Submit Confidential Mandate
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                All communications are protected under strict fiduciary confidentiality standards.
              </p>
            </div>

            <ContactFormClient />
          </div>

          {/* Right Column: Direct Channels & Practice Credentials (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Direct Channels Card */}
            <div className="bg-slate-900 text-white rounded-3xl p-8 space-y-6">
              <h3 className="font-serif text-xl font-bold">
                Direct Contact Channels
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-slate-300">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">Direct Phone &amp; WhatsApp</span>
                    <a href="tel:+40700000000" className="text-sm font-bold text-white hover:text-slate-300 transition font-mono">
                      +40 700 000 000
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-slate-300">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">Executive Inquiries</span>
                    <a href="mailto:contact@vaduva-partners.ro" className="text-sm font-semibold text-white hover:text-slate-300 transition">
                      contact@vaduva-partners.ro
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-slate-300">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">Advisory Headquarters</span>
                    <p className="text-xs text-slate-200">
                      Bulevardul Primăverii, Sector 1, Bucharest, Romania
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-slate-300">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">Operating Hours</span>
                    <p className="text-xs text-slate-200">
                      Monday – Friday: 09:00 – 19:00 EET<br />
                      Private viewings by appointment 7 days / week
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Standards & Fiduciary Card */}
            <div className="bg-slate-50 rounded-3xl border border-slate-200/80 p-8 space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Strict Discretion &amp; Representation</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                We represent private individuals, family offices, and institutions. Off-market mandates, private acquisitions, and sensitive asset disposals are conducted with complete non-disclosure protocols.
              </p>
            </div>

            <div className="bg-slate-50 rounded-3xl border border-slate-200/80 p-8 space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Award className="w-4 h-4 text-blue-600" />
                <span>Integrated Execution</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                From finding off-market real estate to bank credit approval and comprehensive insurance coverage, all phases are coordinated under a single senior advisory desk.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
