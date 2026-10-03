import { PrivateLayout } from '@/components/layout/private/PrivateLayout'
import Link from 'next/link'
import { 
  Shield, 
  Users, 
  FileText, 
  Clock, 
  AlertTriangle, 
  ArrowUpRight, 
  Plus,
  Wallet
} from 'lucide-react'
import { getInsuranceMetrics, getInsuranceClients, getAllInsurancePolicies } from '@/lib/db/insurance-isolated'
import { calculateExpiration } from '@/lib/utils/insurance-expiration'

export const dynamic = 'force-dynamic'

export default async function InsuranceDashboardPage() {
  const metrics = await getInsuranceMetrics()
  const { clients } = await getInsuranceClients()
  const allPolicies = await getAllInsurancePolicies()

  // Get urgent expiring policies for prompt action banner
  const urgentExpiring = allPolicies.filter((p) => {
    const exp = calculateExpiration(p.expiry_date)
    return !exp.isExpired && exp.daysRemaining <= 14
  })

  return (
    <PrivateLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Header with Navigation and Quick Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2.5">
              <Shield className="w-6 h-6 text-blue-600" />
              <span>Panou Asigurări &amp; Portofoliu Clienți</span>
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Gestiune centralizată clienți, polițe (RCA, CASCO, PAD, EUROCASA, Travel) și monitorizare reînnoiri
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/admin/insurance/financial"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 rounded-xl font-bold text-xs transition active:scale-95 shadow-sm"
            >
              <Wallet className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
              <span>Financiar CIF</span>
            </Link>

            <Link
              href="/admin/insurance/clients"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition active:scale-95 shadow-sm"
            >
              <Users className="w-4 h-4" />
              <span>Clienți Activi Insurance</span>
            </Link>

            <Link
              href="/admin/insurance/new"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl font-bold text-xs transition"
            >
              <Plus className="w-4 h-4 text-blue-600" />
              <span>Adaugă Client</span>
            </Link>
          </div>
        </div>

        {/* Real-time Metric Cards (Zero Hardcoded Stats) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Active Clients */}
          <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Clienți Activi
            </span>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {metrics.activeClients}
            </p>
            <p className="text-[11px] text-neutral-500">Portofoliu verificat</p>
          </div>

          {/* Active Policies */}
          <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Polițe Active
            </span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {metrics.activePolicies}
            </p>
            <p className="text-[11px] text-neutral-500">Sub acoperire</p>
          </div>

          {/* Expiring in 30 Days */}
          <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Expiră în 30 Zile
            </span>
            <p className="text-2xl font-bold text-amber-600">
              {metrics.expiringIn30Days}
            </p>
            <p className="text-[11px] text-neutral-500">Urmează reînnoire</p>
          </div>

          {/* Expiring in 14 Days */}
          <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Expiră în 14 Zile
            </span>
            <p className="text-2xl font-bold text-amber-600">
              {metrics.expiringIn14Days}
            </p>
            <p className="text-[11px] text-amber-600/80 font-medium">Prioritate ofertare</p>
          </div>

          {/* Expiring in 7 Days */}
          <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Expiră în 7 Zile
            </span>
            <p className="text-2xl font-bold text-rose-600">
              {metrics.expiringIn7Days}
            </p>
            <p className="text-[11px] text-rose-600/80 font-medium">Acțiune urgentă</p>
          </div>

          {/* Expired Policies */}
          <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Expirate
            </span>
            <p className="text-2xl font-bold text-neutral-700 dark:text-neutral-300">
              {metrics.expiredPolicies}
            </p>
            <p className="text-[11px] text-neutral-400">Istoric</p>
          </div>
        </div>

        {/* Urgent Action Banner if any policies expiring in 14 days */}
        {urgentExpiring.length > 0 && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-2xl flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="font-bold text-amber-900 dark:text-amber-200">
                  {urgentExpiring.length} Polițe Necesită Ofertare Reînnoire Urgentă (&le; 14 Zile)
                </p>
                <p className="text-amber-700 dark:text-amber-400 mt-0.5">
                  Contactează asigurații pentru transmiterea ofertelor comparative.
                </p>
              </div>
            </div>
            <Link
              href="/admin/insurance/expirations"
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shrink-0 transition"
            >
              Vezi Expirări
            </Link>
          </div>
        )}

        {/* Quick Navigation Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/insurance/clients"
            className="group bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs hover:border-blue-500/50 transition space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-blue-600 transition" />
            </div>
            <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
              Clienți Activi Insurance
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Vizualizează toți cei {metrics.totalClients} clienți cu polițe, contacte, vehicule și adrese.
            </p>
          </Link>

          <Link
            href="/admin/insurance/policies"
            className="group bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs hover:border-blue-500/50 transition space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-indigo-600 transition" />
            </div>
            <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
              Registru Centralizat Polițe
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Total {metrics.totalPolicies} polițe emise (RCA, PAD, EUROCASA, Travel, CASCO) cu prime și comisioane.
            </p>
          </Link>

          <Link
            href="/admin/insurance/expirations"
            className="group bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs hover:border-blue-500/50 transition space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-amber-600 transition" />
            </div>
            <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
              Calendar &amp; Expirări
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Monitorizare dinamică pe tranșe de 7, 14 și 30 de zile pentru ofertare proactivă.
            </p>
          </Link>
        </div>

        {/* Latest Active Clients Snapshot */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Portofoliu Clienți Asigurări
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Sumar operativ al clienților activi
              </p>
            </div>
            <Link
              href="/admin/insurance/clients"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition"
            >
              Vezi Tabelul Complet &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {clients.slice(0, 6).map((client) => {
              const exp = calculateExpiration(client.earliest_expiry_date)
              return (
                <Link
                  key={client.id}
                  href={`/admin/insurance/clients/${client.id}`}
                  className="p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/60 transition space-y-2.5 block"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-neutral-900 dark:text-neutral-100 truncate">
                      {client.full_name}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${exp.badgeColor}`}>
                      {exp.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-500">
                    <span>{client.canonical_phone || client.phone || 'Fără tel'}</span>
                    <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                      {client.policy_types?.join(', ')}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </PrivateLayout>
  )
}
