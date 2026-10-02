import { PrivateLayout } from '@/components/layout/private/PrivateLayout'
import { getAllInsurancePolicies } from '@/lib/db/insurance-isolated'
import { InsurancePoliciesView } from './InsurancePoliciesView'

export const dynamic = 'force-dynamic'

export default async function InsurancePoliciesPage() {
  const policies = await getAllInsurancePolicies()

  return (
    <PrivateLayout>
      <div className="max-w-7xl mx-auto pb-12">
        <InsurancePoliciesView initialPolicies={policies} />
      </div>
    </PrivateLayout>
  )
}
