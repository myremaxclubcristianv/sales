import React from 'react'
import Link from 'next/link'
import { PublicLayout } from '@/components/layout/public/PublicLayout'
import { getPublicProperties } from '@/lib/db/properties'

interface PublicPropertySummary {
  id: string
  title: string
  slug: string
  type: string
  location: string
  area: string
  bedrooms: number | null
  bathrooms: number | null
  built_area: number | null
  price: number | null
  currency: 'EUR' | 'USD' | 'RON'
  public_price_visibility: boolean
  media?: Array<{ id: string; file_path: string; is_primary: boolean }> | null
}

export const dynamic = 'force-dynamic'

export default async function Home() {
  let properties: PublicPropertySummary[] = []
  try {
    properties = (await getPublicProperties()) || []
  } catch (err) {
    console.error('Error loading featured properties:', err)
  }

  const featured = properties.slice(0, 3)

  return (
    <PublicLayout>
      {/* Hero Editorial Section */}
      <section className="relative bg-slate-950 text-white overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-semibold uppercase tracking-widest text-slate-300">
              <span>★</span>
              <span>Private Real Estate &amp; Advisory</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">
              Discreet Real Estate &amp; Capital Placement.
            </h1>

            <p className="text-base sm:text-xl text-slate-300 leading-relaxed max-w-2xl font-light">
              Connecting private individuals and institutional clients with exceptional residential assets, off-market opportunities, and integrated financing.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                href="/properties"
                className="px-8 py-4 bg-white text-slate-950 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-colors text-center shadow-lg"
              >
                Browse Curated Properties
              </Link>
              <Link
                href="/requests"
                className="px-8 py-4 bg-slate-900 text-white border border-slate-700 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-colors text-center"
              >
                Verified Buyer Requests
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Database Derived Metrics Bar */}
      <section className="border-y border-slate-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4">
              <span className="font-serif text-3xl sm:text-4xl font-bold text-slate-950">
                {properties.length}
              </span>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1">
                Active Listed Assets
              </p>
            </div>
            <div className="p-4 border-l border-slate-100">
              <span className="font-serif text-3xl sm:text-4xl font-bold text-slate-950">
                100%
              </span>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1">
                Vetted Legal Title
              </p>
            </div>
            <div className="p-4 border-l border-slate-100">
              <span className="font-serif text-3xl sm:text-4xl font-bold text-slate-950">
                Private
              </span>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1">
                Off-Market Inventory
              </p>
            </div>
            <div className="p-4 border-l border-slate-100">
              <span className="font-serif text-3xl sm:text-4xl font-bold text-slate-950">
                Direct
              </span>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1">
                Broker Mandates
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Exclusive Selection
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-950 mt-1">
              Latest Property Releases
            </h2>
          </div>
          <Link
            href="/properties"
            className="text-xs font-bold uppercase tracking-wider text-blue-600 hover:text-blue-700 inline-flex items-center gap-1.5"
          >
            <span>View All Properties ({properties.length})</span>
            <span>→</span>
          </Link>
        </div>

        {featured.length === 0 ? (
          <div className="py-16 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-base font-semibold text-slate-800">New exclusive listings undergoing onboarding.</p>
            <p className="text-xs text-slate-500 mt-1">Contact our advisory desk to review off-market files directly.</p>
            <Link
              href="/contact"
              className="inline-block mt-4 px-6 py-2.5 bg-slate-950 text-white text-xs font-semibold rounded-lg uppercase tracking-wider"
            >
              Contact Advisory Desk
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featured.map((prop) => {
              const primaryMedia = prop.media?.find((m: { is_primary: boolean }) => m.is_primary) || prop.media?.[0]
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
                      <span className="px-2.5 py-1 text-[11px] font-semibold bg-white/95 text-slate-900 rounded-md uppercase tracking-wider">
                        {prop.type}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {prop.area} · {prop.location}
                      </p>
                      <h3 className="font-serif text-lg font-bold text-slate-950 group-hover:text-blue-600 transition-colors mt-1 line-clamp-1">
                        {prop.title}
                      </h3>

                      <div className="flex items-center gap-4 text-xs text-slate-600 mt-4 pt-4 border-t border-slate-100">
                        {prop.bedrooms && <span><strong className="text-slate-900">{prop.bedrooms}</strong> Beds</span>}
                        {prop.bathrooms && <span><strong className="text-slate-900">{prop.bathrooms}</strong> Baths</span>}
                        {prop.built_area && <span><strong className="text-slate-900">{prop.built_area}</strong> m²</span>}
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
      </section>

      {/* Advisory & Services CTA */}
      <section className="bg-slate-900 text-white py-20 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Confidential Representation
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-2">
            Looking to Acquire or Place a High-Value Asset?
          </h2>
          <p className="text-sm text-slate-300 mt-3 leading-relaxed font-light">
            We operate with absolute discretion. Our advisory team coordinates legal due diligence, financing structures, and off-market matches tailored to your exact profile.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/contact"
              className="px-8 py-3.5 bg-white text-slate-950 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-colors shadow-md"
            >
              Request Private Consultation
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
