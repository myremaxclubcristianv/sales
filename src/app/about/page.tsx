import { PublicLayout } from '@/components/layout/public/PublicLayout'
import Link from 'next/link'
import { ArrowRight, Building2, Shield, Landmark, CheckCircle2, Award } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About the Advisory Practice | Vaduva & Partners',
  description: 'A multi-disciplinary advisory firm delivering private real estate brokerage, insurance asset protection, and mortgage financing in Bucharest and international markets.',
}

export default function AboutPage() {
  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
        {/* Editorial Hero */}
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-800 tracking-wide uppercase">
            <span>Advisory Firm Overview</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-slate-950 leading-tight">
            Integrated Real Estate, Insurance &amp; Financing Advisory
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Vaduva &amp; Partners operates as a boutique private practice serving high-net-worth individuals, institutional investors, and corporate clients with unified transaction advisory.
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
              Curated portfolio representation across Bucharest&apos;s prime residential districts (Primăverii, Herăstrău, Dorobanți, Floreasca) and commercial assets with off-market discretion.
            </p>
            <ul className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Exclusive Buyer Mandates</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Institutional Property Marketing</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Confidential Off-Market Transactions</span>
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
              Tailored risk engineering and asset protection covering luxury real estate, commercial liabilities, executive life, and high-value physical assets.
            </p>
            <ul className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>All-Risk Property Coverage</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>30-Day Proactive Renewal Radar</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Top Insurer Market Underwriting</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Landmark className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-slate-950">
              Credit &amp; Mortgage Structuring
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Structured mortgage debt advisory, debt-to-income optimization, and commercial real estate financing across all major Romanian banking partners.
            </p>
            <ul className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>8-Stage End-to-End File Handling</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Bank Negotiation for Optimal Margins</span>
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
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              We do not treat real estate transactions as isolated one-off sales. We manage client portfolios across their entire lifecycle, providing continuous market intelligence, financing reviews, and asset risk protection.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-white/10 text-xs">
            <div className="space-y-2">
              <span className="font-bold text-sm text-white">Single Advisory Desk</span>
              <p className="text-slate-400">
                You work with one senior partner coordinating real estate negotiations, legal paperwork, bank financing, and insurance.
              </p>
            </div>
            <div className="space-y-2">
              <span className="font-bold text-sm text-white">Verified Data &amp; No Placeholders</span>
              <p className="text-slate-400">
                Every property listing, buyer mandate, and market figure is verified against registered cadastral documents and active contracts.
              </p>
            </div>
            <div className="space-y-2">
              <span className="font-bold text-sm text-white">Confidential Non-Disclosure</span>
              <p className="text-slate-400">
                Client financial parameters, floor prices, and sensitive ownership details are strictly isolated in private CRM vaults.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-8 bg-slate-50 rounded-3xl border border-slate-200/80">
          <div>
            <h3 className="font-serif text-xl font-bold text-slate-900">
              Ready to Discuss a Transaction or Mandate?
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Contact our advisory desk for an introductory consultation in Bucharest or remotely.
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
              <span>Contact Advisory Desk</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
