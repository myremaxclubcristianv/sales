'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ContactImportModal } from '@/components/ContactImportModal'
import { ConvertContactModal } from '@/components/ConvertContactModal'
import { ContactModal } from '@/components/ContactModal'
import { generateContactsCSV } from '@/lib/utils/csv'
import { CLIENT_CATEGORIES, getCategoryLabel } from '@/lib/types/crm'
import type { ContactRow } from '@/lib/db/contacts'
import {
  Users,
  UserPlus,
  FileSpreadsheet,
  Download,
  Search,
  Phone,
  Mail,
  Trash2,
  Edit2,
  UserCheck,
  CheckCircle2,
  ExternalLink,
  RotateCcw,
} from 'lucide-react'

interface ContactsViewProps {
  initialContacts: ContactRow[]
  totalCount: number
  clientsCount: number
  nonClientsCount: number
  initialCategory?: string
  initialClientFilter?: string
  initialSearch?: string
}

export function ContactsView({
  initialContacts,
  totalCount,
  clientsCount,
  nonClientsCount,
  initialCategory = 'ALL',
  initialClientFilter = 'all',
  initialSearch = '',
}: ContactsViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const [importModalOpen, setImportModalOpen] = useState(false)
  const [contactModalOpen, setContactModalOpen] = useState(false)
  const [convertModalOpen, setConvertModalOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<ContactRow | null>(null)

  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory)
  const [activeClientFilter, setActiveClientFilter] = useState<string>(initialClientFilter)

  const updateFilters = (newParams: { category?: string; clientFilter?: string; search?: string }) => {
    const params = new URLSearchParams(searchParams.toString())

    if (newParams.category !== undefined) {
      if (newParams.category && newParams.category !== 'ALL') {
        params.set('category', newParams.category)
      } else {
        params.delete('category')
      }
    }

    if (newParams.clientFilter !== undefined) {
      if (newParams.clientFilter && newParams.clientFilter !== 'all') {
        params.set('clientFilter', newParams.clientFilter)
      } else {
        params.delete('clientFilter')
      }
    }

    if (newParams.search !== undefined) {
      if (newParams.search) {
        params.set('search', newParams.search)
      } else {
        params.delete('search')
      }
    }

    startTransition(() => {
      router.push(`/admin/contacts?${params.toString()}`)
    })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters({ search: searchTerm })
  }

  const handleResetFilters = () => {
    setSearchTerm('')
    setActiveCategory('ALL')
    setActiveClientFilter('all')
    startTransition(() => {
      router.push('/admin/contacts')
    })
  }

  const handleExportCSV = () => {
    if (initialContacts.length === 0) {
      alert('Nu există contacte de exportat conform filtrelor curente.')
      return
    }

    const csvContent = generateContactsCSV(initialContacts)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `agenda_contacte_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDeleteContact = async (contact: ContactRow) => {
    const confirmMsg = `Sigur vrei să ștergi contactul ${contact.first_name} ${contact.last_name}?`
    if (!window.confirm(confirmMsg)) return

    try {
      const res = await fetch(`/api/contacts/${contact.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Eroare la ștergerea contactului.')
      router.refresh()
    } catch {
      alert('Eroare la ștergerea contactului.')
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Agenda Contacte
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-slate-100 text-slate-800 rounded-full border border-slate-200">
              {totalCount.toLocaleString()} {totalCount === 1 ? 'persoană' : 'persoane'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            Baza de contacte și agenda telefonică (separată de clienții CRM).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Exportă CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setImportModalOpen(true)}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Importă contacte</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedContact(null)
              setContactModalOpen(true)
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Adaugă contact</span>
          </button>
        </div>
      </div>

      {/* 2. Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div
          onClick={() => {
            setActiveClientFilter('all')
            updateFilters({ clientFilter: 'all' })
          }}
          className={`p-4 bg-white rounded-2xl border transition-all cursor-pointer shadow-xs ${
            activeClientFilter === 'all'
              ? 'border-blue-500 ring-2 ring-blue-500/10'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Total Agendă</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {totalCount.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">Toate contactele înregistrate</span>
        </div>

        <div
          onClick={() => {
            setActiveClientFilter('clients_only')
            updateFilters({ clientFilter: 'clients_only' })
          }}
          className={`p-4 bg-white rounded-2xl border transition-all cursor-pointer shadow-xs ${
            activeClientFilter === 'clients_only'
              ? 'border-emerald-500 ring-2 ring-emerald-500/10'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Clienți CRM
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-1">
            {clientsCount.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">Convertite în relații active CRM</span>
        </div>

        <div
          onClick={() => {
            setActiveClientFilter('agenda_only')
            updateFilters({ clientFilter: 'agenda_only' })
          }}
          className={`p-4 bg-white rounded-2xl border transition-all cursor-pointer shadow-xs ${
            activeClientFilter === 'agenda_only'
              ? 'border-amber-500 ring-2 ring-amber-500/10'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              Doar Agendă
            </span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-1">
            {nonClientsCount.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">Persoane neconvertite în clienți</span>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="relative sm:col-span-6">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Caută după nume, telefon, email, companie..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden text-slate-900 placeholder:text-slate-400 font-medium transition-colors"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={activeCategory}
              onChange={(e) => {
                setActiveCategory(e.target.value)
                updateFilters({ category: e.target.value })
              }}
              className="w-full px-3 py-2 text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden text-slate-900 font-medium transition-colors"
            >
              <option value="ALL">Toate categoriile</option>
              {CLIENT_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3 flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
            >
              Caută
            </button>

            {(searchTerm || activeCategory !== 'ALL' || activeClientFilter !== 'all') && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-300 transition-colors flex items-center gap-1"
                title="Resetează filtrele"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </form>
      </div>

      {/* 4. Contacts Table */}
      {initialContacts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Niciun contact găsit
          </h3>
          <p className="text-xs text-slate-600 max-w-sm mx-auto font-medium">
            Adaugă un contact manual sau importă lista din telefon folosind un fișier CSV/VCF.
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setImportModalOpen(true)}
              className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl shadow-xs"
            >
              Importă CSV
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedContact(null)
                setContactModalOpen(true)
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              + Adaugă contact
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 pl-6 pr-3">Persoană</th>
                  <th className="py-3.5 px-3">Telefon</th>
                  <th className="py-3.5 px-3">Email</th>
                  <th className="py-3.5 px-3">Companie & Rol</th>
                  <th className="py-3.5 px-3">Categorie</th>
                  <th className="py-3.5 px-3">Statut CRM</th>
                  <th className="py-3.5 pl-3 pr-6 text-right">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {initialContacts.map((contact) => {
                  const isClient = Boolean(contact.client_id)
                  return (
                    <tr
                      key={contact.id}
                      className="hover:bg-slate-50 transition-colors group"
                    >
                      {/* Name */}
                      <td className="py-3.5 pl-6 pr-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-300">
                            {contact.first_name?.[0] || 'C'}{contact.last_name?.[0] || ''}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block text-sm">
                              {contact.first_name} {contact.last_name}
                            </span>
                            {contact.interest_summary && (
                              <span className="text-[11px] text-slate-600 font-medium line-clamp-1">
                                💡 {contact.interest_summary}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-3">
                        {contact.phone ? (
                          <a
                            href={`tel:${contact.phone}`}
                            className="font-mono text-slate-800 font-medium hover:text-blue-600 transition-colors flex items-center gap-1.5"
                          >
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{contact.phone}</span>
                          </a>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-3">
                        {contact.email ? (
                          <a
                            href={`mailto:${contact.email}`}
                            className="text-slate-700 hover:text-blue-600 font-medium transition-colors flex items-center gap-1.5"
                          >
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{contact.email}</span>
                          </a>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Company & Role */}
                      <td className="py-3.5 px-3">
                        {contact.company_name || contact.role ? (
                          <div>
                            {contact.company_name && (
                              <span className="font-semibold text-slate-800 block">
                                {contact.company_name}
                              </span>
                            )}
                            {contact.role && (
                              <span className="text-[11px] text-slate-500 font-medium block">{contact.role}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3">
                        {contact.category ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-800 border border-slate-200">
                            {getCategoryLabel(contact.category)}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* CRM Status */}
                      <td className="py-3.5 px-3">
                        {isClient ? (
                          <Link
                            href={`/admin/clients/${contact.client_id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Client CRM</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            <span>Agendă</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 pl-3 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isClient && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedContact(contact)
                                setConvertModalOpen(true)
                              }}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 border border-blue-200"
                              title="Transformă în client CRM"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Convert</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedContact(contact)
                              setContactModalOpen(true)
                            }}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Editează contact"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteContact(contact)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Șterge contact"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden divide-y divide-slate-100">
            {initialContacts.map((contact) => {
              const isClient = Boolean(contact.client_id)
              return (
                <div key={contact.id} className="p-4 space-y-3 bg-white">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-300">
                        {contact.first_name?.[0] || 'C'}{contact.last_name?.[0] || ''}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-sm text-slate-900 truncate">
                          {contact.first_name} {contact.last_name}
                        </h3>
                        <p className="text-xs text-slate-600 font-mono mt-0.5 font-medium">{contact.phone || contact.email || '-'}</p>
                      </div>
                    </div>

                    {isClient ? (
                      <Link
                        href={`/admin/clients/${contact.client_id}`}
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
                      >
                        Client CRM
                      </Link>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        Agendă
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-2">
                      {contact.phone && (
                        <a
                          href={`tel:${contact.phone}`}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1 border border-slate-200"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Sună</span>
                        </a>
                      )}
                      {!isClient && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedContact(contact)
                            setConvertModalOpen(true)
                          }}
                          className="px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center gap-1 border border-blue-200"
                        >
                          <UserCheck className="w-3 h-3" />
                          <span>Convert</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedContact(contact)
                          setContactModalOpen(true)
                        }}
                        className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteContact(contact)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Modals */}
      <ContactImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImportComplete={() => {
          router.refresh()
        }}
      />

      <ConvertContactModal
        isOpen={convertModalOpen}
        contact={selectedContact}
        onClose={() => {
          setConvertModalOpen(false)
          setSelectedContact(null)
        }}
        onSuccess={() => {
          router.refresh()
        }}
      />

      <ContactModal
        isOpen={contactModalOpen}
        contact={selectedContact}
        onClose={() => {
          setContactModalOpen(false)
          setSelectedContact(null)
        }}
        onSuccess={() => {
          router.refresh()
        }}
      />
    </div>
  )
}
