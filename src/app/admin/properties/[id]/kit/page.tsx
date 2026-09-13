import React from 'react'
import Link from 'next/link'
import { PrivateLayout } from '@/components/layout/private/PrivateLayout'
import { getPropertyById } from '@/lib/db/properties'
import { Button } from '@/components/ui/Button'
import { MarketingKitClient } from './MarketingKitClient'
import type { Database } from '@/types'

type PropertyFull = Database['public']['Tables']['properties']['Row'] & {
  owner?: { id: string; first_name: string; last_name: string; phone: string | null; email: string | null } | null
  media?: Database['public']['Tables']['property_media']['Row'][] | null
}

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminPropertyMarketingKitPage(props: PageProps) {
  const params = await props.params
  const propertyId = params.id

  let property: PropertyFull | null = null

  try {
    const data = await getPropertyById(propertyId)
    property = data as PropertyFull
  } catch (err) {
    console.error('Error loading property for marketing kit:', err)
  }

  if (!property) {
    return (
      <PrivateLayout>
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <h1 className="text-xl font-bold text-slate-900 mb-2">Property Not Found</h1>
          <p className="text-sm text-slate-500 mb-6">The requested property record does not exist or has been removed.</p>
          <Link href="/admin/properties">
            <Button size="sm">Return to Properties</Button>
          </Link>
        </div>
      </PrivateLayout>
    )
  }

  const portalBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return (
    <PrivateLayout>
      <MarketingKitClient property={property} portalBaseUrl={portalBaseUrl} />
    </PrivateLayout>
  )
}
