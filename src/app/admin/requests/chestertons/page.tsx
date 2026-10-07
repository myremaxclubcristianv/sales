import { PrivateLayout } from '@/components/layout/private/PrivateLayout'
import { getChestertonsRequests, getChestertonsMetrics } from '@/lib/db/chestertons-requests'
import { ChestertonsRequestsView } from './ChestertonsRequestsView'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Cereri Chestertons | CRM Real Estate',
  description: 'Cereri imobiliare Chestertons importate — 38 coloane, zero pierdere date',
}

export default async function ChestertonsRequestsPage() {
  const { requests } = await getChestertonsRequests({ pageSize: 300 })
  const metrics = await getChestertonsMetrics()

  return (
    <PrivateLayout>
      <div className="max-w-7xl mx-auto pb-12">
        <ChestertonsRequestsView initialRequests={requests} metrics={metrics} />
      </div>
    </PrivateLayout>
  )
}
