import { PrivateLayout } from '@/components/layout/private/PrivateLayout'
import { getAllInsurancePolicies } from '@/lib/db/insurance-isolated'
import { InsuranceExpirationsView } from './InsuranceExpirationsView'

export const dynamic = 'force-dynamic'

export default async function InsuranceExpirationsPage() {
  const policies = await getAllInsurancePolicies()

  return (
    <PrivateLayout>
      <div className="max-w-7xl mx-auto pb-12">
        <InsuranceExpirationsView initialPolicies={policies} />
      </div>
    </PrivateLayout>
  )
}
