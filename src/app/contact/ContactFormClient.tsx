'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Send, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react'

export function ContactFormClient() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service_type: 'real_estate_buy',
    message: '',
    marketing_consent: false,
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
      setError('Vă rugăm să introduceți numele complet.')
      setLoading(false)
      return
    }

    if (!formData.email.trim() && !formData.phone.trim()) {
      setError('Vă rugăm să introduceți cel puțin o adresă de email sau un număr de telefon.')
      setLoading(false)
      return
    }

    try {
      const marketingTag = formData.marketing_consent ? ' [Marketing Consent: OPT-IN]' : ' [Marketing Consent: NONE]'
      const payloadMessage = `[Service Interest: ${formData.service_type.replace(/_/g, ' ').toUpperCase()}]${marketingTag} ${formData.message.trim()}`
      
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
        throw new Error(data.error || 'A apărut o eroare la transmiterea mesajului. Vă rugăm să reîncercați.')
      }

      setSubmitted(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'A apărut o problemă temporară de comunicare.')
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
          Solicitarea a Fost Transmisă cu Succes
        </h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
          Vă mulțumim, <span className="text-white font-semibold">{formData.name}</span>. Solicitarea dumneavoastră a fost înregistrată în siguranță. Vă vom contacta în cel mai scurt timp pentru a discuta detaliile.
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
                marketing_consent: false,
                honeypot: '',
              })
            }}
            className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition cursor-pointer"
          >
            Trimite o Nouă Solicitare
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
          Nume și Prenume / Entitate Juridică <span className="text-rose-600">*</span>
        </label>
        <input
          type="text"
          required
          placeholder="ex: Cristian Văduva / Family Office"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition"
        />
      </div>

      {/* Email & Phone Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Adresă de Email <span className="text-slate-400 font-normal lowercase">(opțional dacă introduceți telefonul)</span>
          </label>
          <input
            type="email"
            placeholder="nume@domeniu.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Telefon / WhatsApp <span className="text-slate-400 font-normal lowercase">(opțional dacă introduceți emailul)</span>
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
          Aria de Interes / Tipul Solicitării <span className="text-rose-600">*</span>
        </label>
        <select
          value={formData.service_type}
          onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition"
        >
          <option value="real_estate_buy">Achiziție Imobiliară / Mandat Căutare Cumpărător</option>
          <option value="real_estate_sell">Listare Proprietate &amp; Reprezentare Vânzător</option>
          <option value="insurance_package">Pachet Asigurări &amp; Protecție Patrimonială</option>
          <option value="credit_mortgage">Credit Ipotecar &amp; Structurare Financiară</option>
          <option value="private_advisory">Consultanță Privată / Parteneriat Investițional</option>
        </select>
      </div>

      {/* Message */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
          Detalii Solicitare / Specificații <span className="text-rose-600">*</span>
        </label>
        <textarea
          rows={4}
          required
          placeholder="Descrieți parametrii proprietății dorite, zona preferată, bugetul estimativ sau alte specificații relevante..."
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition"
        />
      </div>

      {/* GDPR Notice & Optional Marketing Checkbox */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
        <div className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-brand-gold-600 shrink-0 mt-0.5" />
          <span>
            Datele transmise sunt utilizate exclusiv de către Cristian Văduva pentru procesarea solicitării dumneavoastră și formularea unui răspuns personalizat, conform{' '}
            <Link href="/privacy-policy" target="_blank" className="text-slate-900 underline font-medium hover:text-brand-gold-600">
              Politicii de Confidențialitate
            </Link>{' '}
            și{' '}
            <Link href="/terms" target="_blank" className="text-slate-900 underline font-medium hover:text-brand-gold-600">
              Termenilor și Condițiilor
            </Link>.
          </span>
        </div>

        <div className="pt-2 border-t border-slate-200">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={formData.marketing_consent}
              onChange={(e) => setFormData({ ...formData, marketing_consent: e.target.checked })}
              className="mt-1 w-4 h-4 text-brand-gold-600 rounded border-slate-300 focus:ring-slate-900"
            />
            <span className="text-xs text-slate-600 leading-relaxed">
              <strong className="text-slate-800 font-medium">Opțional:</strong> Doresc să primesc periodic noutăți imobiliare premium, rapoarte de piață și alerte de proprietăți noi. Pot retrage acest consimțământ oricând cu 1 click (detalii în{' '}
              <Link href="/marketing-consent" target="_blank" className="text-slate-900 underline hover:text-brand-gold-600">
                Politica de Marketing
              </Link>).
            </span>
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-slate-950 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-slate-800 transition disabled:opacity-50 shadow-xs cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span>{loading ? 'Se transmite solicitarea...' : 'Transmite Solicitarea Confidențială'}</span>
        </button>
      </div>
    </form>
  )
}

