import { PrivateLayout } from '@/components/layout/private/PrivateLayout'
import Link from 'next/link'
import { Building2, ArrowLeft, Shield } from 'lucide-react'
import { getInsuranceCompanies, getInsuranceCompaniesMetrics } from '@/lib/db/insurance-companies'
import { FirmeMasterTable } from './FirmeMasterTable'

export const dynamic = 'force-dynamic'

export default async function InsuranceFirmePage() {
  const [{ companies }, metrics] = await Promise.all([
    getInsuranceCompanies({ pageSize: 200 }),
    getInsuranceCompaniesMetrics(),
  ])

  return (
    <PrivateLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        {/* Header Breadcrumbs & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1.5">
              <Link href="/admin/insurance" className="hover:text-blue-600 transition flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <span>Insurance</span>
              </Link>
              <span>/</span>
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">Firme (Prospecte)</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2.5">
              <Building2 className="w-6 h-6 text-indigo-600" />
              <span>Prospectare Companii — Asigurări Flote &amp; Rent a Car</span>
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-2xl">
              107 firme verificate din sursa originală (4 tabele). Gestiune dedicată prospectării comerciale B2B, complet izolată de portofoliul clienților existenți și de polițe.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/insurance"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-xl text-xs font-semibold transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Înapoi la Panou</span>
            </Link>
          </div>
        </div>

        {/* Master Table */}
        <FirmeMasterTable initialCompanies={companies} initialMetrics={metrics} />
      </div>
    </PrivateLayout>
  )
}
