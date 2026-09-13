import { notFound } from 'next/navigation'
import { getRequestById } from '@/lib/db/requests'
import { getProperties } from '@/lib/db/properties'
import { getViewings } from '@/lib/db/viewings'
import { calculatePropertyRequestMatch } from '@/lib/utils/matching-engine'
import { PrivateLayout } from '@/components/layout/private/PrivateLayout'
import Link from 'next/link'
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Sparkles,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react'
import { RequestStatusActions } from './RequestStatusActions'
import { ScheduleViewingModalButton } from './ScheduleViewingModalButton'

interface PageProps {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export default async function RequestDetailPage(props: PageProps) {
  const { id } = await props.params

  let request
  try {
    request = await getRequestById(id)
  } catch {
    notFound()
  }

  if (!request) {
    notFound()
  }

  const buyer = request.buyer as unknown as {
    id: string
    first_name: string
    last_name: string
    phone: string | null
    email: string | null
    preferred_communication: string
  } | null

  // Fetch all inventory properties to run deterministic matching
  const allProperties = await getProperties()

  // Calculate matches and sort by score descending
  const matchedProperties = allProperties
    .map((prop) => {
      const match = calculatePropertyRequestMatch(prop, request)
      return {
        property: prop,
        match,
      }
    })
    .sort((a, b) => b.match.score - a.match.score)

  // Fetch viewings for this client
  const clientViewings = buyer ? await getViewings({ clientId: buyer.id }) : []

  return (
    <PrivateLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Top Breadcrumb & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/requests"
              className="p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                  {request.title}
                </h1>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                    request.status === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                      : request.status === 'PAUSED'
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                      : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400'
                  }`}
                >
                  {request.status}
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Created on {new Date(request.created_at).toLocaleDateString()} • Ref: #{request.id.slice(0, 8)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {buyer && (
              <ScheduleViewingModalButton
                clientId={buyer.id}
                clientName={`${buyer.first_name} ${buyer.last_name}`}
                properties={allProperties}
              />
            )}
            <RequestStatusActions requestId={request.id} currentStatus={request.status} />
          </div>
        </div>

        {/* 2-Column Layout: Left (Criteria & Buyer Card), Right (Matching Inventory) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Client & Criteria */}
          <div className="space-y-6">
            {/* Buyer Contact Card */}
            {buyer ? (
              <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Buyer Profile
                  </h3>
                  <Link
                    href={`/admin/clients/${buyer.id}`}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Open Client 360 →
                  </Link>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    {buyer.first_name} {buyer.last_name}
                  </h4>
                  <p className="text-xs text-neutral-500">
                    Preferred: <span className="capitalize">{buyer.preferred_communication}</span>
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                  {buyer.phone && (
                    <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                      <Phone className="w-3.5 h-3.5 text-neutral-400" />
                      <a href={`tel:${buyer.phone}`} className="hover:underline font-mono">
                        {buyer.phone}
                      </a>
                    </div>
                  )}
                  {buyer.email && (
                    <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                      <Mail className="w-3.5 h-3.5 text-neutral-400" />
                      <a href={`mailto:${buyer.email}`} className="hover:underline font-mono">
                        {buyer.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 text-sm text-neutral-500">
                No buyer linked to this request.
              </div>
            )}

            {/* Criteria Card */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 pb-2 border-b border-neutral-100 dark:border-neutral-800">
                Search Parameters
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-neutral-400 block font-medium">Budget Min</span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {request.budget_min ? `${request.budget_min.toLocaleString()} ${request.currency}` : 'Flexible'}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block font-medium">Budget Max</span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {request.budget_max ? `${request.budget_max.toLocaleString()} ${request.currency}` : 'Open'}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block font-medium">Property Type</span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100 capitalize">
                    {request.property_type || 'Any'}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block font-medium">Bedrooms</span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {request.bedrooms ? `${request.bedrooms}+ beds` : 'Any'}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block font-medium">Min Surface</span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {request.minimum_area ? `${request.minimum_area} m²` : 'Any'}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block font-medium">Financing</span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {request.financing_required ? 'Bank Credit' : 'Cash / Ready'}
                  </span>
                </div>
              </div>

              {/* Preferred Locations */}
              {request.preferred_locations && request.preferred_locations.length > 0 && (
                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <span className="text-neutral-400 text-xs block font-medium mb-1.5">
                    Target Zones
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {request.preferred_locations.map((loc: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-md text-xs font-medium"
                      >
                        📍 {loc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline & Notes */}
              {request.timeline && (
                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                  <span className="text-neutral-400 block font-medium">Timeline</span>
                  <span className="font-medium text-neutral-800 dark:text-neutral-200">
                    {request.timeline}
                  </span>
                </div>
              )}

              {request.notes && (
                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                  <span className="text-neutral-400 block font-medium">Confidential Broker Notes</span>
                  <p className="mt-1 text-neutral-600 dark:text-neutral-400 italic">
                    {request.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Client Viewings & Offers Activity */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 pb-2 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <span>Viewings Log ({clientViewings.length})</span>
                <Link href="/admin/viewings" className="text-primary hover:underline text-[11px] normal-case">
                  All Viewings →
                </Link>
              </h3>

              {clientViewings.length === 0 ? (
                <p className="text-xs text-neutral-400 py-2 text-center">
                  No viewings recorded yet for this client.
                </p>
              ) : (
                <div className="space-y-3">
                  {clientViewings.map((v) => {
                    const prop = v.property as unknown as { title: string; area: string } | null
                    return (
                      <div
                        key={v.id}
                        className="p-2.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-100 dark:border-neutral-800 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between font-semibold text-neutral-900 dark:text-neutral-100">
                          <span className="line-clamp-1">{prop?.title || 'Property'}</span>
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700">
                            {v.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-neutral-500 text-[11px]">
                          <span>{new Date(v.date).toLocaleDateString()}</span>
                          {v.interest && <span className="capitalize">Interest: {v.interest}</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Deterministic Inventory Matches */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-neutral-100 dark:border-neutral-800">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                      Inventory Match Results
                    </h2>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Real-time deterministic ranking based on budget, zone, surface & specs
                  </p>
                </div>
                <div className="text-xs font-semibold px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-neutral-700 dark:text-neutral-300">
                  {matchedProperties.filter((m) => m.match.isStrongMatch).length} High Compatibility
                </div>
              </div>

              {matchedProperties.length === 0 ? (
                <div className="py-12 text-center text-neutral-400 text-sm">
                  No properties currently in the inventory.
                </div>
              ) : (
                <div className="space-y-4 mt-5">
                  {matchedProperties.map(({ property: prop, match }) => {
                    const isHigh = match.score >= 75
                    const isMedium = match.score >= 50 && match.score < 75

                    return (
                      <div
                        key={prop.id}
                        className={`rounded-2xl border transition p-5 ${
                          isHigh
                            ? 'bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/50'
                            : isMedium
                            ? 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800'
                            : 'bg-neutral-50/50 dark:bg-neutral-900/40 border-neutral-200/50 dark:border-neutral-800/50 opacity-75'
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          {/* Property Details */}
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                  isHigh
                                    ? 'bg-emerald-600 text-white'
                                    : isMedium
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-neutral-400 text-white'
                                }`}
                              >
                                {match.score}% Match
                              </span>
                              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                {prop.type} • {prop.property_status}
                              </span>
                            </div>

                            <Link
                              href={`/admin/properties/${prop.id}`}
                              className="text-base font-bold text-neutral-900 dark:text-neutral-100 hover:text-primary transition line-clamp-1"
                            >
                              {prop.title}
                            </Link>

                            <p className="text-xs text-neutral-500 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {prop.area ? `${prop.area}, ` : ''}
                              {prop.location}
                            </p>

                            <div className="flex items-center gap-4 text-xs font-semibold text-neutral-800 dark:text-neutral-200 pt-1">
                              <span>
                                {prop.price ? `${prop.price.toLocaleString()} ${prop.currency}` : 'Price on request'}
                              </span>
                              <span>•</span>
                              <span>{prop.bedrooms || 0} Beds</span>
                              <span>•</span>
                              <span>{prop.built_area || 0} m²</span>
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex flex-row md:flex-col items-end gap-2 shrink-0">
                            <Link
                              href={`/admin/properties/${prop.id}`}
                              className="px-3 py-1.5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-medium rounded-lg hover:opacity-95 transition"
                            >
                              View Property →
                            </Link>
                          </div>
                        </div>

                        {/* Explainable Match Breakdown */}
                        <div className="mt-4 pt-3 border-t border-neutral-200/60 dark:border-neutral-800 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {match.criteria.map((c, cIdx) => (
                            <div key={cIdx} className="flex items-start gap-2">
                              {c.matched ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              ) : (
                                <XCircle className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                              )}
                              <div className="text-[11px]">
                                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                                  {c.label}:{' '}
                                </span>
                                <span className={c.matched ? 'text-neutral-600 dark:text-neutral-400' : 'text-neutral-400 italic'}>
                                  {c.detail}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PrivateLayout>
  )
}
