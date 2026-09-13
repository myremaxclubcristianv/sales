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
import { calculateRelationshipHealth, getHealthIcon, type RelationshipHealth } from '@/lib/utils/relationship-health'
import { getNextBestActions } from '@/lib/utils/next-best-action'
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
    const [actData, docData, foldData, healthData, recData] = await Promise.all([
      getClientActivities(clientId).catch(() => []),
      getClientDocuments(clientId).catch(() => []),
      getClientDocumentFolders(clientId).catch(() => []),
      calculateRelationshipHealth(clientId).catch(() => null),
      getNextBestActions(clientId, `${client.first_name} ${client.last_name}`).catch(() => []),
    ])
    activities = (actData as ActivityRow[]) || []
    documents = (docData as DocumentRow[]) || []
    folders = (foldData as DocumentFolderRow[]) || []
    health = healthData
    recommendations = recData || []
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

          {/* Right Column: Activity Timeline & Document Vault */}
          <div className="lg:col-span-2 space-y-6">
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
