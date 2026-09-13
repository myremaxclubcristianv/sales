import React from 'react'
import Link from 'next/link'
import { PrivateLayout } from '@/components/layout/private/PrivateLayout'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { getPropertyById } from '@/lib/db/properties'
import type { Database } from '@/types'

type PropertyFull = Database['public']['Tables']['properties']['Row'] & {
  owner?: { id: string; first_name: string; last_name: string; phone: string | null; email: string | null } | null
  seller?: { id: string; first_name: string; last_name: string; phone: string | null; email: string | null } | null
  media?: Database['public']['Tables']['property_media']['Row'][] | null
  documents?: Database['public']['Tables']['property_documents']['Row'][] | null
}

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminPropertyDetailPage(props: PageProps) {
  const params = await props.params
  const propertyId = params.id

  let property: PropertyFull | null = null
  try {
    const data = await getPropertyById(propertyId)
    property = data as PropertyFull
  } catch (err) {
    console.error('Error loading property by id:', err)
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

  const primaryMedia = property.media?.find((m) => m.is_primary) || property.media?.[0]
  const formattedPrice = property.price
    ? `${property.price.toLocaleString()} ${property.currency}`
    : 'Not Specified'

  return (
    <PrivateLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                {property.title}
              </h1>
              <Badge
                variant={
                  property.property_status === 'PUBLIC'
                    ? 'success'
                    : property.property_status === 'OFF_MARKET'
                    ? 'purple'
                    : 'info'
                }
                size="sm"
              >
                {property.property_status}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              📍 {property.location} · {property.area} · Slug: <span className="font-mono text-slate-700">{property.slug}</span>
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {property.public_visibility && property.property_status === 'PUBLIC' && (
              <a
                href={`/properties/${property.slug}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm">
                  ↗ View Public Page
                </Button>
              </a>
            )}
            <Link href={`/admin/properties`}>
              <Button variant="outline" size="sm">
                ← All Properties
              </Button>
            </Link>
          </div>
        </div>

        {/* Overview Metric Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Asking Price</span>
            <p className="text-base font-bold text-slate-900 mt-1">{formattedPrice}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {property.public_price_visibility ? 'Visible publicly' : 'Confidential (Upon Request)'}
            </p>
          </Card>

          <Card className="p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Dimensions</span>
            <p className="text-base font-bold text-slate-900 mt-1">
              {property.built_area ? `${property.built_area} m² built` : 'N/A'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {property.bedrooms || 0} Beds · {property.bathrooms || 0} Baths
            </p>
          </Card>

          <Card className="p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Availability</span>
            <p className="text-base font-bold text-slate-900 mt-1 capitalize">
              {property.availability || 'Available'}
            </p>
            <p className="text-xs text-emerald-600 font-medium mt-0.5">Active asset</p>
          </Card>

          <Card className="p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Public Status</span>
            <p className="text-base font-bold text-slate-900 mt-1">
              {property.public_visibility ? 'Published' : 'Unpublished'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {property.public_visibility ? 'Portal indexable' : 'Internal only'}
            </p>
          </Card>
        </div>

        {/* 2-Column Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Gallery, Media & Public Description */}
          <div className="lg:col-span-2 space-y-6">
            {/* Primary Media Banner */}
            <Card className="p-0 overflow-hidden">
              <div className="h-64 bg-slate-900 relative flex items-center justify-center">
                {primaryMedia ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${primaryMedia.file_path}`}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-6 text-slate-400">
                    <span className="text-4xl block mb-2">📸</span>
                    <p className="text-sm font-medium">No media uploaded yet</p>
                  </div>
                )}
              </div>

              <div className="p-5">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Public Editorial Description
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {property.description || 'No public description provided.'}
                </p>
              </div>
            </Card>

            {/* Media Gallery Management */}
            <Card>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Property Photos &amp; Media ({property.media?.length || 0})
                </h3>
                <span className="text-xs text-slate-500">Public Bucket</span>
              </div>

              {(!property.media || property.media.length === 0) ? (
                <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-sm font-medium text-slate-600">No photos uploaded for this property.</p>
                  <p className="text-xs text-slate-400 mt-1">High-resolution photography improves portal engagement.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.media.map((item) => (
                    <div
                      key={item.id}
                      className="relative rounded-lg overflow-hidden border border-slate-200 group h-32 bg-slate-900"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${item.file_path}`}
                        alt={item.file_name}
                        className="w-full h-full object-cover"
                      />
                      {item.is_primary && (
                        <div className="absolute top-2 left-2">
                          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-600 text-white rounded">
                            Primary
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Private Property Documents Vault */}
            <Card>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Private Property Documents Vault
                  </h3>
                  <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                    Confidential
                  </span>
                </div>
                <span className="text-xs text-slate-500">Private Bucket</span>
              </div>

              {(!property.documents || property.documents.length === 0) ? (
                <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-sm font-medium text-slate-600">No private documents uploaded.</p>
                  <p className="text-xs text-slate-400 mt-1">Store cadastral plans, deeds, mandate contracts, and energy certificates privately.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {property.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-200/80 bg-slate-50/50"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">📁</span>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{doc.file_name}</p>
                          <p className="text-[10px] text-slate-500 capitalize">{doc.category || 'Legal'}</p>
                        </div>
                      </div>
                      <Badge variant="outline" size="sm">Private</Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Right Col: Owner & Confidential Financial Valuation */}
          <div className="space-y-6">
            {/* Owner Details Card */}
            <Card className="border-amber-200/80 bg-amber-50/20">
              <div className="flex items-center justify-between pb-3 border-b border-amber-200 mb-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Owner &amp; Seller Relationship
                </h3>
                <span className="text-[10px] font-mono text-amber-800 font-bold">Confidential</span>
              </div>

              {property.owner ? (
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-500 font-medium">Owner Name</span>
                    <Link
                      href={`/admin/clients/${property.owner.id}`}
                      className="block text-sm font-bold text-blue-600 hover:underline mt-0.5"
                    >
                      {property.owner.first_name} {property.owner.last_name} →
                    </Link>
                  </div>
                  {property.owner.phone && (
                    <div>
                      <span className="text-slate-500 font-medium">Phone</span>
                      <p className="font-semibold text-slate-900 font-mono mt-0.5">{property.owner.phone}</p>
                    </div>
                  )}
                  {property.owner.email && (
                    <div>
                      <span className="text-slate-500 font-medium">Email</span>
                      <p className="font-semibold text-slate-900 mt-0.5">{property.owner.email}</p>
                    </div>
                  )}
                  <div className="pt-2 flex gap-2">
                    {property.owner.phone && (
                      <a href={`tel:${property.owner.phone}`} className="flex-1">
                        <Button size="sm" variant="outline" className="w-full">Call Owner</Button>
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-xs text-slate-500">
                  <p>No client assigned as owner.</p>
                </div>
              )}
            </Card>

            {/* Confidential Valuation & Commission */}
            <Card className="border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 mb-4">
                Internal Valuation &amp; Terms
              </h3>
              <dl className="space-y-3 text-xs">
                <div>
                  <dt className="text-slate-500 font-medium">Minimum Reserve Price</dt>
                  <dd className="text-sm font-bold text-rose-600 mt-0.5">
                    {property.minimum_internal_price
                      ? `${property.minimum_internal_price.toLocaleString()} ${property.currency}`
                      : 'Not Defined'}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500 font-medium">Agency Commission</dt>
                  <dd className="text-sm font-bold text-slate-900 mt-0.5">
                    {property.commission
                      ? `${property.commission.toLocaleString()} ${property.currency}`
                      : property.commission_percentage
                      ? `${property.commission_percentage}%`
                      : 'Standard Mandate'}
                  </dd>
                </div>
                {property.internal_notes && (
                  <div>
                    <dt className="text-slate-500 font-medium">Confidential Internal Notes</dt>
                    <dd className="text-slate-800 bg-slate-50 p-2.5 rounded-lg mt-1 whitespace-pre-wrap">
                      {property.internal_notes}
                    </dd>
                  </div>
                )}
              </dl>
            </Card>
          </div>
        </div>
      </div>
    </PrivateLayout>
  )
}
