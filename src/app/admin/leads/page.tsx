import { getLeads } from '@/lib/db/leads'
import { PrivateLayout } from '@/components/layout/private/PrivateLayout'
import { LeadsManager, type LeadItem } from './LeadsManager'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{
    status?: string
    source?: string
    campaign_id?: string
  }>
}

export default async function AdminLeadsPage(props: PageProps) {
  const searchParams = await props.searchParams
  const leads = await getLeads({
    status: searchParams.status,
    source: searchParams.source,
    campaignId: searchParams.campaign_id,
  })

  return (
    <PrivateLayout>
      <div className="max-w-7xl mx-auto">
        <LeadsManager initialLeads={leads as unknown as LeadItem[]} />
      </div>
    </PrivateLayout>
  )
}
