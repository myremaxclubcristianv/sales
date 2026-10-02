'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  Shield, 
  ArrowLeft, 
  Phone, 
  Mail, 
  Clock, 
  FileText, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  ExternalLink, 
  Car, 
  Home, 
  Plane, 
  Database, 
  Lock
} from 'lucide-react'
import { InsuranceClientDetailItem } from '@/lib/db/insurance-isolated'
import { calculateExpiration, maskCNP } from '@/lib/utils/insurance-expiration'

interface InsuranceClientDetailViewProps {
  client: InsuranceClientDetailItem
}

export function InsuranceClientDetailView({ client }: InsuranceClientDetailViewProps) {
  const [showCNP, setShowCNP] = useState(false)
  const [showRawInspector, setShowRawInspector] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'policies' | 'notes' | 'activities' | 'raw'>('policies')
  const [newNote, setNewNote] = useState('')
  const [notesList, setNotesList] = useState(client.notes_list || [])

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNote.trim()) return
    const note = {
      id: `manual-note-${Date.now()}`,
      content: newNote.trim(),
      created_at: new Date().toISOString(),
      created_by: 'Broker Asigurări',
    }
    setNotesList([note, ...notesList])
    setNewNote('')
  }

  const cleanPhone = client.phone?.replace(/\D/g, '') || ''
  const waPhone = cleanPhone.startsWith('0') ? '4' + cleanPhone : cleanPhone.startsWith('7') ? '40' + cleanPhone : cleanPhone

  return (
    <div className="space-y-6">
      {/* Top Breadcrumbs & Back link */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/insurance/clients"
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Înapoi la Clienți Activi Insurance</span>
        </Link>

        <button
          onClick={() => setShowRawInspector(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl transition cursor-pointer"
        >
          <Database className="w-3.5 h-3.5 text-neutral-500" />
          <span>Inspector Sursă Brută Excel</span>
        </button>
      </div>

      {/* Client Header Card */}
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
              {client.full_name?.charAt(0).toUpperCase() || 'C'}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {client.full_name}
                </h1>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  client.status === 'ACTIVE'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900'
                    : 'bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {client.status}
                </span>
                {client.import_source_id && (
                  <span className="text-[11px] font-mono px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 rounded-md">
                    {client.import_source_id}
                  </span>
                )}
              </div>

              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Sursă lead: <span className="font-semibold text-neutral-700 dark:text-neutral-300">{client.source || 'Direct'}</span>
                {client.last_interaction && (
                  <span className="ml-3">
                    Ultima interacțiune: <span className="font-semibold text-neutral-700 dark:text-neutral-300">{client.last_interaction}</span>
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {client.phone && (
              <>
                <a
                  href={`tel:${client.canonical_phone || client.phone}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl text-xs font-bold transition"
                >
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  <span>Apelează</span>
                </a>

                <a
                  href={`https://wa.me/${waPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </>
            )}

            {client.email && (
              <a
                href={`mailto:${client.email}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl text-xs font-bold transition"
              >
                <Mail className="w-3.5 h-3.5 text-neutral-600" />
                <span>Email</span>
              </a>
            )}
          </div>
        </div>

        {/* Contact and Identity Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 text-xs">
          {/* Phone */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Telefon Mobil</span>
            {client.phone ? (
              <div className="flex items-center gap-2">
                <span className="font-bold text-neutral-800 dark:text-neutral-200 font-mono">
                  {client.canonical_phone || client.phone}
                </span>
                <button
                  onClick={() => handleCopy(client.canonical_phone || client.phone || '', 'phone')}
                  className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
                  title="Copiază"
                >
                  {copiedKey === 'phone' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            ) : (
              <p className="text-neutral-400 italic">Lipsă</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Email</span>
            {client.email ? (
              <div className="flex items-center gap-2">
                <span className="font-bold text-neutral-800 dark:text-neutral-200 truncate" title={client.email}>
                  {client.email}
                </span>
                <button
                  onClick={() => handleCopy(client.email || '', 'email')}
                  className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
                  title="Copiază"
                >
                  {copiedKey === 'email' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            ) : (
              <p className="text-neutral-400 italic">Lipsă</p>
            )}
          </div>

          {/* Protected CNP (with toggle) */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
              <Lock className="w-3 h-3 text-amber-500" />
              <span>CNP (Protejat)</span>
            </span>
            {client.cnp ? (
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">
                  {showCNP ? client.cnp : maskCNP(client.cnp)}
                </span>
                <button
                  onClick={() => setShowCNP(!showCNP)}
                  className="p-1 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
                  title={showCNP ? 'Ascunde CNP' : 'Arată CNP'}
                >
                  {showCNP ? <EyeOff className="w-3.5 h-3.5 text-amber-600" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                {showCNP && (
                  <button
                    onClick={() => handleCopy(client.cnp || '', 'cnp')}
                    className="p-1 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                    title="Copiază CNP"
                  >
                    {copiedKey === 'cnp' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                )}
              </div>
            ) : (
              <p className="text-neutral-400 italic">Nedefinit în sursă</p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Adresă Înregistrată</span>
            <p className="font-medium text-neutral-800 dark:text-neutral-200 truncate" title={client.address || 'Fără adresă'}>
              {client.address || 'Fără adresă înregistrată'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('policies')}
          className={`pb-3 border-b-2 transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'policies'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Polițe Active ({client.policies?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`pb-3 border-b-2 transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'notes'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Note &amp; Observații ({notesList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('activities')}
          className={`pb-3 border-b-2 transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'activities'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Istoric &amp; Activitate</span>
        </button>
      </div>

      {/* Tab 1: Policies Cards */}
      {activeTab === 'policies' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {client.policies?.map((policy, idx) => {
              const exp = calculateExpiration(policy.expiry_date)
              const isProperty = policy.policy_type === 'PAD' || policy.policy_type === 'EUROCASA' || policy.property_details

              return (
                <div
                  key={policy.id || idx}
                  className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 shadow-2xs space-y-4 relative overflow-hidden"
                >
                  {/* Top Bar with Badge & Expiration Urgency */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                        policy.policy_type === 'RCA'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                          : policy.policy_type === 'PAD' || policy.policy_type === 'EUROCASA'
                          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                      }`}>
                        {policy.policy_type === 'RCA' ? <Car className="w-5 h-5" /> : isProperty ? <Home className="w-5 h-5" /> : <Plane className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
                            {policy.policy_type}
                          </h3>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                            {policy.insurer || policy.insurer_raw || 'Generali'}
                          </span>
                        </div>
                        {policy.policy_number ? (
                          <p className="text-[11px] font-mono text-neutral-500">
                            Nr: {policy.policy_number}
                          </p>
                        ) : (
                          <p className="text-[10px] text-neutral-400 italic">Poliță emisă</p>
                        )}
                      </div>
                    </div>

                    {/* Expiration Badge */}
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${exp.badgeColor}`}>
                      <Clock className="w-3 h-3" />
                      {exp.label}
                    </span>
                  </div>

                  {/* Policy Data Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                    <div>
                      <span className="text-[10px] text-neutral-400 font-bold uppercase block">Emisă la</span>
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                        {policy.issue_date ? new Date(policy.issue_date).toLocaleDateString('ro-RO') : '—'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-neutral-400 font-bold uppercase block">Expiră la</span>
                      <span className="font-bold text-neutral-900 dark:text-neutral-100">
                        {new Date(policy.expiry_date).toLocaleDateString('ro-RO')}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-neutral-400 font-bold uppercase block">Primă</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {policy.premium_amount ? `${policy.premium_amount} ${policy.premium_currency}` : '—'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-neutral-400 font-bold uppercase block">Comision</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {policy.commission_rate || (policy.commission_amount !== null && policy.commission_amount !== undefined ? `${policy.commission_amount} RON` : '—')}
                      </span>
                    </div>

                    {policy.vin && (
                      <div className="col-span-2">
                        <span className="text-[10px] text-neutral-400 font-bold uppercase block">Serie Șasiu (VIN)</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">
                            {policy.vin}
                          </span>
                          <button
                            onClick={() => handleCopy(policy.vin || '', `vin-${idx}`)}
                            className="p-1 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                            title="Copiază VIN"
                          >
                            {copiedKey === `vin-${idx}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    )}

                    {policy.vehicle_registration && (
                      <div>
                        <span className="text-[10px] text-neutral-400 font-bold uppercase block">Nr. Înmatriculare</span>
                        <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                          {policy.vehicle_registration}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Extra Notes / Property Details if present */}
                  {(policy.notes || policy.property_details || policy.details) && (
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl text-xs space-y-1 text-neutral-600 dark:text-neutral-300">
                      <span className="text-[10px] font-bold uppercase text-neutral-400 block">Observații asociate</span>
                      <p>{policy.property_details || policy.details || policy.notes}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Notes */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          <form onSubmit={handleAddNote} className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">Adaugă Notă Operativă</h3>
            <textarea
              rows={3}
              placeholder="Scrie o notă privind clientul, istoricul sau detalii reînnoire..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="w-full p-3 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Salvează Nota
              </button>
            </div>
          </form>

          <div className="space-y-3">
            {notesList.map((note) => (
              <div
                key={note.id}
                className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-1"
              >
                <div className="flex items-center justify-between text-[11px] text-neutral-400">
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                    {note.created_by || 'Notă Sistem'}
                  </span>
                  <span>{new Date(note.created_at).toLocaleString('ro-RO')}</span>
                </div>
                <p className="text-xs text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap">
                  {note.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Activities */}
      {activeTab === 'activities' && (
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Jurnal Activitate Client</h3>
          <div className="space-y-4">
            {client.activities?.map((act) => (
              <div key={act.id} className="flex items-start gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                <div className="space-y-0.5">
                  <p className="font-bold text-neutral-900 dark:text-neutral-100">{act.title}</p>
                  {act.description && <p className="text-neutral-600 dark:text-neutral-400">{act.description}</p>}
                  <p className="text-[10px] text-neutral-400 font-mono">
                    {new Date(act.created_at).toLocaleString('ro-RO')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RAW DATA INSPECTOR MODAL */}
      {showRawInspector && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 w-full max-w-2xl rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                  Inspector Date Brute (Sursă Excel)
                </h3>
              </div>
              <button
                onClick={() => setShowRawInspector(false)}
                className="px-2.5 py-1 text-xs bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-lg text-neutral-700 dark:text-neutral-300 font-bold transition cursor-pointer"
              >
                Închide
              </button>
            </div>

            <p className="text-xs text-neutral-500">
              Această secțiune conține datele originale 100% nealterate așa cum au fost furnizate în sursa de adevăr (Excel).
            </p>

            <div className="bg-neutral-950 text-emerald-400 p-4 rounded-xl font-mono text-[11px] overflow-x-auto">
              <pre>{JSON.stringify({ client_source_data: client.source_data, policies_source_data: client.policies?.map(p => p.source_data) }, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
