'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Phone,
  Mail,
  Globe,
  MapPin,
  Clock,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  FileText,
  MessageSquare,
  ExternalLink,
  Send,
  PhoneCall,
} from 'lucide-react'
import {
  type InsuranceCompany,
  type InsuranceCompanyActivity,
  type ProspectStatus,
  PROSPECT_STATUSES,
} from '@/lib/data/verified-insurance-companies-dataset'

interface CompanyDetailClientProps {
  initialCompany: InsuranceCompany
  initialActivities: InsuranceCompanyActivity[]
}

export function CompanyDetailClient({
  initialCompany,
  initialActivities,
}: CompanyDetailClientProps) {
  const [company, setCompany] = useState<InsuranceCompany>(initialCompany)
  const [activities, setActivities] = useState<InsuranceCompanyActivity[]>(initialActivities)

  // Edit state for CRM workflow
  const [status, setStatus] = useState<ProspectStatus>(company.prospect_status)
  const [lastContact, setLastContact] = useState<string>(company.last_contact_at?.split('T')[0] || '')
  const [nextFollowUp, setNextFollowUp] = useState<string>(company.next_follow_up_at?.split('T')[0] || '')
  const [crmNotes, setCrmNotes] = useState<string>(company.crm_notes || '')

  // Additional phones & emails
  const [additionalPhones, setAdditionalPhones] = useState<string[]>(company.additional_phones || [])
  const [newPhone, setNewPhone] = useState('')
  const [additionalEmails, setAdditionalEmails] = useState<string[]>(company.additional_emails || [])
  const [newEmail, setNewEmail] = useState('')

  // New activity form state
  const [activityType, setActivityType] = useState<InsuranceCompanyActivity['activity_type']>('NOTE')
  const [activityContent, setActivityContent] = useState('')
  const [isSubmittingActivity, setIsSubmittingActivity] = useState(false)
  const [isSavingWorkflow, setIsSavingWorkflow] = useState(false)
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('')

  // Save CRM workflow changes
  const handleSaveWorkflow = async () => {
    setIsSavingWorkflow(true)
    setSaveSuccessMsg('')
    try {
      const res = await fetch(`/api/insurance/companies/${company.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prospect_status: status,
          last_contact_at: lastContact ? new Date(lastContact).toISOString() : null,
          next_follow_up_at: nextFollowUp ? new Date(nextFollowUp).toISOString() : null,
          crm_notes: crmNotes.trim() || null,
          additional_phones: additionalPhones,
          additional_emails: additionalEmails,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setCompany(data.company)
        setActivities(data.activities || activities)
        setSaveSuccessMsg('Modificările au fost salvate cu succes!')
        setTimeout(() => setSaveSuccessMsg(''), 4000)
      } else {
        alert('Eroare la salvarea modificărilor.')
      }
    } catch (err) {
      console.error('Failed to save workflow:', err)
      alert('A apărut o eroare la salvare.')
    } finally {
      setIsSavingWorkflow(false)
    }
  }

  // Add new phone
  const handleAddPhone = () => {
    if (newPhone.trim()) {
      setAdditionalPhones([...additionalPhones, newPhone.trim()])
      setNewPhone('')
    }
  }

  const handleRemovePhone = (index: number) => {
    setAdditionalPhones(additionalPhones.filter((_, i) => i !== index))
  }

  // Add new email
  const handleAddEmail = () => {
    if (newEmail.trim()) {
      setAdditionalEmails([...additionalEmails, newEmail.trim()])
      setNewEmail('')
    }
  }

  const handleRemoveEmail = (index: number) => {
    setAdditionalEmails(additionalEmails.filter((_, i) => i !== index))
  }

  // Add new activity
  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activityContent.trim()) return

    setIsSubmittingActivity(true)
    try {
      const res = await fetch(`/api/insurance/companies/${company.id}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity_type: activityType,
          content: activityContent.trim(),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setActivities(data.activities || [data.activity, ...activities])
        setActivityContent('')
      } else {
        alert('Eroare la adăugarea activității.')
      }
    } catch (err) {
      console.error('Failed to add activity:', err)
    } finally {
      setIsSubmittingActivity(false)
    }
  }

  const isActualPhone = (p: string) => /\d{5,}/.test(p)
  const isActualEmail = (e: string) => /@.+\./.test(e)
  const isActualUrl = (u: string) => u.startsWith('http') || u.includes('.ro') || u.includes('.com')

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-500 mb-2">
              <Link
                href="/admin/insurance/firme"
                className="hover:text-blue-600 transition flex items-center gap-1 font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Firme Asigurări</span>
              </Link>
              <span>/</span>
              <span className="font-mono text-neutral-600 dark:text-neutral-400">
                {company.import_source_id}
              </span>
              <span>/</span>
              <span className="text-neutral-800 dark:text-neutral-200 font-semibold">{company.name}</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-neutral-100">
                {company.name}
              </h1>
              <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300">
                {company.table_name} (#{company.nr})
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Tip: <span className="font-semibold text-neutral-700 dark:text-neutral-300">{company.activity_type}</span> • Oraș:{' '}
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">{company.city || 'Nespecificat'}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/insurance/firme"
              className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-xl text-xs font-semibold transition"
            >
              Înapoi la Listă
            </Link>
          </div>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Cele 9 coloane originale din sursă (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Card: Date Originale Importate */}
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Cele 9 Coloane Originale Sursă</span>
              </h2>
              <span className="text-[10px] font-mono text-neutral-400">Audit fidel 100%</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* 1. Nr. */}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-0.5">
                  1. Nr. Original &amp; Tabel
                </span>
                <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">
                  #{company.nr} ({company.table_name}, rândul {company.row_index})
                </span>
              </div>

              {/* 2. Denumire Firmă */}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-0.5">
                  2. Denumire Firmă
                </span>
                <span className="font-bold text-neutral-900 dark:text-neutral-100">
                  {company.name}
                </span>
              </div>

              {/* 3. Tip Activitate */}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl sm:col-span-2">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-0.5">
                  3. Tip Activitate
                </span>
                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                  {company.activity_type || '—'}
                </span>
              </div>

              {/* 4. Telefon */}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl sm:col-span-2">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                  4. Telefon Sursă
                </span>
                {company.phone ? (
                  isActualPhone(company.phone) ? (
                    <div className="flex flex-wrap items-center gap-2">
                      {company.phone.split(/;|\//).map((ph, idx) => {
                        const clean = ph.trim()
                        if (!clean) return null
                        return (
                          <a
                            key={idx}
                            href={`tel:${clean.replace(/\s+/g, '')}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-lg font-mono font-bold text-xs transition"
                          >
                            <PhoneCall className="w-3 h-3" />
                            <span>{clean}</span>
                          </a>
                        )
                      })}
                    </div>
                  ) : (
                    <span className="text-neutral-600 dark:text-neutral-400 italic">
                      {company.phone}
                    </span>
                  )
                ) : (
                  <span className="text-neutral-400">—</span>
                )}
              </div>

              {/* 5. Email */}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl sm:col-span-2">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                  5. Email Sursă
                </span>
                {company.email ? (
                  isActualEmail(company.email) ? (
                    <div className="flex flex-wrap items-center gap-2">
                      {company.email.split(/;|,/).map((em, idx) => {
                        const clean = em.trim()
                        if (!clean) return null
                        return (
                          <a
                            key={idx}
                            href={`mailto:${clean}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs transition"
                          >
                            <Mail className="w-3 h-3" />
                            <span>{clean}</span>
                          </a>
                        )
                      })}
                    </div>
                  ) : (
                    <span className="text-neutral-600 dark:text-neutral-400 italic">
                      {company.email}
                    </span>
                  )
                ) : (
                  <span className="text-neutral-400">—</span>
                )}
              </div>

              {/* 6. Website */}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl sm:col-span-2">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                  6. Website Sursă
                </span>
                {company.website ? (
                  isActualUrl(company.website) ? (
                    <a
                      href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1.5 font-medium"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>{company.website}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-neutral-600 dark:text-neutral-400 italic">
                      {company.website}
                    </span>
                  )
                ) : (
                  <span className="text-neutral-400">—</span>
                )}
              </div>

              {/* 7. Adresă / Sediu */}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl sm:col-span-2">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-0.5">
                  7. Adresă / Sediu Sursă
                </span>
                <span className="text-neutral-800 dark:text-neutral-200">
                  {company.address || '—'}
                </span>
              </div>

              {/* 8. Oraș / Județ */}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-0.5">
                  8. Oraș / Județ
                </span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-neutral-400" />
                  <span>{company.city || '—'}</span>
                </span>
              </div>

              {/* Internal ID */}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-0.5">
                  ID Intern Deterministic
                </span>
                <span className="font-mono text-neutral-700 dark:text-neutral-300 font-bold">
                  {company.import_source_id}
                </span>
              </div>

              {/* 9. Observații / Sursă */}
              <div className="p-3.5 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-xl sm:col-span-2">
                <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-400 block mb-1">
                  9. {company.observations_header} (Integral din sursă)
                </span>
                <p className="text-xs text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed">
                  {company.original_observations || 'Nicio observație specificată în fișier.'}
                </p>
              </div>
            </div>
          </div>

          {/* Card: Contacte Adiționale (Telefoane & Emailuri adăugate de administrator) */}
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-blue-600" />
              <span>Contacte Adiționale (Adăugate ulterior)</span>
            </h3>
            <p className="text-[11px] text-neutral-500">
              Valorile originale importate rămân neschimbate pentru audit. Aici poți adăuga numere de telefon sau emailuri suplimentare identificate în timpul discuțiilor.
            </p>

            {/* Additional Phones */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 block">
                Telefoane adiționale
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="Ex: 0722 123 456 (Director Flotă)"
                  className="flex-1 px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddPhone}
                  className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Adaugă</span>
                </button>
              </div>

              {additionalPhones.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  {additionalPhones.map((ph, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 bg-neutral-50 dark:bg-neutral-800/60 rounded-lg text-xs"
                    >
                      <span className="font-mono text-neutral-800 dark:text-neutral-200">{ph}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePhone(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Additional Emails */}
            <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 block">
                Emailuri adiționale
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Ex: achizitii@firma.ro"
                  className="flex-1 px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddEmail}
                  className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Adaugă</span>
                </button>
              </div>

              {additionalEmails.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  {additionalEmails.map((em, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 bg-neutral-50 dark:bg-neutral-800/60 rounded-lg text-xs"
                    >
                      <span className="text-neutral-800 dark:text-neutral-200">{em}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveEmail(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: CRM Workflow & Istoric Activități (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Card: Workflow Comercial Prospectare */}
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Workflow Comercial &amp; Status Prospect</span>
              </h2>
              <span className="text-[10px] text-neutral-400">Separare strictă CRM</span>
            </div>

            <div className="space-y-4 text-xs">
              {/* Prospect Status */}
              <div>
                <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Status Prospectare (Editabil CRM)
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProspectStatus)}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl font-bold text-xs text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  {PROSPECT_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dates: Last contact & Next follow-up */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Ultimul contact
                  </label>
                  <input
                    type="date"
                    value={lastContact}
                    onChange={(e) => setLastContact(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Următorul follow-up
                  </label>
                  <input
                    type="date"
                    value={nextFollowUp}
                    onChange={(e) => setNextFollowUp(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Note CRM Interne */}
              <div>
                <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Note &amp; Strategie Comercială
                </label>
                <textarea
                  rows={4}
                  value={crmNotes}
                  onChange={(e) => setCrmNotes(e.target.value)}
                  placeholder="Notează discuția cu persoana de decizie, dimensiunea flotei, când expiră polițele CASCO/RCA actuale, cerințe specifice..."
                  className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Save Workflow Button */}
              <button
                type="button"
                disabled={isSavingWorkflow}
                onClick={handleSaveWorkflow}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition active:scale-98 shadow-sm flex items-center justify-center gap-2"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavingWorkflow ? 'Se salvează...' : 'Salvează Modificările CRM'}</span>
              </button>
            </div>
          </div>

          {/* Card: Istoric Activități & Notițe */}
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                <span>Istoric Activități &amp; Notițe ({activities.length})</span>
              </h3>
            </div>

            {/* Quick Add Form */}
            <form onSubmit={handleAddActivity} className="space-y-3">
              <div className="flex gap-2">
                <select
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value as InsuranceCompanyActivity['activity_type'])}
                  className="px-2.5 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-semibold"
                >
                  <option value="NOTE">Notă</option>
                  <option value="CALL">Apel telefonic</option>
                  <option value="EMAIL">Email trimis</option>
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="MEETING">Întâlnire</option>
                  <option value="OFFER">Ofertă trimisă</option>
                  <option value="FOLLOW_UP">Follow-up</option>
                </select>

                <input
                  type="text"
                  value={activityContent}
                  onChange={(e) => setActivityContent(e.target.value)}
                  placeholder="Introdu detalii activitate..."
                  className="flex-1 px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs"
                />

                <button
                  type="submit"
                  disabled={isSubmittingActivity || !activityContent.trim()}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  <span>Adaugă</span>
                </button>
              </div>
            </form>

            {/* Timeline */}
            <div className="space-y-3 pt-2">
              {activities.length === 0 ? (
                <div className="text-center py-8 text-neutral-400 text-xs">
                  Nicio activitate înregistrată încă pentru această firmă.
                </div>
              ) : (
                activities.map((act) => (
                  <div
                    key={act.id}
                    className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl text-xs border border-neutral-100 dark:border-neutral-800 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[10px] px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200">
                        {act.activity_type}
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        {new Date(act.created_at).toLocaleString('ro-RO', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-neutral-800 dark:text-neutral-200 text-xs leading-relaxed">
                      {act.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
