'use client'

import React, { useState } from 'react'
import Link from 'next/link'

interface PropertyInquiryFormProps {
  propertyId: string
  propertyTitle: string
}

export function PropertyInquiryForm({ propertyId, propertyTitle }: PropertyInquiryFormProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState(`I am interested in ${propertyTitle} and would like to schedule a private viewing.`)
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [honeypot, setHoneypot] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg('')

    try {
      const marketingTag = marketingConsent ? ' [Marketing Consent: OPT-IN]' : ' [Marketing Consent: NONE]'
      const fullMessage = `${message.trim()}${marketingTag}`

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          email: email.trim() || null,
          message: fullMessage,
          property_id: propertyId,
          honeypot,
        }),
      })

      if (res.ok) {
        setSubmitted(true)
      } else {
        const errorData = await res.json()
        setErrorMsg(errorData.error || 'Failed to submit inquiry. Please try again.')
      }
    } catch {
      setErrorMsg('An unexpected connection error occurred.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center text-emerald-900">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
          ✓
        </div>
        <h4 className="text-base font-bold mb-1">Inquiry Received</h4>
        <p className="text-xs text-emerald-800 leading-relaxed">
          Thank you, {name}. Our private broker will contact you directly via phone or WhatsApp to arrange details.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
      <div>
        <h3 className="font-serif text-lg font-bold text-white tracking-wide">
          Private Inquiry &amp; Viewing
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Request private acquisition details or schedule a confidential walkthrough.
        </p>
      </div>

      {/* Honeypot field for bot suppression */}
      <input
        type="text"
        name="honeypot"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />

      {errorMsg && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          {errorMsg}
        </div>
      )}

      <div>
        <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
          Your Full Name <span className="text-rose-400">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g., Alexander Radu"
          className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
          Phone / WhatsApp <span className="text-rose-400">*</span>
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          placeholder="+40 7xx xxx xxx"
          className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
        />
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
          Email Address (Optional)
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="alexander@domain.com"
          className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
          Message &amp; Preferred Time
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* GDPR Consent Notice & Optional Marketing */}
      <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700/60 space-y-2 text-[11px] text-slate-400 leading-relaxed">
        <p className="mb-0">
          🔒 Your details are processed strictly to answer this property inquiry pursuant to our{' '}
          <Link href="/privacy-policy" target="_blank" className="text-slate-200 underline hover:text-white">
            Privacy Policy
          </Link>.
        </p>
        <label className="flex items-start gap-2 pt-1.5 border-t border-slate-700/50 cursor-pointer select-none text-[11px] text-slate-300">
          <input
            type="checkbox"
            checked={marketingConsent}
            onChange={(e) => setMarketingConsent(e.target.checked)}
            className="mt-0.5 w-3.5 h-3.5 rounded border-slate-600 bg-slate-900 text-blue-500"
          />
          <span>Send me matching new off-market properties (optional).</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 px-4 bg-white text-slate-950 hover:bg-slate-100 font-semibold text-xs uppercase tracking-wider rounded-lg transition-colors shadow-md disabled:opacity-50 cursor-pointer"
      >
        {submitting ? 'Sending Request...' : 'Send Private Inquiry'}
      </button>
    </form>
  )
}

