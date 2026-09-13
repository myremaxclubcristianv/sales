import { getOffers } from '@/lib/db/offers'
import { PrivateLayout } from '@/components/layout/private/PrivateLayout'
import Link from 'next/link'
import { Plus, Handshake, Calendar, User, Building, FileText } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function OffersPage() {
  let offers: Awaited<ReturnType<typeof getOffers>> = []
  try {
    offers = await getOffers()
  } catch (err) {
    console.error('Error loading offers:', err)
  }

  const activeOffers = offers.filter((o) => o.status === 'SUBMITTED' || o.status === 'COUNTERED' || o.status === 'UNDER_REVIEW')
  const acceptedOffers = offers.filter((o) => o.status === 'ACCEPTED')
  const totalVolume = acceptedOffers.reduce((sum, o) => sum + (Number(o.offer_amount) || 0), 0)

  return (
    <PrivateLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Offers &amp; Negotiations Hub
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Active buyer proposals, counter-offers, and transaction negotiation histories.
            </p>
          </div>
          <Link
            href="/admin/offers/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-slate-800 transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Submit New Offer</span>
          </Link>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Negotiations</span>
            <div className="mt-2 text-2xl font-bold text-amber-600">{activeOffers.length}</div>
            <div className="text-xs text-slate-500 mt-1">Under review or countered</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Accepted Deals</span>
            <div className="mt-2 text-2xl font-bold text-emerald-600">{acceptedOffers.length}</div>
            <div className="text-xs text-slate-500 mt-1">Transacted &amp; confirmed</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Accepted Volume</span>
            <div className="mt-2 text-2xl font-bold text-slate-900">€{totalVolume.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-1">Total transacted asset value</div>
          </div>
        </div>

        {/* Offers List */}
        {offers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-xl mx-auto space-y-4 shadow-xs">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <Handshake className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-900 text-base">No Recorded Offers Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When buyers submit offers on listed properties, negotiation rounds and counter-offers will appear here.
            </p>
            <div>
              <Link
                href="/admin/offers/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-slate-800 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Submit First Offer</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-4 sm:px-6">Property / Client</th>
                    <th className="py-3.5 px-4">Offer Amount</th>
                    <th className="py-3.5 px-4">Asking Price</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {offers.map((offer) => {
                    const askingPrice = Number(offer.property?.price) || 0
                    const offerAmount = Number(offer.offer_amount) || 0
                    const diffPct = askingPrice > 0 ? Math.round(((offerAmount - askingPrice) / askingPrice) * 100) : 0

                    return (
                      <tr key={offer.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-4 px-4 sm:px-6 space-y-1">
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{offer.property?.title || 'Unknown Property'}</span>
                          </div>
                          {offer.client && (
                            <div className="text-[11px] text-slate-500 flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{offer.client.first_name} {offer.client.last_name}</span>
                            </div>
                          )}
                        </td>

                        <td className="py-4 px-4 font-bold text-slate-900">
                          €{offerAmount.toLocaleString()}
                          {diffPct !== 0 && (
                            <span className={`ml-1.5 text-[10px] font-bold ${diffPct > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {diffPct > 0 ? `+${diffPct}%` : `${diffPct}%`}
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-4 text-slate-600 font-medium">
                          {askingPrice > 0 ? `€${askingPrice.toLocaleString()}` : '—'}
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              offer.status === 'ACCEPTED'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : offer.status === 'REJECTED'
                                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                : offer.status === 'COUNTERED'
                                ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {offer.status}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-slate-500 text-[11px]">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{new Date(offer.offer_date).toLocaleDateString()}</span>
                          </div>
                        </td>

                        <td className="py-4 px-4 sm:px-6 text-right">
                          <Link
                            href={`/admin/clients/${offer.client_id}`}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-900 hover:text-slate-600 underline"
                          >
                            <FileText className="w-3 h-3" />
                            <span>View In 360°</span>
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </PrivateLayout>
  )
}
