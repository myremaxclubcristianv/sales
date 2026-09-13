import { getPublicRequestById } from '@/lib/db/requests'
import { PublicLayout } from '@/components/layout/public/PublicLayout'
import { RequestInquiryForm } from '@/components/RequestInquiryForm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, CheckCircle2, Sparkles } from 'lucide-react'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { id } = await props.params
  try {
    const req = await getPublicRequestById(id)
    if (!req) return { title: 'Buyer Mandate Not Found' }
    return {
      title: `${req.title} | Verified Buyer Mandate`,
      description: `Represented client property search with verified budget up to ${req.budget_max ? `€${req.budget_max.toLocaleString()}` : 'market price'}.`,
    }
  } catch {
    return { title: 'Buyer Mandate' }
  }
}

export default async function PublicRequestDetailPage(props: PageProps) {
  const { id } = await props.params
  let request: Awaited<ReturnType<typeof getPublicRequestById>> | null = null

  try {
    request = await getPublicRequestById(id)
  } catch {
    notFound()
  }

  if (!request) {
    notFound()
  }

  const desiredFeaturesList = request.desired_features && typeof request.desired_features === 'object'
    ? Object.entries(request.desired_features as Record<string, unknown>)
        .filter(([, v]) => Boolean(v))
        .map(([k]) => k.replace(/_/g, ' '))
    : []

  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Back Link */}
        <div>
          <Link
            href="/requests"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Verified Buyer Searches</span>
          </Link>
        </div>

        {/* Hero Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-xs space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-8 border-b border-slate-100">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-[11px] font-bold rounded-full uppercase tracking-wider">
                  Active Buyer Mandate
                </span>
                <span className="text-xs text-slate-400">
                  Ref #{request.id.slice(0, 8)}
                </span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
                {request.title}
              </h1>
              <p className="text-sm text-slate-500 max-w-2xl">
                This search is actively managed under an exclusive advisory mandate. Client identity is strictly protected.
              </p>
            </div>

            <div className="sm:text-right bg-slate-50 sm:bg-transparent p-6 sm:p-0 rounded-2xl">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
                Target Budget
              </span>
              <span className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
                {request.budget_max
                  ? `Up to ${request.budget_max.toLocaleString()} ${request.currency}`
                  : request.budget_min
                  ? `From ${request.budget_min.toLocaleString()} ${request.currency}`
                  : 'Market Price / Flexible'}
              </span>
            </div>
          </div>

          {/* Criteria Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Property Type</span>
              <p className="text-sm font-semibold text-slate-900 capitalize">{request.property_type || 'Any Type'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Bedrooms</span>
              <p className="text-sm font-semibold text-slate-900">{request.bedrooms ? `${request.bedrooms}+ Bedrooms` : 'Flexible'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Min. Usable Area</span>
              <p className="text-sm font-semibold text-slate-900">{request.minimum_area ? `${request.minimum_area} m²` : 'Flexible'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Financing State</span>
              <p className="text-sm font-semibold text-slate-900">{request.financing_required ? 'Financing Pre-Approved' : 'Cash / Committed Capital'}</p>
            </div>
          </div>

          {/* Preferred Locations */}
          {request.preferred_locations && request.preferred_locations.length > 0 && (
            <div className="space-y-3 pt-6 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>Preferred Target Locations</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {request.preferred_locations.map((loc: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-slate-100 text-slate-800 text-xs font-medium rounded-lg"
                  >
                    {loc}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Desired Features */}
          {desiredFeaturesList.length > 0 && (
            <div className="space-y-3 pt-6 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-slate-500" />
                <span>Client Requirements &amp; Preferences</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {desiredFeaturesList.map((feature: string, idx: number) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium rounded-lg capitalize"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{feature}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Off-Market Submission Form */}
        <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-12 space-y-8">
          <div className="max-w-2xl space-y-3">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
              Represent a Matching Property?
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              If you are an owner, developer, or certified broker with an asset meeting these parameters (including off-market properties), submit the listing directly to our advisory practice.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
            <RequestInquiryForm
              requestId={request.id}
              requestTitle={request.title}
            />
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
