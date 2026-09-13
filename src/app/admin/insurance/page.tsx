import { getInsurancePolicies } from '@/lib/db/insurance'
import { PrivateLayout } from '@/components/layout/private/PrivateLayout'
import Link from 'next/link'
import { Shield, AlertTriangle, UserPlus } from 'lucide-react'
import { InsuranceMasterTable } from './InsuranceMasterTable'

export const dynamic = 'force-dynamic'

export default async function InsuranceDashboardPage() {
  const policies = await getInsurancePolicies().catch(() => [])

  // Calculate metrics
  const now = new Date()
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const activePolicies = policies.filter(
    (p) => p.status === 'ACTIVE' && new Date(p.expiry_date) >= now
  )

  const expiringSoon = policies.filter((p) => {
    if (p.status !== 'ACTIVE') return false
    const exp = new Date(p.expiry_date)
    return exp >= now && exp <= thirtyDaysFromNow
  })

  const totalActivePremium = activePolicies.reduce(
    (sum, p) => sum + (Number(p.premium) || 0),
    0
  )

  const totalCommission = activePolicies.reduce(
    (sum, p) => sum + (Number(p.commission) || 0),
    0
  )

  return (
    <PrivateLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header with CTAs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2.5">
              <Shield className="w-6 h-6 text-blue-600" />
              <span>Portofoliu Asigurări &amp; Reînnoiri</span>
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Administrare centralizată clienți, polițe (RCA, CASCO, Locuință, Viață, IMM, Cyber), alerte reînnoire și dosare digitale
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/insurance/new"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition active:scale-95 shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              <span>Introducere Client Nou Insurance</span>
            </Link>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Polițe Active
            </span>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {activePolicies.length}
            </p>
            <p className="text-xs text-neutral-500 font-medium">Sub administrare activă</p>
          </div>

          <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Expiră în &lt; 30 Zile
            </span>
            <p className="text-2xl font-bold text-amber-600">
              {expiringSoon.length}
            </p>
            <p className="text-xs text-amber-600/80 font-medium">Necesită ofertare reînnoire</p>
          </div>

          <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Primă Anuală Activă
            </span>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {totalActivePremium.toLocaleString()} RON
            </p>
            <p className="text-xs text-neutral-400 font-medium">Volum portofoliu</p>
          </div>

          <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Comision Intermediere
            </span>
            <p className="text-2xl font-bold text-emerald-600">
              {totalCommission.toLocaleString()} RON
            </p>
            <p className="text-xs text-emerald-600/80 font-medium">Venit generat</p>
          </div>
        </div>

        {/* Expiring Soon Banner if any */}
        {expiringSoon.length > 0 && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-2xl flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="font-bold text-amber-900 dark:text-amber-200">
                  {expiringSoon.length} Polițe Expiră în Următoarele 30 de Zile
                </p>
                <p className="text-amber-700 dark:text-amber-400 mt-0.5">
                  Recomandăm contactarea clienților pentru emiterea ofertelor comparate.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Master Table */}
        <InsuranceMasterTable initialPolicies={policies} />
      </div>
    </PrivateLayout>
  )
}
