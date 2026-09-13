import { getOpportunities } from '@/lib/db/opportunities'
import { PrivateLayout } from '@/components/layout/private/PrivateLayout'
import Link from 'next/link'
import { Plus, TrendingUp, DollarSign, Target, Calendar } from 'lucide-react'

export const dynamic = 'force-dynamic'

const STAGES = [
  { key: 'PROSPECT', label: 'Prospect', color: 'bg-slate-100 text-slate-800 border-slate-200' },
  { key: 'QUALIFIED', label: 'Qualified', color: 'bg-blue-50 text-blue-800 border-blue-200' },
  { key: 'PROPOSAL', label: 'Proposal', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  { key: 'NEGOTIATION', label: 'Negotiation', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  { key: 'CLOSED_WON', label: 'Won', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { key: 'CLOSED_LOST', label: 'Lost', color: 'bg-rose-50 text-rose-800 border-rose-200' },
]

export default async function OpportunitiesPage() {
  let opportunities: Awaited<ReturnType<typeof getOpportunities>> = []
  try {
    opportunities = await getOpportunities()
  } catch (err) {
    console.error('Error loading opportunities:', err)
  }

  const totalPipelineValue = opportunities.reduce((sum, item) => sum + (Number(item.value) || 0), 0)
  const weightedPipelineValue = opportunities.reduce(
    (sum, item) => sum + (Number(item.value) || 0) * ((item.probability || 0) / 100),
    0
  )
  const activeOpportunities = opportunities.filter(
    (item) => item.stage !== 'CLOSED_WON' && item.stage !== 'CLOSED_LOST'
  )

  return (
    <PrivateLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Deals &amp; Opportunities Pipeline
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Live deal progression across real estate sales, mandates, insurance, and mortgage cases.
            </p>
          </div>
          <Link
            href="/admin/opportunities/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-slate-800 transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Opportunity</span>
          </Link>
        </div>

        {/* Executive Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Pipeline</span>
              <DollarSign className="w-5 h-5 text-slate-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              €{totalPipelineValue.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-1">{opportunities.length} total recorded deals</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Weighted Forecast</span>
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-emerald-700">
              €{Math.round(weightedPipelineValue).toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-1">Probability-adjusted expected yield</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Deals</span>
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {activeOpportunities.length}
            </div>
            <div className="text-xs text-slate-500 mt-1">Under active negotiation or progression</div>
          </div>
        </div>

        {/* Pipeline Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-start">
          {STAGES.map((stage) => {
            const stageDeals = opportunities.filter((op) => op.stage === stage.key)
            const stageValue = stageDeals.reduce((sum, item) => sum + (Number(item.value) || 0), 0)

            return (
              <div
                key={stage.key}
                className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-3.5 space-y-3 min-h-[360px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      {stage.label}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                      {stageDeals.length}
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-500">
                    €{stageValue >= 1000 ? `${Math.round(stageValue / 1000)}k` : stageValue}
                  </span>
                </div>

                {/* Deal Cards */}
                <div className="space-y-2.5">
                  {stageDeals.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400">
                      No deals
                    </div>
                  ) : (
                    stageDeals.map((deal) => (
                      <div
                        key={deal.id}
                        className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs hover:shadow-xs transition space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-semibold text-slate-900 line-clamp-2">
                            {deal.title}
                          </h4>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                            {deal.type}
                          </span>
                        </div>

                        {deal.client && (
                          <div className="text-[11px] text-slate-600 font-medium">
                            <Link
                              href={`/admin/clients/${deal.client_id}`}
                              className="hover:text-slate-900 underline decoration-slate-300"
                            >
                              {deal.client.first_name} {deal.client.last_name}
                            </Link>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                          <span className="font-bold text-slate-900">
                            {deal.value ? `€${Number(deal.value).toLocaleString()}` : '—'}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {deal.probability}% prob.
                          </span>
                        </div>

                        {deal.expected_close_date && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-400">
                            <Calendar className="w-3 h-3" />
                            <span>Target: {new Date(deal.expected_close_date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </PrivateLayout>
  )
}
