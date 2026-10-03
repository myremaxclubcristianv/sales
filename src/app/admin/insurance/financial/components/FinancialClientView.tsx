'use client'

import React, { useState } from 'react'
import {
  LayoutDashboard,
  Receipt,
  TrendingUp,
  RotateCw,
} from 'lucide-react'
import {
  VerifiedExpenseRecord,
  VerifiedIncomeRecord,
  FinancialOverviewSummary,
  computeFinancialOverview,
} from '@/lib/data/verified-insurance-financial-dataset'
import { FinancialOverviewTab } from './FinancialOverviewTab'
import { ExpensesTab } from './ExpensesTab'
import { IncomeTab } from './IncomeTab'

interface FinancialClientViewProps {
  initialExpenses: VerifiedExpenseRecord[]
  initialIncomes: VerifiedIncomeRecord[]
  initialOverview: FinancialOverviewSummary
}

export function FinancialClientView({
  initialExpenses,
  initialIncomes,
  initialOverview,
}: FinancialClientViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'income'>('overview')
  const [expenses, setExpenses] = useState<VerifiedExpenseRecord[]>(initialExpenses)
  const [incomes, setIncomes] = useState<VerifiedIncomeRecord[]>(initialIncomes)
  const [overview, setOverview] = useState<FinancialOverviewSummary>(initialOverview)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true)
      const [expRes, incRes, ovRes] = await Promise.all([
        fetch('/api/admin/insurance/financial/expenses'),
        fetch('/api/admin/insurance/financial/income'),
        fetch('/api/admin/insurance/financial/overview'),
      ])

      if (expRes.ok) {
        const expData = await expRes.json()
        setExpenses(expData.expenses || [])
      }
      if (incRes.ok) {
        const incData = await incRes.json()
        setIncomes(incData.incomes || [])
      }
      if (ovRes.ok) {
        const ovData = await ovRes.json()
        setOverview(ovData)
      } else {
        // compute from state
        setOverview(computeFinancialOverview(expenses, incomes))
      }
    } catch (err) {
      console.error('Refresh error:', err)
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Navigation Tabs Bar */}
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
        <div className="flex items-center gap-2">
          {/* Overview Tab */}
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview Financiar</span>
          </button>

          {/* Cheltuieli Tab */}
          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'expenses'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Cheltuieli</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                activeTab === 'expenses'
                  ? 'bg-blue-700 text-white'
                  : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200'
              }`}
            >
              {expenses.length}
            </span>
          </button>

          {/* Încasări / Comisioane Tab */}
          <button
            onClick={() => setActiveTab('income')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'income'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Încasări / Comisioane</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                activeTab === 'income'
                  ? 'bg-blue-700 text-white'
                  : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200'
              }`}
            >
              {incomes.length}
            </span>
          </button>
        </div>

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          title="Reîmprospătează datele"
        >
          <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <FinancialOverviewTab
          overview={overview}
          onSelectTab={(tab) => setActiveTab(tab)}
        />
      )}

      {activeTab === 'expenses' && (
        <ExpensesTab
          expenses={expenses}
          onRefresh={handleRefresh}
        />
      )}

      {activeTab === 'income' && (
        <IncomeTab
          incomes={incomes}
          onRefresh={handleRefresh}
        />
      )}
    </div>
  )
}
