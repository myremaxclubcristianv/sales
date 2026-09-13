import { notFound } from 'next/navigation'
import { PrivateLayout } from '@/components/layout/private/PrivateLayout'
import { getClientById } from '@/lib/db/clients'
import {
  getInsurancePolicies,
  getInsurancePolicyById,
  getClientVehicles,
  getClientProperties,
  getInsuranceOpportunities,
  getInsuranceClaims
} from '@/lib/db/insurance'
import { getClientActivities } from '@/lib/db/activities'
import { getClientFollowUps } from '@/lib/db/follow-ups'
import { getClientDocuments, getClientDocumentFolders } from '@/lib/db/documents'
import { InsuranceClientWorkspace, WorkspaceTab, ClientData } from './InsuranceClientWorkspace'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}

export const dynamic = 'force-dynamic'

export default async function InsuranceDetailPage(props: PageProps) {
  const { id } = await props.params
  const searchParams = await props.searchParams
  const initialTab = (searchParams.tab as WorkspaceTab) || 'overview'

  let client: ClientData | null = null

  // Try to find as client first
  try {
    const rawClient = await getClientById(id)
    if (rawClient) {
      client = rawClient as unknown as ClientData
    }
  } catch {
    client = null
  }

  // If not a direct client ID, check if it is a policy ID
  if (!client) {
    try {
      const policy = await getInsurancePolicyById(id)
      if (policy && policy.client_id) {
        const rawClient = await getClientById(policy.client_id)
        if (rawClient) {
          client = rawClient as unknown as ClientData
        }
      }
    } catch {
      client = null
    }
  }

  if (!client) {
    notFound()
  }

  // Fetch all related records in parallel
  const [
    policies,
    vehicles,
    properties,
    opportunities,
    claims,
    activities,
    followUps,
    documents,
    folders
  ] = await Promise.all([
    getInsurancePolicies({ clientId: client.id }).catch(() => []),
    getClientVehicles(client.id).catch(() => []),
    getClientProperties(client.id).catch(() => []),
    getInsuranceOpportunities(client.id).catch(() => []),
    getInsuranceClaims(client.id).catch(() => []),
    getClientActivities(client.id).catch(() => []),
    getClientFollowUps(client.id).catch(() => []),
    getClientDocuments(client.id).catch(() => []),
    getClientDocumentFolders(client.id).catch(() => []),
  ])

  return (
    <PrivateLayout>
      <div className="max-w-7xl mx-auto">
        <InsuranceClientWorkspace
          client={client}
          policies={policies}
          vehicles={vehicles}
          properties={properties}
          opportunities={opportunities}
          claims={claims}
          activities={activities}
          followUps={followUps}
          documents={documents}
          folders={folders}
          initialTab={initialTab}
        />
      </div>
    </PrivateLayout>
  )
}
