import { getCampaigns } from '@/lib/db/campaigns'
import { PrivateLayout } from '@/components/layout/private/PrivateLayout'
import Link from 'next/link'
import { Plus, Megaphone } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function CampaignsDirectoryPage() {
  const campaigns = await getCampaigns()

  const activeCampaigns = campaigns.filter((c) => c.status === 'ACTIVE')
  const totalBudget = campaigns.reduce((sum, c) => sum + (Number(c.budget) || 0), 0)

  return (
    <PrivateLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2.5">
              <Megaphone className="w-6 h-6 text-purple-600" />
              Marketing &amp; Acquisition Campaigns
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Multi-channel lead generation tracking across web, paid media, social, and direct referral campaigns
            </p>
          </div>
          <Link
            href="/admin/campaigns/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-xl font-medium text-sm hover:opacity-95 transition active:scale-95 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Campaign
          </Link>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Active Campaigns
            </span>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {activeCampaigns.length}
            </p>
            <p className="text-xs text-neutral-500 font-medium">Currently driving acquisition</p>
          </div>

          <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Total Marketing Budget
            </span>
            <p className="text-2xl font-bold text-purple-600">
              {totalBudget.toLocaleString()} €
            </p>
            <p className="text-xs text-purple-600/80 font-medium">Committed across campaigns</p>
          </div>

          <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Total Campaigns Run
            </span>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {campaigns.length}
            </p>
            <p className="text-xs text-neutral-500 font-medium">Historical records</p>
          </div>
        </div>

        {/* Campaigns Grid */}
        {campaigns.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-12 text-center">
            <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-400">
              <Megaphone className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              No marketing campaigns created yet
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
              Launch and track acquisition campaigns across social media, Google ads, email outreach, or partner referral channels.
            </p>
            <div className="mt-6">
              <Link
                href="/admin/campaigns/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-xl font-medium text-sm hover:opacity-95 transition"
              >
                <Plus className="w-4 h-4" />
                Create First Campaign
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {campaigns.map((c) => (
              <div
                key={c.id}
                className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 shadow-sm space-y-4 hover:border-neutral-400 dark:hover:border-neutral-700 transition"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                        c.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : c.status === 'PAUSED'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                          : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                      }`}
                    >
                      {c.status}
                    </span>
                    <span className="text-xs font-medium text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded uppercase">
                      {c.channel || 'website'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
                      {c.name}
                    </h3>
                    {c.objective && (
                      <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">
                        {c.objective}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="bg-neutral-50 dark:bg-neutral-800/40 p-2 rounded-lg">
                      <span className="text-neutral-400 block text-[10px] uppercase font-bold">
                        Budget
                      </span>
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {c.budget ? `${Number(c.budget).toLocaleString()} ${c.currency}` : 'Flexible'}
                      </span>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-800/40 p-2 rounded-lg">
                      <span className="text-neutral-400 block text-[10px] uppercase font-bold">
                        Duration
                      </span>
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100 truncate block">
                        {c.start_date || 'Immediate'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
                  <Link
                    href={`/admin/leads?campaign_id=${c.id}`}
                    className="font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    View Captured Leads →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PrivateLayout>
  )
}
