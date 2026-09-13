'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  Copy,
  Check,
  Share2,
  Printer,
  Sparkles,
  Camera,
  Globe,
  MessageCircle,
  ExternalLink,
  ArrowLeft
} from 'lucide-react'
import type { Database } from '@/types'

type PropertyWithMedia = Database['public']['Tables']['properties']['Row'] & {
  media?: Database['public']['Tables']['property_media']['Row'][] | null
  owner?: { id: string; first_name: string; last_name: string; phone: string | null; email: string | null } | null
}

interface MarketingKitClientProps {
  property: PropertyWithMedia
  portalBaseUrl: string
}

export function MarketingKitClient({ property, portalBaseUrl }: MarketingKitClientProps) {
  const [copiedTab, setCopiedTab] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'instagram' | 'linkedin' | 'facebook' | 'whatsapp' | 'sheet'>('instagram')
  const [utmSource, setUtmSource] = useState('instagram')
  const [utmMedium, setUtmMedium] = useState('social')
  const [utmCampaign, setUtmCampaign] = useState('spring_showcase')

  const publicUrl = `${portalBaseUrl}/properties/${property.slug || property.id}`
  const trackedUrl = `${publicUrl}?utm_source=${encodeURIComponent(utmSource)}&utm_medium=${encodeURIComponent(utmMedium)}&utm_campaign=${encodeURIComponent(utmCampaign)}`

  const formattedPrice = property.price
    ? `${property.price.toLocaleString()} ${property.currency}`
    : 'Price on Request'

  // Instagram copy
  const instagramCopy = `✨ EXCLUSIVE LISTING: ${property.title} ✨

📍 Location: ${property.area ? `${property.area}, ` : ''}${property.location}
💰 Price: ${formattedPrice}
📐 Specs: ${property.bedrooms || '—'} Beds • ${property.bathrooms || '—'} Baths • ${property.built_area || '—'} m²

${property.description?.slice(0, 280) || 'An exceptional luxury property offering supreme comfort, prime location, and timeless elegance.'}...

🔑 Key Highlights:
• Prime location in ${property.area || property.location}
• Total Area: ${property.built_area ? `${property.built_area} m²` : 'Spacious layout'}
• Status: Verified & Ready for viewing

📩 DM us or click the link in bio for private walkthrough & floor plans:
🔗 ${publicUrl}

#RealEstate #${property.location.replace(/\s+/g, '')}RealEstate #LuxuryHomes #PropertyForSale #DreamHome #Architecture #InvestmentProperty #ExclusiveListing`

  // LinkedIn copy
  const linkedinCopy = `🏢 INVESTMENT OPPORTUNITY: ${property.title}

We are pleased to introduce a prime ${property.type.toLowerCase()} asset in ${property.location}${property.area ? ` (${property.area})` : ''}.

Summary Specifications:
• Asset Value: ${formattedPrice}
• Usable Surface: ${property.built_area ? `${property.built_area} m²` : 'N/A'}
• Rooms & Layout: ${property.bedrooms || 0} Beds / ${property.bathrooms || 0} Baths

${property.description?.slice(0, 320) || 'Positioned in a high-demand sector with consistent capital appreciation and strong rental yield fundamentals.'}

For accredited investor inquiries, due diligence package, or to schedule a private acquisition viewing:
👉 Detailed portal dossier: ${publicUrl}

#CommercialRealEstate #RealEstateInvestment #AssetManagement #RealEstate #PropertyInvestment #${property.location.replace(/\s+/g, '')}`

  // Facebook copy
  const facebookCopy = `🏡 NEW ON THE MARKET: ${property.title}

Discover this remarkable ${property.type.toLowerCase()} situated in ${property.area ? `${property.area}, ` : ''}${property.location}.

✨ Overview:
• Price: ${formattedPrice}
• Size: ${property.built_area || '—'} m²
• Bedrooms: ${property.bedrooms || '—'} | Bathrooms: ${property.bathrooms || '—'}
• Location: ${property.neighborhood ? `${property.neighborhood}, ` : ''}${property.location}

${property.description || 'Step inside this beautifully appointed residence designed for modern luxury living.'}

Interested in taking a tour? Send us a direct message or explore high-definition photos and schedule a private viewing online:
👇 View Full Gallery & Floorplan:
${publicUrl}`

  // WhatsApp / Telegram Broadcast copy
  const whatsappCopy = `🚨 *EXCLUSIVE PROPERTY ALERT* 🚨

*${property.title}*
📍 *Location:* ${property.area ? `${property.area}, ` : ''}${property.location}
💰 *Price:* ${formattedPrice}
📐 *Size:* ${property.built_area || '—'} m² | ${property.bedrooms || 0} Beds | ${property.bathrooms || 0} Baths

${property.description?.slice(0, 160) || 'High-end property with top-tier finishes and premium positioning.'}...

📲 *Direct Portal Link:*
${publicUrl}

Reply directly to this message to book an immediate private viewing.`

  const copyToClipboard = async (text: string, tabKey: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedTab(tabKey)
      setTimeout(() => setCopiedTab(null), 2500)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  const primaryMedia = property.media?.find(m => m.is_primary) || property.media?.[0]
  const primaryImageUrl = primaryMedia
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${primaryMedia.file_path}`
    : null

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href={`/admin/properties/${property.id}`}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Property 360
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Sparkles className="w-7 h-7 text-blue-600" />
            Marketing &amp; Social Kit
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Multi-channel campaign generator, custom copy presets, tracked UTM links, and client presentation sheet for <strong className="text-slate-700">{property.title}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" /> Print Spec Sheet
          </Button>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="sm" className="flex items-center gap-1.5">
              <ExternalLink className="w-4 h-4" /> View Public Page
            </Button>
          </a>
        </div>
      </div>

      {/* Tabs Navigation (Screen Only) */}
      <div className="border-b border-slate-200 print:hidden">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab('instagram')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'instagram'
                ? 'border-pink-600 text-pink-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Camera className="w-4 h-4" /> Instagram Post
          </button>
          <button
            onClick={() => setActiveTab('linkedin')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'linkedin'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="w-4 h-4" /> LinkedIn Brief
          </button>
          <button
            onClick={() => setActiveTab('facebook')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'facebook'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Share2 className="w-4 h-4" /> Facebook Listing
          </button>
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'whatsapp'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageCircle className="w-4 h-4" /> WhatsApp / Telegram
          </button>
          <button
            onClick={() => setActiveTab('sheet')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'sheet'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Printer className="w-4 h-4" /> Client Dossier Sheet
          </button>
        </nav>
      </div>

      {/* UTM Campaign Link Builder */}
      <Card className="p-4 bg-slate-900 text-white border-slate-800 print:hidden">
        <div className="flex items-center gap-2 mb-3">
          <Share2 className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-bold text-white">Campaign Lead Attribution Link Builder (UTM Tracked)</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">UTM Source</label>
            <input
              type="text"
              value={utmSource}
              onChange={(e) => setUtmSource(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-blue-500"
              placeholder="e.g. instagram, linkedin, newsletter"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">UTM Medium</label>
            <input
              type="text"
              value={utmMedium}
              onChange={(e) => setUtmMedium(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-blue-500"
              placeholder="e.g. social, cpc, email"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">UTM Campaign</label>
            <input
              type="text"
              value={utmCampaign}
              onChange={(e) => setUtmCampaign(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-blue-500"
              placeholder="e.g. spring_exclusive, luxury_october"
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-800 p-2.5 rounded-lg border border-slate-700">
          <span className="text-xs text-slate-300 font-mono flex-1 truncate select-all">
            {trackedUrl}
          </span>
          <Button
            size="sm"
            onClick={() => copyToClipboard(trackedUrl, 'utm')}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs whitespace-nowrap flex items-center gap-1.5"
          >
            {copiedTab === 'utm' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" /> Copied Tracked Link!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy Tracked Link
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* TAB CONTENT: Social Copy */}
      {activeTab !== 'sheet' && (
        <Card className="p-6 bg-white border-slate-200 print:hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {activeTab === 'instagram' && <Camera className="w-5 h-5 text-pink-600" />}
              {activeTab === 'linkedin' && <Globe className="w-5 h-5 text-blue-700" />}
              {activeTab === 'facebook' && <Share2 className="w-5 h-5 text-blue-600" />}
              {activeTab === 'whatsapp' && <MessageCircle className="w-5 h-5 text-emerald-600" />}
              <h2 className="text-base font-bold text-slate-900 capitalize">
                {activeTab} Optimized Copy &amp; Formatting
              </h2>
            </div>
            <Button
              size="sm"
              onClick={() => {
                const text =
                  activeTab === 'instagram'
                    ? instagramCopy
                    : activeTab === 'linkedin'
                    ? linkedinCopy
                    : activeTab === 'facebook'
                    ? facebookCopy
                    : whatsappCopy
                copyToClipboard(text, activeTab)
              }}
              className="flex items-center gap-1.5"
            >
              {copiedTab === activeTab ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" /> Copied to Clipboard!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copy Entire Copy
                </>
              )}
            </Button>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5">
            <pre className="whitespace-pre-wrap font-sans text-sm text-slate-800 leading-relaxed">
              {activeTab === 'instagram' && instagramCopy}
              {activeTab === 'linkedin' && linkedinCopy}
              {activeTab === 'facebook' && facebookCopy}
              {activeTab === 'whatsapp' && whatsappCopy}
            </pre>
          </div>
        </Card>
      )}

      {/* CLIENT SPEC SHEET / EDITORIAL DOSSIER (Always visible when tab active or in Print mode) */}
      <div className={`${activeTab === 'sheet' ? 'block' : 'hidden print:block'}`}>
        <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 shadow-sm max-w-4xl mx-auto print:border-none print:shadow-none print:p-0">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-6 mb-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-blue-600 font-bold">
                Luxury Real Estate Portfolio • Private Presentation
              </span>
              <h1 className="text-3xl font-extrabold text-slate-900 mt-1">{property.title}</h1>
              <p className="text-sm text-slate-500 mt-1">
                {property.neighborhood ? `${property.neighborhood}, ` : ''}{property.area ? `${property.area}, ` : ''}{property.location}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 font-mono block">LIST PRICE</span>
              <span className="text-2xl font-black text-slate-900">{formattedPrice}</span>
              <Badge variant="info" className="mt-1">{property.property_status}</Badge>
            </div>
          </div>

          {/* Primary Photo Showcase */}
          {primaryImageUrl && (
            <div className="mb-8 rounded-xl overflow-hidden aspect-video bg-slate-100 border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={primaryImageUrl}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Key Specifications Table */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <span className="text-[11px] text-slate-500 uppercase font-mono block">Built Surface</span>
              <span className="text-base font-bold text-slate-900">{property.built_area ? `${property.built_area} m²` : '—'}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 uppercase font-mono block">Bedrooms / Baths</span>
              <span className="text-base font-bold text-slate-900">{property.bedrooms || 0} Bed / {property.bathrooms || 0} Bath</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 uppercase font-mono block">Property Type</span>
              <span className="text-base font-bold text-slate-900 capitalize">{property.type}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 uppercase font-mono block">Land Area</span>
              <span className="text-base font-bold text-slate-900">{property.land_area ? `${property.land_area} m²` : 'N/A'}</span>
            </div>
          </div>

          {/* Property Description */}
          <div className="mb-8">
            <h3 className="text-base font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2">Property Overview</h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {property.description || 'Exclusive luxury residence crafted with superior materials, panoramic vistas, and refined architectural balance.'}
            </p>
          </div>

          {/* Image Gallery */}
          {property.media && property.media.length > 1 && (
            <div className="mb-8">
              <h3 className="text-base font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2">Photo Gallery</h3>
              <div className="grid grid-cols-3 gap-3">
                {property.media.slice(1, 4).map((m, idx) => (
                  <div key={idx} className="aspect-4/3 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${m.file_path}`}
                      alt={`Gallery ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Contact & Verification */}
          <div className="border-t border-slate-200 pt-6 flex items-center justify-between text-xs text-slate-500">
            <div>
              <p className="font-semibold text-slate-800">Private Real Estate Advisory</p>
              <p>Confidential Client Presentation • Schedule a viewing: {publicUrl}</p>
            </div>
            <div className="text-right font-mono">
              <span>ID: {property.id.slice(0, 8)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
