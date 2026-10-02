import { PrivateLayout } from '@/components/layout/private/PrivateLayout'
import { getInsuranceClients } from '@/lib/db/insurance-isolated'
import { InsuranceClientsView } from './InsuranceClientsView'

export const dynamic = 'force-dynamic'

export default async function InsuranceClientsPage() {
  const { clients } = await getInsuranceClients()

  return (
    <PrivateLayout>
      <div className="max-w-7xl mx-auto pb-12">
        <InsuranceClientsView initialClients={clients} />
      </div>
    </PrivateLayout>
  )
}
