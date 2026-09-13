import React from 'react'
import Link from 'next/link'
import { PrivateLayout } from '@/components/layout/private/PrivateLayout'
import { Button } from '@/components/ui/Button'
import { getClientById } from '@/lib/db/clients'
import { getClientActivities } from '@/lib/db/activities'
import { getClientDocuments, getClientDocumentFolders } from '@/lib/db/documents'
import { getInsurancePolicies, getInsuranceOpportunities } from '@/lib/db/insurance'
import { getClientFollowUps } from '@/lib/db/follow-ups'
import { getRequests } from '@/lib/db/requests'
import { getOpportunities } from '@/lib/db/opportunities'
import { calculateRelationshipHealth } from '@/lib/utils/relationship-health'
import { getNextBestActions } from '@/lib/utils/next-best-action'
import { ClientWorkspaceTabs } from './ClientWorkspaceTabs'
import type { Database } from '@/types'

type ClientDetail = Database['public']['Tables']['clients']['Row'] & {
  client_relationships?: Database['public']['Tables']['client_relationships']['Row'][]
  companies?: { id: string; name: string; email: string | null; phone: string | null } | null
}
type ActivityRow = Database['public']['Tables']['activities']['Row']
type DocumentRow = Database['public']['Tables']['documents']['Row']
type DocumentFolderRow = Database['public']['Tables']['document_folders']['Row']
type PolicyRow = Database['public']['Tables']['insurance_policies']['Row']
type InsuranceOppRow = Database['public']['Tables']['insurance_opportunities']['Row']
type FollowUpRow = Database['public']['Tables']['follow_ups']['Row']
type OpportunityRow = Database['public']['Tables']['opportunities']['Row']
type RequestRow = Database['public']['Tables']['requests']['Row']

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
  let clientPolicies: PolicyRow[] = []
  let clientInsuranceOpps: InsuranceOppRow[] = []
  let clientFollowUps: FollowUpRow[] = []
  let clientRequests: RequestRow[] = []
  let clientOpportunities: OpportunityRow[] = []
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
        <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800">
          <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Client Not Found</h1>
          <p className="text-sm text-neutral-500 mb-6">The requested client record does not exist or has been removed.</p>
          <Link href="/admin/clients">
            <Button size="sm">Return to Clients</Button>
          </Link>
        </div>
      </PrivateLayout>
    )
  }

  try {
    const [actData, docData, foldData, healthData, recData, polData, insOppData, flwData, reqData, opData] = await Promise.all([
      getClientActivities(clientId).catch(() => []),
      getClientDocuments(clientId).catch(() => []),
      getClientDocumentFolders(clientId).catch(() => []),
      calculateRelationshipHealth(clientId).catch(() => null),
      getNextBestActions(clientId, `${client.first_name} ${client.last_name}`).catch(() => []),
      getInsurancePolicies({ clientId }).catch(() => []),
      getInsuranceOpportunities(clientId).catch(() => []),
      getClientFollowUps(clientId).catch(() => []),
      getRequests({ buyerId: clientId }).catch(() => []),
      getOpportunities({ clientId }).catch(() => []),
    ])
    activities = (actData as ActivityRow[]) || []
    documents = (docData as DocumentRow[]) || []
    folders = (foldData as DocumentFolderRow[]) || []
    health = healthData
    recommendations = recData || []
    clientPolicies = (polData as unknown as PolicyRow[]) || []
    clientInsuranceOpps = (insOppData as unknown as InsuranceOppRow[]) || []
    clientFollowUps = (flwData as unknown as FollowUpRow[]) || []
    clientRequests = (reqData as unknown as RequestRow[]) || []
    clientOpportunities = (opData as unknown as OpportunityRow[]) || []
  } catch (err) {
    console.error('Error loading client related data:', err)
  }

  return (
    <PrivateLayout>
      <div className="max-w-7xl mx-auto">
        <ClientWorkspaceTabs
          client={client}
          activities={activities}
          documents={documents}
          folders={folders}
          policies={clientPolicies}
          insuranceOpportunities={clientInsuranceOpps}
          followUps={clientFollowUps}
          opportunities={clientOpportunities}
          requests={clientRequests}
          health={health}
          recommendations={recommendations}
        />
      </div>
    </PrivateLayout>
  )
}
