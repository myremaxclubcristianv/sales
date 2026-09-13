import React from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { PublicLayout } from '@/components/layout/public/PublicLayout'
import { getPublicPropertyBySlug } from '@/lib/db/properties'
import { PropertyInquiryForm } from '@/components/PropertyInquiryForm'
import type { Database } from '@/types'

type PublicPropertyDetail = {
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
  params: Promise<{ slug: string }>
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params
  const data = await getPublicPropertyBySlug(params.slug)
  if (!data) {
    return { title: 'Property Not Found | Văduva & Partners' }
  }

  const prop = data as unknown as PublicPropertyDetail
  const displayPrice = prop.public_price_visibility && prop.price
    ? `${prop.price.toLocaleString()} ${prop.currency}`
    : 'Price Upon Request'

  return {
    title: `${prop.title} | ${prop.area} | Văduva & Partners`,
    description: prop.description
      ? prop.description.slice(0, 160)
      : `Luxury ${prop.type} in ${prop.area}, ${prop.location}. ${displayPrice}.`,
    openGraph: {
      title: `${prop.title} | Văduva & Partners`,
      description: prop.description ? prop.description.slice(0, 160) : undefined,
      type: 'website',
    },
  }
}

export default async function PropertyDetailPage(props: PageProps) {
  const params = await props.params
  const data = await getPublicPropertyBySlug(params.slug)

  if (!data) {
    notFound()
  }

  const prop = data as unknown as PublicPropertyDetail
  const displayPrice = prop.public_price_visibility && prop.price
    ? `${prop.price.toLocaleString()} ${prop.currency}`
    : 'Price Upon Request'

  const mediaList = prop.media || []
  const primaryMedia = mediaList.find((m) => m.is_primary) || mediaList[0]
  const galleryMedia = mediaList.filter((m) => m.id !== primaryMedia?.id)

  return (
    <PublicLayout>
      {/* Breadcrumb Header */}
      <div className="bg-slate-50 border-b border-slate-200/80 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/properties" className="hover:text-slate-900 transition-colors">Properties</Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold truncate max-w-xs">{prop.title}</span>
          </div>

          <Link href="/properties" className="text-blue-600 hover:underline">
            ← All Listings
          </Link>
        </div>
      </div>

      <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Title & Key Spec Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-slate-200">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              {prop.type} · {prop.area}
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-slate-950 mt-1">
              {prop.title}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              📍 {prop.public_location_visibility ? `${prop.location}, ${prop.area}` : prop.area}
            </p>
          </div>

          <div className="lg:text-right">
            <span className="text-xs font-medium text-slate-500 block uppercase tracking-wider">Acquisition Value</span>
            <p className="font-serif text-3xl sm:text-4xl font-bold text-slate-950 mt-0.5">
              {displayPrice}
            </p>
          </div>
        </div>

        {/* Hero Gallery Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 rounded-2xl overflow-hidden bg-slate-950">
          <div className="md:col-span-2 h-96 sm:h-[480px] relative overflow-hidden bg-slate-900 flex items-center justify-center text-slate-400">
            {primaryMedia ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${primaryMedia.file_path}`}
                alt={prop.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-6">
                <span className="text-5xl block mb-2">🏛️</span>
                <span className="text-sm font-medium">Exclusive Private Listing</span>
              </div>
            )}
          </div>

          <div className="hidden md:flex flex-col gap-4 h-[480px]">
            {galleryMedia.slice(0, 2).map((media) => (
              <div key={media.id} className="flex-1 relative overflow-hidden bg-slate-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${media.file_path}`}
                  alt={media.file_name}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {galleryMedia.length < 2 && (
              <div className="flex-1 bg-slate-900 flex items-center justify-center text-slate-500 text-xs font-mono">
                Văduva &amp; Partners Private Collection
              </div>
            )}
          </div>
        </div>

        {/* Main Content & Inquiry Sidebar */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left 2 Cols: Details & Description */}
          <div className="lg:col-span-2 space-y-10">
            {/* Architectural Specifications Grid */}
            <div className="bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-200/80">
              <h2 className="font-serif text-xl font-bold text-slate-950 mb-6">
                Property Specifications
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm">
                <div>
                  <span className="text-xs text-slate-500 block">Property Type</span>
                  <span className="font-semibold text-slate-900 capitalize mt-0.5 block">{prop.type}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Built Surface</span>
                  <span className="font-semibold text-slate-900 mt-0.5 block">
                    {prop.built_area ? `${prop.built_area} m²` : 'Upon Request'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Bedrooms</span>
                  <span className="font-semibold text-slate-900 mt-0.5 block">
                    {prop.bedrooms || 'Custom layout'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Bathrooms</span>
                  <span className="font-semibold text-slate-900 mt-0.5 block">
                    {prop.bathrooms || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Location Zone</span>
                  <span className="font-semibold text-slate-900 mt-0.5 block">{prop.area}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Land Surface</span>
                  <span className="font-semibold text-slate-900 mt-0.5 block">
                    {prop.land_area ? `${prop.land_area} m²` : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Availability</span>
                  <span className="font-semibold text-slate-900 capitalize mt-0.5 block">
                    {prop.availability || 'Immediate'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Representation</span>
                  <span className="font-semibold text-slate-900 mt-0.5 block">Private Exclusive</span>
                </div>
              </div>
            </div>

            {/* Editorial Overview */}
            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-slate-950">
                Architectural &amp; Living Experience
              </h2>
              <div className="prose prose-slate max-w-none text-slate-700 text-base leading-relaxed whitespace-pre-wrap">
                {prop.description || 'Detailed private brochure available upon request through our advisory desk.'}
              </div>
            </div>

            {/* Private Advisory Guarantee */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs flex items-start gap-4">
              <div className="w-10 h-10 bg-slate-950 text-white rounded-xl flex items-center justify-center font-bold flex-shrink-0">
                ★
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-950">Discreet Private Advisory</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Every acquisition and viewing is conducted under strict confidentiality. We provide full cadastral verification, legal diligence, and structured negotiation assistance.
                </p>
              </div>
            </div>
          </div>

          {/* Right Col: Inquiry Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-28">
              <PropertyInquiryForm propertyId={prop.id} propertyTitle={prop.title} />
            </div>
          </div>
        </div>
      </article>
    </PublicLayout>
  )
}
