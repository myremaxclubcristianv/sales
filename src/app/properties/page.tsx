import React from 'react'
import Link from 'next/link'
import { PublicLayout } from '@/components/layout/public/PublicLayout'
import { getPublicProperties, type PropertyFilterParams } from '@/lib/db/properties'
import type { Database } from '@/types'

type PublicPropertyItem = {
  id: string
  title: string
  slug: string
  type: string
  location: string
  area: string
  neighborhood: string | null
  bedrooms: number | null
  bathrooms: number | null
  rooms: number | null
  built_area: number | null
  land_area: number | null
  price: number | null
  currency: 'EUR' | 'USD' | 'RON'
  property_status: string
  availability: string | null
  description: string | null
  features: Record<string, unknown> | null
  public_price_visibility: boolean
  public_location_visibility: boolean
  created_at: string
  media: Database['public']['Tables']['property_media']['Row'][] | null
}

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{
    type?: string
    location?: string
    minPrice?: string
    maxPrice?: string
    bedrooms?: string
  }>
}

export default async function PublicPropertiesPage(props: PageProps) {
  const searchParams = await props.searchParams
  const type = searchParams?.type || ''
  const location = searchParams?.location || ''
  const minPrice = searchParams?.minPrice ? parseFloat(searchParams.minPrice) : undefined
  const maxPrice = searchParams?.maxPrice ? parseFloat(searchParams.maxPrice) : undefined
  const bedrooms = searchParams?.bedrooms ? parseInt(searchParams.bedrooms, 10) : undefined

  const filterParams: PropertyFilterParams = {
    type: type || undefined,
    location: location || undefined,
    minPrice,
    maxPrice,
    bedrooms,
  }

  let properties: PublicPropertyItem[] = []
  try {
    const data = await getPublicProperties(filterParams)
    properties = (data as unknown as PublicPropertyItem[]) || []
  } catch (err) {
    console.error('Error loading public properties:', err)
  }

  return (
    <PublicLayout>
      <div className="bg-slate-50 border-b border-slate-200/80 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Curated Portfolio
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-slate-950 mt-2">
              Featured Properties &amp; Estates
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
              Explore our vetted collection of prime residential properties, penthouses, and private estates across premium locations.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Search & Filter Matrix */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs mb-10">
          <form method="GET" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <input
              type="text"
              name="location"
              placeholder="Location or neighborhood..."
              defaultValue={location}
              className="px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            />

            <select
              name="type"
              defaultValue={type}
              className="px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 bg-white"
            >
              <option value="">All Property Types</option>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="villa">Villa</option>
              <option value="land">Land</option>
              <option value="commercial">Commercial</option>
              <option value="office">Office</option>
            </select>

            <select
              name="bedrooms"
              defaultValue={bedrooms?.toString() || ''}
              className="px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 bg-white"
            >
              <option value="">Any Bedrooms</option>
              <option value="1">1+ Bedrooms</option>
              <option value="2">2+ Bedrooms</option>
              <option value="3">3+ Bedrooms</option>
              <option value="4">4+ Bedrooms</option>
            </select>

            <input
              type="number"
              name="maxPrice"
              placeholder="Max Price (€)"
              defaultValue={maxPrice?.toString() || ''}
              className="px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            />

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-slate-950 text-white rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Search
              </button>
              {(type || location || minPrice || maxPrice || bedrooms) && (
                <Link
                  href="/properties"
                  className="px-3 py-2.5 text-xs text-slate-600 hover:text-slate-950 border border-slate-200 rounded-lg transition-colors whitespace-nowrap"
                >
                  Reset
                </Link>
              )}
            </div>
          </form>
        </div>

        {/* Listings Output */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Showing {properties.length} Available Listing{properties.length === 1 ? '' : 's'}
          </p>
        </div>

        {properties.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <span className="text-4xl block mb-3">🏡</span>
            <h3 className="font-serif text-xl font-bold text-slate-900">No Listings Match Your Search</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
              We frequently handle confidential off-market assets that are not listed publicly. Contact our private advisory desk for bespoke placements.
            </p>
            <Link
              href="/contact"
              className="inline-block mt-6 px-6 py-2.5 bg-slate-950 text-white text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-slate-800 transition-colors"
            >
              Inquire About Off-Market Properties
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((prop) => {
              const primaryMedia = prop.media?.find((m) => m.is_primary) || prop.media?.[0]
              const displayPrice = prop.public_price_visibility && prop.price
                ? `${prop.price.toLocaleString()} ${prop.currency}`
                : 'Price Upon Request'

              return (
                <Link
                  key={prop.id}
                  href={`/properties/${prop.slug}`}
                  className="group block bg-white rounded-2xl border border-slate-200/80 overflow-hidden hover:border-slate-300 hover:shadow-lg transition-all duration-200 flex flex-col"
                >
                  <div className="relative h-64 bg-slate-950 overflow-hidden flex items-center justify-center text-slate-500">
                    {primaryMedia ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${primaryMedia.file_path}`}
                        alt={prop.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <span className="text-4xl block mb-1">🏛️</span>
                        <span className="text-xs text-slate-400">Exclusive Representation</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 text-[11px] font-semibold bg-white/95 text-slate-900 rounded-md backdrop-blur-xs uppercase tracking-wider">
                        {prop.type}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {prop.area} · {prop.public_location_visibility ? prop.location : 'Prime Location'}
                      </p>
                      <h3 className="font-serif text-lg font-bold text-slate-950 group-hover:text-blue-600 transition-colors mt-1 line-clamp-1">
                        {prop.title}
                      </h3>

                      <div className="flex items-center gap-4 text-xs text-slate-600 mt-4 pt-4 border-t border-slate-100">
                        {prop.bedrooms && (
                          <span className="flex items-center gap-1">
                            <span className="font-bold text-slate-900">{prop.bedrooms}</span> Beds
                          </span>
                        )}
                        {prop.bathrooms && (
                          <span className="flex items-center gap-1">
                            <span className="font-bold text-slate-900">{prop.bathrooms}</span> Baths
                          </span>
                        )}
                        {prop.built_area && (
                          <span className="flex items-center gap-1">
                            <span className="font-bold text-slate-900">{prop.built_area}</span> m²
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="font-serif text-base font-bold text-slate-950">{displayPrice}</span>
                      <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                        Explore →
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </PublicLayout>
  )
}
