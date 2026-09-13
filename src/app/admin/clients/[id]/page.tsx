import React from 'react'
import Link from 'next/link'
import { PrivateLayout } from '@/components/layout/private/PrivateLayout'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { ActivityTimeline } from '@/components/ActivityTimeline'
import { ActivityForm } from '@/components/ActivityForm'
import { DocumentVault } from '@/components/DocumentVault'
import { getClientById } from '@/lib/db/clients'
import { getClientActivities } from '@/lib/db/activities'
import { getClientDocuments, getClientDocumentFolders } from '@/lib/db/documents'
import { getInsurancePolicies } from '@/lib/db/insurance'
import { getCreditCases } from '@/lib/db/credit'
import { getRequests } from '@/lib/db/requests'
import { getViewings } from '@/lib/db/viewings'
import { getOpportunities } from '@/lib/db/opportunities'
import { getOffers } from '@/lib/db/offers'
import { calculateRelationshipHealth, getHealthIcon, type RelationshipHealth } from '@/lib/utils/relationship-health'
import { getNextBestActions } from '@/lib/utils/next-best-action'
import { Shield, Landmark, Home, Calendar, Target, Handshake } from 'lucide-react'
import type { Database } from '@/types'

type ClientDetail = Database['public']['Tables']['clients']['Row'] & {
  client_relationships?: Database['public']['Tables']['client_relationships']['Row'][]
  companies?: { id: string; name: string; email: string | null; phone: string | null } | null
}
type ActivityRow = Database['public']['Tables']['activities']['Row']
type DocumentRow = Database['public']['Tables']['documents']['Row']
type DocumentFolderRow = Database['public']['Tables']['document_folders']['Row']

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ClientDetailPage(props: PageProps) {
  const params = await props.params
  const clientId = params.id

  let client: ClientDetail | null = null
  let activities: ActivityRow[] = []
  let documents: DocumentRow[] = []
  let folders: DocumentFolderRow[] = []
  let clientPolicies: Awaited<ReturnType<typeof getInsurancePolicies>> = []
  let clientCreditCases: Awaited<ReturnType<typeof getCreditCases>> = []
  let clientRequests: Awaited<ReturnType<typeof getRequests>> = []
  let clientViewings: Awaited<ReturnType<typeof getViewings>> = []
  let clientOpportunities: Awaited<ReturnType<typeof getOpportunities>> = []
  let clientOffers: Awaited<ReturnType<typeof getOffers>> = []
  let health: { status: string; score: number; reason: string } | null = null
  let recommendations: Array<{ id: string; title: string; reason: string; priority: string; actions: string[] }> = []

  try {
    const data = await getClientById(clientId)
    client = data as ClientDetail
  } catch (err) {
    console.error('Error fetching client by id:', err)
  }

  if (!client) {
    return (
      <PrivateLayout>
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <h1 className="text-xl font-bold text-slate-900 mb-2">Client Not Found</h1>
          <p className="text-sm text-slate-500 mb-6">The requested client record does not exist or has been removed.</p>
          <Link href="/admin/clients">
            <Button size="sm">Return to Clients</Button>
          </Link>
        </div>
      </PrivateLayout>
    )
  }

  try {
    const [actData, docData, foldData, healthData, recData, polData, credData, reqData, viewData, opData, offData] = await Promise.all([
      getClientActivities(clientId).catch(() => []),
      getClientDocuments(clientId).catch(() => []),
      getClientDocumentFolders(clientId).catch(() => []),
      calculateRelationshipHealth(clientId).catch(() => null),
      getNextBestActions(clientId, `${client.first_name} ${client.last_name}`).catch(() => []),
      getInsurancePolicies({ clientId }).catch(() => []),
      getCreditCases({ clientId }).catch(() => []),
      getRequests({ buyerId: clientId }).catch(() => []),
      getViewings({ clientId }).catch(() => []),
      getOpportunities({ clientId }).catch(() => []),
      getOffers({ clientId }).catch(() => []),
    ])
    activities = (actData as ActivityRow[]) || []
    documents = (docData as DocumentRow[]) || []
    folders = (foldData as DocumentFolderRow[]) || []
    health = healthData
    recommendations = recData || []
    clientPolicies = polData || []
    clientCreditCases = credData || []
    clientRequests = reqData || []
    clientViewings = viewData || []
    clientOpportunities = opData || []
    clientOffers = offData || []
  } catch (err) {
    console.error('Error loading client related data:', err)
  }

  const relationships = client.client_relationships || []
  const primaryRelationship = relationships.find((r) => r.is_primary)

  return (
    <PrivateLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-bold text-base flex items-center justify-center shadow-xs">
              {client.first_name?.[0]}{client.last_name?.[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  {client.first_name} {client.last_name}
                </h1>
                <Badge
                  variant={client.status === 'ACTIVE' ? 'success' : client.status === 'INACTIVE' ? 'default' : 'danger'}
                  size="sm"
                >
                  {client.status}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">ID: {client.id}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {client.phone && (
              <a href={`tel:${client.phone}`}>
                <Button size="sm" variant="outline">📞 Call</Button>
              </a>
            )}
            {client.whatsapp && (
              <a
                href={`https://wa.me/${client.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="sm" variant="outline">💬 WhatsApp</Button>
              </a>
            )}
            {client.email && (
              <a href={`mailto:${client.email}`}>
                <Button size="sm" variant="outline">✉️ Email</Button>
              </a>
            )}
          </div>
        </div>

        {/* 360 Overview Summary Card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Relationship Status
            </span>
            <p className="text-sm font-bold text-slate-900 mt-1 capitalize">
              {primaryRelationship?.relationship_type || 'General Contact'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{relationships.length} active roles</p>
          </Card>

          <Card className="p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Health Status
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span>{health ? getHealthIcon(health.status as RelationshipHealth) : '⚪'}</span>
              <span className="text-sm font-bold text-slate-900 capitalize">
                {health?.status ? health.status.toLowerCase().replace('_', ' ') : 'Active'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 truncate">{health?.reason || 'Regular contact cadence'}</p>
          </Card>

          <Card className="p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Preferred Channel
            </span>
            <p className="text-sm font-bold text-slate-900 mt-1 capitalize">
              {client.preferred_communication || 'WhatsApp'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Primary channel</p>
          </Card>

          <Card className="p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Lead Source
            </span>
            <p className="text-sm font-bold text-slate-900 mt-1 capitalize">
              {client.lead_source || 'Direct Contact'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Attribution</p>
          </Card>
        </div>

        {/* Next Best Action Engine Recommendations */}
        {recommendations.length > 0 && (
          <Card className="border-blue-200 bg-blue-50/40 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Next Best Action Engine
                </h3>
              </div>
              <span className="text-xs text-blue-700 font-medium">Deterministic Rule Match</span>
            </div>
            <div className="space-y-2">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-white border border-blue-200/80 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-900">{rec.title}</p>
                      <Badge variant={rec.priority === 'URGENT' ? 'danger' : 'info'} size="sm">
                        {rec.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{rec.reason}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {rec.actions.map((act) => (
                      <Button key={act} size="sm" variant="outline">
                        {act}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Main Details & Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Client Details */}
          <div className="space-y-6">
            <Card>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 mb-4">
                Contact &amp; Identity
              </h3>
              <dl className="space-y-3 text-xs">
                <div>
                  <dt className="text-slate-500 font-medium">First &amp; Last Name</dt>
                  <dd className="text-slate-900 font-semibold mt-0.5">{client.first_name} {client.last_name}</dd>
                </div>
                {client.phone && (
                  <div>
                    <dt className="text-slate-500 font-medium">Phone</dt>
                    <dd className="text-slate-900 font-semibold mt-0.5 font-mono">{client.phone}</dd>
                  </div>
                )}
                {client.whatsapp && (
                  <div>
                    <dt className="text-slate-500 font-medium">WhatsApp</dt>
                    <dd className="text-slate-900 font-semibold mt-0.5 font-mono">{client.whatsapp}</dd>
                  </div>
                )}
                {client.email && (
                  <div>
                    <dt className="text-slate-500 font-medium">Email</dt>
                    <dd className="text-slate-900 font-semibold mt-0.5">{client.email}</dd>
                  </div>
                )}
                {client.address && (
                  <div>
                    <dt className="text-slate-500 font-medium">Address</dt>
                    <dd className="text-slate-900 font-semibold mt-0.5">{client.address}, {client.city || 'Bucharest'}</dd>
                  </div>
                )}
                {client.personal_notes && (
                  <div>
                    <dt className="text-slate-500 font-medium">Internal Notes</dt>
                    <dd className="text-slate-800 bg-slate-50 p-2.5 rounded-lg mt-1 whitespace-pre-wrap">{client.personal_notes}</dd>
                  </div>
                )}
              </dl>
            </Card>

            <Card>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 mb-4">
                Record New Activity
              </h3>
              <ActivityForm clientId={clientId} />
            </Card>
          </div>

          {/* Right Column: Portfolio Widgets, Activity Timeline & Document Vault */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Deals & Opportunities Pipeline Card */}
            <Card>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Deals &amp; Opportunities ({clientOpportunities.length})
                  </h3>
                </div>
                <Link href="/admin/opportunities/new" className="text-xs text-blue-600 hover:underline">
                  + New Deal
                </Link>
              </div>

              {clientOpportunities.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center">
                  No active deal opportunities logged for this client.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {clientOpportunities.map((op) => (
                    <div
                      key={op.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between font-semibold text-slate-900">
                        <span className="line-clamp-1">{op.title}</span>
                        <Badge size="sm" variant="info">
                          {op.stage}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-bold text-emerald-700">
                          {op.value ? `€${Number(op.value).toLocaleString()}` : '—'}
                        </span>
                        <span>{op.probability}% probability</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Client Offers & Proposals Card */}
            <Card>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <Handshake className="w-4 h-4 text-amber-600" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Offers &amp; Proposals ({clientOffers.length})
                  </h3>
                </div>
                <Link href="/admin/offers/new" className="text-xs text-blue-600 hover:underline">
                  + Submit Offer
                </Link>
              </div>

              {clientOffers.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center">
                  No property purchase proposals recorded for this client.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {clientOffers.map((off) => (
                    <div
                      key={off.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between font-semibold text-slate-900">
                        <span className="line-clamp-1">{off.property?.title || 'Target Property'}</span>
                        <Badge
                          size="sm"
                          variant={off.status === 'ACCEPTED' ? 'success' : off.status === 'REJECTED' ? 'danger' : 'warning'}
                        >
                          {off.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-bold text-slate-900">
                          €{Number(off.offer_amount).toLocaleString()}
                        </span>
                        <span>{new Date(off.offer_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Client Insurance Portfolio Card */}
            <Card>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Insurance Portfolio ({clientPolicies.length})
                  </h3>
                </div>
                <Link href="/admin/insurance/new" className="text-xs text-blue-600 hover:underline">
                  + Add Policy
                </Link>
              </div>

              {clientPolicies.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center">
                  No active insurance policies registered for this client.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {clientPolicies.map((p) => (
                    <Link
                      key={p.id}
                      href={`/admin/insurance/${p.id}`}
                      className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/80 transition block text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between font-semibold text-slate-900">
                        <span>{p.product} ({p.insurer})</span>
                        <Badge size="sm" variant={p.status === 'ACTIVE' ? 'success' : 'warning'}>
                          {p.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>{p.premium ? `${Number(p.premium).toLocaleString()} ${p.currency}` : 'N/A'}</span>
                        <span>Exp: {p.expiry_date}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Card>

            {/* Client Financing & Credit Cases Card */}
            <Card>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Credit &amp; Mortgage Cases ({clientCreditCases.length})
                  </h3>
                </div>
                <Link href="/admin/credit/new" className="text-xs text-blue-600 hover:underline">
                  + Open Case
                </Link>
              </div>

              {clientCreditCases.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center">
                  No credit or mortgage cases open for this client.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {clientCreditCases.map((c) => (
                    <Link
                      key={c.id}
                      href={`/admin/credit/${c.id}`}
                      className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/80 transition block text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between font-semibold text-slate-900">
                        <span className="line-clamp-1">{c.purpose}</span>
                        <Badge size="sm" variant="info">
                          {c.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-bold text-emerald-600">
                          {Number(c.amount).toLocaleString()} {c.currency}
                        </span>
                        <span>{c.institution || 'Partner Bank'}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Card>

            {/* Client Buyer Requests Card */}
            <Card>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-purple-600" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Real Estate Buyer Searches ({clientRequests.length})
                  </h3>
                </div>
                <Link href="/admin/requests/new" className="text-xs text-blue-600 hover:underline">
                  + Add Request
                </Link>
              </div>

              {clientRequests.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center">
                  No active buyer search profiles for this client.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {clientRequests.map((r) => (
                    <Link
                      key={r.id}
                      href={`/admin/requests/${r.id}`}
                      className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/80 transition block text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between font-semibold text-slate-900">
                        <span className="line-clamp-1">{r.title}</span>
                        <Badge size="sm" variant={r.status === 'ACTIVE' ? 'success' : 'warning'}>
                          {r.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>
                          {r.budget_max ? `Up to ${r.budget_max.toLocaleString()} ${r.currency}` : 'Flexible'}
                        </span>
                        <span className="capitalize">{r.property_type || 'Any type'}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Card>

            {/* Client Property Viewings Card */}
            <Card>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Property Viewings ({clientViewings.length})
                  </h3>
                </div>
                <Link href="/admin/viewings" className="text-xs text-blue-600 hover:underline">
                  + Schedule Viewing
                </Link>
              </div>

              {clientViewings.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center">
                  No property viewings recorded for this client.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {clientViewings.map((v) => (
                    <div
                      key={v.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between font-semibold text-slate-900">
                        <span className="line-clamp-1">{v.property?.title || 'Property'}</span>
                        <Badge size="sm" variant={v.status === 'COMPLETED' ? 'success' : 'info'}>
                          {v.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>{new Date(v.date).toLocaleDateString()}</span>
                        {v.interest && <span className="capitalize">{v.interest} interest</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 mb-4">
                Activity Timeline &amp; History
              </h3>
              <ActivityTimeline activities={activities} />
            </Card>

            <Card>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 mb-4">
                Private Document Vault
              </h3>
              <DocumentVault
                clientId={clientId}
                documents={documents}
                folders={folders}
              />
            </Card>
          </div>
        </div>
      </div>
    </PrivateLayout>
  )
}
