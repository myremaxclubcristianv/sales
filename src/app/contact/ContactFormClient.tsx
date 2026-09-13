'use client'

import React, { useState } from 'react'
import { Send, CheckCircle2, AlertCircle } from 'lucide-react'

export function ContactFormClient() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service_type: 'real_estate_buy',
    message: '',
    honeypot: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Honeypot check
    if (formData.honeypot) {
      setSubmitted(true)
      setLoading(false)
      return
    }

    if (!formData.name.trim()) {
      setError('Please provide your full name.')
      setLoading(false)
      return
    }

    if (!formData.email.trim() && !formData.phone.trim()) {
      setError('Please provide either an email address or a phone number.')
      setLoading(false)
      return
    }

    try {
      const payloadMessage = `[Service Interest: ${formData.service_type.replace(/_/g, ' ').toUpperCase()}] ${formData.message.trim()}`
      
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim() || null,
          phone: formData.phone.trim() || null,
          message: payloadMessage,
          honeypot: formData.honeypot,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit your inquiry. Please try again.')
      }

      setSubmitted(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'A temporary communication error occurred.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-slate-900 text-white p-8 sm:p-12 rounded-3xl border border-slate-800 text-center space-y-4">
        <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="font-serif text-2xl sm:text-3xl font-bold">
          Inquiry Successfully Transmitted
        </h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
          Thank you, <span className="text-white font-semibold">{formData.name}</span>. Your inquiry has been registered with our senior advisory team. A dedicated partner will contact you shortly.
        </p>
        <div className="pt-4">
          <button
            onClick={() => {
              setSubmitted(false)
              setFormData({
                name: '',
                email: '',
                phone: '',
                service_type: 'real_estate_buy',
                message: '',
                honeypot: '',
              })
            }}
            className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition"
          >
            Submit Another Inquiry
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Honeypot for spam bots */}
      <input
        type="text"
        name="honeypot"
        value={formData.honeypot}
        onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Name */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
          Full Name / Legal Entity *
        </label>
        <input
          type="text"
          required
          placeholder="e.g. Cristian Văduva / Family Office"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition"
        />
      </div>

      {/* Email & Phone Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            placeholder="name@domain.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Phone / WhatsApp Number
          </label>
          <input
            type="tel"
            placeholder="+40 7xx xxx xxx"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition"
          />
        </div>
      </div>

      {/* Advisory Service Type */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
          Advisory Interest / Service Area
        </label>
        <select
          value={formData.service_type}
          onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition"
        >
          <option value="real_estate_buy">Property Acquisition / Buyer Search Mandate</option>
          <option value="real_estate_sell">Property Listing &amp; Seller Representation</option>
          <option value="insurance_package">Insurance Portfolio &amp; Asset Protection</option>
          <option value="credit_mortgage">Mortgage &amp; Real Estate Credit Structuring</option>
          <option value="private_advisory">Private Wealth / General Partnership</option>
        </select>
      </div>

      {/* Message */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
          Confidential Brief / Requirements
        </label>
        <textarea
          rows={4}
          required
          placeholder="Outline your target asset parameters, location preferences, timeline, or financing needs..."
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition"
        />
      </div>

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-slate-950 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-slate-800 transition disabled:opacity-50 shadow-xs cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span>{loading ? 'Transmitting Inbound...' : 'Transmit Confidential Inquiry'}</span>
        </button>
      </div>
    </form>
  )
}
