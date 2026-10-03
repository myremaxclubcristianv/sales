import { PrivateLayout } from '@/components/layout/private/PrivateLayout'
import Link from 'next/link'
import {
  Wallet,
  ArrowLeft,
} from 'lucide-react'
import {
  getExpenses,
  getIncomes,
  getFinancialOverview,
} from '@/lib/db/insurance-financial'
import { FinancialClientView } from './components/FinancialClientView'

export const dynamic = 'force-dynamic'

export default async function InsuranceFinancialPage() {
  const [{ expenses }, { incomes }, overview] = await Promise.all([
    getExpenses(),
    getIncomes(),
    getFinancialOverview(),
  ])

  return (
    <PrivateLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Breadcrumb & Navigation Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 mb-1.5">
              <Link href="/admin/dashboard" className="hover:text-neutral-800 transition">
                Admin
              </Link>
              <span>/</span>
              <Link href="/admin/insurance" className="hover:text-neutral-800 transition">
                Asigurări
              </Link>
              <span>/</span>
              <span className="text-blue-600 font-bold">Evidență Financiară CIF</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2.5">
              <Wallet className="w-6 h-6 text-blue-600" />
              <span>Evidență Financiară — CIF ASIGURĂRI</span>
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Modul financiar izolat pentru evidența cheltuielilor și încasărilor de comisioane pe CIF
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/admin/insurance"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-700 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Panou Asigurări</span>
            </Link>
          </div>
        </div>

        {/* Client Interactive Tabs View */}
        <FinancialClientView
          initialExpenses={expenses}
          initialIncomes={incomes}
          initialOverview={overview}
        />
      </div>
    </PrivateLayout>
  )
}
