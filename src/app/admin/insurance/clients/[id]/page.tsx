import { notFound } from 'next/navigation'
import { PrivateLayout } from '@/components/layout/private/PrivateLayout'
import { getInsuranceClientById } from '@/lib/db/insurance-isolated'
import { InsuranceClientDetailView } from './InsuranceClientDetailView'

interface PageProps {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export default async function InsuranceClientDetailPage(props: PageProps) {
  const { id } = await props.params
  const client = await getInsuranceClientById(id)

  if (!client) {
    notFound()
  }

  return (
    <PrivateLayout>
      <div className="max-w-7xl mx-auto pb-12">
        <InsuranceClientDetailView client={client} />
      </div>
    </PrivateLayout>
  )
}
