import React from 'react'
import Link from 'next/link'
import { PrivateLayout } from '@/components/layout/private/PrivateLayout'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { getProperties, type PropertyFilterParams } from '@/lib/db/properties'
import type { Database } from '@/types'

type PropertyWithRelations = Database['public']['Tables']['properties']['Row'] & {
  owner?: { id: string; first_name: string; last_name: string; phone: string | null; email: string | null } | null
  media?: Database['public']['Tables']['property_media']['Row'][] | null
}

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{
    type?: string
    status?: string
    location?: string
    minPrice?: string
    maxPrice?: string
  }>
}

export default async function AdminPropertiesPage(props: PageProps) {
  const searchParams = await props.searchParams
  const type = searchParams?.type || ''
  const status = searchParams?.status || ''
  const location = searchParams?.location || ''

  const filterParams: PropertyFilterParams = {
    type: type || undefined,
    status: status || undefined,
    location: location || undefined,
  }

  let properties: PropertyWithRelations[] = []
  try {
    const data = await getProperties(filterParams)
    properties = (data as PropertyWithRelations[]) || []
  } catch (err) {
    console.error('Error loading properties:', err)
  }

  const getStatusBadge = (propStatus: string) => {
    switch (propStatus) {
      case 'PUBLIC':
        return <Badge variant="success" size="sm">Public Portal</Badge>
      case 'PRIVATE':
        return <Badge variant="info" size="sm">Private CRM</Badge>
      case 'OFF_MARKET':
        return <Badge variant="purple" size="sm">Off-Market</Badge>
      case 'RESERVED':
        return <Badge variant="warning" size="sm">Reserved</Badge>
      case 'SOLD':
        return <Badge variant="default" size="sm">Sold</Badge>
      default:
        return <Badge variant="default" size="sm">Draft</Badge>
    }
  }

  return (
    <PrivateLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Properties &amp; Listings Portfolio
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Private assets, off-market inventory, and public portal listings with strict data isolation.
            </p>
          </div>
          <Link href="/admin/properties/new">
            <Button size="sm">+ Add New Property</Button>
          </Link>
        </div>

        {/* Filter Controls */}
        <Card className="p-4">
          <form method="GET" className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input
              type="text"
              name="location"
              placeholder="Filter by city, area, neighborhood..."
              defaultValue={location}
              className="px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <select
              name="type"
              defaultValue={type}
              className="px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            >
              <option value="">All Property Types</option>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="villa">Villa</option>
              <option value="land">Land</option>
              <option value="commercial">Commercial</option>
              <option value="office">Office</option>
              <option value="retail">Retail</option>
              <option value="industrial">Industrial</option>
            </select>
            <select
              name="status"
              defaultValue={status}
              className="px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            >
              <option value="">All Visibility Statuses</option>
              <option value="PUBLIC">Public</option>
              <option value="PRIVATE">Private</option>
              <option value="OFF_MARKET">Off-Market</option>
              <option value="RESERVED">Reserved</option>
              <option value="SOLD">Sold</option>
              <option value="DRAFT">Draft</option>
            </select>
            <div className="flex items-center gap-2">
              <Button type="submit" size="sm" className="w-full">
                Apply Filters
              </Button>
              {(type || status || location) && (
                <Link href="/admin/properties">
                  <Button type="button" variant="outline" size="sm">
                    Reset
                  </Button>
                </Link>
              )}
            </div>
          </form>
        </Card>

        {/* Properties Grid */}
        {properties.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200">
            <p className="text-base font-semibold text-slate-800">No properties in portfolio</p>
            <p className="text-xs text-slate-500 mt-1">Add a new property listing or modify your filter criteria.</p>
            <Link href="/admin/properties/new" className="mt-4 inline-block">
              <Button size="sm">+ Create Property Listing</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {properties.map((prop) => {
              const primaryMedia = prop.media?.find((m) => m.is_primary) || prop.media?.[0]
              const formattedPrice = prop.price
                ? `${prop.price.toLocaleString()} ${prop.currency}`
                : 'Price Upon Request'

              return (
                <Link
                  key={prop.id}
                  href={`/admin/properties/${prop.id}`}
                  className="bg-white rounded-xl border border-slate-200/80 hover:border-slate-300 overflow-hidden shadow-2xs hover:shadow-xs transition-all flex flex-col group"
                >
                  <div className="h-44 bg-slate-900 relative overflow-hidden flex items-center justify-center text-slate-400">
                    {primaryMedia ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${primaryMedia.file_path}`}
                        alt={prop.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <span className="text-3xl block mb-1">🏢</span>
                        <span className="text-[11px] text-slate-400">No media uploaded</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      {getStatusBadge(prop.property_status)}
                    </div>
                    {prop.public_visibility && (
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/90 text-white rounded-md backdrop-blur-xs">
                          Live on Portal
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600">
                        {prop.type} · {prop.area}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors mt-0.5 line-clamp-1">
                        {prop.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                        📍 {prop.location}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100">
                        {prop.bedrooms && <span>🛏 {prop.bedrooms} beds</span>}
                        {prop.bathrooms && <span>🚿 {prop.bathrooms} baths</span>}
                        {prop.built_area && <span>📐 {prop.built_area} m²</span>}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900">{formattedPrice}</span>
                      {prop.owner && (
                        <span className="text-[11px] text-slate-500 font-medium">
                          👤 {prop.owner.first_name} {prop.owner.last_name}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </PrivateLayout>
  )
}
