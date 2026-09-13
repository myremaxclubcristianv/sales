'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CheckCircle2, Send, Home, ShieldCheck } from 'lucide-react'

interface Props {
  requestId: string
  requestTitle: string
}

export function RequestInquiryForm({ requestId, requestTitle }: Props) {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    property_details: '',
    asking_price: '',
    marketing_consent: false,
    honeypot: '', // anti-bot spam protection
  })

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

    try {
      const marketingTag = formData.marketing_consent ? ' [Marketing Consent: OPT-IN]' : ' [Marketing Consent: NONE]'
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          message: `[Matching Property Submission for Request: ${requestTitle}] Details: ${formData.property_details} | Asking: ${formData.asking_price}${marketingTag}`,
          source: 'website',
          request_id: requestId,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit proposal')
      }

      setSubmitted(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error submitting proposal'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="p-6 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-2xl text-center space-y-2">
        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <h4 className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">
          Property Proposal Received
        </h4>
        <p className="text-xs text-emerald-700 dark:text-emerald-400 max-w-sm mx-auto">
          Thank you. Our private broker team will review your property specifications against the buyer&apos;s mandate.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 bg-neutral-50 dark:bg-neutral-800/40 p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800">
      <div className="flex items-center gap-2 mb-2">
        <Home className="w-4 h-4 text-primary" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
          Have a Matching Property?
        </h4>
      </div>
      <p className="text-xs text-neutral-500 mb-3">
        Submit property specs confidentially directly to the buyer&apos;s managing broker.
      </p>

      {error && (
        <div className="p-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 text-xs rounded-lg">
          {error}
        </div>
      )}

      {/* Honeypot field (hidden from humans) */}
      <input
        type="text"
        name="website_url"
        value={formData.honeypot}
        onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <Input
          required
          placeholder="Your Name *"
          className="text-xs h-9 bg-white dark:bg-neutral-900"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <Input
          required
          type="tel"
          placeholder="Phone Number *"
          className="text-xs h-9 bg-white dark:bg-neutral-900 font-mono"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
        <Input
          type="email"
          placeholder="Email Address"
          className="text-xs h-9 bg-white dark:bg-neutral-900"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="sm:col-span-2">
          <Input
            required
            placeholder="Property location, area (m²), rooms & key details *"
            className="text-xs h-9 bg-white dark:bg-neutral-900"
            value={formData.property_details}
            onChange={(e) => setFormData({ ...formData, property_details: e.target.value })}
          />
        </div>
        <div>
          <Input
            placeholder="Asking Price (e.g. 320.000 €)"
            className="text-xs h-9 bg-white dark:bg-neutral-900"
            value={formData.asking_price}
            onChange={(e) => setFormData({ ...formData, asking_price: e.target.value })}
          />
        </div>
      </div>

      {/* GDPR Consent Notice */}
      <div className="p-2.5 bg-white dark:bg-neutral-900/80 rounded-lg border border-neutral-200 dark:border-neutral-800 space-y-1.5 text-[11px] text-neutral-500">
        <div className="flex items-start gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
          <span>
            Data processed confidentially to evaluate this proposal under our{' '}
            <Link href="/privacy-policy" target="_blank" className="underline hover:text-neutral-900 dark:hover:text-white">
              Privacy Policy
            </Link>.
          </span>
        </div>
        <label className="flex items-center gap-2 pt-1 border-t border-neutral-100 dark:border-neutral-800 cursor-pointer select-none text-[11px]">
          <input
            type="checkbox"
            checked={formData.marketing_consent}
            onChange={(e) => setFormData({ ...formData, marketing_consent: e.target.checked })}
            className="w-3.5 h-3.5 rounded border-neutral-300 dark:border-neutral-700"
          />
          <span>Receive relevant investor search briefs (optional).</span>
        </label>
      </div>

      <div className="flex justify-end pt-1">
        <Button type="submit" disabled={loading} size="sm" className="gap-2 text-xs">
          <Send className="w-3.5 h-3.5" />
          {loading ? 'Submitting...' : 'Submit Property to Broker'}
        </Button>
      </div>
    </form>
  )
}

