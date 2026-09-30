'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { ActivityTimeline } from '@/components/ActivityTimeline'
import { ActivityForm } from '@/components/ActivityForm'
import { DocumentVault } from '@/components/DocumentVault'
import { ClientStatusSelect } from '@/components/ClientStatusSelect'
import {
  Shield,
  Phone,
  Mail,
  MessageSquare,
  Plus,
  ArrowUpRight,
  AlertTriangle,
  Clock,
  FileText,
  Briefcase,
  User,
  History,
  Building2,
  CreditCard,
  Eye,
  EyeOff,
} from 'lucide-react'
import { getCategoryLabel, getSourceLabel } from '@/lib/types/crm'
import { formatPhoneDisplay, getTelUrl, getWhatsAppUrl } from '@/lib/utils/phone'
import type { Database } from '@/types'

type ClientRow = Database['public']['Tables']['clients']['Row'] & {
  companies?: { id: string; name: string; email: string | null; phone: string | null } | null
  client_relationships?: Database['public']['Tables']['client_relationships']['Row'][]
}
type ActivityRow = Database['public']['Tables']['activities']['Row']
type DocumentRow = Database['public']['Tables']['documents']['Row']
type DocumentFolderRow = Database['public']['Tables']['document_folders']['Row']
type PolicyRow = Database['public']['Tables']['insurance_policies']['Row']
type InsuranceOppRow = Database['public']['Tables']['insurance_opportunities']['Row']
type FollowUpRow = Database['public']['Tables']['follow_ups']['Row']
type OpportunityRow = Database['public']['Tables']['opportunities']['Row']
type RequestRow = Database['public']['Tables']['requests']['Row']

interface ClientWorkspaceProps {
  client: ClientRow
  activities: ActivityRow[]
  documents: DocumentRow[]
  folders: DocumentFolderRow[]
  policies: PolicyRow[]
  insuranceOpportunities: InsuranceOppRow[]
  followUps: FollowUpRow[]
  opportunities: OpportunityRow[]
  requests: RequestRow[]
  health?: { status: string; score: number; reason: string } | null
  recommendations?: Array<{ id: string; title: string; reason: string; priority: string; actions: string[] }>
  defaultTab?: string
}

export function ClientWorkspaceTabs({
  client,
  activities,
  documents,
  folders,
  policies,
  insuranceOpportunities,
  followUps,
  opportunities,
  requests,
  health,
  recommendations = [],
  defaultTab = 'overview',
}: ClientWorkspaceProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab') || (searchParams.get('from') === 'insurance' ? 'policies' : defaultTab)
  const [activeTab, setActiveTab] = useState<string>(initialTab)
  const [showCnp, setShowCnp] = useState(false)

  const now = new Date()

  // Policy computations
  const activePolicies = policies.filter((p) => p.status === 'ACTIVE' && new Date(p.expiry_date) >= now)
  const expiringSoon = policies.filter((p) => {
    if (p.status !== 'ACTIVE') return false
    const exp = new Date(p.expiry_date)
    const diff = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    return diff >= 0 && diff <= 30
  })
  const totalAnnualPremium = activePolicies.reduce((sum, p) => sum + (Number(p.premium) || 0), 0)

  // Follow-up computations
  const pendingFollowUps = followUps.filter((f) => f.status === 'PENDING')
  const overdueFollowUps = pendingFollowUps.filter((f) => new Date(f.due_date) < now)
  const nextFollowUp = pendingFollowUps.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0]

  // Timeline events synthesis
  const timelineEvents = [
    ...activities.map((a) => ({
      id: `act-${a.id}`,
      type: 'ACTIVITY',
      title: a.title,
      description: a.notes,
      timestamp: new Date(a.date).getTime(),
      dateStr: a.date,
      badge: a.type,
      icon: '💬',
    })),
    ...policies.map((p) => ({
      id: `pol-${p.id}`,
      type: 'POLICY',
      title: `Policy Created: ${p.product} (${p.insurer})`,
      description: `Policy #${p.policy_number || 'N/A'} • Premium: ${p.premium ? `${Number(p.premium).toLocaleString()} ${p.currency}` : 'N/A'}`,
      timestamp: new Date(p.created_at || p.start_date).getTime(),
      dateStr: p.created_at || p.start_date,
      badge: p.status,
      icon: '🛡️',
    })),
    ...insuranceOpportunities.map((o) => ({
      id: `opp-${o.id}`,
      type: 'OPPORTUNITY',
      title: `Insurance Opportunity: ${o.product}`,
      description: `Status: ${o.status} • Estimated: ${o.estimated_premium ? `${Number(o.estimated_premium).toLocaleString()} ${o.currency}` : 'N/A'}`,
      timestamp: new Date(o.created_at || '').getTime(),
      dateStr: o.created_at || '',
      badge: o.status,
      icon: '🎯',
    })),
    ...followUps.map((f) => ({
      id: `flw-${f.id}`,
      type: 'FOLLOW_UP',
      title: `Follow-up: ${f.reason}`,
      description: f.notes || `Priority: ${f.priority}`,
      timestamp: new Date(f.created_at || f.due_date).getTime(),
      dateStr: f.created_at || f.due_date,
      badge: f.status,
      icon: '📅',
    })),
  ].sort((a, b) => b.timestamp - a.timestamp)

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText, count: null },
    { id: 'contact', label: 'Contact', icon: User, count: null },
    { id: 'policies', label: 'Policies', icon: Shield, count: policies.length },
    { id: 'opportunities', label: 'Opportunities', icon: Briefcase, count: insuranceOpportunities.length + opportunities.length },
    { id: 'claims', label: 'Claims', icon: AlertTriangle, count: 0 },
    { id: 'documents', label: 'Documents', icon: FileText, count: documents.length },
    { id: 'activities', label: 'Activities', icon: MessageSquare, count: activities.length },
    { id: 'follow-ups', label: 'Follow-ups', icon: Clock, count: pendingFollowUps.length, alert: overdueFollowUps.length > 0 },
    { id: 'history', label: 'History', icon: History, count: null },
  ]

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    const params = new URLSearchParams(window.location.search)
    params.set('tab', tabId)
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const clientCategory = (client.category || 'REAL_ESTATE').toUpperCase()

  return (
    <div className="space-y-6">
      {/* 1. Client Context Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
          {/* Client Identity */}
          <div className="flex items-start gap-4">
            <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-2xl bg-slate-900 text-white font-bold text-lg sm:text-xl flex items-center justify-center shrink-0 shadow-xs">
              {client.first_name?.[0] || 'C'}{client.last_name?.[0] || 'V'}
            </div>
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  {client.first_name} {client.last_name}
                </h1>

                {/* Editable Status Select */}
                <ClientStatusSelect
                  clientId={client.id}
                  currentStatus={client.status}
                  size="md"
                  onStatusChange={() => router.refresh()}
                />

                {/* Category Badge */}
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    clientCategory === 'INSURANCE'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : clientCategory === 'CREDIT'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}
                >
                  {clientCategory === 'REAL_ESTATE' && <Building2 className="w-3 h-3" />}
                  {clientCategory === 'INSURANCE' && <Shield className="w-3 h-3" />}
                  {clientCategory === 'CREDIT' && <CreditCard className="w-3 h-3" />}
                  <span>{getCategoryLabel(client.category)}</span>
                </span>

                {/* Source Badge */}
                <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200">
                  {getSourceLabel(client.lead_source)}
                </span>
              </div>

              {/* Ce dorește / Interest Summary banner */}
              {(client.interest_summary || client.personal_notes) && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 rounded-xl text-xs font-medium text-blue-950 dark:text-blue-300 max-w-xl">
                  <span className="font-bold text-blue-700 dark:text-blue-400">Ce dorește:</span>
                  <span>{client.interest_summary || client.personal_notes}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400 pt-0.5">
                {client.phone && (
                  <a href={getTelUrl(client.phone)} className="font-mono flex items-center gap-1 hover:text-blue-600">
                    <Phone className="w-3 h-3 text-neutral-400" />
                    {formatPhoneDisplay(client.phone)}
                  </a>
                )}
                {client.email && (
                  <a href={`mailto:${client.email}`} className="flex items-center gap-1 hover:text-blue-600">
                    <Mail className="w-3 h-3 text-neutral-400" />
                    {client.email}
                  </a>
                )}
                {client.companies?.name && (
                  <span className="flex items-center gap-1 font-semibold text-neutral-700 dark:text-neutral-300">
                    <Building2 className="w-3 h-3 text-neutral-400" />
                    {client.companies.name}
                  </span>
                )}
                <span className="text-neutral-400">
                  Advisor: <span className="text-neutral-700 dark:text-neutral-300 font-medium">Cristian Văduva</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-neutral-100 dark:border-neutral-800 shrink-0">
            {client.phone && (
              <a href={getTelUrl(client.phone)}>
                <Button size="sm" variant="outline" className="gap-1.5 text-xs h-9">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Sună</span>
                </Button>
              </a>
            )}
            {(client.whatsapp || client.phone) && (
              <a
                href={getWhatsAppUrl(client.whatsapp || client.phone)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="sm" variant="outline" className="gap-1.5 text-xs h-9 text-emerald-700 dark:text-emerald-400">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                  <span>WhatsApp</span>
                </Button>
              </a>
            )}
            {client.email && (
              <a href={`mailto:${client.email}`}>
                <Button size="sm" variant="outline" className="gap-1.5 text-xs h-9">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>Email</span>
                </Button>
              </a>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleTabChange('activities')}
              className="gap-1.5 text-xs h-9"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Activitate</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleTabChange('follow-ups')}
              className="gap-1.5 text-xs h-9"
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Follow-up</span>
            </Button>
            <Link href={`/admin/opportunities/new?client_id=${client.id}`}>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs h-9">
                <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                <span>Oportunitate</span>
              </Button>
            </Link>
            <Link href={`/admin/insurance/new?client_id=${client.id}`}>
              <Button size="sm" className="gap-1.5 text-xs h-9 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                <span>Poliță Nouă</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Structured Tabs Bar (Desktop & Horizontally Scrollable on Mobile) */}
      <div className="bg-white dark:bg-neutral-900 p-1.5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm overflow-x-auto scrollbar-none">
        <nav className="flex items-center gap-1 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer select-none ${
                  isActive
                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-inherit' : 'text-neutral-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== null && tab.count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white dark:bg-neutral-900/20 dark:text-neutral-900'
                        : tab.alert
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
                {tab.alert && !isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* 3. Tab Contents */}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 space-y-1 bg-white dark:bg-neutral-900">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Active Policies
              </span>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {activePolicies.length}
              </p>
              <p className="text-xs text-neutral-500">
                {totalAnnualPremium > 0 ? `${totalAnnualPremium.toLocaleString()} € / year` : 'No active premium'}
              </p>
            </Card>

            <Card className="p-4 space-y-1 bg-white dark:bg-neutral-900">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Relationship Status
              </span>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 capitalize">
                {health?.status ? health.status.toLowerCase().replace('_', ' ') : 'Strong'}
              </p>
              <p className="text-xs text-neutral-500 truncate">{health?.reason || 'Active client engagement'}</p>
            </Card>

            <Card className="p-4 space-y-1 bg-white dark:bg-neutral-900">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Next Follow-up
              </span>
              <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate mt-1">
                {nextFollowUp ? nextFollowUp.reason : 'None scheduled'}
              </p>
              <p className="text-xs text-neutral-500">
                {nextFollowUp ? `Due: ${new Date(nextFollowUp.due_date).toLocaleDateString()}` : 'Add follow-up'}
              </p>
            </Card>

            <Card className="p-4 space-y-1 bg-white dark:bg-neutral-900">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Total Documents Vault
              </span>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {documents.length}
              </p>
              <p className="text-xs text-neutral-500">{folders.length} organized vaults</p>
            </Card>
          </div>

          {/* Expiring Soon Banner if any */}
          {expiringSoon.length > 0 && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
                    {expiringSoon.length} Coverage Policy Expiring Within 30 Days
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    {expiringSoon.map((p) => `${p.product} (${p.insurer} - expires ${p.expiry_date})`).join(', ')}
                  </p>
                </div>
              </div>
              <Button size="sm" onClick={() => handleTabChange('policies')} className="text-xs bg-amber-600 hover:bg-amber-700">
                Review Policies
              </Button>
            </div>
          )}

          {/* 2-Column Summary Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Col: Client Overview & Notes */}
            <div className="lg:col-span-2 space-y-6">
              {/* Executive Notes */}
              {client.personal_notes && (
                <Card className="p-5 bg-white dark:bg-neutral-900 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Important Account Notes
                  </span>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
                    {client.personal_notes}
                  </p>
                </Card>
              )}

              {/* Active Policies Summary */}
              <Card className="p-5 bg-white dark:bg-neutral-900 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                      Insurance Policies ({policies.length})
                    </h3>
                  </div>
                  <Link
                    href={`/admin/insurance/new?client_id=${client.id}`}
                    className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Policy</span>
                  </Link>
                </div>

                {policies.length === 0 ? (
                  <p className="text-xs text-neutral-500 py-4 text-center">
                    No insurance policies registered yet.{' '}
                    <Link href={`/admin/insurance/new?client_id=${client.id}`} className="text-blue-600 underline">
                      Add first policy
                    </Link>
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {policies.slice(0, 4).map((p) => {
                      const isExp = new Date(p.expiry_date) < now || p.status === 'EXPIRED'
                      return (
                        <div
                          key={p.id}
                          className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-neutral-100">
                              <span>{p.product}</span>
                              <span className="font-normal text-neutral-500">• {p.insurer}</span>
                              <span
                                className={`px-1.5 py-0.2 rounded-md text-[10px] uppercase font-semibold ${
                                  isExp
                                    ? 'bg-neutral-200 text-neutral-600'
                                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                }`}
                              >
                                {p.status}
                              </span>
                            </div>
                            <p className="text-neutral-400 text-[11px] font-mono">
                              #{p.policy_number || 'N/A'} • Exp: {p.expiry_date}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-neutral-900 dark:text-neutral-100 block">
                              {p.premium ? `${Number(p.premium).toLocaleString()} ${p.currency}` : 'N/A'}
                            </span>
                            <Link
                              href={`/admin/insurance/${p.id}`}
                              className="text-[11px] text-blue-600 hover:underline"
                            >
                              Manage →
                            </Link>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </Card>

              {/* Recent Activity */}
              <Card className="p-5 bg-white dark:bg-neutral-900 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-neutral-500" />
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                      Recent Activity
                    </h3>
                  </div>
                  <button
                    onClick={() => handleTabChange('activities')}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    View All ({activities.length}) →
                  </button>
                </div>
                <ActivityTimeline activities={activities.slice(0, 3)} />
              </Card>
            </div>

            {/* Right Col: Next Best Action & Outstanding Tasks */}
            <div className="space-y-6">
              {/* Next Best Action Card */}
              {recommendations.length > 0 && (
                <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20 p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                    <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                      Next Best Action
                    </h3>
                  </div>
                  {recommendations.slice(0, 2).map((rec) => (
                    <div key={rec.id} className="p-3 bg-white dark:bg-neutral-900 rounded-xl border border-blue-100 dark:border-blue-900/50 space-y-2">
                      <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100">{rec.title}</p>
                      <p className="text-[11px] text-neutral-500 leading-relaxed">{rec.reason}</p>
                    </div>
                  ))}
                </Card>
              )}

              {/* Outstanding Follow-ups */}
              <Card className="p-5 bg-white dark:bg-neutral-900 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                  <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Scheduled Follow-ups</span>
                  </h3>
                  <button
                    onClick={() => handleTabChange('follow-ups')}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    All ({pendingFollowUps.length})
                  </button>
                </div>
                {pendingFollowUps.length === 0 ? (
                  <p className="text-xs text-neutral-500 py-3 text-center">No pending follow-ups</p>
                ) : (
                  <div className="space-y-2 text-xs">
                    {pendingFollowUps.slice(0, 3).map((f) => {
                      const isOverdue = new Date(f.due_date) < now
                      return (
                        <div
                          key={f.id}
                          className={`p-2.5 rounded-xl border ${
                            isOverdue
                              ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900'
                              : 'bg-neutral-50 dark:bg-neutral-800/40 border-neutral-100 dark:border-neutral-800'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span>{f.reason}</span>
                            <span className={isOverdue ? 'text-amber-600' : 'text-neutral-500'}>
                              {new Date(f.due_date).toLocaleDateString()}
                            </span>
                          </div>
                          {f.notes && <p className="text-neutral-500 mt-0.5 line-clamp-1">{f.notes}</p>}
                        </div>
                      )
                    })}
                  </div>
                )}
              </Card>

              {/* Quick Log Form */}
              <Card className="p-5 bg-white dark:bg-neutral-900 space-y-3">
                <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                  Quick Activity Log
                </h3>
                <ActivityForm clientId={client.id} />
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PERSONAL / CONTACT DATA */}
      {activeTab === 'contact' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 bg-white dark:bg-neutral-900 space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider pb-3 border-b border-neutral-100 dark:border-neutral-800">
              Identity &amp; Contact Coordinates
            </h3>
            <dl className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-neutral-100 dark:border-neutral-800/50">
                <dt className="text-neutral-400">Full Name</dt>
                <dd className="font-bold text-neutral-900 dark:text-neutral-100">{client.first_name} {client.last_name}</dd>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100 dark:border-neutral-800/50">
                <dt className="text-neutral-400">Primary Phone</dt>
                <dd className="font-mono font-semibold text-neutral-900 dark:text-neutral-100">{client.phone || '—'}</dd>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100 dark:border-neutral-800/50">
                <dt className="text-neutral-400">WhatsApp</dt>
                <dd className="font-mono font-semibold text-emerald-600">{client.whatsapp || '—'}</dd>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100 dark:border-neutral-800/50">
                <dt className="text-neutral-400">Primary Email</dt>
                <dd className="font-medium text-neutral-900 dark:text-neutral-100">{client.email || '—'}</dd>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-neutral-100 dark:border-neutral-800/50">
                <dt className="text-neutral-400">CNP</dt>
                <dd className="font-mono font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <span>{client.cnp ? (showCnp ? client.cnp : '•••••••••••••') : '—'}</span>
                  {client.cnp && (
                    <button
                      type="button"
                      onClick={() => setShowCnp(!showCnp)}
                      className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
                      title={showCnp ? 'Ascunde CNP' : 'Afișează CNP'}
                    >
                      {showCnp ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </dd>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100 dark:border-neutral-800/50">
                <dt className="text-neutral-400">Preferred Channel</dt>
                <dd className="font-bold uppercase text-neutral-900 dark:text-neutral-100">{client.preferred_communication || 'WhatsApp'}</dd>
              </div>
              <div className="flex justify-between py-1.5">
                <dt className="text-neutral-400">Lead Attribution Source</dt>
                <dd className="font-semibold text-neutral-900 dark:text-neutral-100">{client.lead_source || 'Direct Contact'}</dd>
              </div>
            </dl>
          </Card>

          <Card className="p-6 bg-white dark:bg-neutral-900 space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider pb-3 border-b border-neutral-100 dark:border-neutral-800">
              Company &amp; Location Data
            </h3>
            <dl className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-neutral-100 dark:border-neutral-800/50">
                <dt className="text-neutral-400">Company / Employer</dt>
                <dd className="font-bold text-neutral-900 dark:text-neutral-100">{client.companies?.name || 'Individual / Private'}</dd>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100 dark:border-neutral-800/50">
                <dt className="text-neutral-400">Client Type / Role</dt>
                <dd className="font-bold uppercase text-neutral-900 dark:text-neutral-100">{client.role || (client.company_id ? 'CORPORATE' : 'INDIVIDUAL')}</dd>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100 dark:border-neutral-800/50">
                <dt className="text-neutral-400">Account Created</dt>
                <dd className="font-mono text-neutral-500">{new Date(client.created_at).toLocaleDateString()}</dd>
              </div>
              <div className="flex justify-between py-1.5">
                <dt className="text-neutral-400">Record ID</dt>
                <dd className="font-mono text-[11px] text-neutral-400">{client.id}</dd>
              </div>
            </dl>
          </Card>
        </div>
      )}

      {/* TAB 3: POLICIES */}
      {activeTab === 'policies' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <span>Client Insurance Policies ({policies.length})</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                RCA, CASCO, Home, Life, Health, and Business Coverage records
              </p>
            </div>
            <Link href={`/admin/insurance/new?client_id=${client.id}`}>
              <Button size="sm" className="gap-1.5 text-xs bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900">
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Policy</span>
              </Button>
            </Link>
          </div>

          {policies.length === 0 ? (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-12 text-center space-y-3">
              <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto text-neutral-400">
                <Shield className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-neutral-900 dark:text-neutral-100">No Insurance Policies on Record</h4>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Track client coverage policies, renewal dates, and automated renewal alerts.
              </p>
              <div className="pt-2">
                <Link href={`/admin/insurance/new?client_id=${client.id}`}>
                  <Button size="sm" className="gap-1.5 text-xs">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Policy</span>
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {policies.map((p) => {
                const isExp = new Date(p.expiry_date) < now || p.status === 'EXPIRED'
                const daysRemaining = Math.ceil((new Date(p.expiry_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                const isUrgent = daysRemaining >= 0 && daysRemaining <= 30 && p.status === 'ACTIVE'

                return (
                  <div
                    key={p.id}
                    className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 space-y-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base text-neutral-900 dark:text-neutral-100">
                            {p.product} Coverage
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isUrgent
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200'
                                : isExp
                                ? 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                            }`}
                          >
                            {isUrgent ? 'EXPIRING SOON' : p.status}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500">
                          Insurer: <span className="font-semibold text-neutral-800 dark:text-neutral-200">{p.insurer}</span>
                        </p>
                      </div>
                      <span className="text-xs font-mono text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
                        #{p.policy_number || 'No #'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl">
                        <span className="text-[10px] text-neutral-400 uppercase font-bold block">Annual Premium</span>
                        <span className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                          {p.premium ? `${Number(p.premium).toLocaleString()} ${p.currency}` : 'N/A'}
                        </span>
                      </div>
                      <div className="p-2.5 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl">
                        <span className="text-[10px] text-neutral-400 uppercase font-bold block">Expiry Date</span>
                        <span className={`font-bold text-sm ${isUrgent ? 'text-amber-600' : 'text-neutral-900 dark:text-neutral-100'}`}>
                          {p.expiry_date}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                      <span className="text-neutral-400">
                        Start: {p.start_date}
                      </span>
                      <Link
                        href={`/admin/insurance/${p.id}`}
                        className="font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        <span>Manage Policy</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: OPPORTUNITIES */}
      {activeTab === 'opportunities' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-purple-600" />
                <span>Insurance &amp; Advisory Opportunities</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Active pipeline stages, quotes, and converted deals
              </p>
            </div>
            <Link href={`/admin/opportunities/new?client_id=${client.id}`}>
              <Button size="sm" className="gap-1.5 text-xs">
                <Plus className="w-3.5 h-3.5" />
                <span>New Opportunity</span>
              </Button>
            </Link>
          </div>

          {insuranceOpportunities.length === 0 && opportunities.length === 0 && requests.length === 0 ? (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-12 text-center space-y-2">
              <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">No active opportunities or requests in pipeline</p>
              <p className="text-xs text-neutral-500">Create a quote or proposal opportunity for this client.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insuranceOpportunities.map((opp) => (
                <div key={opp.id} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                      {opp.product} Coverage Proposal
                    </span>
                    <Badge variant={opp.status === 'CLOSED_WON' ? 'success' : 'default'} size="sm">
                      {opp.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-neutral-500 space-y-1">
                    <p>Estimated Premium: <span className="font-bold text-neutral-900 dark:text-neutral-100">{opp.estimated_premium ? `${Number(opp.estimated_premium).toLocaleString()} ${opp.currency}` : 'N/A'}</span></p>
                    {opp.notes && <p className="text-neutral-400">{opp.notes}</p>}
                  </div>
                </div>
              ))}
              {opportunities.map((opp) => (
                <div key={opp.id} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                      {opp.title} ({opp.type})
                    </span>
                    <Badge variant={opp.stage === 'CLOSED_WON' ? 'success' : 'default'} size="sm">
                      {opp.stage}
                    </Badge>
                  </div>
                  <div className="text-xs text-neutral-500 space-y-1">
                    <p>Deal Value: <span className="font-bold text-neutral-900 dark:text-neutral-100">{opp.value ? `${Number(opp.value).toLocaleString()} ${opp.currency}` : 'N/A'}</span></p>
                    {opp.notes && <p className="text-neutral-400">{opp.notes}</p>}
                  </div>
                </div>
              ))}
              {requests.map((req) => (
                <div key={req.id} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                      Buyer Mandate: {req.title}
                    </span>
                    <Badge variant="info" size="sm">
                      {req.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-neutral-500 space-y-1">
                    <p>Target Budget: <span className="font-bold text-neutral-900 dark:text-neutral-100">{req.budget_max ? `Up to ${Number(req.budget_max).toLocaleString()} ${req.currency}` : 'Flexible'}</span></p>
                    <p className="text-neutral-400">Location: {req.preferred_locations?.length ? req.preferred_locations.join(', ') : 'Multiple areas'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: CLAIMS / INCIDENTS */}
      {activeTab === 'claims' && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto text-neutral-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
            Claims &amp; Incident Tracking
          </h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
            No active claims or damage assessments are recorded for this client. Damage photos, insurer claims correspondence, and loss adjustment documents are stored securely in the <strong>Documents</strong> vault.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Button size="sm" onClick={() => handleTabChange('documents')} className="text-xs gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Open Document Vault</span>
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleTabChange('activities')} className="text-xs gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Log Incident Note</span>
            </Button>
          </div>
        </div>
      )}

      {/* TAB 6: DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <DocumentVault
            clientId={client.id}
            documents={documents}
            folders={folders}
          />
        </div>
      )}

      {/* TAB 7: ACTIVITIES */}
      {activeTab === 'activities' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-6 bg-white dark:bg-neutral-900 space-y-4">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider pb-3 border-b border-neutral-100 dark:border-neutral-800">
                Client Activity Feed ({activities.length})
              </h3>
              <ActivityTimeline activities={activities} />
            </Card>
          </div>
          <div className="space-y-4">
            <Card className="p-5 bg-white dark:bg-neutral-900 space-y-3">
              <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                Log New Interaction
              </h3>
              <ActivityForm clientId={client.id} />
            </Card>
          </div>
        </div>
      )}

      {/* TAB 8: FOLLOW-UPS */}
      {activeTab === 'follow-ups' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <span>Client Follow-up Schedule ({followUps.length})</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Automated policy renewals, check-ins, and scheduled tasks
              </p>
            </div>
          </div>

          {followUps.length === 0 ? (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border p-12 text-center text-xs text-neutral-500">
              No follow-ups recorded for this client.
            </div>
          ) : (
            <div className="space-y-3">
              {followUps.map((f) => {
                const isOverdue = new Date(f.due_date) < now && f.status === 'PENDING'
                return (
                  <div
                    key={f.id}
                    className={`bg-white dark:bg-neutral-900 p-4 rounded-2xl border transition space-y-2 ${
                      isOverdue
                        ? 'border-amber-300 dark:border-amber-900/60 bg-amber-50/20'
                        : 'border-neutral-200/80 dark:border-neutral-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-900 dark:text-neutral-100">{f.reason}</span>
                        <Badge variant={f.status === 'COMPLETED' ? 'success' : isOverdue ? 'danger' : 'default'} size="sm">
                          {isOverdue ? 'OVERDUE' : f.status}
                        </Badge>
                      </div>
                      <span className="font-mono text-neutral-500 font-semibold">
                        Due: {new Date(f.due_date).toLocaleDateString()}
                      </span>
                    </div>
                    {f.notes && <p className="text-xs text-neutral-600 dark:text-neutral-400">{f.notes}</p>}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 9: TIMELINE / HISTORY */}
      {activeTab === 'history' && (
        <Card className="p-6 bg-white dark:bg-neutral-900 space-y-4">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider pb-3 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-2">
            <History className="w-4 h-4 text-neutral-400" />
            <span>Chronological Relationship History ({timelineEvents.length} Events)</span>
          </h3>

          {timelineEvents.length === 0 ? (
            <p className="text-xs text-neutral-500 py-6 text-center">No history events recorded yet.</p>
          ) : (
            <div className="space-y-4 relative">
              <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-neutral-100 dark:bg-neutral-800" />
              {timelineEvents.map((evt) => (
                <div key={evt.id} className="flex gap-4 relative">
                  <div className="w-8 h-8 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-sm shrink-0 z-10 shadow-2xs">
                    {evt.icon}
                  </div>
                  <div className="flex-1 bg-neutral-50 dark:bg-neutral-800/40 p-3.5 rounded-xl border border-neutral-100 dark:border-neutral-800 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-900 dark:text-neutral-100">{evt.title}</span>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {evt.dateStr ? new Date(evt.dateStr).toLocaleString() : ''}
                      </span>
                    </div>
                    {evt.description && <p className="text-neutral-500 leading-relaxed">{evt.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
