import { getPublicRequests } from '@/lib/db/requests'
import { PublicLayout } from '@/components/layout/public/PublicLayout'
import { RequestInquiryForm } from '@/components/RequestInquiryForm'
import { Search } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function PublicRequestsPage() {
  const requests = await getPublicRequests()

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Editorial Hero Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-800 tracking-wide uppercase">
            <span>Verified Buyer Mandates</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-slate-950">
            Active Client Property Searches
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Represented private buyers and institutional investors with committed capital actively acquiring residential and commercial assets.
          </p>
        </div>

        {/* Requests Showcase */}
        {requests.length === 0 ? (
          <div className="bg-slate-50 rounded-3xl border border-slate-200/80 p-12 text-center max-w-2xl mx-auto">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 shadow-xs">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-slate-900">
              No Public Searches Currently Listed
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              If you own or represent a prime property in Bucharest or international markets, contact our advisory practice directly.
            </p>
            <div className="mt-6">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-slate-950 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-slate-800 transition"
              >
                Inquire Directly
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 pb-3 border-b border-slate-200">
              <span>Showing {requests.length} verified buyer mandates</span>
              <span>All client identities strictly protected &amp; verified</span>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs hover:border-slate-400 transition space-y-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-[11px] font-bold rounded-full uppercase tracking-wider">
                          Active Search Mandate
                        </span>
                        <span className="text-xs text-slate-400">
                          Ref: #{req.id.slice(0, 8)}
                        </span>
                      </div>
                      <h2 className="font-serif text-2xl font-bold text-slate-950">
                        {req.title}
                      </h2>
                    </div>

                    {/* Budget Highlight */}
                    <div className="sm:text-right bg-slate-50 sm:bg-transparent p-4 sm:p-0 rounded-2xl">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
                        Target Budget
                      </span>
                      <span className="font-serif text-xl sm:text-2xl font-bold text-slate-900">
                        {req.budget_max
                          ? `Up to ${req.budget_max.toLocaleString()} ${req.currency}`
                          : req.budget_min
                          ? `From ${req.budget_min.toLocaleString()} ${req.currency}`
                          : 'Market Price / Flexible'}
                      </span>
                    </div>
                  </div>

                  {/* Specifications Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl text-xs">
                    <div>
                      <span className="text-slate-400 block uppercase font-bold text-[10px] tracking-wider">
                        Asset Type
                      </span>
                      <span className="font-semibold text-slate-900 capitalize">
                        {req.property_type || 'Any property type'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase font-bold text-[10px] tracking-wider">
                        Bedrooms
                      </span>
                      <span className="font-semibold text-slate-900">
                        {req.bedrooms ? `${req.bedrooms}+ Bedrooms` : 'Flexible'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase font-bold text-[10px] tracking-wider">
                        Min. Surface
                      </span>
                      <span className="font-semibold text-slate-900">
                        {req.minimum_area ? `${req.minimum_area} m²` : 'Flexible'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase font-bold text-[10px] tracking-wider">
                        Financing Status
                      </span>
                      <span className="font-semibold text-slate-900">
                        {req.financing_required ? 'Financing Pre-Approved' : 'Cash Buyer'}
                      </span>
                    </div>
                  </div>

                  {/* Locations */}
                  {req.preferred_locations && req.preferred_locations.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2">
                        Preferred Zones:
                      </span>
                      {req.preferred_locations.map((loc: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-medium"
                        >
                          📍 {loc}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Matching Property Lead Submission Box */}
                  <RequestInquiryForm requestId={req.id} requestTitle={req.title} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  )
}
