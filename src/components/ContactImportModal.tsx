'use client'

import React, { useState, useRef } from 'react'
import { autoDetectColumnMapping, parseCSV, parseVCF } from '@/lib/utils/csv'
import { normalizeEmail, normalizePhone } from '@/lib/utils/phone'
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  ArrowRight,
  X,
  Layers,
  Sparkles,
} from 'lucide-react'

interface ContactImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImportComplete: () => void
}

type Step = 'upload' | 'mapping' | 'preview' | 'importing' | 'summary'
export type ParsedContact = Record<string, string | Record<string, unknown>>

export function ContactImportModal({ isOpen, onClose, onImportComplete }: ContactImportModalProps) {
  const [step, setStep] = useState<Step>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [rawHeaders, setRawHeaders] = useState<string[]>([])
  const [rawRows, setRawRows] = useState<string[][]>([])
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
  const [importMode, setImportMode] = useState<'skip' | 'update_empty'>('skip')

  // Calculated preview stats
  const [parsedContacts, setParsedContacts] = useState<ParsedContact[]>([])
  const [stats, setStats] = useState({
    totalRows: 0,
    validContacts: 0,
    incompleteContacts: 0,
    duplicateContacts: 0,
    newContacts: 0,
  })

  // Batch progress state
  const [progress, setProgress] = useState({
    current: 0,
    total: 0,
    percentage: 0,
  })

  // Final summary
  const [summary, setSummary] = useState<{
    imported: number
    skipped: number
    duplicates: number
    invalid: number
    errors: Array<{ index: number; name: string; error: string }>
  } | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const resetAll = () => {
    setStep('upload')
    setFile(null)
    setRawHeaders([])
    setRawRows([])
    setColumnMapping({})
    setParsedContacts([])
    setStats({
      totalRows: 0,
      validContacts: 0,
      incompleteContacts: 0,
      duplicateContacts: 0,
      newContacts: 0,
    })
    setProgress({ current: 0, total: 0, percentage: 0 })
    setSummary(null)
    setError(null)
    setLoading(false)
  }

  // Handle File Selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const selected = e.target.files?.[0]
    if (!selected) return

    if (selected.size > 15 * 1024 * 1024) {
      setError('Fișierul este prea mare (maxim 15MB permise).')
      return
    }

    const isCSV = selected.name.toLowerCase().endsWith('.csv') || selected.name.toLowerCase().endsWith('.txt')
    const isVCF = selected.name.toLowerCase().endsWith('.vcf')

    if (!isCSV && !isVCF) {
      setError('Format neacceptat. Te rugăm să încarci un fișier .csv sau .vcf.')
      return
    }

    setFile(selected)
    setLoading(true)

    try {
      const text = await selected.text()

      if (isVCF) {
        const vcfContacts = parseVCF(text)
        if (vcfContacts.length === 0) {
          throw new Error('Nu au fost găsite contacte valide în fișierul VCF.')
        }
        setParsedContacts(vcfContacts)
        calculateStats(vcfContacts)
        setStep('preview')
      } else {
        const { headers, rows } = parseCSV(text)
        if (headers.length === 0 || rows.length === 0) {
          throw new Error('Fișierul CSV este gol sau are un format invalid.')
        }

        setRawHeaders(headers)
        setRawRows(rows)

        const detected = autoDetectColumnMapping(headers)
        setColumnMapping(detected)
        setStep('mapping')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Eroare la citirea fișierului.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // Process Mapping & Generate Preview Stats
  const handleMappingProceed = async () => {
    setLoading(true)
    setError(null)

    try {
      const contacts: ParsedContact[] = []

      for (const row of rawRows) {
        const contact: Record<string, string | Record<string, unknown>> = {}
        const rawData: Record<string, string> = {}

        rawHeaders.forEach((header, idx) => {
          const val = row[idx] || ''
          const mappedField = columnMapping[header]
          if (mappedField) {
            contact[mappedField] = val
          } else if (val) {
            rawData[header] = val
          }
        })

        if (Object.keys(rawData).length > 0) {
          contact.raw_data = rawData
        }

        contacts.push(contact)
      }

      setParsedContacts(contacts)
      await calculateStats(contacts)
      setStep('preview')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Eroare la procesarea coloanelor.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // Calculate statistics (intra-file duplicates + total valid)
  const calculateStats = async (contacts: ParsedContact[]) => {
    let valid = 0
    let incomplete = 0
    let duplicates = 0

    const seenPhones = new Set<string>()
    const seenEmails = new Set<string>()

    for (const c of contacts) {
      const name = String(c.first_name || '') + ' ' + String(c.last_name || '') + ' ' + String(c.name || '')
      const phone = String(c.phone || c.whatsapp || '')
      const email = String(c.email || '')

      const normP = normalizePhone(phone)
      const normE = normalizeEmail(email)

      const hasName = name.trim().length > 0
      const hasPhone = normP.length > 0
      const hasEmail = normE.length > 0

      if (!hasName && !hasPhone && !hasEmail) {
        incomplete++
        continue
      }

      let isDup = false
      if (normP && seenPhones.has(normP)) isDup = true
      if (normE && seenEmails.has(normE)) isDup = true

      if (isDup) {
        duplicates++
      } else {
        if (normP) seenPhones.add(normP)
        if (normE) seenEmails.add(normE)
      }

      valid++
    }

    setStats({
      totalRows: contacts.length,
      validContacts: valid,
      incompleteContacts: incomplete,
      duplicateContacts: duplicates,
      newContacts: valid - duplicates,
    })
  }

  // Execute Batch Import
  const startImport = async () => {
    setStep('importing')
    setLoading(true)
    setError(null)

    const BATCH_SIZE = 250
    const total = parsedContacts.length
    let processed = 0

    let totalImported = 0
    let totalSkipped = 0
    let totalDuplicates = 0
    let totalInvalid = 0
    const allErrors: Array<{ index: number; name: string; error: string }> = []

    try {
      for (let i = 0; i < total; i += BATCH_SIZE) {
        const chunk = parsedContacts.slice(i, i + BATCH_SIZE)
        const isFinal = i + BATCH_SIZE >= total

        const res = await fetch('/api/contacts/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file?.name || 'import.csv',
            contacts: chunk,
            mode: importMode,
            isFinalBatch: isFinal,
            totalExpectedRows: total,
          }),
        })

        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.error || 'Eroare la procesarea batch-ului de contacte.')
        }

        totalImported += data.importedCount || 0
        totalSkipped += data.skippedCount || 0
        totalDuplicates += data.duplicateCount || 0
        totalInvalid += data.invalidCount || 0
        if (data.errors) {
          allErrors.push(...data.errors)
        }

        processed += chunk.length
        setProgress({
          current: Math.min(processed, total),
          total,
          percentage: Math.round((Math.min(processed, total) / total) * 100),
        })
      }

      setSummary({
        imported: totalImported,
        skipped: totalSkipped,
        duplicates: totalDuplicates,
        invalid: totalInvalid,
        errors: allErrors,
      })
      setStep('summary')
      onImportComplete()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Eroare în timpul importului.'
      setError(msg)
      setStep('preview')
    } finally {
      setLoading(false)
    }
  }

  // CRM Available Fields for Dropdown
  const crmFields = [
    { id: '', label: '-- Ignoră această coloană --' },
    { id: 'first_name', label: 'Prenume (First Name)' },
    { id: 'last_name', label: 'Nume (Last Name)' },
    { id: 'name', label: 'Nume Complet (Full Name)' },
    { id: 'phone', label: 'Telefon Mobil / Phone' },
    { id: 'whatsapp', label: 'WhatsApp' },
    { id: 'email', label: 'Email' },
    { id: 'company_name', label: 'Companie / Organizație' },
    { id: 'role', label: 'Funcție / Titlu' },
    { id: 'notes', label: 'Note / Detalii' },
    { id: 'address', label: 'Adresă' },
    { id: 'city', label: 'Oraș' },
    { id: 'category', label: 'Categorie' },
    { id: 'source', label: 'Sursă' },
    { id: 'interest_summary', label: 'Ce dorește / Nevoie' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-neutral-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-neutral-100">
                Import Contacte în Agendă
              </h2>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                Încarcă mii de contacte din telefon sau fișier CSV/VCF
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 text-xs text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl">
              {error}
            </div>
          )}

          {/* STEP 1: UPLOAD */}
          {step === 'upload' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 dark:border-neutral-700 hover:border-blue-500 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-neutral-800/30 hover:bg-blue-50/30 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.vcf,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-neutral-200">
                  Apasă pentru a alege fișierul sau trage-l aici
                </p>
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
                  Suportă fișiere <strong>.CSV</strong> (Google Contacts, Outlook, Excel) și <strong>.VCF</strong> (vCard iPhone/Android)
                </p>
                <span className="inline-block mt-3 px-3 py-1 bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-neutral-300 rounded-lg text-xs font-semibold shadow-2xs">
                  Maxim 15MB
                </span>
              </div>
            </div>
          )}

          {/* STEP 2: COLUMN MAPPING */}
          {step === 'mapping' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 rounded-xl text-xs text-blue-900 dark:text-blue-300">
                Am detectat automat corespondența coloanelor. Verifică și ajustează dacă este necesar:
              </div>

              <div className="border border-slate-200 dark:border-neutral-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-neutral-800 max-h-72 overflow-y-auto">
                {rawHeaders.map((header) => {
                  const sampleVal = rawRows[0]?.[rawHeaders.indexOf(header)] || ''
                  return (
                    <div key={header} className="p-3 flex items-center justify-between gap-4 bg-white dark:bg-neutral-900">
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-neutral-100 block truncate">
                          {header}
                        </span>
                        {sampleVal && (
                          <span className="text-[11px] text-slate-400 truncate block">
                            Exemplu: {sampleVal}
                          </span>
                        )}
                      </div>

                      <select
                        value={columnMapping[header] || ''}
                        onChange={(e) =>
                          setColumnMapping((prev) => ({
                            ...prev,
                            [header]: e.target.value,
                          }))
                        }
                        className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-hidden font-medium text-slate-800 dark:text-neutral-200"
                      >
                        {crmFields.map((field) => (
                          <option key={field.id} value={field.id}>
                            {field.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )
                })}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={resetAll}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-neutral-300 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  ← Încarcă alt fișier
                </button>
                <button
                  type="button"
                  onClick={handleMappingProceed}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <span>Continuă la Previzualizare</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PREVIEW & RESOLUTION MODE */}
          {step === 'preview' && (
            <div className="space-y-4">
              {/* Stats Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-slate-50 dark:bg-neutral-800/60 rounded-xl border border-slate-200/80 dark:border-neutral-700 text-center">
                  <span className="text-xl font-bold text-slate-900 dark:text-neutral-100 block">
                    {stats.totalRows.toLocaleString()}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Total rânduri
                  </span>
                </div>

                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/40 text-center">
                  <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400 block">
                    {stats.validContacts.toLocaleString()}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700/80 uppercase tracking-wider">
                    Contacte valide
                  </span>
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/40 text-center">
                  <span className="text-xl font-bold text-amber-700 dark:text-amber-400 block">
                    {stats.duplicateContacts.toLocaleString()}
                  </span>
                  <span className="text-[11px] font-semibold text-amber-700/80 uppercase tracking-wider">
                    Duplicate
                  </span>
                </div>

                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-800/40 text-center">
                  <span className="text-xl font-bold text-rose-700 dark:text-rose-400 block">
                    {stats.incompleteContacts.toLocaleString()}
                  </span>
                  <span className="text-[11px] font-semibold text-rose-700/80 uppercase tracking-wider">
                    Incomplete
                  </span>
                </div>
              </div>

              {/* Non-destructive Duplicate Strategy Selection */}
              <div className="p-4 bg-slate-50 dark:bg-neutral-800/60 border border-slate-200 dark:border-neutral-700 rounded-xl space-y-2">
                <label className="block text-xs font-bold text-slate-800 dark:text-neutral-200 uppercase tracking-wider">
                  Tratare contacte existente (Non-destructiv):
                </label>
                <div className="space-y-2">
                  <label className="flex items-start gap-2.5 p-2 bg-white dark:bg-neutral-900 rounded-lg border border-slate-200 dark:border-neutral-700 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      value="skip"
                      checked={importMode === 'skip'}
                      onChange={() => setImportMode('skip')}
                      className="mt-0.5"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-neutral-100 block">
                        Ignoră contactele existente (Skip - Recomandat)
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-neutral-400 block">
                        Păstrează integral datele existente, fără nicio modificare.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2 bg-white dark:bg-neutral-900 rounded-lg border border-slate-200 dark:border-neutral-700 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      value="update_empty"
                      checked={importMode === 'update_empty'}
                      onChange={() => setImportMode('update_empty')}
                      className="mt-0.5"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-neutral-100 block">
                        Completează doar câmpurile goale (Update only empty fields)
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-neutral-400 block">
                        Adaugă doar informațiile lipsă, fără a suprascrie valorile deja completate.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setStep(rawHeaders.length > 0 ? 'mapping' : 'upload')}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-neutral-300 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  ← Înapoi
                </button>
                <button
                  type="button"
                  onClick={startImport}
                  disabled={loading || stats.validContacts === 0}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Începe importul ({stats.validContacts.toLocaleString()} contacte)</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: IMPORTING PROGRESS */}
          {step === 'importing' && (
            <div className="text-center py-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center mx-auto animate-pulse">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-neutral-100">
                  Se importă contactele...
                </h3>
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
                  Importing {progress.current.toLocaleString()} / {progress.total.toLocaleString()} contacte
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 dark:bg-neutral-800 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-slate-700 dark:text-neutral-300">
                {progress.percentage}%
              </span>
            </div>
          )}

          {/* STEP 5: FINAL SUMMARY */}
          {step === 'summary' && summary && (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-neutral-100">
                  Import finalizat cu succes!
                </h3>
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
                  Contactele au fost înregistrate în agendă.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/40 text-center">
                  <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400 block">
                    {summary.imported.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700/80 uppercase">Importate</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-neutral-800/60 rounded-xl border border-slate-200 dark:border-neutral-700 text-center">
                  <span className="text-lg font-bold text-slate-700 dark:text-neutral-300 block">
                    {summary.skipped.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Ignorate</span>
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/40 text-center">
                  <span className="text-lg font-bold text-amber-700 dark:text-amber-400 block">
                    {summary.duplicates.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-bold text-amber-700/80 uppercase">Duplicate</span>
                </div>

                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-800/40 text-center">
                  <span className="text-lg font-bold text-rose-700 dark:text-rose-400 block">
                    {summary.invalid.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-bold text-rose-700/80 uppercase">Invalide</span>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                >
                  Închide și vezi agenda
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
