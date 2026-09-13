import { getCreditCases } from '@/lib/db/credit'
import { PrivateLayout } from '@/components/layout/private/PrivateLayout'
import Link from 'next/link'
import { Plus, Landmark, User, ChevronRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

const PIPELINE_STAGES = [
  { key: 'LEAD', label: 'Lead / Inflow', color: 'bg-blue-500' },
  { key: 'QUALIFICATION', label: 'Qualification', color: 'bg-indigo-500' },
  { key: 'ANALYSIS', label: 'Scoring & Analysis', color: 'bg-purple-500' },
  { key: 'DOCUMENTS', label: 'Doc Gathering', color: 'bg-amber-500' },
  { key: 'OFFERS', label: 'Bank Offers', color: 'bg-cyan-500' },
  { key: 'APPROVAL', label: 'Bank Approval', color: 'bg-emerald-500' },
  { key: 'CONTRACT', label: 'Signing & Drawdown', color: 'bg-teal-500' },
  { key: 'COMPLETED', label: 'Funded / Won', color: 'bg-emerald-600' },
]

export default async function CreditPipelinePage() {
  const cases = await getCreditCases()

  // Pipeline metrics
  const activeCases = cases.filter((c) => c.status !== 'COMPLETED' && c.status !== 'LOST')
  const totalActiveVolume = activeCases.reduce((sum, c) => sum + (Number(c.amount) || 0), 0)
  const completedCases = cases.filter((c) => c.status === 'COMPLETED')
  const totalFundedVolume = completedCases.reduce((sum, c) => sum + (Number(c.amount) || 0), 0)

  return (
    <PrivateLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2.5">
              <Landmark className="w-6 h-6 text-emerald-600" />
              Credit &amp; Mortgage Financing Pipeline
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              End-to-end mortgage advisory, income qualification, bank analysis, and loan drawdowns
            </p>
          </div>
          <Link
            href="/admin/credit/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-xl font-medium text-sm hover:opacity-95 transition active:scale-95 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Financing Case
          </Link>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Active Pipeline Volume
            </span>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {totalActiveVolume.toLocaleString()} €
            </p>
            <p className="text-xs text-neutral-500 font-medium">{activeCases.length} cases in progress</p>
          </div>

          <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Funded / Completed
            </span>
            <p className="text-2xl font-bold text-emerald-600">
              {totalFundedVolume.toLocaleString()} €
            </p>
            <p className="text-xs text-emerald-600/80 font-medium">{completedCases.length} loans drawn down</p>
          </div>

          <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              In Document &amp; Scoring
            </span>
            <p className="text-2xl font-bold text-amber-600">
              {cases.filter((c) => c.status === 'ANALYSIS' || c.status === 'DOCUMENTS').length}
            </p>
            <p className="text-xs text-amber-600/80 font-medium">Under active underwriter review</p>
          </div>

          <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Bank Approval Stage
            </span>
            <p className="text-2xl font-bold text-indigo-600">
              {cases.filter((c) => c.status === 'APPROVAL' || c.status === 'CONTRACT').length}
            </p>
            <p className="text-xs text-indigo-600/80 font-medium">Ready for deed &amp; drawdown</p>
          </div>
        </div>

        {/* Pipeline Visual Stage Board */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Pipeline Stage Breakdown
            </h2>
            <span className="text-xs text-neutral-400 font-medium">
              Real-time loan workflow
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {PIPELINE_STAGES.map((stage) => {
              const stageCases = cases.filter((c) => c.status === stage.key)
              const stageSum = stageCases.reduce((sum, c) => sum + (Number(c.amount) || 0), 0)

              return (
                <div
                  key={stage.key}
                  className="bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-xl border border-neutral-200/60 dark:border-neutral-800 flex flex-col justify-between space-y-2 min-h-[90px]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 truncate">
                      {stage.label}
                    </span>
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
                      {stageCases.length}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 block truncate">
                      {stageSum > 0 ? `${stageSum.toLocaleString()} €` : '0 €'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Credit Cases Directory */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Financing Cases Directory ({cases.length})
            </h2>
          </div>

          {cases.length === 0 ? (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-12 text-center">
              <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-400">
                <Landmark className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                No credit cases found
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
                Open a financing case for clients purchasing properties or refinancing existing credit.
              </p>
              <div className="mt-6">
                <Link
                  href="/admin/credit/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-xl font-medium text-sm hover:opacity-95 transition"
                >
                  <Plus className="w-4 h-4" />
                  Open First Financing Case
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {cases.map((c) => {
                const stageMeta = PIPELINE_STAGES.find((s) => s.key === c.status) || {
                  label: c.status,
                  color: 'bg-neutral-500',
                }

                return (
                  <Link
                    key={c.id}
                    href={`/admin/credit/${c.id}`}
                    className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 shadow-sm hover:border-neutral-400 dark:hover:border-neutral-700 transition flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
                          {stageMeta.label}
                        </span>
                        <span className="text-xs font-semibold text-emerald-600">
                          {Number(c.amount).toLocaleString()} {c.currency}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100 line-clamp-1">
                          {c.purpose}
                        </h3>
                        <p className="text-xs text-neutral-500 font-medium mt-0.5">
                          Bank Partner: <span className="text-neutral-800 dark:text-neutral-200 font-semibold">{c.institution || 'Selecting Partner'}</span>
                        </p>
                      </div>

                      {c.client && (
                        <div className="p-2.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-neutral-400" />
                            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                              {c.client.first_name} {c.client.last_name}
                            </span>
                          </div>
                          {c.client.phone && (
                            <span className="text-neutral-400 font-mono text-[11px]">
                              {c.client.phone}
                            </span>
                          )}
                        </div>
                      )}

                      {c.notes && (
                        <p className="text-xs text-neutral-500 line-clamp-2 italic">
                          &quot;{c.notes}&quot;
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                      <span>Manage Case &amp; Progress</span>
                      <ChevronRight className="w-4 h-4 text-neutral-400" />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </PrivateLayout>
  )
}
