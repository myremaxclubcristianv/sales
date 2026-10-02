'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { 
  Clock, 
  ExternalLink, 
  Eye
} from 'lucide-react'
import { InsurancePolicyItem } from '@/lib/db/insurance-isolated'
import { calculateExpiration } from '@/lib/utils/insurance-expiration'

interface InsuranceExpirationsViewProps {
  initialPolicies: InsurancePolicyItem[]
}

export function InsuranceExpirationsView({ initialPolicies }: InsuranceExpirationsViewProps) {
  const [selectedUrgency, setSelectedUrgency] = useState<string>('ALL')

  const policiesWithExp = useMemo(() => {
    return initialPolicies.map((p) => ({
      ...p,
      exp: calculateExpiration(p.expiry_date),
    })).sort((a, b) => a.exp.daysRemaining - b.exp.daysRemaining)
  }, [initialPolicies])

  const filtered = useMemo(() => {
    if (selectedUrgency === 'ALL') return policiesWithExp
    if (selectedUrgency === 'URGENT') return policiesWithExp.filter((p) => !p.exp.isExpired && p.exp.daysRemaining <= 7)
    if (selectedUrgency === '14_DAYS') return policiesWithExp.filter((p) => !p.exp.isExpired && p.exp.daysRemaining <= 14)
    if (selectedUrgency === '30_DAYS') return policiesWithExp.filter((p) => !p.exp.isExpired && p.exp.daysRemaining <= 30)
    if (selectedUrgency === 'EXPIRED') return policiesWithExp.filter((p) => p.exp.isExpired)
    if (selectedUrgency === 'ACTIVE') return policiesWithExp.filter((p) => !p.exp.isExpired && p.exp.daysRemaining > 30)
    return policiesWithExp
  }, [policiesWithExp, selectedUrgency])

  const counts = useMemo(() => {
    let urgent = 0
    let in14 = 0
    let in30 = 0
    let expired = 0
    let active = 0

    policiesWithExp.forEach((p) => {
      if (p.exp.isExpired) expired++
      else {
        if (p.exp.daysRemaining <= 7) urgent++
        if (p.exp.daysRemaining <= 14) in14++
        if (p.exp.daysRemaining <= 30) in30++
        if (p.exp.daysRemaining > 30) active++
      }
    })

    return { urgent, in14, in30, expired, active, total: policiesWithExp.length }
  }, [policiesWithExp])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <span>Calendar Expirări &amp; Reînnoiri Proactive</span>
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Calcul automatizat al zilelor rămase (expiry_date - current_date) pentru emiterea ofertelor comparative
            </p>
          </div>
        </div>
      </div>

      {/* Urgency Quick Selector Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => setSelectedUrgency('ALL')}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
            selectedUrgency === 'ALL'
              ? 'bg-blue-50/70 border-blue-500 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 shadow-xs'
              : 'bg-white dark:bg-neutral-900 border-neutral-200/80 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:border-neutral-300'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block text-neutral-400">Toate</span>
          <p className="text-2xl font-bold mt-1">{counts.total}</p>
        </button>

        <button
          onClick={() => setSelectedUrgency('URGENT')}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
            selectedUrgency === 'URGENT'
              ? 'bg-rose-50/70 border-rose-500 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100 shadow-xs'
              : 'bg-white dark:bg-neutral-900 border-neutral-200/80 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:border-neutral-300'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block text-rose-500">&le; 7 Zile (Urgent)</span>
          <p className="text-2xl font-bold text-rose-600 mt-1">{counts.urgent}</p>
        </button>

        <button
          onClick={() => setSelectedUrgency('14_DAYS')}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
            selectedUrgency === '14_DAYS'
              ? 'bg-amber-50/70 border-amber-500 dark:bg-amber-950/40 text-amber-900 dark:text-amber-100 shadow-xs'
              : 'bg-white dark:bg-neutral-900 border-neutral-200/80 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:border-neutral-300'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block text-amber-600">&le; 14 Zile</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">{counts.in14}</p>
        </button>

        <button
          onClick={() => setSelectedUrgency('30_DAYS')}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
            selectedUrgency === '30_DAYS'
              ? 'bg-blue-50/70 border-blue-500 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 shadow-xs'
              : 'bg-white dark:bg-neutral-900 border-neutral-200/80 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:border-neutral-300'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block text-blue-500">&le; 30 Zile</span>
          <p className="text-2xl font-bold text-blue-600 mt-1">{counts.in30}</p>
        </button>

        <button
          onClick={() => setSelectedUrgency('ACTIVE')}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
            selectedUrgency === 'ACTIVE'
              ? 'bg-emerald-50/70 border-emerald-500 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 shadow-xs'
              : 'bg-white dark:bg-neutral-900 border-neutral-200/80 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:border-neutral-300'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block text-emerald-600">&gt; 30 Zile Active</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{counts.active}</p>
        </button>

        <button
          onClick={() => setSelectedUrgency('EXPIRED')}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
            selectedUrgency === 'EXPIRED'
              ? 'bg-neutral-100 border-neutral-500 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
              : 'bg-white dark:bg-neutral-900 border-neutral-200/80 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:border-neutral-300'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block text-neutral-400">Expirate</span>
          <p className="text-2xl font-bold text-neutral-700 dark:text-neutral-300 mt-1">{counts.expired}</p>
        </button>
      </div>

      {/* Expirations List */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs overflow-hidden">
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
          {filtered.map((p, idx) => {
            const cleanPhone = p.client?.phone?.replace(/\D/g, '') || ''
            const waPhone = cleanPhone.startsWith('0') ? '4' + cleanPhone : cleanPhone.startsWith('7') ? '40' + cleanPhone : cleanPhone

            return (
              <div
                key={p.id || idx}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition"
              >
                {/* Left: Product & Client */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200/60">
                      {p.policy_type}
                    </span>
                    <span className="text-xs font-semibold text-neutral-500">
                      {p.insurer || p.insurer_raw || 'Generali'}
                    </span>
                    {p.policy_number && (
                      <span className="font-mono text-[11px] text-neutral-400">
                        {p.policy_number}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/insurance/clients/${p.insurance_client_id}`}
                      className="font-bold text-sm text-neutral-900 dark:text-neutral-100 hover:text-blue-600 transition"
                    >
                      {p.client?.full_name}
                    </Link>
                    {p.client?.phone && (
                      <span className="text-xs text-neutral-400">
                        &bull; {p.client.phone}
                      </span>
                    )}
                  </div>

                  {(p.vin || p.vehicle_registration || p.property_details) && (
                    <p className="text-[11px] text-neutral-500">
                      {p.vin ? `VIN: ${p.vin}` : ''} {p.vehicle_registration ? `[${p.vehicle_registration}]` : ''} {p.property_details ? p.property_details : ''}
                    </p>
                  )}
                </div>

                {/* Right: Expiration Badge & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  <div className="text-right space-y-0.5">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${p.exp.badgeColor}`}>
                      <Clock className="w-3.5 h-3.5" />
                      {p.exp.label}
                    </span>
                    <p className="text-[11px] text-neutral-400">
                      {new Date(p.expiry_date).toLocaleDateString('ro-RO')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {p.client?.phone && (
                      <a
                        href={`https://wa.me/${waPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-xl transition"
                        title="Ofertă pe WhatsApp"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}

                    <Link
                      href={`/admin/insurance/clients/${p.insurance_client_id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-100 hover:bg-blue-600 hover:text-white dark:bg-neutral-800 dark:hover:bg-blue-600 text-neutral-700 dark:text-neutral-200 rounded-xl font-bold text-xs transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Dosar</span>
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
