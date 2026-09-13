import { PublicLayout } from '@/components/layout/public/PublicLayout'
import Link from 'next/link'
import { SITE_CONFIG } from '@/lib/config/site'
import { ArrowRight, Building2, Shield, Landmark, CheckCircle2, Award, ExternalLink, ArrowUpRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: `About ${SITE_CONFIG.name} | ${SITE_CONFIG.positioning.role}`,
  description: `Executive profile and advisory practice of ${SITE_CONFIG.name}. Prime real estate brokerage, insurance asset protection, and private credit structuring in ${SITE_CONFIG.positioning.markets.join(', ')}.`,
}

export default function AboutPage() {
  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
        {/* Editorial Hero */}
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-800 tracking-wide uppercase">
            <span>Executive Profile &amp; Practice</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-slate-950 leading-tight">
            {SITE_CONFIG.name}
          </h1>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 font-mono">
            {SITE_CONFIG.positioning.role} · {SITE_CONFIG.positioning.pillars.join(' · ')}
          </p>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-light">
            Providing private advisory and discrete representation for high-net-worth individuals, family offices, and institutional investors across {SITE_CONFIG.positioning.markets.join(', ')}.
          </p>
        </div>

        {/* Practice Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-slate-950">
              Prime Real Estate Brokerage
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Curated representation across Bucharest&apos;s prime residential districts (Primăverii, Herăstrău, Dorobanți, Floreasca) and international luxury corridors, backed by off-market discretion.
            </p>
            <ul className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Exclusive Buyer &amp; Seller Mandates</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Off-Market Confidential Transactions</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Cross-Border Acquisition Advisory</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-slate-950">
              Insurance &amp; Asset Protection
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Comprehensive risk engineering and asset protection covering luxury estates, commercial real estate portfolios, executive liability, and private physical assets.
            </p>
            <ul className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>All-Risk Property &amp; Asset Coverage</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>30-Day Proactive Renewal Radar</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Institutional Risk Underwriting</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Landmark className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-slate-950">
              Credit &amp; Capital Structuring
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Structured mortgage debt advisory, debt-to-income optimization, private capital placement, and commercial financing across top tier banking partners.
            </p>
            <ul className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Mortgage &amp; Real Estate Debt Structuring</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Senior Bank Negotiation</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Refinancing &amp; Equity Extraction</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Advisory Principles & Fiduciary Commitment */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-14 space-y-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-slate-300 tracking-wide uppercase">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Operating Standards</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight">
              Fiduciary Transparency, Zero Compromise
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light">
              We manage client portfolios across their entire lifecycle—providing continuous market intelligence, acquisition due diligence, financing structuring, and complete asset risk protection.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-white/10 text-xs">
            <div className="space-y-2">
              <span className="font-bold text-sm text-white">Direct Representation</span>
              <p className="text-slate-400">
                You work directly with Cristian Văduva coordinating legal due diligence, pricing negotiations, banking partners, and insurance coverage.
              </p>
            </div>
            <div className="space-y-2">
              <span className="font-bold text-sm text-white">Verified Data &amp; Discretion</span>
              <p className="text-slate-400">
                Every property listing and mandate is verified. Sensitive client financial parameters are strictly isolated in private CRM vaults.
              </p>
            </div>
            <div className="space-y-2">
              <span className="font-bold text-sm text-white">Multi-Market Reach</span>
              <p className="text-slate-400">
                Active presence and execution capability across Bucharest, Monaco, and Dubai luxury corridors.
              </p>
            </div>
          </div>
        </div>

        {/* Ecosystem & Public Portals */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 space-y-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Integrated Platforms
            </span>
            <h3 className="font-serif text-2xl font-bold text-slate-950 mt-1">
              Ecosystem &amp; Public Portals
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Explore the specialized platforms and resources operated under the Cristian Văduva advisory network:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SITE_CONFIG.websites.map((site) => (
              <a
                key={site.name}
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-5 rounded-2xl border border-slate-200/80 hover:border-slate-900 bg-slate-50/50 hover:bg-white transition group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-slate-950 font-bold text-sm mb-1">
                    <span>{site.name}</span>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-950 transition" />
                  </div>
                  {site.description && (
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {site.description}
                    </p>
                  )}
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-1 text-[11px] text-blue-600 font-medium">
                  <span>Visit Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Call to Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-8 bg-slate-50 rounded-3xl border border-slate-200/80">
          <div>
            <h3 className="font-serif text-xl font-bold text-slate-900">
              Ready to Discuss a Transaction or Mandate?
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Connect directly with Cristian Văduva for a private consultation in Bucharest or remotely.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/properties"
              className="px-5 py-2.5 bg-white border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-slate-100 transition shadow-2xs"
            >
              View Listings
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-950 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-slate-800 transition shadow-xs"
            >
              <span>Contact Directly</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
