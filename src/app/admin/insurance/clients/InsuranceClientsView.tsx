'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { 
  Shield, 
  Search, 
  Phone, 
  Mail, 
  Clock, 
  FileText, 
  Copy, 
  Check, 
  Eye, 
  ExternalLink,
  Plus
} from 'lucide-react'
import { InsuranceClientListItem } from '@/lib/db/insurance-isolated'
import { calculateExpiration } from '@/lib/utils/insurance-expiration'

interface InsuranceClientsViewProps {
  initialClients: InsuranceClientListItem[]
}

export function InsuranceClientsView({ initialClients }: InsuranceClientsViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')
  const [urgencyFilter, setUrgencyFilter] = useState<string>('ALL')
  const [productFilter, setProductFilter] = useState<string>('ALL')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Filter clients dynamically
  const filteredClients = useMemo(() => {
    return initialClients.filter((client) => {
      // 1. Search text
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchName = client.full_name?.toLowerCase().includes(q)
        const matchPhone = client.phone?.includes(q) || client.canonical_phone?.includes(q)
        const matchEmail = client.email?.toLowerCase().includes(q)
        const matchSource = client.source?.toLowerCase().includes(q)
        const matchPolicy = client.policies?.some(
          (p) =>
            p.policy_number?.toLowerCase().includes(q) ||
            p.vin?.toLowerCase().includes(q) ||
            p.vehicle_registration?.toLowerCase().includes(q) ||
            p.insurer?.toLowerCase().includes(q)
        )
        if (!matchName && !matchPhone && !matchEmail && !matchSource && !matchPolicy) {
          return false
        }
      }

      // 2. Status
      if (statusFilter !== 'ALL' && client.status !== statusFilter) {
        return false
      }

      // 3. Product filter
      if (productFilter !== 'ALL') {
        const hasProduct = client.policy_types?.some(
          (t) => t.toLowerCase() === productFilter.toLowerCase()
        )
        if (!hasProduct) return false
      }

      // 4. Urgency filter
      if (urgencyFilter !== 'ALL') {
        if (urgencyFilter === 'EXPIRED') {
          return client.has_expired_policies
        }
        if (urgencyFilter === 'EXPIRING_URGENT') {
          return client.has_urgent_expirations
        }
        if (urgencyFilter === 'EXPIRING_30_DAYS') {
          return client.policies?.some((p) => {
            const exp = calculateExpiration(p.expiry_date)
            return !exp.isExpired && exp.daysRemaining <= 30
          })
        }
      }

      return true
    })
  }, [initialClients, searchQuery, statusFilter, urgencyFilter, productFilter])

  // Extract unique policy types from actual dataset for safe filter options
  const availableProductTypes = useMemo(() => {
    const types = new Set<string>()
    initialClients.forEach((c) => {
      c.policy_types?.forEach((t) => types.add(t))
    })
    return Array.from(types)
  }, [initialClients])

  return (
    <div className="space-y-6">
      {/* Header & Stats Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <span>Clienți Activi Insurance</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-semibold">
                  {filteredClients.length} {filteredClients.length === 1 ? 'client' : 'clienți'}
                </span>
              </h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Baza izolată de clienți și polițe active de asigurare (RCA, PAD, EUROCASA, Travel)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/insurance/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs transition active:scale-95 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Client Nou Insurance</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Caută nume, telefon, email, VIN, poliță..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')}
              className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-neutral-100"
            >
              <option value="ALL">Status: Toți clienții</option>
              <option value="ACTIVE">Status: Doar Activi</option>
              <option value="INACTIVE">Status: Inactivi</option>
            </select>
          </div>

          {/* Urgency / Expiration Filter */}
          <div className="flex items-center gap-2">
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-neutral-100"
            >
              <option value="ALL">Expirări: Toate polițele</option>
              <option value="EXPIRING_URGENT">Expiră Urgent (&le; 7 zile)</option>
              <option value="EXPIRING_30_DAYS">Expiră în &le; 30 zile</option>
              <option value="EXPIRED">Expirate</option>
            </select>
          </div>

          {/* Product Type Filter */}
          <div className="flex items-center gap-2">
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-neutral-100"
            >
              <option value="ALL">Tip Asigurare: Toate</option>
              {availableProductTypes.map((type) => (
                <option key={type} value={type}>
                  Tip: {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Clients Master Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs overflow-hidden">
        {filteredClients.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
              <Search className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Niciun client găsit conform filtrelor selectate
            </p>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              Încearcă să resetezi căutarea sau filtrele de expirare pentru a afișa lista completă.
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('ALL')
                setUrgencyFilter('ALL')
                setProductFilter('ALL')
              }}
              className="px-4 py-2 text-xs bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl font-medium transition cursor-pointer"
            >
              Resetează filtrele
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Polițe Active</th>
                  <th className="py-3.5 px-4">Tipuri Produse</th>
                  <th className="py-3.5 px-4">Următoarea Expirare</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Sursă &amp; Interacțiune</th>
                  <th className="py-3.5 px-4 text-right">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 text-xs">
                {filteredClients.map((client) => {
                  const expiryCalc = calculateExpiration(client.earliest_expiry_date)
                  const cleanPhone = client.phone?.replace(/\D/g, '') || ''
                  const waPhone = cleanPhone.startsWith('0') ? '4' + cleanPhone : cleanPhone.startsWith('7') ? '40' + cleanPhone : cleanPhone

                  return (
                    <tr 
                      key={client.id}
                      className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors group"
                    >
                      {/* Client Name & ID */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-100 dark:border-blue-900/40">
                            {client.full_name?.charAt(0).toUpperCase() || 'C'}
                          </div>
                          <div>
                            <Link
                              href={`/admin/insurance/clients/${client.id}`}
                              className="font-bold text-neutral-900 dark:text-neutral-100 hover:text-blue-600 dark:hover:text-blue-400 transition"
                            >
                              {client.full_name}
                            </Link>
                            {client.import_source_id && (
                              <p className="text-[10px] text-neutral-400 font-mono">
                                {client.import_source_id}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact Info (Phone + Email) */}
                      <td className="py-4 px-4 space-y-1">
                        {client.phone ? (
                          <div className="flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200">
                            <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                            <a 
                              href={`tel:${client.canonical_phone || client.phone}`}
                              className="hover:underline hover:text-blue-600 font-medium"
                            >
                              {client.canonical_phone || client.phone}
                            </a>
                            <button
                              onClick={() => handleCopy(client.canonical_phone || client.phone || '', `ph-${client.id}`)}
                              className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded text-neutral-400 hover:text-neutral-600 cursor-pointer"
                              title="Copiază telefon"
                            >
                              {copiedId === `ph-${client.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        ) : (
                          <span className="text-neutral-400 italic text-[11px]">Fără telefon</span>
                        )}

                        {client.email ? (
                          <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
                            <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                            <a 
                              href={`mailto:${client.email}`}
                              className="hover:underline hover:text-blue-600 truncate max-w-[140px] block"
                              title={client.email}
                            >
                              {client.email}
                            </a>
                          </div>
                        ) : null}
                      </td>

                      {/* Policy Count & Volume */}
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
                            <FileText className="w-3 h-3 text-neutral-500" />
                            {client.policies_count} {client.policies_count === 1 ? 'poliță' : 'polițe'}
                          </span>
                          {client.total_premium_ron > 0 && (
                            <p className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                              {client.total_premium_ron.toLocaleString()} RON
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Product Types Badges */}
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1.5 max-w-[180px]">
                          {client.policy_types?.map((type) => {
                            const isRCA = type === 'RCA'
                            const isPAD = type === 'PAD' || type === 'EUROCASA'
                            return (
                              <span
                                key={type}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-tight border ${
                                  isRCA
                                    ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900'
                                    : isPAD
                                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900'
                                }`}
                              >
                                {type}
                              </span>
                            )
                          })}
                        </div>
                      </td>

                      {/* Next Expiration */}
                      <td className="py-4 px-4">
                        {client.earliest_expiry_date ? (
                          <div className="space-y-1">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${expiryCalc.badgeColor}`}>
                              <Clock className="w-3 h-3" />
                              {expiryCalc.label}
                            </span>
                            <p className="text-[11px] text-neutral-400">
                              {new Date(client.earliest_expiry_date).toLocaleDateString('ro-RO')}
                            </p>
                          </div>
                        ) : (
                          <span className="text-neutral-400 italic text-[11px]">—</span>
                        )}
                      </td>

                      {/* Client Status */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                          client.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900'
                            : 'bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400'
                        }`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          {client.status}
                        </span>
                      </td>

                      {/* Source & Last Interaction */}
                      <td className="py-4 px-4 space-y-0.5">
                        <p className="text-[11px] font-medium text-neutral-800 dark:text-neutral-200 truncate max-w-[130px]" title={client.source || 'Direct'}>
                          {client.source || 'Direct'}
                        </p>
                        {client.last_interaction && (
                          <p className="text-[10px] text-neutral-400 truncate max-w-[130px]" title={client.last_interaction}>
                            {client.last_interaction}
                          </p>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {client.phone && (
                            <a
                              href={`https://wa.me/${waPhone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition"
                              title="Mesaj WhatsApp"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}

                          <Link
                            href={`/admin/insurance/clients/${client.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-neutral-100 hover:bg-blue-600 hover:text-white dark:bg-neutral-800 dark:hover:bg-blue-600 text-neutral-700 dark:text-neutral-200 rounded-lg font-bold text-xs transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Dosar</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
