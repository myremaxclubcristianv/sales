import { PublicLayout } from '@/components/layout/public/PublicLayout'
import { ContactFormClient } from './ContactFormClient'
import { SITE_CONFIG } from '@/lib/config/site'
import { MapPin, Phone, Mail, Globe, MessageSquare, ShieldCheck, ArrowUpRight, FileText } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: `Contact ${SITE_CONFIG.name} | ${SITE_CONFIG.positioning.role}`,
  description: `Direct advisory engagement with ${SITE_CONFIG.name} for luxury real estate acquisitions, property sales, insurance asset protection, and capital structuring.`,
}

export default function ContactPage() {
  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-800 tracking-wide uppercase">
            <span>Direct Advisory Engagement</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-slate-950">
            Contact {SITE_CONFIG.name}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-light">
            Direct access for prime residential acquisitions, confidential seller representation, insurance asset protection, and private credit structuring across {SITE_CONFIG.positioning.markets.join(', ')}.
          </p>
        </div>

        {/* 2-Column Contact Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Interactive Form & Direct Mandates (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-xs space-y-8">
              <div>
                <h2 className="font-serif text-2xl font-bold text-slate-950">
                  Submit Direct Inquiry / Brief
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Registered directly in our private CRM and treated with strict fiduciary confidentiality.
                </p>
              </div>

              <ContactFormClient />
            </div>

            {/* Direct Public Fast-Track Forms */}
            <div className="bg-slate-50 rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <FileText className="w-4 h-4 text-slate-700" />
                <span>Dedicated Public Mandate Forms</span>
              </div>
              <p className="text-xs text-slate-600">
                Prefer a structured questionnaire? Select a dedicated submission form below:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {SITE_CONFIG.publicForms.map((form) => (
                  <a
                    key={form.title}
                    href={form.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 bg-white border border-slate-200/80 hover:border-slate-900 rounded-xl transition flex flex-col justify-between group shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center justify-between text-slate-900 font-semibold text-xs mb-1">
                        <span>{form.title.replace(' Form', '')}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 transition" />
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {form.purpose}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Master Direct Channels & Social Channels (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Direct Channels Card */}
            <div className="bg-slate-950 text-white rounded-3xl p-8 space-y-6 shadow-md">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">
                  {SITE_CONFIG.positioning.role}
                </span>
                <h3 className="font-serif text-2xl font-bold text-white">
                  {SITE_CONFIG.name}
                </h3>
              </div>

              <div className="space-y-4 text-xs">
                {/* Primary Phone */}
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-slate-300">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">
                      Primary Phone (RO)
                    </span>
                    <a
                      href={SITE_CONFIG.contact.primaryPhone.tel}
                      className="text-sm font-bold text-white hover:text-slate-300 transition font-mono"
                    >
                      {SITE_CONFIG.contact.primaryPhone.display}
                    </a>
                  </div>
                </div>

                {/* Real-Estate / WhatsApp Direct */}
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">
                      Real-Estate Direct / WhatsApp (AT)
                    </span>
                    <div className="flex items-center gap-2">
                      <a
                        href={SITE_CONFIG.contact.realEstatePhone.tel}
                        className="text-sm font-bold text-white hover:text-slate-300 transition font-mono"
                      >
                        {SITE_CONFIG.contact.realEstatePhone.display}
                      </a>
                      <a
                        href={SITE_CONFIG.contact.whatsapp.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-0.5 bg-emerald-500 text-slate-950 rounded text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-400 transition"
                      >
                        Open WhatsApp
                      </a>
                    </div>
                  </div>
                </div>

                {/* Primary & Public Email */}
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-slate-300">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <div>
                      <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">
                        Public Advisory Inquiries
                      </span>
                      <a
                        href={SITE_CONFIG.contact.publicEmail.mailto}
                        className="text-sm font-semibold text-white hover:text-slate-300 transition"
                      >
                        {SITE_CONFIG.contact.publicEmail.address}
                      </a>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">
                        Primary Direct Email
                      </span>
                      <a
                        href={SITE_CONFIG.contact.primaryEmail.mailto}
                        className="text-xs font-mono text-slate-300 hover:text-white transition"
                      >
                        {SITE_CONFIG.contact.primaryEmail.address}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Primary Website */}
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-slate-300">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">
                      Primary Website
                    </span>
                    <a
                      href={SITE_CONFIG.websites[0].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-white hover:text-slate-300 transition inline-flex items-center gap-1"
                    >
                      <span>cristianvaduva.com</span>
                      <ArrowUpRight className="w-3 h-3 text-slate-400" />
                    </a>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-slate-300">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">
                      Location &amp; Markets
                    </span>
                    <p className="text-xs text-slate-200">
                      {SITE_CONFIG.location.full} · {SITE_CONFIG.positioning.markets.join(' · ')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social & Advisory Channels Card */}
            <div className="bg-slate-50 rounded-3xl border border-slate-200/80 p-8 space-y-4">
              <h4 className="font-serif text-lg font-bold text-slate-900">
                Public Profiles &amp; Networks
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {SITE_CONFIG.socials.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-900 hover:shadow-xs transition group flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between font-semibold text-slate-900 mb-1">
                      <span>{social.name}</span>
                      <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-slate-900 transition" />
                    </div>
                    {social.handle && (
                      <span className="text-[10px] text-slate-500 truncate font-mono">
                        {social.handle}
                      </span>
                    )}
                  </a>
                ))}
              </div>
            </div>

            {/* Standards & Fiduciary Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-8 space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Strict Discretion &amp; Representation</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                We represent private individuals, family offices, and institutions. Off-market mandates, private acquisitions, and sensitive asset disposals are conducted with complete non-disclosure protocols.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
