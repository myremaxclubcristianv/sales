import React from 'react'
import Link from 'next/link'
import { PublicLayout } from '@/components/layout/public/PublicLayout'
import { getPublicProperties } from '@/lib/db/properties'
import { SITE_CONFIG } from '@/lib/config/site'
import {
  Building2,
  Shield,
  Landmark,
  Users,
  FolderLock,
  Activity,
  ArrowRight,
  Phone,
  Mail,
  MessageSquare,
  CheckCircle2,
  TrendingUp,
  CalendarCheck,
} from 'lucide-react'

interface PublicPropertySummary {
  id: string
  title: string
  slug: string
  type: string
  location: string
  area: string
  bedrooms: number | null
  bathrooms: number | null
  built_area: number | null
  price: number | null
  currency: 'EUR' | 'USD' | 'RON'
  public_price_visibility: boolean
  media?: Array<{ id: string; file_path: string; is_primary: boolean }> | null
}

export const dynamic = 'force-dynamic'

export default async function Home() {
  let properties: PublicPropertySummary[] = []
  try {
    properties = (await getPublicProperties()) || []
  } catch (err) {
    console.error('Error loading featured properties:', err)
  }

  const featured = properties.slice(0, 3)

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative bg-slate-950 text-white overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-semibold uppercase tracking-widest text-slate-300">
              <span>★</span>
              <span>CRM SALES · Private Practice &amp; Advisory</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">
              Discreet Real Estate, Insurance &amp; Capital Advisory.
            </h1>

            <p className="text-base sm:text-xl text-slate-300 leading-relaxed max-w-2xl font-light">
              A unified advisory architecture connecting high-value property acquisitions, institutional risk engineering, and private credit structuring for individuals, family offices, and investors.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                href="/properties"
                className="px-8 py-4 bg-white text-slate-950 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-colors text-center shadow-lg"
              >
                Browse Curated Properties
              </Link>
              <Link
                href="/requests"
                className="px-8 py-4 bg-slate-900 text-white border border-slate-700 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-colors text-center"
              >
                Verified Buyer Requests
              </Link>
              <Link
                href="/contact"
                className="px-8 py-4 bg-brand-gold-500/20 text-brand-gold-300 border border-brand-gold-500/40 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-brand-gold-500/30 transition-colors text-center"
              >
                Private Consultation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Core Practice Pillars Section */}
      <section className="py-20 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Integrated Capabilities
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-950 mt-1">
              Three Unified Pillars of Advisory
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed font-light">
              Rather than managing transactions in isolation, CRM SALES coordinates acquisitions, risk management, and debt structuring into one coherent strategy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Real Estate */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-slate-950">
                  Luxury Real Estate Brokerage
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Prime residential listings, verified buyer mandates, confidential off-market matching, private viewings, formal offers, and legal closing support.
                </p>
                <ul className="space-y-2 text-xs text-slate-700 pt-3 border-t border-slate-100">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Exclusive Buyer &amp; Seller Mandates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Direct Property Matching Engine</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Private Viewings &amp; Offer Pipeline</span>
                  </li>
                </ul>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <Link
                  href="/properties"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider"
                >
                  <span>Explore Portfolio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Insurance & Asset Protection */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-slate-950">
                  Insurance &amp; Asset Protection
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Institutional-grade asset protection, estate all-risk policies, executive liability, 30-day proactive renewal tracking, and continuous claim oversight.
                </p>
                <ul className="space-y-2 text-xs text-slate-700 pt-3 border-t border-slate-100">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Comprehensive Property &amp; Asset Coverage</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Proactive 30-Day Renewal Alerts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Integrated Policy &amp; Claims Management</span>
                  </li>
                </ul>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <a
                  href={SITE_CONFIG.websites.find(w => w.name === 'Insurance')?.url || 'https://insurance.cristianvaduva.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider"
                >
                  <span>Risk Engineering Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Credit & Capital Placement */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Landmark className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-slate-950">
                  Credit &amp; Capital Structuring
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Financing cases, mortgage debt advisory, banking partner negotiation, liquidity management, and capital structuring for major acquisitions.
                </p>
                <ul className="space-y-2 text-xs text-slate-700 pt-3 border-t border-slate-100">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Residential &amp; Commercial Mortgage Cases</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Debt-to-Income Optimization &amp; Underwriting</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Pipeline Tracking &amp; Stage Milestones</span>
                  </li>
                </ul>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <a
                  href={SITE_CONFIG.websites.find(w => w.name === 'Credit')?.url || 'https://credite.cristianvaduva.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-700 uppercase tracking-wider"
                >
                  <span>Credit Structuring Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Client 360 Architecture Section */}
      <section className="py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-800 tracking-wide uppercase">
                <Users className="w-3.5 h-3.5 text-slate-700" />
                <span>Relationship Intelligence</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-slate-950">
                Client 360 Architecture.
              </h2>
              <p className="text-base text-slate-600 leading-relaxed font-light">
                Every client interaction is centralized into an immutable relationship record. Financial parameters, preferred property profiles, insurance coverage, and compliance documents exist in one unified view.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <span>Real-Time Activity Timelines</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Calls, viewings, meetings, and follow-ups logged with automatic relationship health scoring.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                    <FolderLock className="w-4 h-4 text-emerald-600" />
                    <span>Encrypted Document Vault</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Categorized ID documents, contracts, title deeds, and credit files with strict access controls.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                    <CalendarCheck className="w-4 h-4 text-purple-600" />
                    <span>Key Dates &amp; Milestones</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Birthdays, policy renewals, mortgage maturity, and transaction anniversaries tracked automatically.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                    <TrendingUp className="w-4 h-4 text-amber-600" />
                    <span>Cross-Pillar Opportunities</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Property acquisitions seamlessly linked to insurance underwriting and mortgage loan structuring.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              {/* Visual Architecture Box */}
              <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-800 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                      CRM Record Synchronization
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">Live Architecture</span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">👤 Client Profile</span>
                    <span className="text-emerald-400">Verified KYC &amp; Preferences</span>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">🏠 Real Estate Mandate</span>
                    <span className="text-blue-400">Property / Buyer Request</span>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">🛡️ Asset Risk Protection</span>
                    <span className="text-emerald-400">Insurance Policies &amp; Renewals</span>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">💳 Financing &amp; Debt</span>
                    <span className="text-purple-400">Credit Case &amp; Stage Tracking</span>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">📁 Vault Storage</span>
                    <span className="text-brand-gold-400">Row-Level Security Encrypted</span>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-slate-400 font-light leading-relaxed">
                  Fiduciary data isolation ensures sensitive client information is never exposed publicly.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lead Management Pipeline Section */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-gold-400">
              Operational Lifecycle
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white mt-1">
              From Inquiry to Closed Transaction
            </h2>
            <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed font-light">
              Every mandate follows a disciplined 6-stage lifecycle supported by real-time database tracking and automated alerts.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { stage: '1. Inbound Lead', desc: 'Contact inquiry, property brief, or buyer search registration.', icon: '📩' },
              { stage: '2. Client Profile', desc: 'KYC validation, budget parameters, and criteria onboarding.', icon: '👤' },
              { stage: '3. Opportunity', desc: 'Structured mandate creation across property, credit, or insurance.', icon: '🎯' },
              { stage: '4. Activities', desc: 'Scheduled calls, property viewings, and valuation meetings.', icon: '🗓️' },
              { stage: '5. Follow-ups', desc: 'Offer negotiations, bank underwriting, and legal diligence.', icon: '⚡' },
              { stage: '6. Transaction', desc: 'Final contract signing, policy binding, and archive vaulting.', icon: '🤝' },
            ].map((step, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <span className="text-2xl block">{step.icon}</span>
                  <h4 className="font-serif text-sm font-bold text-white">{step.stage}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-gold-400" style={{ width: `${((idx + 1) / 6) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Exclusive Selection
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-950 mt-1">
              Latest Property Releases
            </h2>
          </div>
          <Link
            href="/properties"
            className="text-xs font-bold uppercase tracking-wider text-blue-600 hover:text-blue-700 inline-flex items-center gap-1.5"
          >
            <span>View All Properties ({properties.length})</span>
            <span>→</span>
          </Link>
        </div>

        {featured.length === 0 ? (
          <div className="py-16 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <span className="text-4xl block mb-2">🏡</span>
            <p className="text-base font-semibold text-slate-800">New exclusive listings undergoing onboarding.</p>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Our curated properties and confidential off-market mandates are being prepared. Contact our advisory desk to review files directly.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/contact"
                className="px-6 py-2.5 bg-slate-950 text-white text-xs font-semibold rounded-lg uppercase tracking-wider hover:bg-slate-800 transition-colors"
              >
                Inquire Off-Market Files
              </Link>
              <Link
                href="/requests"
                className="px-6 py-2.5 bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-lg uppercase tracking-wider hover:bg-slate-50 transition-colors"
              >
                View Buyer Requests
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featured.map((prop) => {
              const primaryMedia = prop.media?.find((m: { is_primary: boolean }) => m.is_primary) || prop.media?.[0]
              const displayPrice = prop.public_price_visibility && prop.price
                ? `${prop.price.toLocaleString()} ${prop.currency}`
                : 'Price Upon Request'

              return (
                <Link
                  key={prop.id}
                  href={`/properties/${prop.slug}`}
                  className="group block bg-white rounded-2xl border border-slate-200/80 overflow-hidden hover:border-slate-300 hover:shadow-lg transition-all duration-200 flex flex-col"
                >
                  <div className="relative h-64 bg-slate-950 overflow-hidden flex items-center justify-center text-slate-500">
                    {primaryMedia ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${primaryMedia.file_path}`}
                        alt={prop.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <span className="text-4xl block mb-1">🏛️</span>
                        <span className="text-xs text-slate-400">Exclusive Representation</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 text-[11px] font-semibold bg-white/95 text-slate-900 rounded-md uppercase tracking-wider">
                        {prop.type}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {prop.area} · {prop.location}
                      </p>
                      <h3 className="font-serif text-lg font-bold text-slate-950 group-hover:text-blue-600 transition-colors mt-1 line-clamp-1">
                        {prop.title}
                      </h3>

                      <div className="flex items-center gap-4 text-xs text-slate-600 mt-4 pt-4 border-t border-slate-100">
                        {prop.bedrooms && <span><strong className="text-slate-900">{prop.bedrooms}</strong> Beds</span>}
                        {prop.bathrooms && <span><strong className="text-slate-900">{prop.bathrooms}</strong> Baths</span>}
                        {prop.built_area && <span><strong className="text-slate-900">{prop.built_area}</strong> m²</span>}
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="font-serif text-base font-bold text-slate-950">{displayPrice}</span>
                      <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                        Explore →
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* Direct Contact & Consultation CTA */}
      <section className="bg-slate-950 text-white py-20 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-brand-gold-400">
                Direct Principal Access
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
                Initiate a Confidential Advisory Dialogue
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed font-light">
                Whether acquiring prime residential assets in Bucharest, underwriting portfolio insurance, or structuring acquisition debt, contact Cristian Văduva directly.
              </p>
              <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono text-slate-300">
                <a href={SITE_CONFIG.contact.primaryEmail.mailto} className="inline-flex items-center gap-1.5 hover:text-white transition">
                  <Mail className="w-4 h-4 text-brand-gold-400" />
                  <span>{SITE_CONFIG.contact.primaryEmail.address}</span>
                </a>
                <a href={SITE_CONFIG.contact.primaryPhone.tel} className="inline-flex items-center gap-1.5 hover:text-white transition">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{SITE_CONFIG.contact.primaryPhone.display}</span>
                </a>
                <a href={SITE_CONFIG.contact.whatsapp.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition">
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp Direct</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
              <Link
                href="/contact"
                className="px-8 py-4 bg-white text-slate-950 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-colors text-center shadow-lg"
              >
                Submit Inbound Brief
              </Link>
              <Link
                href="/about"
                className="px-8 py-4 bg-slate-900 border border-slate-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-colors text-center"
              >
                Review Advisory Practice
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
