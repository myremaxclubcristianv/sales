'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { parseAndValidateCnp } from '@/lib/utils/cnp'
import {
  User,
  Shield,
  Car,
  Home,
  MessageSquare,
  TrendingUp,
  FileText,
  AlertTriangle,
  History,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Lock
} from 'lucide-react'
import Link from 'next/link'

const INSURANCE_PRODUCTS = [
  { value: 'RCA', label: 'RCA (Răspundere Civilă Auto)' },
  { value: 'CASCO', label: 'CASCO (Avarii & Furt)' },
  { value: 'HOME', label: 'Locuință (PAD + Facultativă)' },
  { value: 'LIFE', label: 'Viață & Protecție' },
  { value: 'HEALTH', label: 'Sănătate & Spitalizare' },
  { value: 'TRAVEL', label: 'Călătorie (Travel)' },
  { value: 'LIABILITY', label: 'Răspundere Civilă Generală' },
  { value: 'PROFESSIONAL_LIABILITY', label: 'Răspundere Profesională (Malpraxis, Avocați, etc.)' },
  { value: 'CARGO', label: 'Cargo / Transport Marfă' },
  { value: 'IMM', label: 'IMM / Clădiri & Bunuri Comerciale' },
  { value: 'BUSINESS', label: 'Business & Continuitate' },
  { value: 'CYBER', label: 'Cyber Risk & Securitate' },
  { value: 'OTHER', label: 'Alte Tipuri de Asigurare' },
]

const INSURERS = [
  'Allianz-Tiriac',
  'Omniasig VIG',
  'Groupama',
  'Generali',
  'Grawe',
  'Uniqa',
  'Asirom VIG',
  'Euroins (Istoric)',
  'Axeria IARD',
  'Hellas Direct',
  'Eurolife FFH',
  'NN Asigurări',
  'Signal Iduna',
  'Alt Asigurător'
]

const LEAD_SOURCES = [
  { value: 'website', label: 'Website' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'referral', label: 'Recomandare' },
  { value: 'phone', label: 'Telefon' },
  { value: 'email', label: 'Email' },
  { value: 'property', label: 'Real Estate' },
  { value: 'campaign', label: 'Campanie' },
  { value: 'other', label: 'Altă sursă / Existent' },
]

type FormTab =
  | 'client'
  | 'policy'
  | 'auto'
  | 'home'
  | 'interactions'
  | 'opportunity'
  | 'documents'
  | 'claims'
  | 'notes'

export function NewInsuranceClientForm() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<FormTab>('client')
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Form State
  const today = useMemo(() => new Date().toISOString().split('T')[0], [])
  const nextYear = useMemo(() => {
    const d = new Date()
    d.setFullYear(d.getFullYear() + 1)
    return d.toISOString().split('T')[0]
  }, [])

  const [formData, setFormData] = useState({
    // TAB 1: Client
    client: {
      first_name: '',
      last_name: '',
      phone: '',
      whatsapp: '',
      email: '',
      date_of_birth: '',
      address: '',
      city: '',
      county: '',
      postal_code: '',
      country: 'Romania',
      role: '',
      client_type: 'INDIVIDUAL', // INDIVIDUAL or CORPORATE
      lead_source: 'website',
      preferred_communication: 'phone',
      personal_notes: '',
      cnp: '', // Optional secure field
    },
    // TAB 2: Policy
    policy: {
      policy_number: '',
      product: 'RCA',
      insurer: 'Allianz-Tiriac',
      start_date: today,
      issue_date: today,
      expiry_date: nextYear,
      premium: '',
      commission: '',
      currency: 'RON',
      status: 'ACTIVE',
      notes: '',
      details: '',
    },
    // TAB 3: Auto
    vehicle: {
      vin: '',
      make: '',
      model: '',
      year: '',
      plate_number: '',
      fuel_type: 'Benzină',
      engine_capacity: '',
      power_hp: '',
      value: '',
      details: '',
    },
    // TAB 4: Home
    property: {
      property_type: 'Apartament', // Apartament, Casă, Vilă, etc.
      address: '',
      city: '',
      county: '',
      surface_sqm: '',
      property_value: '',
      insured_value: '',
      construction_year: '',
      details: '',
      notes: '',
    },
    // TAB 5: Interactions & Follow-up
    interaction: {
      last_activity_date: today,
      last_activity_type: 'call',
      last_activity_title: '',
      last_activity_notes: '',
      next_followup_date: '',
      next_followup_reason: '',
      next_followup_priority: 'MEDIUM',
      next_followup_notes: '',
    },
    // TAB 6: Opportunity
    opportunity: {
      product: '',
      estimated_premium: '',
      currency: 'RON',
      status: 'LEAD',
      notes: '',
    },
    // TAB 8: Claims
    claim: {
      has_claim: false,
      incident_date: today,
      claim_type: '',
      claim_number: '',
      insurer: '',
      estimated_amount: '',
      currency: 'RON',
      status: 'OPEN',
      description: '',
      notes: '',
      next_action: '',
    },
  })

  // Automatic Calculation of Zile Rămase
  const daysRemaining = useMemo(() => {
    if (!formData.policy.expiry_date) return null
    const exp = new Date(formData.policy.expiry_date)
    const now = new Date()
    return Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  }, [formData.policy.expiry_date])

  const isAutoPolicy = formData.policy.product === 'RCA' || formData.policy.product === 'CASCO'
  const isHomePolicy = formData.policy.product === 'HOME'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg(null)

    // Validation
    if (!formData.client.first_name.trim() && !formData.client.last_name.trim()) {
      setErrorMsg('Vă rugăm să introduceți numele sau prenumele clientului.')
      setActiveTab('client')
      setSubmitting(false)
      return
    }

    if (!formData.client.phone.trim() && !formData.client.email.trim()) {
      setErrorMsg('Cel puțin un număr de telefon sau o adresă de email este obligatorie.')
      setActiveTab('client')
      setSubmitting(false)
      return
    }

    if (formData.policy.start_date && formData.policy.expiry_date) {
      if (new Date(formData.policy.expiry_date) < new Date(formData.policy.start_date)) {
        setErrorMsg('Data de expirare a poliței nu poate fi anterioară datei de emitere.')
        setActiveTab('policy')
        setSubmitting(false)
        return
      }
    }

    try {
      const payload = {
        client: {
          ...formData.client,
          first_name: formData.client.first_name.trim(),
          last_name: formData.client.last_name.trim(),
        },
        policy: formData.policy.product ? {
          ...formData.policy,
          premium: formData.policy.premium ? Number(formData.policy.premium) : 0,
          commission: formData.policy.commission ? Number(formData.policy.commission) : 0,
        } : null,
        vehicle: isAutoPolicy || formData.vehicle.vin.trim() ? formData.vehicle : null,
        property: isHomePolicy || formData.property.address.trim() ? formData.property : null,
        opportunity: formData.opportunity.product ? {
          ...formData.opportunity,
          estimated_premium: formData.opportunity.estimated_premium ? Number(formData.opportunity.estimated_premium) : null,
        } : null,
        interaction: (formData.interaction.last_activity_title || formData.interaction.next_followup_reason) ? formData.interaction : null,
        claim: formData.claim.has_claim && formData.claim.claim_type ? {
          ...formData.claim,
          estimated_amount: formData.claim.estimated_amount ? Number(formData.claim.estimated_amount) : null,
        } : null,
      }

      const res = await fetch('/api/insurance/client-full', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Eroare la salvarea clientului')
      }

      // Successful creation -> Redirect to Insurance Client Workspace
      router.push(`/admin/insurance/${data.client_id}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'A apărut o eroare la salvare'
      setErrorMsg(msg)
      setSubmitting(false)
    }
  }

  const tabsConfig = [
    { id: 'client', label: '1. Date Client', icon: User, badge: null },
    { id: 'policy', label: '2. Poliță', icon: Shield, badge: formData.policy.product || null },
    { id: 'auto', label: '3. Auto', icon: Car, badge: isAutoPolicy ? 'Recomandat' : null, highlight: isAutoPolicy },
    { id: 'home', label: '4. Locuință', icon: Home, badge: isHomePolicy ? 'Recomandat' : null, highlight: isHomePolicy },
    { id: 'interactions', label: '5. Interacțiuni', icon: MessageSquare, badge: null },
    { id: 'opportunity', label: '6. Oportunitate', icon: TrendingUp, badge: null },
    { id: 'documents', label: '7. Documente', icon: FileText, badge: null },
    { id: 'claims', label: '8. Daune', icon: AlertTriangle, badge: formData.claim.has_claim ? 'Activ' : null },
    { id: 'notes', label: '9. Note / Istoric', icon: History, badge: null },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Banner & Title */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Workspace Creare Client &amp; Polițe Insurance</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Introducere Client Nou &amp; Administrare Portofoliu
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Toate secțiunile sunt persistate atomic în baza de date Supabase și legate automat de profilul clientului.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/insurance"
            className="px-4 py-2.5 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            Anulează
          </Link>
          <Button type="submit" disabled={submitting} className="text-xs font-semibold gap-2 shadow-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>{submitting ? 'Se salvează în DB...' : 'Salvează Clientul'}</span>
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl flex items-center gap-3 text-xs text-red-700 dark:text-red-300">
          <AlertTriangle className="w-5 h-5 shrink-0 text-red-600" />
          <p className="font-semibold">{errorMsg}</p>
        </div>
      )}

      {/* Tab Navigation (Horizontal scroll on mobile) */}
      <div className="flex items-center gap-1.5 p-1.5 bg-neutral-100 dark:bg-neutral-800/80 rounded-2xl overflow-x-auto no-scrollbar">
        {tabsConfig.map((t) => {
          const Icon = t.icon
          const isActive = activeTab === t.id
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as FormTab)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
              } ${t.highlight && !isActive ? 'ring-1 ring-blue-500/40' : ''}`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-neutral-400'}`} />
              <span>{t.label}</span>
              {t.badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-mono">
                  {t.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* TAB 1: DATE CLIENT */}
      {activeTab === 'client' && (
        <Card className="p-6 bg-white dark:bg-neutral-900 space-y-6">
          <div className="border-b border-neutral-100 dark:border-neutral-800 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>Identitate &amp; Date de Contact Client</span>
            </h2>
            <span className="text-[11px] text-neutral-400">* Câmpuri obligatorii: Nume, Telefon sau Email</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Nume *"
              placeholder="ex: Popescu"
              value={formData.client.last_name}
              onChange={(e) => setFormData({ ...formData, client: { ...formData.client, last_name: e.target.value } })}
              required
            />
            <Input
              label="Prenume *"
              placeholder="ex: Andrei"
              value={formData.client.first_name}
              onChange={(e) => setFormData({ ...formData, client: { ...formData.client, first_name: e.target.value } })}
            />
            <Select
              label="Tip Client"
              value={formData.client.client_type}
              onChange={(e) => setFormData({ ...formData, client: { ...formData.client, client_type: e.target.value } })}
              options={[
                { value: 'INDIVIDUAL', label: 'Persoană Fizică (PF)' },
                { value: 'CORPORATE', label: 'Persoană Juridică (PJ)' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Număr Telefon *"
              type="tel"
              placeholder="ex: +40 722 000 111"
              value={formData.client.phone}
              onChange={(e) => setFormData({ ...formData, client: { ...formData.client, phone: e.target.value } })}
            />
            <Input
              label="WhatsApp"
              type="tel"
              placeholder="ex: +40 722 000 111"
              value={formData.client.whatsapp}
              onChange={(e) => setFormData({ ...formData, client: { ...formData.client, whatsapp: e.target.value } })}
            />
            <Input
              label="Adresă Email"
              type="email"
              placeholder="ex: andrei.popescu@email.com"
              value={formData.client.email}
              onChange={(e) => setFormData({ ...formData, client: { ...formData.client, email: e.target.value } })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="Data Nașterii"
              type="date"
              value={formData.client.date_of_birth}
              onChange={(e) => setFormData({ ...formData, client: { ...formData.client, date_of_birth: e.target.value } })}
            />
            <Input
              label="Oraș"
              placeholder="ex: București"
              value={formData.client.city}
              onChange={(e) => setFormData({ ...formData, client: { ...formData.client, city: e.target.value } })}
            />
            <Input
              label="Județ / Sector"
              placeholder="ex: Sector 1 / Ilfov"
              value={formData.client.county}
              onChange={(e) => setFormData({ ...formData, client: { ...formData.client, county: e.target.value } })}
            />
            <Input
              label="Cod Poștal"
              placeholder="ex: 010101"
              value={formData.client.postal_code}
              onChange={(e) => setFormData({ ...formData, client: { ...formData.client, postal_code: e.target.value } })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Adresă Domiciliu / Sediu"
              placeholder="Strada, Număr, Bloc, Apartament"
              value={formData.client.address}
              onChange={(e) => setFormData({ ...formData, client: { ...formData.client, address: e.target.value } })}
            />
            <Input
              label="Companie / Angajator"
              placeholder="ex: SC Alfa Group SRL"
              value={formData.client.role}
              onChange={(e) => setFormData({ ...formData, client: { ...formData.client, role: e.target.value } })}
            />
            <Select
              label="Canal Preferat de Comunicare"
              value={formData.client.preferred_communication}
              onChange={(e) => setFormData({ ...formData, client: { ...formData.client, preferred_communication: e.target.value } })}
              options={[
                { value: 'phone', label: 'Telefon' },
                { value: 'whatsapp', label: 'WhatsApp' },
                { value: 'email', label: 'Email' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Sursă Atragere Client (Attribution)"
              value={formData.client.lead_source}
              onChange={(e) => setFormData({ ...formData, client: { ...formData.client, lead_source: e.target.value } })}
              options={LEAD_SOURCES}
            />
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-neutral-400" />
                <span>CNP / CUI (Opțional &amp; Confidențial)</span>
              </label>
              <input
                type="text"
                placeholder="Stocat securizat exclusiv pentru emitere polițe"
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
                value={formData.client.cnp}
                onChange={(e) => setFormData({ ...formData, client: { ...formData.client, cnp: e.target.value } })}
                onBlur={() => {
                  if (formData.client.cnp && !formData.client.date_of_birth) {
                    const val = parseAndValidateCnp(formData.client.cnp)
                    if (val.isValid && val.dateOfBirth) {
                      setFormData((prev) => ({
                        ...prev,
                        client: { ...prev.client, date_of_birth: val.dateOfBirth || '' },
                      }))
                    }
                  }
                }}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="button" onClick={() => setActiveTab('policy')} className="text-xs gap-2">
              <span>Continuă la Pasul 2 (Poliță)</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* TAB 2: POLIȚĂ */}
      {activeTab === 'policy' && (
        <Card className="p-6 bg-white dark:bg-neutral-900 space-y-6">
          <div className="border-b border-neutral-100 dark:border-neutral-800 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>Poliță de Asigurare Asociată</span>
            </h2>
            {daysRemaining !== null && (
              <Badge variant={daysRemaining < 30 ? 'warning' : 'success'} size="sm">
                Valabilitate: {daysRemaining > 0 ? `${daysRemaining} zile rămase` : 'Expirată'}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Tip Asigurare *"
              value={formData.policy.product}
              onChange={(e) => setFormData({ ...formData, policy: { ...formData.policy, product: e.target.value } })}
              options={INSURANCE_PRODUCTS}
            />
            <Select
              label="Companie Asigurătoare *"
              value={formData.policy.insurer}
              onChange={(e) => setFormData({ ...formData, policy: { ...formData.policy, insurer: e.target.value } })}
              options={INSURERS.map((ins) => ({ value: ins, label: ins }))}
            />
            <Input
              label="Număr / Serie Poliță"
              placeholder="ex: RO/01/B12345678"
              value={formData.policy.policy_number}
              onChange={(e) => setFormData({ ...formData, policy: { ...formData.policy, policy_number: e.target.value } })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="Data Emitere *"
              type="date"
              value={formData.policy.start_date}
              onChange={(e) => setFormData({ ...formData, policy: { ...formData.policy, start_date: e.target.value, issue_date: e.target.value } })}
              required
            />
            <Input
              label="Data Expirare *"
              type="date"
              value={formData.policy.expiry_date}
              onChange={(e) => setFormData({ ...formData, policy: { ...formData.policy, expiry_date: e.target.value } })}
              required
            />
            <Input
              label="Primă Asigurare"
              type="number"
              placeholder="ex: 1250"
              value={formData.policy.premium}
              onChange={(e) => setFormData({ ...formData, policy: { ...formData.policy, premium: e.target.value } })}
            />
            <Input
              label="Comision Intermediere"
              type="number"
              placeholder="ex: 150"
              value={formData.policy.commission}
              onChange={(e) => setFormData({ ...formData, policy: { ...formData.policy, commission: e.target.value } })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Monedă"
              value={formData.policy.currency}
              onChange={(e) => setFormData({ ...formData, policy: { ...formData.policy, currency: e.target.value } })}
              options={[
                { value: 'RON', label: 'RON (Lei)' },
                { value: 'EUR', label: 'EUR (Euro)' },
                { value: 'USD', label: 'USD (Dolari)' },
              ]}
            />
            <Select
              label="Status Poliță"
              value={formData.policy.status}
              onChange={(e) => setFormData({ ...formData, policy: { ...formData.policy, status: e.target.value } })}
              options={[
                { value: 'ACTIVE', label: 'Activă' },
                { value: 'OFFERED', label: 'Ofertată' },
                { value: 'DRAFT', label: 'Draft' },
                { value: 'PENDING_RENEWAL', label: 'În Reînnoire' },
                { value: 'EXPIRED', label: 'Expirată' },
                { value: 'CANCELLED', label: 'Anulată' },
              ]}
            />
            <Input
              label="Termeni &amp; Clauze Speciale"
              placeholder="ex: Decontare directă inclusă, franșiză 100 EUR"
              value={formData.policy.details}
              onChange={(e) => setFormData({ ...formData, policy: { ...formData.policy, details: e.target.value } })}
            />
          </div>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={() => setActiveTab('client')} className="text-xs">
              Înapoi la Date Client
            </Button>
            <Button
              type="button"
              onClick={() => setActiveTab(isAutoPolicy ? 'auto' : isHomePolicy ? 'home' : 'interactions')}
              className="text-xs gap-2"
            >
              <span>{isAutoPolicy ? 'Continuă la Date Auto' : isHomePolicy ? 'Continuă la Date Locuință' : 'Continuă la Interacțiuni'}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* TAB 3: AUTO */}
      {activeTab === 'auto' && (
        <Card className="p-6 bg-white dark:bg-neutral-900 space-y-6">
          <div className="border-b border-neutral-100 dark:border-neutral-800 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Car className="w-4 h-4 text-blue-600" />
              <span>Specificare Vehicul Asigurat (Auto / Moto / Flotă)</span>
            </h2>
            <span className="text-xs text-neutral-400">Asociat cu RCA / CASCO</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Serie Șasiu (VIN) *"
              placeholder="ex: WBA3A5C50DF123456"
              value={formData.vehicle.vin}
              onChange={(e) => setFormData({ ...formData, vehicle: { ...formData.vehicle, vin: e.target.value.toUpperCase() } })}
            />
            <Input
              label="Marcă Vehicul *"
              placeholder="ex: BMW, Mercedes, Audi, Dacia"
              value={formData.vehicle.make}
              onChange={(e) => setFormData({ ...formData, vehicle: { ...formData.vehicle, make: e.target.value } })}
            />
            <Input
              label="Model Vehicul *"
              placeholder="ex: Seria 3 320d, Duster, Golf"
              value={formData.vehicle.model}
              onChange={(e) => setFormData({ ...formData, vehicle: { ...formData.vehicle, model: e.target.value } })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="Număr Înmatriculare"
              placeholder="ex: B 123 ABC"
              value={formData.vehicle.plate_number}
              onChange={(e) => setFormData({ ...formData, vehicle: { ...formData.vehicle, plate_number: e.target.value.toUpperCase() } })}
            />
            <Input
              label="An Fabricație"
              type="number"
              placeholder="ex: 2021"
              value={formData.vehicle.year}
              onChange={(e) => setFormData({ ...formData, vehicle: { ...formData.vehicle, year: e.target.value } })}
            />
            <Select
              label="Tip Combustibil"
              value={formData.vehicle.fuel_type}
              onChange={(e) => setFormData({ ...formData, vehicle: { ...formData.vehicle, fuel_type: e.target.value } })}
              options={[
                { value: 'Benzină', label: 'Benzină' },
                { value: 'Motorină (Diesel)', label: 'Motorină (Diesel)' },
                { value: 'Hibrid (HEV/PHEV)', label: 'Hibrid (HEV/PHEV)' },
                { value: 'Electric (EV)', label: 'Electric (EV)' },
                { value: 'GPL', label: 'GPL / Gaz' },
              ]}
            />
            <Input
              label="Capacitate Cilindrică (cm³)"
              type="number"
              placeholder="ex: 1995"
              value={formData.vehicle.engine_capacity}
              onChange={(e) => setFormData({ ...formData, vehicle: { ...formData.vehicle, engine_capacity: e.target.value } })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Putere Motor (CP)"
              type="number"
              placeholder="ex: 190"
              value={formData.vehicle.power_hp}
              onChange={(e) => setFormData({ ...formData, vehicle: { ...formData.vehicle, power_hp: e.target.value } })}
            />
            <Input
              label="Valoare Asigurată Vehicul (EUR)"
              type="number"
              placeholder="ex: 28500"
              value={formData.vehicle.value}
              onChange={(e) => setFormData({ ...formData, vehicle: { ...formData.vehicle, value: e.target.value } })}
            />
            <Input
              label="Detalii Tehnice / Dotări"
              placeholder="ex: Pachet M Sport, Trapă panoramică, Cârlig remorcare"
              value={formData.vehicle.details}
              onChange={(e) => setFormData({ ...formData, vehicle: { ...formData.vehicle, details: e.target.value } })}
            />
          </div>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={() => setActiveTab('policy')} className="text-xs">
              Înapoi la Poliță
            </Button>
            <Button type="button" onClick={() => setActiveTab('home')} className="text-xs gap-2">
              <span>Continuă la Date Locuință</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* TAB 4: LOCUINȚĂ */}
      {activeTab === 'home' && (
        <Card className="p-6 bg-white dark:bg-neutral-900 space-y-6">
          <div className="border-b border-neutral-100 dark:border-neutral-800 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Home className="w-4 h-4 text-blue-600" />
              <span>Specificare Locuință / Proprietate Imobiliară Asigurată</span>
            </h2>
            <span className="text-xs text-neutral-400">PAD + Asigurare Facultativă</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Casă / Apartament / Tip Imobil *"
              value={formData.property.property_type}
              onChange={(e) => setFormData({ ...formData, property: { ...formData.property, property_type: e.target.value } })}
              options={[
                { value: 'Apartament', label: 'Apartament în Bloc' },
                { value: 'Casă', label: 'Casă Individuală' },
                { value: 'Vilă', label: 'Vilă / Duplex' },
                { value: 'Comercial', label: 'Spațiu Comercial / Birou' },
                { value: 'Alte', label: 'Altă Proprietate' },
              ]}
            />
            <Input
              label="Oraș *"
              placeholder="ex: București / Cluj / Timișoara"
              value={formData.property.city}
              onChange={(e) => setFormData({ ...formData, property: { ...formData.property, city: e.target.value } })}
            />
            <Input
              label="Județ / Sector"
              placeholder="ex: Sector 1 / Ilfov / Cluj"
              value={formData.property.county}
              onChange={(e) => setFormData({ ...formData, property: { ...formData.property, county: e.target.value } })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Adresă Exactă Proprietate *"
                placeholder="ex: Str. Primăverii nr. 12, etaj 3, ap. 15"
                value={formData.property.address}
                onChange={(e) => setFormData({ ...formData, property: { ...formData.property, address: e.target.value } })}
              />
            </div>
            <Input
              label="Suprafață Utilă (mp)"
              type="number"
              placeholder="ex: 85"
              value={formData.property.surface_sqm}
              onChange={(e) => setFormData({ ...formData, property: { ...formData.property, surface_sqm: e.target.value } })}
            />
            <Input
              label="An Construcție"
              type="number"
              placeholder="ex: 2018"
              value={formData.property.construction_year}
              onChange={(e) => setFormData({ ...formData, property: { ...formData.property, construction_year: e.target.value } })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Valoare Imobil (EUR)"
              type="number"
              placeholder="ex: 180000"
              value={formData.property.property_value}
              onChange={(e) => setFormData({ ...formData, property: { ...formData.property, property_value: e.target.value } })}
            />
            <Input
              label="Sumă Asigurată Clădire + Conținut (EUR)"
              type="number"
              placeholder="ex: 200000"
              value={formData.property.insured_value}
              onChange={(e) => setFormData({ ...formData, property: { ...formData.property, insured_value: e.target.value } })}
            />
            <Input
              label="Detalii Structură &amp; Instalații"
              placeholder="ex: Beton armat, finisaje premium, sistem alarmă"
              value={formData.property.details}
              onChange={(e) => setFormData({ ...formData, property: { ...formData.property, details: e.target.value } })}
            />
          </div>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={() => setActiveTab('auto')} className="text-xs">
              Înapoi la Date Auto
            </Button>
            <Button type="button" onClick={() => setActiveTab('interactions')} className="text-xs gap-2">
              <span>Continuă la Interacțiuni</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* TAB 5: INTERACȚIUNI & FOLLOW-UP */}
      {activeTab === 'interactions' && (
        <Card className="p-6 bg-white dark:bg-neutral-900 space-y-6">
          <div className="border-b border-neutral-100 dark:border-neutral-800 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span>Istoric Interacțiuni &amp; Următorul Follow-up</span>
            </h2>
            <span className="text-xs text-neutral-400">Integrat cu Activities &amp; Follow-ups CRM</span>
          </div>

          {/* Section: Last Activity */}
          <div className="p-4 bg-neutral-50 dark:bg-neutral-800/40 rounded-2xl border border-neutral-200/60 dark:border-neutral-700/60 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              A. Ultima Interacțiune Realizată
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Tip Interacțiune"
                value={formData.interaction.last_activity_type}
                onChange={(e) => setFormData({ ...formData, interaction: { ...formData.interaction, last_activity_type: e.target.value } })}
                options={[
                  { value: 'call', label: 'Apel Telefonic' },
                  { value: 'whatsapp', label: 'Mesaj WhatsApp' },
                  { value: 'email', label: 'Email' },
                  { value: 'meeting', label: 'Întâlnire Față în Față' },
                  { value: 'telegram', label: 'Telegram' },
                  { value: 'note', label: 'Notă Internă' },
                ]}
              />
              <Input
                label="Titlu / Subiect Interacțiune"
                placeholder="ex: Ofertare RCA și prezentare CASCO"
                value={formData.interaction.last_activity_title}
                onChange={(e) => setFormData({ ...formData, interaction: { ...formData.interaction, last_activity_title: e.target.value } })}
              />
              <Input
                label="Data &amp; Ora"
                type="date"
                value={formData.interaction.last_activity_date}
                onChange={(e) => setFormData({ ...formData, interaction: { ...formData.interaction, last_activity_date: e.target.value } })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                Note &amp; Detalii Discuție
              </label>
              <textarea
                rows={2}
                placeholder="Clientul dorește oferta pe email și analiza comparativă cu decontare directă..."
                className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
                value={formData.interaction.last_activity_notes}
                onChange={(e) => setFormData({ ...formData, interaction: { ...formData.interaction, last_activity_notes: e.target.value } })}
              />
            </div>
          </div>

          {/* Section: Next Follow-up */}
          <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
              B. Următoarea Acțiune / Task Programat (Follow-up)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Motiv / Acțiune Programată"
                placeholder="ex: Trimitere ofertă CASCO & verificare expirare"
                value={formData.interaction.next_followup_reason}
                onChange={(e) => setFormData({ ...formData, interaction: { ...formData.interaction, next_followup_reason: e.target.value } })}
              />
              <Input
                label="Data Scadentă (Due Date)"
                type="date"
                value={formData.interaction.next_followup_date}
                onChange={(e) => setFormData({ ...formData, interaction: { ...formData.interaction, next_followup_date: e.target.value } })}
              />
              <Select
                label="Prioritate"
                value={formData.interaction.next_followup_priority}
                onChange={(e) => setFormData({ ...formData, interaction: { ...formData.interaction, next_followup_priority: e.target.value } })}
                options={[
                  { value: 'LOW', label: 'Scăzută' },
                  { value: 'MEDIUM', label: 'Medie' },
                  { value: 'HIGH', label: 'Ridicată' },
                  { value: 'URGENT', label: 'Urgentă' },
                ]}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                Instrucțiuni Follow-up
              </label>
              <textarea
                rows={2}
                placeholder="Reamintire verificare primă cu 14 zile înainte de expirare..."
                className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
                value={formData.interaction.next_followup_notes}
                onChange={(e) => setFormData({ ...formData, interaction: { ...formData.interaction, next_followup_notes: e.target.value } })}
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={() => setActiveTab('home')} className="text-xs">
              Înapoi la Locuință
            </Button>
            <Button type="button" onClick={() => setActiveTab('opportunity')} className="text-xs gap-2">
              <span>Continuă la Oportunitate</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* TAB 6: OPORTUNITATE (Cross-sell / Upsell) */}
      {activeTab === 'opportunity' && (
        <Card className="p-6 bg-white dark:bg-neutral-900 space-y-6">
          <div className="border-b border-neutral-100 dark:border-neutral-800 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>Oportunitate de Cross-Sell / Produse Viitoare</span>
            </h2>
            <span className="text-xs text-neutral-400">Interese de asigurare identificate</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Produs Suplimentar Vizat"
              value={formData.opportunity.product}
              onChange={(e) => setFormData({ ...formData, opportunity: { ...formData.opportunity, product: e.target.value } })}
              options={[
                { value: '', label: '— Nicio oportunitate inițială —' },
                ...INSURANCE_PRODUCTS,
              ]}
            />
            <Input
              label="Primă Estimată (RON)"
              type="number"
              placeholder="ex: 3500"
              value={formData.opportunity.estimated_premium}
              onChange={(e) => setFormData({ ...formData, opportunity: { ...formData.opportunity, estimated_premium: e.target.value } })}
            />
            <Select
              label="Etapă Pipeline"
              value={formData.opportunity.status}
              onChange={(e) => setFormData({ ...formData, opportunity: { ...formData.opportunity, status: e.target.value } })}
              options={[
                { value: 'LEAD', label: 'Lead / Identificat' },
                { value: 'PROPOSAL', label: 'Ofertă Prezentată' },
                { value: 'NEGOTIATION', label: 'Negociere' },
                { value: 'CLOSED_WON', label: 'Câștigat' },
                { value: 'CLOSED_LOST', label: 'Pierdut' },
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
              Observații Oportunitate
            </label>
            <textarea
              rows={3}
              placeholder="Clientul are în plan achiziția unei a doua mașini în Q4 sau dorește asigurare de viață cu acumulare de capital..."
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
              value={formData.opportunity.notes}
              onChange={(e) => setFormData({ ...formData, opportunity: { ...formData.opportunity, notes: e.target.value } })}
            />
          </div>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={() => setActiveTab('interactions')} className="text-xs">
              Înapoi la Interacțiuni
            </Button>
            <Button type="button" onClick={() => setActiveTab('documents')} className="text-xs gap-2">
              <span>Continuă la Documente</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* TAB 7: DOCUMENTE */}
      {activeTab === 'documents' && (
        <Card className="p-6 bg-white dark:bg-neutral-900 space-y-6">
          <div className="border-b border-neutral-100 dark:border-neutral-800 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Document Vault &amp; Dosare Digitale</span>
            </h2>
            <span className="text-xs text-neutral-400">Protejat prin Supabase Storage RLS</span>
          </div>

          <div className="p-6 bg-neutral-50 dark:bg-neutral-800/40 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Dosarul de documente va fi generat automat pentru acest client
            </h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
              După salvarea clientului, veți putea încărca imediat în Workspace-ul dedicat: <strong>Polița semnată</strong>, <strong>Oferta comparativă</strong>, <strong>Copie CI / Talon / CIV</strong>, <strong>Act proprietate</strong> și <strong>Procese-verbale de daună</strong>.
            </p>
          </div>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={() => setActiveTab('opportunity')} className="text-xs">
              Înapoi la Oportunitate
            </Button>
            <Button type="button" onClick={() => setActiveTab('claims')} className="text-xs gap-2">
              <span>Continuă la Daune</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* TAB 8: DAUNE */}
      {activeTab === 'claims' && (
        <Card className="p-6 bg-white dark:bg-neutral-900 space-y-6">
          <div className="border-b border-neutral-100 dark:border-neutral-800 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Înregistrare Dosar Daună / Incident Activ (Opțional)</span>
            </h2>
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={formData.claim.has_claim}
                onChange={(e) => setFormData({ ...formData, claim: { ...formData.claim, has_claim: e.target.checked } })}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Înregistrează o daună existentă</span>
            </label>
          </div>

          {formData.claim.has_claim ? (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Tip Daună *"
                  placeholder="ex: Tamponare spate, Inundație apartament"
                  value={formData.claim.claim_type}
                  onChange={(e) => setFormData({ ...formData, claim: { ...formData.claim, claim_type: e.target.value } })}
                />
                <Input
                  label="Număr Dosar Daună"
                  placeholder="ex: DS-2026-9941"
                  value={formData.claim.claim_number}
                  onChange={(e) => setFormData({ ...formData, claim: { ...formData.claim, claim_number: e.target.value } })}
                />
                <Input
                  label="Data Incidentului *"
                  type="date"
                  value={formData.claim.incident_date}
                  onChange={(e) => setFormData({ ...formData, claim: { ...formData.claim, incident_date: e.target.value } })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Valoare Estimată Pagubă (RON)"
                  type="number"
                  placeholder="ex: 8500"
                  value={formData.claim.estimated_amount}
                  onChange={(e) => setFormData({ ...formData, claim: { ...formData.claim, estimated_amount: e.target.value } })}
                />
                <Select
                  label="Status Dosar Daună"
                  value={formData.claim.status}
                  onChange={(e) => setFormData({ ...formData, claim: { ...formData.claim, status: e.target.value } })}
                  options={[
                    { value: 'OPEN', label: 'Deschis / În Evaluare' },
                    { value: 'UNDER_REVIEW', label: 'Constatare Efectuată' },
                    { value: 'APPROVED', label: 'Aprobat la Plată' },
                    { value: 'PAID', label: 'Despăgubit / Finalizat' },
                    { value: 'REJECTED', label: 'Respins' },
                    { value: 'CLOSED', label: 'Închis' },
                  ]}
                />
                <Input
                  label="Următorul Pas / Acțiune"
                  placeholder="ex: Programare reconstatare service auto"
                  value={formData.claim.next_action}
                  onChange={(e) => setFormData({ ...formData, claim: { ...formData.claim, next_action: e.target.value } })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                  Descriere Împrejurări &amp; Pagube
                </label>
                <textarea
                  rows={3}
                  placeholder="Descriere detaliată a evenimentului asigurat..."
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
                  value={formData.claim.description}
                  onChange={(e) => setFormData({ ...formData, claim: { ...formData.claim, description: e.target.value } })}
                />
              </div>
            </div>
          ) : (
            <p className="text-xs text-neutral-500 py-4 text-center">
              Nicio daună bifată. Clientul nu are dosare de daună active la momentul înregistrării.
            </p>
          )}

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={() => setActiveTab('documents')} className="text-xs">
              Înapoi la Documente
            </Button>
            <Button type="button" onClick={() => setActiveTab('notes')} className="text-xs gap-2">
              <span>Continuă la Note &amp; Finalizare</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* TAB 9: NOTE / ISTORIC */}
      {activeTab === 'notes' && (
        <Card className="p-6 bg-white dark:bg-neutral-900 space-y-6">
          <div className="border-b border-neutral-100 dark:border-neutral-800 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600" />
              <span>Note Interne &amp; Observații Comerciale</span>
            </h2>
            <span className="text-xs text-neutral-400">Vizibil doar echipei de brokeraj</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
              Observații Generale despre Relația cu Clientul
            </label>
            <textarea
              rows={4}
              placeholder="Preferă comunicarea dimineața pe WhatsApp. Are contracte de asigurare și pentru cele 3 vehicule ale firmei. Fidelizare prin discount de volum..."
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
              value={formData.client.personal_notes}
              onChange={(e) => setFormData({ ...formData, client: { ...formData.client, personal_notes: e.target.value } })}
            />
          </div>

          <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl border border-blue-200/60 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>Gata pentru Salvare Atomică</span>
            </p>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              La apăsarea butonului &quot;Salvează Clientul&quot;, datele vor fi validate și persistate tranzacțional în tabelele Supabase. Veți fi redirecționat automat către Workspace-ul dedicat al clientului.
            </p>
          </div>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={() => setActiveTab('claims')} className="text-xs">
              Înapoi la Daune
            </Button>
            <Button type="submit" disabled={submitting} className="text-xs font-bold gap-2 shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? 'Se salvează în DB...' : 'Finalizează & Salvează Clientul'}</span>
            </Button>
          </div>
        </Card>
      )}
    </form>
  )
}
