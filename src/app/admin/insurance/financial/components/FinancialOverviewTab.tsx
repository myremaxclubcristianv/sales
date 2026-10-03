'use client'

import React from 'react'
import {
  Coins,
  TrendingDown,
  TrendingUp,
  Percent,
  Calendar,
  Building2,
  Tag,
  ArrowRight,
} from 'lucide-react'
import {
  FinancialOverviewSummary,
  formatCurrencyRo,
  formatTaxRo,
} from '@/lib/data/verified-insurance-financial-dataset'
import { YearDiscrepancyBadge } from './YearDiscrepancyBadge'

interface FinancialOverviewTabProps {
  overview: FinancialOverviewSummary
  onSelectTab: (tab: 'expenses' | 'income') => void
}

export function FinancialOverviewTab({ overview, onSelectTab }: FinancialOverviewTabProps) {
  const isNetPositive = overview.netResult >= 0

  return (
    <div className="space-y-6">
      {/* Year Discrepancy Note */}
      <YearDiscrepancyBadge />

      {/* Top Real-time Dynamic KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cheltuieli */}
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Total Cheltuieli
            </span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
              {formatCurrencyRo(overview.totalExpenses)}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              {overview.expenseCount} plăți înregistrate
            </p>
          </div>
          <button
            onClick={() => onSelectTab('expenses')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 pt-1"
          >
            <span>Vezi detalii cheltuieli</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Total Comisioane Încasate */}
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Comisioane Încasate
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
              {formatCurrencyRo(overview.totalIncome)}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              {overview.incomeCount} încasări comision
            </p>
          </div>
          <button
            onClick={() => onSelectTab('income')}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 pt-1"
          >
            <span>Vezi detalii încasări</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Total Impozit 1% */}
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Total Impozit 1%
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
              {formatTaxRo(overview.totalTax1Percent)}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              1% pe venit comision CIF
            </p>
          </div>
          <div className="text-[11px] text-neutral-400 font-mono pt-1">
            Calcul exact pe bază de fluturaș
          </div>
        </div>

        {/* Rezultat Net */}
        <div className={`p-5 rounded-2xl border shadow-2xs space-y-2 ${
          isNetPositive
            ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
            : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${
              isNetPositive ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'
            }`}>
              Rezultat Net (Încasări - Cheltuieli)
            </span>
            <div className={`p-2 rounded-xl ${
              isNetPositive
                ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700'
                : 'bg-rose-100 dark:bg-rose-900/60 text-rose-700'
            }`}>
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className={`text-2xl sm:text-3xl font-bold font-mono ${
              isNetPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}>
              {formatCurrencyRo(overview.netResult)}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Bilanț operațional CIF Asigurări
            </p>
          </div>
          <div className="text-[11px] text-neutral-500 font-medium pt-1">
            {overview.expenseCount + overview.incomeCount} tranzacții totale
          </div>
        </div>
      </div>

      {/* Monthly Cash Flow Evolution Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
              Evoluție Lunară Cash Flow (An 2026)
            </h3>
          </div>
          <span className="text-xs text-neutral-400 font-mono">
            {overview.monthlyBreakdown.length} luni active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-500 uppercase tracking-wider font-semibold border-b border-neutral-200 dark:border-neutral-800">
              <tr>
                <th className="px-4 py-3">Luna</th>
                <th className="px-4 py-3 text-right">Cheltuieli</th>
                <th className="px-4 py-3 text-right">Încasări (Comisioane)</th>
                <th className="px-4 py-3 text-right">Impozit 1%</th>
                <th className="px-4 py-3 text-right">Net Lună</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {overview.monthlyBreakdown.map((m) => {
                const isPos = m.net >= 0
                return (
                  <tr key={m.month} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition">
                    <td className="px-4 py-3 font-semibold text-neutral-900 dark:text-neutral-100">
                      {m.monthLabel}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-rose-600 dark:text-rose-400 font-medium">
                      {m.expenses > 0 ? `-${formatCurrencyRo(m.expenses)}` : '0,00 RON'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                      {m.income > 0 ? `+${formatCurrencyRo(m.income)}` : '0,00 RON'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-amber-600 dark:text-amber-400">
                      {formatTaxRo(m.tax)}
                    </td>
                    <td className={`px-4 py-3 text-right font-mono font-bold ${
                      isPos ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {formatCurrencyRo(m.net)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot className="bg-neutral-100/70 dark:bg-neutral-800 font-bold border-t-2 border-neutral-300 dark:border-neutral-700">
              <tr>
                <td className="px-4 py-3 text-neutral-900 dark:text-white">TOTAL GENERAL</td>
                <td className="px-4 py-3 text-right font-mono text-rose-600">
                  -{formatCurrencyRo(overview.totalExpenses)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-emerald-600">
                  +{formatCurrencyRo(overview.totalIncome)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-amber-600">
                  {formatTaxRo(overview.totalTax1Percent)}
                </td>
                <td className={`px-4 py-3 text-right font-mono ${
                  overview.netResult >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {formatCurrencyRo(overview.netResult)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Two Column Breakdown: Categories & Suppliers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Categories Breakdown */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                Cheltuieli pe Categorii
              </h3>
            </div>
            <span className="text-xs text-neutral-400 font-mono">
              {overview.categoriesBreakdown.length} categorii
            </span>
          </div>

          <div className="space-y-3">
            {overview.categoriesBreakdown.map((cat) => {
              const pct = overview.totalExpenses > 0 ? (cat.amount / overview.totalExpenses) * 100 : 0
              return (
                <div key={cat.category} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                      {cat.category} ({cat.count} tranzacții)
                    </span>
                    <span className="font-mono font-bold text-neutral-900 dark:text-white">
                      {formatCurrencyRo(cat.amount)} ({pct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Suppliers Breakdown */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                Cheltuieli pe Furnizori
              </h3>
            </div>
            <span className="text-xs text-neutral-400 font-mono">
              {overview.suppliersBreakdown.length} furnizori
            </span>
          </div>

          <div className="space-y-3">
            {overview.suppliersBreakdown.map((sup) => {
              const pct = overview.totalExpenses > 0 ? (sup.amount / overview.totalExpenses) * 100 : 0
              return (
                <div key={sup.supplier} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                      {sup.supplier} ({sup.count} tranzacții)
                    </span>
                    <span className="font-mono font-bold text-neutral-900 dark:text-white">
                      {formatCurrencyRo(sup.amount)} ({pct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
