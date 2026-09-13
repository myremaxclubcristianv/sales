'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PrivateLayout } from '@/components/layout/private/PrivateLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { getClientsClient } from '@/lib/db/client-client'
import type { Database } from '@/types'

type ClientOption = Database['public']['Tables']['clients']['Row']

export default function NewPropertyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<ClientOption[]>([])

  const [formData, setFormData] = useState({
    title: '',
    type: 'apartment' as const,
    location: '',
    area: '',
    neighborhood: '',
    price: '',
    currency: 'EUR' as 'EUR' | 'USD' | 'RON',
    bedrooms: '',
    bathrooms: '',
    rooms: '',
    built_area: '',
    land_area: '',
    property_status: 'DRAFT' as 'DRAFT' | 'PRIVATE' | 'PUBLIC' | 'OFF_MARKET' | 'RESERVED' | 'SOLD' | 'ARCHIVED',
    availability: 'available' as 'available' | 'reserved' | 'sold' | 'rented' | 'off_market',
    description: '',
    owner_id: '',
    seller_id: '',
    internal_notes: '',
    minimum_internal_price: '',
    commission: '',
    commission_percentage: '',
    public_visibility: false,
    public_price_visibility: true,
    public_location_visibility: true,
  })

  useEffect(() => {
    getClientsClient()
      .then((data) => setClients(data || []))
      .catch((err) => console.error('Error fetching clients for property owner:', err))
  }, [])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        title: formData.title.trim(),
        type: formData.type,
        location: formData.location.trim(),
        area: formData.area.trim(),
        neighborhood: formData.neighborhood.trim() || null,
        price: formData.price ? parseFloat(formData.price) : null,
        currency: formData.currency,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms, 10) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms, 10) : null,
        rooms: formData.rooms ? parseInt(formData.rooms, 10) : null,
        built_area: formData.built_area ? parseFloat(formData.built_area) : null,
        land_area: formData.land_area ? parseFloat(formData.land_area) : null,
        property_status: formData.property_status,
        availability: formData.availability,
        description: formData.description.trim() || null,
        owner_id: formData.owner_id || null,
        seller_id: formData.seller_id || null,
        internal_notes: formData.internal_notes.trim() || null,
        minimum_internal_price: formData.minimum_internal_price ? parseFloat(formData.minimum_internal_price) : null,
        commission: formData.commission ? parseFloat(formData.commission) : null,
        commission_percentage: formData.commission_percentage ? parseFloat(formData.commission_percentage) : null,
        public_visibility: formData.public_visibility,
        public_price_visibility: formData.public_price_visibility,
        public_location_visibility: formData.public_location_visibility,
      }

      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        const data = await res.json()
        router.push(`/admin/properties/${data.property.id}`)
      } else {
        const errorData = await res.json()
        alert(errorData.error || 'Failed to create property')
      }
    } catch {
      alert('An unexpected error occurred while creating property')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PrivateLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Create Property Record
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Establish property specifications, owner links, valuation details, and public visibility controls.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Basic Specifications */}
          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
              1. Core Specifications &amp; Location
            </h3>

            <Input
              label="Property Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="e.g., Luxury 4-Room Penthouse with Panoramic Terrace"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Property Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="villa">Villa</option>
                  <option value="land">Land</option>
                  <option value="commercial">Commercial</option>
                  <option value="office">Office</option>
                  <option value="retail">Retail</option>
                  <option value="industrial">Industrial</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <Input
                label="City / City Area"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                placeholder="e.g., Bucharest, Sector 1"
              />

              <Input
                label="Specific Zone / Area"
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                required
                placeholder="e.g., Herăstrău / Pipera"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <Input
                label="Asking Price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="750000"
              />
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Currency</label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="RON">RON</option>
                </select>
              </div>
              <Input
                label="Built Area (m²)"
                name="built_area"
                type="number"
                value={formData.built_area}
                onChange={handleInputChange}
                placeholder="220"
              />
              <Input
                label="Land Area (m²)"
                name="land_area"
                type="number"
                value={formData.land_area}
                onChange={handleInputChange}
                placeholder="Optional"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Bedrooms"
                name="bedrooms"
                type="number"
                value={formData.bedrooms}
                onChange={handleInputChange}
                placeholder="3"
              />
              <Input
                label="Bathrooms"
                name="bathrooms"
                type="number"
                value={formData.bathrooms}
                onChange={handleInputChange}
                placeholder="3"
              />
              <Input
                label="Total Rooms"
                name="rooms"
                type="number"
                value={formData.rooms}
                onChange={handleInputChange}
                placeholder="4"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Public Editorial Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                placeholder="Write a refined editorial overview of the property..."
              />
            </div>
          </Card>

          {/* Section 2: Owner & Private CRM Data (Strictly Hidden from Public) */}
          <Card className="space-y-4 border-amber-200/80 bg-amber-50/20">
            <div className="flex items-center justify-between pb-3 border-b border-amber-200">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                2. Private CRM &amp; Owner Information (Confidential)
              </h3>
              <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                RLS Protected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Property Owner (Client link)
                </label>
                <select
                  name="owner_id"
                  value={formData.owner_id}
                  onChange={handleInputChange}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">-- Unassigned / Direct Asset --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.first_name} {c.last_name} ({c.phone || c.email || 'No contact info'})
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Minimum Internal Reserve Price"
                name="minimum_internal_price"
                type="number"
                value={formData.minimum_internal_price}
                onChange={handleInputChange}
                placeholder="Confidential floor price"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Commission Amount"
                name="commission"
                type="number"
                value={formData.commission}
                onChange={handleInputChange}
                placeholder="e.g., 15000"
              />
              <Input
                label="Commission Percentage (%)"
                name="commission_percentage"
                type="number"
                value={formData.commission_percentage}
                onChange={handleInputChange}
                placeholder="e.g., 2.5"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Internal Broker Notes &amp; History</label>
              <textarea
                name="internal_notes"
                value={formData.internal_notes}
                onChange={handleInputChange}
                rows={3}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                placeholder="Confidential owner constraints, negotiation limits, or legal situation..."
              />
            </div>
          </Card>

          {/* Section 3: Status & Public Visibility Controls */}
          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
              3. Visibility &amp; Status Controls
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Lifecycle Status</label>
                <select
                  name="property_status"
                  value={formData.property_status}
                  onChange={handleInputChange}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PRIVATE">Private (CRM Only)</option>
                  <option value="PUBLIC">Public (Visible on Portal)</option>
                  <option value="OFF_MARKET">Off-Market Opportunity</option>
                  <option value="RESERVED">Reserved</option>
                  <option value="SOLD">Sold</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Availability</label>
                <select
                  name="availability"
                  value={formData.availability}
                  onChange={handleInputChange}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="sold">Sold</option>
                  <option value="rented">Rented</option>
                  <option value="off_market">Off-Market</option>
                </select>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="public_visibility"
                  checked={formData.public_visibility}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-semibold text-slate-900">
                  Publish to Public Portal (`/properties`)
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer ml-7">
                <input
                  type="checkbox"
                  name="public_price_visibility"
                  checked={formData.public_price_visibility}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-700">
                  Show price publicly (Uncheck to show &quot;Price Upon Request&quot;)
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer ml-7">
                <input
                  type="checkbox"
                  name="public_location_visibility"
                  checked={formData.public_location_visibility}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-700">
                  Show general location publicly
                </span>
              </label>
            </div>
          </Card>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={loading} size="lg">
              {loading ? 'Creating Property...' : 'Save & Continue to Media'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </PrivateLayout>
  )
}
