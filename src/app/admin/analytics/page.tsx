import React from 'react'
import Link from 'next/link'
import { PrivateLayout } from '@/components/layout/private/PrivateLayout'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { getRealDatabaseAnalytics } from '@/lib/db/analytics'
import {
  TrendingUp,
  Building2,
  Shield,
  CreditCard,
  Target,
  BarChart3,
  AlertTriangle
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminAnalyticsPage() {
  const analytics = await getRealDatabaseAnalytics()

  const totalSourceLeads = Object.values(analytics.leads.bySource).reduce((sum, count) => sum + count, 0)

  return (
    <PrivateLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Executive Operating Analytics
              </h1>
              <Badge variant="info" size="sm">
                Live Data
              </Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Deterministic, real-time database aggregation across Real Estate, Insurance, Credit, and Lead Attribution pipelines.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/admin/leads">
              <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                <Target className="w-4 h-4 text-blue-600" />
                Leads Inbox
              </Button>
            </Link>
            <Link href="/admin/campaigns/new">
              <Button size="sm" className="flex items-center gap-1.5">
                + Launch Campaign
              </Button>
            </Link>
          </div>
        </div>

        {/* Top Primary KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 bg-white border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Real Estate Inventory</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-slate-900">
                {analytics.properties.totalInventoryValue.toLocaleString()} €
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {analytics.properties.totalActive} active listings • avg {analytics.properties.avgPrice.toLocaleString()} €
              </p>
            </div>
          </Card>

          <Card className="p-5 bg-white border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Credit Pipeline</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-slate-900">
                {analytics.credit.totalPipelineVolume.toLocaleString()} €
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {analytics.credit.activeCasesCount} active cases • {analytics.credit.totalFundedVolume.toLocaleString()} € funded
              </p>
            </div>
          </Card>

          <Card className="p-5 bg-white border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Insurance Book</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-slate-900">
                {analytics.insurance.totalAnnualPremium.toLocaleString()} €
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-xs text-slate-500">{analytics.insurance.totalActive} policies</span>
                {analytics.insurance.expiringSoonCount > 0 && (
                  <span className="text-xs text-amber-600 font-semibold flex items-center gap-0.5">
                    • <AlertTriangle className="w-3 h-3" /> {analytics.insurance.expiringSoonCount} 30-day renewals
                  </span>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-white border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Lead Conversion</span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-slate-900">
                {analytics.leads.conversionRate}%
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {analytics.leads.convertedCount} of {analytics.leads.total} leads converted ({analytics.leads.newCount} new)
              </p>
            </div>
          </Card>

          <Card className="p-5 bg-white border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Deals Pipeline</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-slate-900">
                {analytics.opportunities.totalPipelineValue.toLocaleString()} €
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {analytics.opportunities.activeDealsCount} active deals • {analytics.opportunities.weightedPipelineValue.toLocaleString()} € weighted forecast
              </p>
            </div>
          </Card>

          <Card className="p-5 bg-white border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Accepted Offers</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-slate-900">
                {analytics.offers.acceptedOffersVolume.toLocaleString()} €
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {analytics.offers.totalOffersCount} total offers ({analytics.offers.pendingOffersCount} pending review)
              </p>
            </div>
          </Card>
        </div>

        {/* Deep Dive Section: Attribution Breakdown & Pipeline Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lead Source Attribution Channel Matrix */}
          <Card className="p-6 bg-white border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  Marketing Lead Attribution by Channel
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live traffic & inquiry distribution across acquisition touchpoints
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">{totalSourceLeads} Total Inbound</span>
            </div>

            {Object.keys(analytics.leads.bySource).length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No lead acquisition records yet. Inquiries from the public portal or social campaigns will populate here.
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(analytics.leads.bySource)
                  .sort(([, a], [, b]) => b - a)
                  .map(([source, count]) => {
                    const pct = totalSourceLeads > 0 ? Math.round((count / totalSourceLeads) * 100) : 0
                    return (
                      <div key={source} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-800 capitalize">
                            {source.replace(/_/g, ' ')}
                          </span>
                          <span className="text-slate-500 font-mono">
                            {count} leads ({pct}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </Card>

          {/* Operational Pipeline Summary Matrix */}
          <Card className="p-6 bg-white border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-600" />
                  Portfolio Operational Balance
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cross-sector activity metrics and client engagement
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-mono text-slate-500 uppercase block">Active Buyer Demand</span>
                <span className="text-xl font-bold text-slate-900 mt-1 block">
                  {analytics.requests.totalActive} Requests
                </span>
                <span className="text-xs text-slate-500 mt-1 block font-mono">
                  {analytics.requests.totalBudgetCeiling.toLocaleString()} € combined ceiling
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-mono text-slate-500 uppercase block">Client Relationship Base</span>
                <span className="text-xl font-bold text-slate-900 mt-1 block">
                  {analytics.clients.totalClients} Total Contacts
                </span>
                <span className="text-xs text-slate-500 mt-1 block font-mono">
                  {analytics.clients.activeClients} active accounts
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-mono text-slate-500 uppercase block">Public Listings</span>
                <span className="text-xl font-bold text-slate-900 mt-1 block">
                  {analytics.properties.totalPublic} Online
                </span>
                <span className="text-xs text-slate-500 mt-1 block font-mono">
                  {analytics.properties.totalSold} closed deals
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-mono text-slate-500 uppercase block">Financing Completion</span>
                <span className="text-xl font-bold text-slate-900 mt-1 block">
                  {analytics.credit.totalFundedVolume.toLocaleString()} €
                </span>
                <span className="text-xs text-emerald-600 font-semibold mt-1 block">
                  Disbursed loans
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PrivateLayout>
  )
}
