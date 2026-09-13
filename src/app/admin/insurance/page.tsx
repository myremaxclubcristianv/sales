import { getInsurancePolicies } from '@/lib/db/insurance'
import { PrivateLayout } from '@/components/layout/private/PrivateLayout'
import Link from 'next/link'
import { Plus, Shield, AlertTriangle, ArrowUpRight, User } from 'lucide-react'

interface PageProps {
  searchParams: Promise<{
    status?: string
    product?: string
    filter?: string
  }>
}

export const dynamic = 'force-dynamic'

export default async function InsuranceDashboardPage(props: PageProps) {
  const searchParams = await props.searchParams
  const policies = await getInsurancePolicies({
    status: searchParams.status,
    product: searchParams.product,
  })

  // Calculate renewal alerts (expiring within 30 days)
  const now = new Date()
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  const expiringSoon = policies.filter((p) => {
    if (p.status !== 'ACTIVE') return false
    const exp = new Date(p.expiry_date)
    return exp >= now && exp <= thirtyDaysFromNow
  })

  const expiredPolicies = policies.filter((p) => {
    const exp = new Date(p.expiry_date)
    return exp < now || p.status === 'EXPIRED'
  })

  const activePolicies = policies.filter((p) => p.status === 'ACTIVE' && new Date(p.expiry_date) >= now)

  // Calculate annual premium portfolio
  const totalActivePremium = activePolicies.reduce((sum, p) => sum + (Number(p.premium) || 0), 0)

  return (
    <PrivateLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2.5">
              <Shield className="w-6 h-6 text-blue-600" />
              Insurance Portfolio &amp; Renewals
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Active coverage policies, automated renewal warnings, and client insurance vaults
            </p>
          </div>
          <Link
            href="/admin/insurance/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-xl font-medium text-sm hover:opacity-95 transition active:scale-95 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Policy
          </Link>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Active Policies
            </span>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {activePolicies.length}
            </p>
            <p className="text-xs text-neutral-500 font-medium">Under active management</p>
          </div>

          <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Expiring (Next 30 Days)
            </span>
            <p className="text-2xl font-bold text-amber-600">
              {expiringSoon.length}
            </p>
            <p className="text-xs text-amber-600/80 font-medium">Needs renewal outreach</p>
          </div>

          <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Expired / Inactive
            </span>
            <p className="text-2xl font-bold text-neutral-500">
              {expiredPolicies.length}
            </p>
            <p className="text-xs text-neutral-400 font-medium">Historical records</p>
          </div>

          <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Annual Active Premium
            </span>
            <p className="text-2xl font-bold text-emerald-600">
              {totalActivePremium.toLocaleString()} €
            </p>
            <p className="text-xs text-emerald-600/80 font-medium">Total portfolio value</p>
          </div>
        </div>

        {/* 30-Day Renewal Alerts Callout */}
        {expiringSoon.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>Policies Requiring Immediate Renewal Outreach ({expiringSoon.length})</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {expiringSoon.map((p) => {
                const daysLeft = Math.ceil(
                  (new Date(p.expiry_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                )
                return (
                  <Link
                    key={p.id}
                    href={`/admin/insurance/${p.id}`}
                    className="p-3 bg-white dark:bg-neutral-900 rounded-xl border border-amber-200 dark:border-amber-900/60 shadow-xs hover:border-amber-400 transition block space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-neutral-900 dark:text-neutral-100">{p.product} • {p.insurer}</span>
                      <span className="text-amber-600 font-bold">{daysLeft} days left</span>
                    </div>
                    <p className="text-neutral-500">
                      Client: {p.client?.first_name} {p.client?.last_name}
                    </p>
                    <p className="text-neutral-400 text-[11px]">
                      Expires on: {p.expiry_date}
                    </p>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/insurance"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                !searchParams.status
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
              }`}
            >
              All Policies ({policies.length})
            </Link>
            <Link
              href="/admin/insurance?status=ACTIVE"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                searchParams.status === 'ACTIVE'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
              }`}
            >
              Active
            </Link>
            <Link
              href="/admin/insurance?status=PENDING_RENEWAL"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                searchParams.status === 'PENDING_RENEWAL'
                  ? 'bg-amber-600 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
              }`}
            >
              Pending Renewal
            </Link>
            <Link
              href="/admin/insurance?status=EXPIRED"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                searchParams.status === 'EXPIRED'
                  ? 'bg-neutral-600 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
              }`}
            >
              Expired
            </Link>
          </div>
          <span className="text-xs text-neutral-400">
            Showing {policies.length} records
          </span>
        </div>

        {/* Policies Directory */}
        {policies.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-12 text-center">
            <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-400">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              No insurance policies found
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
              Add client policies (RCA, CASCO, Home, Life, Health, Liability) to track renewals and document storage.
            </p>
            <div className="mt-6">
              <Link
                href="/admin/insurance/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-xl font-medium text-sm hover:opacity-95 transition"
              >
                <Plus className="w-4 h-4" />
                Add First Policy
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {policies.map((p) => {
              const isExpired = new Date(p.expiry_date) < now || p.status === 'EXPIRED'
              const daysLeft = Math.ceil(
                (new Date(p.expiry_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
              )
              const isUrgent = daysLeft >= 0 && daysLeft <= 30 && p.status === 'ACTIVE'

              return (
                <Link
                  key={p.id}
                  href={`/admin/insurance/${p.id}`}
                  className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 shadow-sm hover:border-neutral-400 dark:hover:border-neutral-700 transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                            isUrgent
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                              : isExpired
                              ? 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                          }`}
                        >
                          {isUrgent ? 'EXPIRING SOON' : p.status}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-neutral-400">
                        {p.policy_number || 'No Policy #'}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
                        {p.product} Coverage
                      </h3>
                      <p className="text-xs text-neutral-500 font-medium">
                        Insurer: <span className="text-neutral-800 dark:text-neutral-200 font-semibold">{p.insurer}</span>
                      </p>
                    </div>

                    {p.client && (
                      <div className="p-2.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-neutral-400" />
                          <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                            {p.client.first_name} {p.client.last_name}
                          </span>
                        </div>
                        {p.client.phone && (
                          <span className="text-neutral-400 font-mono text-[11px]">
                            {p.client.phone}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div className="bg-neutral-50 dark:bg-neutral-800/40 p-2 rounded-lg">
                        <span className="text-neutral-400 block text-[10px] uppercase font-bold">
                          Premium
                        </span>
                        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {p.premium ? `${Number(p.premium).toLocaleString()} ${p.currency}` : 'N/A'}
                        </span>
                      </div>
                      <div className="bg-neutral-50 dark:bg-neutral-800/40 p-2 rounded-lg">
                        <span className="text-neutral-400 block text-[10px] uppercase font-bold">
                          Expiry Date
                        </span>
                        <span className={`font-semibold ${isUrgent ? 'text-amber-600' : 'text-neutral-900 dark:text-neutral-100'}`}>
                          {p.expiry_date}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                    <span>Manage Policy</span>
                    <ArrowUpRight className="w-4 h-4 text-neutral-400" />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </PrivateLayout>
  )
}
