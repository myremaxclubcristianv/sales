'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { 
  FileText, 
  Search, 
  Car, 
  Home, 
  Plane, 
  Clock, 
  Copy, 
  Check, 
  Eye
} from 'lucide-react'
import { InsurancePolicyItem } from '@/lib/db/insurance-isolated'
import { calculateExpiration } from '@/lib/utils/insurance-expiration'

interface InsurancePoliciesViewProps {
  initialPolicies: InsurancePolicyItem[]
}

export function InsurancePoliciesView({ initialPolicies }: InsurancePoliciesViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [productFilter, setProductFilter] = useState<string>('ALL')
  const [urgencyFilter, setUrgencyFilter] = useState<string>('ALL')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filteredPolicies = useMemo(() => {
    return initialPolicies.filter((p) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchPolicy = p.policy_number?.toLowerCase().includes(q)
        const matchVin = p.vin?.toLowerCase().includes(q)
        const matchReg = p.vehicle_registration?.toLowerCase().includes(q)
        const matchInsurer = p.insurer?.toLowerCase().includes(q)
        const matchClient = p.client?.full_name?.toLowerCase().includes(q)
        const matchPhone = p.client?.phone?.includes(q)
        if (!matchPolicy && !matchVin && !matchReg && !matchInsurer && !matchClient && !matchPhone) {
          return false
        }
      }

      if (productFilter !== 'ALL' && p.policy_type.toLowerCase() !== productFilter.toLowerCase()) {
        return false
      }

      if (urgencyFilter !== 'ALL') {
        const exp = calculateExpiration(p.expiry_date)
        if (urgencyFilter === 'EXPIRED' && !exp.isExpired) return false
        if (urgencyFilter === 'EXPIRING_URGENT' && (!exp.isUrgent || exp.isExpired)) return false
        if (urgencyFilter === 'EXPIRING_30_DAYS' && (exp.isExpired || exp.daysRemaining > 30)) return false
      }

      return true
    })
  }, [initialPolicies, searchQuery, productFilter, urgencyFilter])

  const availableProductTypes = useMemo(() => {
    const set = new Set<string>()
    initialPolicies.forEach((p) => set.add(p.policy_type))
    return Array.from(set)
  }, [initialPolicies])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <span>Registru Polițe Asigurare</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold">
                {filteredPolicies.length} polițe
              </span>
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Toate contractele de asigurare emise, primele anuale, serii șasiu și termene de valabilitate
            </p>
          </div>
        </div>

        <Link
          href="/admin/insurance/clients"
          className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl font-semibold text-xs transition cursor-pointer"
        >
          <span>Vezi Clienți Activi</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Caută poliță, client, VIN, număr auto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Tip Asigurare: Toate</option>
              {availableProductTypes.map((type) => (
                <option key={type} value={type}>
                  Tip: {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Expirare: Toate</option>
              <option value="EXPIRING_URGENT">Expiră Urgent (&le; 7 zile)</option>
              <option value="EXPIRING_30_DAYS">Expiră în &le; 30 zile</option>
              <option value="EXPIRED">Expirate</option>
            </select>
          </div>
        </div>
      </div>

      {/* Policies Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Tip &amp; Asigurător</th>
                <th className="py-3.5 px-4">Client Asigurat</th>
                <th className="py-3.5 px-4">Nr. Poliță / Contract</th>
                <th className="py-3.5 px-4">Primă &amp; Comision</th>
                <th className="py-3.5 px-4">Vehicul / Proprietate</th>
                <th className="py-3.5 px-4">Valabilitate</th>
                <th className="py-3.5 px-4 text-right">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 text-xs">
              {filteredPolicies.map((p, idx) => {
                const exp = calculateExpiration(p.expiry_date)
                const isProperty = p.policy_type === 'PAD' || p.policy_type === 'EUROCASA' || p.property_details

                return (
                  <tr key={p.id || idx} className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition">
                    {/* Policy Type & Insurer */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          p.policy_type === 'RCA'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                            : isProperty
                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400'
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                        }`}>
                          {p.policy_type === 'RCA' ? <Car className="w-4 h-4" /> : isProperty ? <Home className="w-4 h-4" /> : <Plane className="w-4 h-4" />}
                        </div>
                        <div>
                          <span className="font-bold text-neutral-900 dark:text-neutral-100">
                            {p.policy_type}
                          </span>
                          <p className="text-[11px] text-neutral-500">
                            {p.insurer || p.insurer_raw || 'Generali'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Client */}
                    <td className="py-4 px-4">
                      <Link
                        href={`/admin/insurance/clients/${p.insurance_client_id}`}
                        className="font-bold text-neutral-900 dark:text-neutral-100 hover:text-blue-600 dark:hover:text-blue-400 transition"
                      >
                        {p.client?.full_name || 'Client'}
                      </Link>
                      {p.client?.phone && (
                        <p className="text-[11px] text-neutral-400">{p.client.phone}</p>
                      )}
                    </td>

                    {/* Policy Number */}
                    <td className="py-4 px-4">
                      {p.policy_number ? (
                        <div className="flex items-center gap-1.5 font-mono text-neutral-800 dark:text-neutral-200">
                          <span>{p.policy_number}</span>
                          <button
                            onClick={() => handleCopy(p.policy_number || '', `p-${idx}`)}
                            className="p-1 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                            title="Copiază"
                          >
                            {copiedId === `p-${idx}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      ) : (
                        <span className="text-neutral-400 italic text-[11px]">Înregistrată în evidență</span>
                      )}
                    </td>

                    {/* Premium */}
                    <td className="py-4 px-4 space-y-0.5">
                      <span className="font-bold text-neutral-900 dark:text-neutral-100">
                        {p.premium_amount ? `${p.premium_amount} ${p.premium_currency}` : '—'}
                      </span>
                      {p.commission_rate && (
                        <p className="text-[10px] font-semibold text-emerald-600">
                          Comision: {p.commission_rate}
                        </p>
                      )}
                    </td>

                    {/* Vehicle / Property */}
                    <td className="py-4 px-4 space-y-0.5">
                      {p.vin && (
                        <p className="font-mono text-[11px] text-neutral-700 dark:text-neutral-300">
                          VIN: {p.vin}
                        </p>
                      )}
                      {p.vehicle_registration && (
                        <span className="inline-block px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 font-mono text-[10px] font-bold rounded">
                          {p.vehicle_registration}
                        </span>
                      )}
                      {p.property_details && (
                        <p className="text-[11px] text-neutral-500 truncate max-w-[180px]" title={p.property_details}>
                          {p.property_details}
                        </p>
                      )}
                      {p.details && (
                        <p className="text-[10px] text-neutral-400">{p.details}</p>
                      )}
                      {!p.vin && !p.property_details && !p.details && (
                        <span className="text-neutral-400 italic text-[11px]">—</span>
                      )}
                    </td>

                    {/* Validity & Expiration Badge */}
                    <td className="py-4 px-4 space-y-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${exp.badgeColor}`}>
                        <Clock className="w-3 h-3" />
                        {exp.label}
                      </span>
                      <p className="text-[11px] text-neutral-400">
                        Expiră: {new Date(p.expiry_date).toLocaleDateString('ro-RO')}
                      </p>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <Link
                        href={`/admin/insurance/clients/${p.insurance_client_id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-neutral-100 hover:bg-blue-600 hover:text-white dark:bg-neutral-800 dark:hover:bg-blue-600 text-neutral-700 dark:text-neutral-200 rounded-lg font-bold text-xs transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Dosar</span>
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
