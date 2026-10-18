import { notFound } from 'next/navigation'
import { PrivateLayout } from '@/components/layout/private/PrivateLayout'
import {
  getInsuranceCompanyById,
  getInsuranceCompanyActivities,
} from '@/lib/db/insurance-companies'
import { CompanyDetailClient } from './CompanyDetailClient'

export const dynamic = 'force-dynamic'

export default async function InsuranceCompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const company = await getInsuranceCompanyById(id)

  if (!company) {
    notFound()
  }

  const activities = await getInsuranceCompanyActivities(id)

  return (
    <PrivateLayout>
      <div className="max-w-7xl mx-auto pb-16">
        <CompanyDetailClient
          initialCompany={company}
          initialActivities={activities}
        />
      </div>
    </PrivateLayout>
  )
}
