'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import {
  Search,
  Phone,
  Car,
  Home,
  ChevronRight
} from 'lucide-react'
import { formatPhoneDisplay, getTelUrl } from '@/lib/utils/phone'

interface PolicyRow {
  id: string
  client_id: string
  policy_number: string | null
  product: string
  insurer: string
  premium: number | null
  commission: number | null
  currency: string
  start_date: string
  issue_date?: string | null
  expiry_date: string
  status: string
  notes: string | null
  details: string | null
  client?: {
    id: string
    first_name: string
    last_name: string
    phone: string | null
    email: string | null
    preferred_communication?: string
    lead_source?: string | null
  } | null
  vehicle?: {
    id: string
    vin: string
    make: string
    model: string
    year?: number | null
    plate_number?: string | null
  } | null
  property?: {
    id: string
    property_type: string
    address: string
    city?: string | null
    county?: string | null
  } | null
}

interface InsuranceMasterTableProps {
  initialPolicies: PolicyRow[]
}

type SortOption = 'expiry_asc' | 'premium_desc' | 'commission_desc' | 'client_asc'

export function InsuranceMasterTable({ initialPolicies }: InsuranceMasterTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [productFilter, setProductFilter] = useState('ALL')
  const [expiryFilter, setExpiryFilter] = useState('ALL') // ALL, 7, 30, 60, 90
  const [sortBy, setSortBy] = useState<SortOption>('expiry_asc')

  const now = useMemo(() => new Date(), [])

  // Filtered & Sorted Policies
  const filteredPolicies = useMemo(() => {
    return initialPolicies
      .filter((p) => {
        // Search term check
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase().trim()
          const clientName = `${p.client?.first_name || ''} ${p.client?.last_name || ''}`.toLowerCase()
          const phone = (p.client?.phone || '').toLowerCase()
          const email = (p.client?.email || '').toLowerCase()
          const policyNum = (p.policy_number || '').toLowerCase()
          const vin = (p.vehicle?.vin || '').toLowerCase()
          const make = (p.vehicle?.make || '').toLowerCase()

          const match =
            clientName.includes(q) ||
            phone.includes(q) ||
            email.includes(q) ||
            policyNum.includes(q) ||
            vin.includes(q) ||
            make.includes(q)

          if (!match) return false
        }

        // Product Filter
        if (productFilter !== 'ALL') {
          if (productFilter === 'AUTO' && p.product !== 'RCA' && p.product !== 'CASCO') return false
          if (productFilter !== 'AUTO' && p.product !== productFilter) return false
        }

        // Expiry Filter (7, 30, 60, 90 days)
        if (expiryFilter !== 'ALL') {
          const daysLimit = Number(expiryFilter)
          const targetDate = new Date(now.getTime() + daysLimit * 24 * 60 * 60 * 1000)
          const expDate = new Date(p.expiry_date)
          if (expDate < now || expDate > targetDate) {
            return false
          }
        }

        return true
      })
      .sort((a, b) => {
        if (sortBy === 'expiry_asc') {
          return new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()
        }
        if (sortBy === 'premium_desc') {
          return (Number(b.premium) || 0) - (Number(a.premium) || 0)
        }
        if (sortBy === 'commission_desc') {
          return (Number(b.commission) || 0) - (Number(a.commission) || 0)
        }
        if (sortBy === 'client_asc') {
          const nameA = `${a.client?.last_name || ''} ${a.client?.first_name || ''}`
          const nameB = `${b.client?.last_name || ''} ${b.client?.first_name || ''}`
          return nameA.localeCompare(nameB)
        }
        return 0
      })
  }, [initialPolicies, searchTerm, productFilter, expiryFilter, sortBy, now])

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Caută după Nume Client, Telefon, Email, Nr. Poliță, VIN..."
              className="w-full pl-9 pr-3 py-2 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Product Filter */}
          <select
            className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-medium focus:outline-none"
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
          >
            <option value="ALL">Toate Tipurile de Asigurare</option>
            <option value="RCA">RCA</option>
            <option value="CASCO">CASCO</option>
            <option value="HOME">Locuință (PAD/Facultativă)</option>
            <option value="LIFE">Viață</option>
            <option value="HEALTH">Sănătate</option>
            <option value="TRAVEL">Călătorie</option>
            <option value="IMM">IMM / Clădiri</option>
            <option value="BUSINESS">Business</option>
            <option value="CYBER">Cyber</option>
            <option value="AUTO">Toate Auto (RCA + CASCO)</option>
          </select>

          {/* Expiry Window Filter */}
          <select
            className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-medium focus:outline-none"
            value={expiryFilter}
            onChange={(e) => setExpiryFilter(e.target.value)}
          >
            <option value="ALL">Toate Termenele de Expirare</option>
            <option value="7">Expiră în 7 zile</option>
            <option value="30">Expiră în 30 de zile</option>
            <option value="60">Expiră în 60 de zile</option>
            <option value="90">Expiră în 90 de zile</option>
          </select>
        </div>

        {/* Secondary Filter & Sort Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-neutral-400 font-semibold uppercase text-[10px] tracking-wider">Filtre Rapide:</span>
            <button
              type="button"
              onClick={() => { setProductFilter('RCA'); setExpiryFilter('ALL'); }}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${productFilter === 'RCA' ? 'bg-blue-600 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'}`}
            >
              RCA
            </button>
            <button
              type="button"
              onClick={() => { setProductFilter('CASCO'); setExpiryFilter('ALL'); }}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${productFilter === 'CASCO' ? 'bg-blue-600 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'}`}
            >
              CASCO
            </button>
            <button
              type="button"
              onClick={() => { setProductFilter('HOME'); setExpiryFilter('ALL'); }}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${productFilter === 'HOME' ? 'bg-blue-600 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'}`}
            >
              Locuință
            </button>
            <button
              type="button"
              onClick={() => { setExpiryFilter('30'); }}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${expiryFilter === '30' ? 'bg-amber-600 text-white' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'}`}
            >
              Expirare &lt; 30 Zile
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-neutral-400 text-[11px]">Sortare:</span>
            <select
              className="px-2.5 py-1 bg-transparent border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs font-semibold focus:outline-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
            >
              <option value="expiry_asc">Expirare Apropiată</option>
              <option value="premium_desc">Primă Descrescător</option>
              <option value="commission_desc">Comision Descrescător</option>
              <option value="client_asc">Client (A $\rightarrow$ Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between text-xs text-neutral-500 px-1">
        <span>Afișare <strong>{filteredPolicies.length}</strong> din {initialPolicies.length} polițe înregistrate</span>
      </div>

      {/* Desktop Master Table */}
      <div className="hidden lg:block bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-neutral-50 dark:bg-neutral-800/80 text-neutral-400 font-bold uppercase tracking-wider border-b border-neutral-200/60 dark:border-neutral-800">
              <tr>
                <th className="p-3">Nr. Poliță</th>
                <th className="p-3">Client</th>
                <th className="p-3">Telefon / Email</th>
                <th className="p-3">Tip Asigurare</th>
                <th className="p-3">Asigurător</th>
                <th className="p-3">Emitere</th>
                <th className="p-3">Expirare</th>
                <th className="p-3">Zile Rămase</th>
                <th className="p-3 text-right">Primă</th>
                <th className="p-3 text-right">Comision</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3">Auto / Imobil</th>
                <th className="p-3 text-right">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filteredPolicies.length === 0 ? (
                <tr>
                  <td colSpan={13} className="p-8 text-center text-neutral-400">
                    Nicio poliță găsită conform filtrelor selectate.
                  </td>
                </tr>
              ) : (
                filteredPolicies.map((p) => {
                  const exp = new Date(p.expiry_date)
                  const days = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                  const isExpiringSoon = days >= 0 && days <= 30 && p.status === 'ACTIVE'
                  const isExpired = days < 0 || p.status === 'EXPIRED'

                  return (
                    <tr key={p.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition">
                      {/* Nr. Polita */}
                      <td className="p-3 font-mono font-bold text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                        {p.policy_number || '—'}
                      </td>

                      {/* Client */}
                      <td className="p-3 whitespace-nowrap">
                        {p.client ? (
                          <Link
                            href={`/admin/insurance/${p.client.id}`}
                            className="font-bold text-neutral-900 dark:text-neutral-100 hover:text-blue-600 hover:underline"
                          >
                            {p.client.first_name} {p.client.last_name}
                          </Link>
                        ) : (
                          <span className="text-neutral-400">Client Nespecificat</span>
                        )}
                      </td>

                      {/* Telefon / Email */}
                      <td className="p-3 whitespace-nowrap">
                        <div className="space-y-0.5">
                          {p.client?.phone && (
                            <a href={getTelUrl(p.client.phone)} className="font-mono text-neutral-700 dark:text-neutral-300 hover:text-blue-600 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-neutral-400" />
                              <span>{formatPhoneDisplay(p.client.phone)}</span>
                            </a>
                          )}
                          {p.client?.email && (
                            <span className="text-neutral-400 truncate max-w-[140px] block">{p.client.email}</span>
                          )}
                        </div>
                      </td>

                      {/* Tip Asigurare */}
                      <td className="p-3 font-bold text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                        {p.product}
                      </td>

                      {/* Asigurator */}
                      <td className="p-3 text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                        {p.insurer}
                      </td>

                      {/* Data Emitere */}
                      <td className="p-3 text-neutral-500 whitespace-nowrap">
                        {p.start_date || p.issue_date || '—'}
                      </td>

                      {/* Data Expirare */}
                      <td className="p-3 font-medium text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
                        {p.expiry_date}
                      </td>

                      {/* Zile Ramase (Dynamic calculation) */}
                      <td className="p-3 whitespace-nowrap">
                        <Badge
                          variant={isExpiringSoon ? 'warning' : isExpired ? 'danger' : 'success'}
                          size="sm"
                        >
                          {days >= 0 ? `${days} zile` : 'Expirată'}
                        </Badge>
                      </td>

                      {/* Prima (RON) */}
                      <td className="p-3 text-right font-bold text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                        {Number(p.premium).toLocaleString()} {p.currency || 'RON'}
                      </td>

                      {/* Comision (RON) */}
                      <td className="p-3 text-right font-semibold text-emerald-600 whitespace-nowrap">
                        {p.commission ? `${Number(p.commission).toLocaleString()} ${p.currency || 'RON'}` : '—'}
                      </td>

                      {/* Status */}
                      <td className="p-3 text-center whitespace-nowrap">
                        <Badge variant={p.status === 'ACTIVE' ? 'success' : 'default'} size="sm">
                          {p.status}
                        </Badge>
                      </td>

                      {/* Auto / Imobil */}
                      <td className="p-3 text-neutral-500 whitespace-nowrap">
                        {p.vehicle ? (
                          <span className="flex items-center gap-1 font-medium text-neutral-700 dark:text-neutral-300">
                            <Car className="w-3.5 h-3.5 text-blue-600" />
                            <span>{p.vehicle.make} {p.vehicle.model}</span>
                          </span>
                        ) : p.property ? (
                          <span className="flex items-center gap-1 font-medium text-neutral-700 dark:text-neutral-300">
                            <Home className="w-3.5 h-3.5 text-blue-600" />
                            <span>{p.property.property_type}: {p.property.address}</span>
                          </span>
                        ) : (
                          <span className="text-neutral-400">—</span>
                        )}
                      </td>

                      {/* Actiuni */}
                      <td className="p-3 text-right whitespace-nowrap">
                        {p.client && (
                          <Link
                            href={`/admin/insurance/${p.client.id}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            <span>Workspace</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {filteredPolicies.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border p-6 text-center text-xs text-neutral-400">
            Nicio poliță găsită.
          </div>
        ) : (
          filteredPolicies.map((p) => {
            const exp = new Date(p.expiry_date)
            const days = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            const isExpiringSoon = days >= 0 && days <= 30 && p.status === 'ACTIVE'
            const isExpired = days < 0 || p.status === 'EXPIRED'

            return (
              <div
                key={p.id}
                className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-3 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      #{p.policy_number || 'Fără număr'} • {p.insurer}
                    </span>
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      {p.product} Coverage
                    </h3>
                  </div>
                  <Badge variant={isExpiringSoon ? 'warning' : isExpired ? 'danger' : 'success'} size="sm">
                    {days >= 0 ? `${days} zile` : 'Expirată'}
                  </Badge>
                </div>

                <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl space-y-1">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Client:</span>
                    <span className="font-bold text-neutral-900 dark:text-neutral-100">{p.client?.first_name} {p.client?.last_name}</span>
                  </div>
                  {p.client?.phone && (
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Telefon:</span>
                      <a href={getTelUrl(p.client.phone)} className="font-mono text-blue-600">{formatPhoneDisplay(p.client.phone)}</a>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Valabilitate:</span>
                    <span>{p.start_date || p.issue_date} $\rightarrow$ {p.expiry_date}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-neutral-200/50 dark:border-neutral-700/50">
                    <span className="text-neutral-400">Primă / Comision:</span>
                    <span className="font-bold text-neutral-900 dark:text-neutral-100">
                      {Number(p.premium).toLocaleString()} {p.currency || 'RON'}
                      {p.commission ? ` (Com: ${Number(p.commission).toLocaleString()})` : ''}
                    </span>
                  </div>
                </div>

                {p.vehicle && (
                  <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                    <Car className="w-3.5 h-3.5 text-blue-600" />
                    <span>Auto: {p.vehicle.make} {p.vehicle.model} ({p.vehicle.vin})</span>
                  </div>
                )}

                {p.property && (
                  <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                    <Home className="w-3.5 h-3.5 text-blue-600" />
                    <span>Imobil: {p.property.property_type} ({p.property.address})</span>
                  </div>
                )}

                {p.client && (
                  <div className="pt-2 flex justify-end">
                    <Link
                      href={`/admin/insurance/${p.client.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-xl font-bold"
                    >
                      <span>Deschide Workspace</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
