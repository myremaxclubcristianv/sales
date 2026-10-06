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
  CheckCircle2,
  XCircle,
  Edit3,
  Sparkles,
  Cake,
} from 'lucide-react'
import { getCategoryLabel, getSourceLabel } from '@/lib/types/crm'
import { formatPhoneDisplay, getTelUrl, getWhatsAppUrl } from '@/lib/utils/phone'
import { formatDobDisplay, calculateAge, getBirthdayCountdownInfo, getRomanianBirthdayWish } from '@/lib/utils/cnp'
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

  // Follow-up modal & actions state
  const [followUpModalOpen, setFollowUpModalOpen] = useState(false)
  const [editingFollowUp, setEditingFollowUp] = useState<FollowUpRow | null>(null)
  const [followUpLoading, setFollowUpLoading] = useState(false)
  const [followUpForm, setFollowUpForm] = useState(() => ({
    reason: '',
    due_date: '',
    due_time: '11:00',
    priority: 'NORMAL',
    notes: '',
    status: 'PENDING',
  }))

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

  // Follow-up Handlers
  const handleOpenNewFollowUp = () => {
    setEditingFollowUp(null)
    setFollowUpForm({
      reason: '',
      due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      due_time: '11:00',
      priority: 'NORMAL',
      notes: '',
      status: 'PENDING',
    })
    setFollowUpModalOpen(true)
  }

  const handleOpenEditFollowUp = (item: FollowUpRow) => {
    setEditingFollowUp(item)
    const d = new Date(item.due_date)
    setFollowUpForm({
      reason: item.reason,
      due_date: !isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : item.due_date.slice(0, 10),
      due_time: !isNaN(d.getTime()) ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '11:00',
      priority: item.priority || 'NORMAL',
      notes: item.notes || '',
      status: item.status || 'PENDING',
    })
    setFollowUpModalOpen(true)
  }

  const handleSaveFollowUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!followUpForm.reason.trim()) {
      alert('Vă rugăm să introduceți motivul follow-up-ului.')
      return
    }
    setFollowUpLoading(true)

    try {
      const dueDateTime = `${followUpForm.due_date}T${followUpForm.due_time}:00`

      if (editingFollowUp) {
        const res = await fetch(`/api/follow-ups/${editingFollowUp.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reason: followUpForm.reason,
            due_date: dueDateTime,
            priority: followUpForm.priority,
            notes: followUpForm.notes,
            status: followUpForm.status,
          }),
        })
        if (!res.ok) throw new Error('Eroare la actualizarea follow-up-ului')
      } else {
        const res = await fetch('/api/follow-ups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: client.id,
            reason: followUpForm.reason,
            due_date: dueDateTime,
            priority: followUpForm.priority,
            notes: followUpForm.notes,
            status: followUpForm.status,
          }),
        })
        if (!res.ok) throw new Error('Eroare la salvarea follow-up-ului')
      }

      setFollowUpModalOpen(false)
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'A apărut o eroare.'
      alert(msg)
    } finally {
      setFollowUpLoading(false)
    }
  }

  const handleCompleteFollowUp = async (id: string) => {
    setFollowUpLoading(true)
    try {
      const res = await fetch(`/api/follow-ups/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      })
      if (res.ok) {
        router.refresh()
      } else {
        alert('Eroare la completarea follow-up-ului.')
      }
    } catch {
      alert('A apărut o eroare.')
    } finally {
      setFollowUpLoading(false)
    }
  }

  const handleCancelFollowUp = async (id: string) => {
    if (!confirm('Sigur doriți să anulați acest follow-up?')) return
    setFollowUpLoading(true)
    try {
      const res = await fetch(`/api/follow-ups/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      })
      if (res.ok) {
        router.refresh()
      } else {
        alert('Eroare la anularea follow-up-ului.')
      }
    } catch {
      alert('A apărut o eroare.')
    } finally {
      setFollowUpLoading(false)
    }
  }

  const clientCategory = (client.category || 'REAL_ESTATE').toUpperCase()
  const clientAge = calculateAge(client.date_of_birth)
  const birthdayInfo = getBirthdayCountdownInfo(client.date_of_birth)

  const [birthdayFelicitat, setBirthdayFelicitat] = useState(false)
  const [birthdayAckLoading, setBirthdayAckLoading] = useState(false)

  const handleAcknowledgeBirthdayInWorkspace = async () => {
    setBirthdayAckLoading(true)
    try {
      const year = new Date().getFullYear()
      const res = await fetch('/api/follow-ups/acknowledge-birthday', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: client.id,
          year,
          notes: `Urări de La Mulți Ani transmise cu succes către ${client.first_name}.`,
        }),
      })
      if (res.ok) {
        setBirthdayFelicitat(true)
        alert(`Aniversarea pentru anul ${year} a fost marcată ca felicitată!`)
      } else {
        alert('Nu s-a putut înregistra felicitarea.')
      }
    } catch {
      alert('Eroare la înregistrarea felicitării.')
    } finally {
      setBirthdayAckLoading(false)
    }
  }

  const handleCopyBirthdayGreeting = async () => {
    const wish = getRomanianBirthdayWish(client.first_name)
    try {
      await navigator.clipboard.writeText(wish)
      alert(`Mesajul de 'La Mulți Ani' a fost copiat în clipboard:\n\n"${wish}"`)
    } catch {
      prompt('Copiază mesajul de La Mulți Ani:', wish)
    }
  }

  const getWhatsAppBirthdayLink = () => {
    const wish = getRomanianBirthdayWish(client.first_name)
    const phone = client.whatsapp || client.phone || ''
    const cleanPhone = phone.replace(/\D/g, '')
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(wish)}`
  }

  return (
    <div className="space-y-6">
      {/* 1. Client Context Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
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

                {/* BIRTHDAY BADGE */}
                {birthdayInfo.hasDob && (
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${
                      birthdayInfo.isToday
                        ? 'bg-pink-100 text-pink-900 border border-pink-300 animate-pulse font-bold shadow-xs'
                        : birthdayInfo.isUpcoming
                        ? 'bg-pink-50 text-pink-900 border border-pink-200 font-bold'
                        : 'bg-pink-50/70 text-pink-900 border border-pink-200/70'
                    }`}
                  >
                    <span>🎂</span>
                    <span className="font-bold">{birthdayInfo.formattedDayMonth}</span>
                    {birthdayInfo.currentAge !== null && (
                      <span className="text-pink-700 font-bold">({birthdayInfo.currentAge} ani)</span>
                    )}
                    <span className="text-pink-600/80 font-mono text-[11px]">
                      · {birthdayInfo.statusTextRo}
                    </span>
                  </div>
                )}
              </div>

              {/* Ce dorește / Interest Summary banner */}
              {(client.interest_summary || client.personal_notes) && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50/70 border border-blue-200/60 rounded-xl text-xs font-medium text-blue-950 max-w-xl">
                  <span className="font-bold text-blue-700">Ce dorește:</span>
                  <span>{client.interest_summary || client.personal_notes}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500 pt-0.5">
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
                  <span className="flex items-center gap-1 font-semibold text-neutral-700">
                    <Building2 className="w-3 h-3 text-neutral-400" />
                    {client.companies.name}
                  </span>
                )}
                <span className="text-neutral-400">
                  Advisor: <span className="text-neutral-700 font-medium">Cristian Văduva</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-neutral-100 shrink-0">
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
                <Button size="sm" variant="outline" className="gap-1.5 text-xs h-9 text-emerald-700">
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
            {/* Quick Action: + NEXT FOLLOW-UP */}
            <Button
              size="sm"
              variant="outline"
              onClick={handleOpenNewFollowUp}
              className="gap-1.5 text-xs h-9 text-amber-900 bg-amber-50/80 border-amber-300 hover:bg-amber-100"
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>+ Next Follow-up</span>
            </Button>
            <Link href={`/admin/opportunities/new?client_id=${client.id}`}>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs h-9">
                <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                <span>Oportunitate</span>
              </Button>
            </Link>
            <Link href={`/admin/insurance/new?client_id=${client.id}`}>
              <Button size="sm" className="gap-1.5 text-xs h-9 bg-neutral-900 text-white">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                <span>Poliță Nouă</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* BIRTHDAY CELEBRATION / UPCOMING BANNER */}
        {birthdayInfo.hasDob && birthdayInfo.isToday && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-gradient-to-r from-pink-50 via-rose-50 to-amber-50 rounded-2xl border border-pink-300 shadow-xs">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-pink-600 text-white text-2xl flex items-center justify-center shrink-0 shadow-md">
                🎂
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-pink-600 text-white text-[10px] font-extrabold uppercase tracking-wider">
                    Aniversare Astăzi
                  </span>
                  <span className="text-xs font-bold text-pink-950">
                    {birthdayInfo.formattedFullDob} ({birthdayInfo.currentAge} ani)
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
                  Astăzi este ziua de naștere a lui {client.first_name} {client.last_name}! 🎉
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Trimite-i o urare caldă pentru a întări relația de parteneriat.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-pink-200/60">
              <Button
                size="sm"
                onClick={handleCopyBirthdayGreeting}
                className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold gap-1.5 shadow-xs cursor-pointer h-9 px-3.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>🎊 LA MULȚI ANI (Copiază)</span>
              </Button>
              {(client.phone || client.whatsapp) && (
                <a
                  href={getWhatsAppBirthdayLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-emerald-500 text-emerald-700 hover:bg-emerald-50 text-xs font-bold gap-1.5 h-9 bg-white"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Trimite pe WhatsApp</span>
                  </Button>
                </a>
              )}
            </div>
          </div>
        )}

        {birthdayInfo.hasDob && !birthdayInfo.isToday && birthdayInfo.isUpcoming && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-pink-50/80 rounded-2xl border border-pink-200 text-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-700 text-base flex items-center justify-center shrink-0">
                🎂
              </div>
              <div>
                <span className="font-bold uppercase tracking-wider text-[10px] text-pink-800">
                  Zi de naștere apropiată
                </span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">
                  {birthdayInfo.formattedDayMonth} · {birthdayInfo.statusTextRo} (împlinește {birthdayInfo.turningAge} ani)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-pink-200/60">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyBirthdayGreeting}
                className="h-8 text-xs font-bold gap-1 text-pink-900 border-pink-200 bg-white hover:bg-pink-50"
              >
                <Sparkles className="w-3 h-3 text-pink-600" />
                <span>Copiază Urarea</span>
              </Button>
            </div>
          </div>
        )}

        {/* NEXT FOLLOW-UP TOP SUMMARY BANNER */}
        {nextFollowUp && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-amber-50/90 rounded-2xl border border-amber-200 text-xs">
            <div className="flex items-start gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="w-4 h-4 text-amber-700" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-amber-800">
                    NEXT FOLLOW-UP
                  </span>
                  <Badge variant={nextFollowUp.priority === 'URGENT' ? 'danger' : 'warning'} size="sm">
                    {nextFollowUp.priority}
                  </Badge>
                </div>
                <p className="font-bold text-slate-900 text-sm mt-0.5">
                  {new Date(nextFollowUp.due_date).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short', year: 'numeric' })} · {new Date(nextFollowUp.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-amber-950 font-medium">{nextFollowUp.reason}</p>
                {nextFollowUp.notes && (
                  <p className="text-slate-600 text-[11px] mt-0.5 line-clamp-1">{nextFollowUp.notes}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-amber-200/60">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleOpenEditFollowUp(nextFollowUp)}
                disabled={followUpLoading}
                className="h-8 text-xs font-bold gap-1 bg-white"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>EDIT</span>
              </Button>
              <Button
                size="sm"
                onClick={() => handleCompleteFollowUp(nextFollowUp.id)}
                disabled={followUpLoading}
                className="h-8 text-xs font-bold gap-1 bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>COMPLETE</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCancelFollowUp(nextFollowUp.id)}
                disabled={followUpLoading}
                className="h-8 text-xs font-bold gap-1 text-red-600 hover:bg-red-50 bg-white"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>CANCEL</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Structured Tabs Bar */}
      <div className="bg-white p-1.5 rounded-2xl border border-neutral-200/80 shadow-sm overflow-x-auto scrollbar-none">
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
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-inherit' : 'text-neutral-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== null && tab.count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : tab.alert
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-neutral-200 text-neutral-700'
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
            <Card className="p-4 space-y-1 bg-white">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Active Policies
              </span>
              <p className="text-2xl font-bold text-neutral-900">
                {activePolicies.length}
              </p>
              <p className="text-xs text-neutral-500">
                {totalAnnualPremium > 0 ? `${totalAnnualPremium.toLocaleString()} € / year` : 'No active premium'}
              </p>
            </Card>

            <Card className="p-4 space-y-1 bg-white">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Relationship Status
              </span>
              <p className="text-2xl font-bold text-neutral-900 capitalize">
                {health?.status ? health.status.toLowerCase().replace('_', ' ') : 'Strong'}
              </p>
              <p className="text-xs text-neutral-500 truncate">{health?.reason || 'Active client engagement'}</p>
            </Card>

            <Card className="p-4 space-y-1 bg-white">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Next Follow-up
              </span>
              <p className="text-sm font-bold text-neutral-900 truncate mt-1">
                {nextFollowUp ? nextFollowUp.reason : 'None scheduled'}
              </p>
              <p className="text-xs text-neutral-500">
                {nextFollowUp ? `Due: ${new Date(nextFollowUp.due_date).toLocaleDateString()}` : 'Add follow-up'}
              </p>
            </Card>

            <Card className="p-4 space-y-1 bg-white">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Total Documents Vault
              </span>
              <p className="text-2xl font-bold text-neutral-900">
                {documents.length}
              </p>
              <p className="text-xs text-neutral-500">{folders.length} organized vaults</p>
            </Card>
          </div>

          {/* Expiring Soon Banner if any */}
          {expiringSoon.length > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-amber-900">
                    {expiringSoon.length} Coverage Policy Expiring Within 30 Days
                  </p>
                  <p className="text-xs text-amber-700">
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
                <Card className="p-5 bg-white space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Important Account Notes
                  </span>
                  <p className="text-xs text-neutral-700 leading-relaxed whitespace-pre-wrap">
                    {client.personal_notes}
                  </p>
                </Card>
              )}

              {/* Active Policies Summary */}
              <Card className="p-5 bg-white space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
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
                          className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2 font-bold text-neutral-900">
                              <span>{p.product}</span>
                              <span className="font-normal text-neutral-500">• {p.insurer}</span>
                              <span
                                className={`px-1.5 py-0.2 rounded-md text-[10px] uppercase font-semibold ${
                                  isExp
                                    ? 'bg-neutral-200 text-neutral-600'
                                    : 'bg-emerald-100 text-emerald-800'
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
                            <span className="font-bold text-neutral-900 block">
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
              <Card className="p-5 bg-white space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-neutral-500" />
                    <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
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
                <Card className="border-blue-200 bg-blue-50/40 p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                    <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                      Next Best Action
                    </h3>
                  </div>
                  {recommendations.slice(0, 2).map((rec) => (
                    <div key={rec.id} className="p-3 bg-white rounded-xl border border-blue-100 space-y-2">
                      <p className="text-xs font-bold text-neutral-900">{rec.title}</p>
                      <p className="text-[11px] text-neutral-500 leading-relaxed">{rec.reason}</p>
                    </div>
                  ))}
                </Card>
              )}

              {/* Outstanding Follow-ups */}
              <Card className="p-5 bg-white space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
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
                              ? 'bg-amber-50 border-amber-200'
                              : 'bg-neutral-50 border-neutral-100'
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

              {/* Quick Log Form with Inline Next Follow-Up */}
              <Card className="p-5 bg-white space-y-3">
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Quick Activity &amp; Next Follow-up
                </h3>
                <ActivityForm clientId={client.id} onActivityCreated={() => router.refresh()} />
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PERSONAL / CONTACT DATA */}
      {activeTab === 'contact' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 bg-white space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider pb-3 border-b border-neutral-100">
              Identity &amp; Contact Coordinates
            </h3>
            <dl className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-neutral-100">
                <dt className="text-neutral-400">Full Name</dt>
                <dd className="font-bold text-neutral-900">{client.first_name} {client.last_name}</dd>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-neutral-100">
                <dt className="text-neutral-400">Data Nașterii (Birthday)</dt>
                <dd className="font-bold text-neutral-900 flex items-center gap-2">
                  <span>{client.date_of_birth ? formatDobDisplay(client.date_of_birth) : '—'}</span>
                  {clientAge !== null && (
                    <span className="px-2 py-0.5 bg-pink-100 text-pink-800 rounded-md text-[10px] font-bold">
                      {clientAge} ani
                    </span>
                  )}
                </dd>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100">
                <dt className="text-neutral-400">Primary Phone</dt>
                <dd className="font-mono font-semibold text-neutral-900">{client.phone || '—'}</dd>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100">
                <dt className="text-neutral-400">WhatsApp</dt>
                <dd className="font-mono font-semibold text-emerald-600">{client.whatsapp || '—'}</dd>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100">
                <dt className="text-neutral-400">Primary Email</dt>
                <dd className="font-medium text-neutral-900">{client.email || '—'}</dd>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-neutral-100">
                <dt className="text-neutral-400">CNP (Securizat)</dt>
                <dd className="font-mono font-semibold text-neutral-900 flex items-center gap-2">
                  <span>{client.cnp ? (showCnp ? client.cnp : '•••••••••••••') : '—'}</span>
                  {client.cnp && (
                    <button
                      type="button"
                      onClick={() => setShowCnp(!showCnp)}
                      className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
                      title={showCnp ? 'Ascunde CNP' : 'Afișează CNP'}
                    >
                      {showCnp ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </dd>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100">
                <dt className="text-neutral-400">Preferred Channel</dt>
                <dd className="font-bold uppercase text-neutral-900">{client.preferred_communication || 'WhatsApp'}</dd>
              </div>
              <div className="flex justify-between py-1.5">
                <dt className="text-neutral-400">Lead Attribution Source</dt>
                <dd className="font-semibold text-neutral-900">{client.lead_source || 'Direct Contact'}</dd>
              </div>
            </dl>
          </Card>

          <Card className="p-6 bg-white space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider pb-3 border-b border-neutral-100">
              Company &amp; Location Data
            </h3>
            <dl className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-neutral-100">
                <dt className="text-neutral-400">Company / Employer</dt>
                <dd className="font-bold text-neutral-900">{client.companies?.name || 'Individual / Private'}</dd>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100">
                <dt className="text-neutral-400">Client Type / Role</dt>
                <dd className="font-bold uppercase text-neutral-900">{client.role || (client.company_id ? 'CORPORATE' : 'INDIVIDUAL')}</dd>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100">
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200/80">
            <div>
              <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <span>Client Insurance Policies ({policies.length})</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                RCA, CASCO, Home, Life, Health, and Business Coverage records
              </p>
            </div>
            <Link href={`/admin/insurance/new?client_id=${client.id}`}>
              <Button size="sm" className="gap-1.5 text-xs bg-neutral-900 text-white">
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Policy</span>
              </Button>
            </Link>
          </div>

          {policies.length === 0 ? (
            <div className="bg-white rounded-2xl border border-neutral-200/80 p-12 text-center space-y-3">
              <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-400">
                <Shield className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-neutral-900">No Insurance Policies on Record</h4>
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
                    className="bg-white rounded-2xl border border-neutral-200/80 p-5 space-y-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base text-neutral-900">
                            {p.product} Coverage
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isUrgent
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : isExp
                                ? 'bg-neutral-100 text-neutral-600'
                                : 'bg-emerald-50 text-emerald-700'
                            }`}
                          >
                            {isUrgent ? 'EXPIRING SOON' : p.status}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500">
                          Insurer: <span className="font-semibold text-neutral-800">{p.insurer}</span>
                        </p>
                      </div>
                      <span className="text-xs font-mono text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded">
                        #{p.policy_number || 'No #'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 bg-neutral-50 rounded-xl">
                        <span className="text-[10px] text-neutral-400 uppercase font-bold block">Annual Premium</span>
                        <span className="font-bold text-neutral-900 text-sm">
                          {p.premium ? `${Number(p.premium).toLocaleString()} ${p.currency}` : 'N/A'}
                        </span>
                      </div>
                      <div className="p-2.5 bg-neutral-50 rounded-xl">
                        <span className="text-[10px] text-neutral-400 uppercase font-bold block">Expiry Date</span>
                        <span className={`font-bold text-sm ${isUrgent ? 'text-amber-600' : 'text-neutral-900'}`}>
                          {p.expiry_date}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs">
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200/80">
            <div>
              <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
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
            <div className="bg-white rounded-2xl border border-neutral-200/80 p-12 text-center space-y-2">
              <p className="text-sm font-semibold text-neutral-700">No active opportunities or requests in pipeline</p>
              <p className="text-xs text-neutral-500">Create a quote or proposal opportunity for this client.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insuranceOpportunities.map((opp) => (
                <div key={opp.id} className="bg-white rounded-2xl border border-neutral-200/80 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-neutral-900">
                      {opp.product} Coverage Proposal
                    </span>
                    <Badge variant={opp.status === 'CLOSED_WON' ? 'success' : 'default'} size="sm">
                      {opp.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-neutral-500 space-y-1">
                    <p>Estimated Premium: <span className="font-bold text-neutral-900">{opp.estimated_premium ? `${Number(opp.estimated_premium).toLocaleString()} ${opp.currency}` : 'N/A'}</span></p>
                    {opp.notes && <p className="text-neutral-400">{opp.notes}</p>}
                  </div>
                </div>
              ))}
              {opportunities.map((opp) => (
                <div key={opp.id} className="bg-white rounded-2xl border border-neutral-200/80 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-neutral-900">
                      {opp.title} ({opp.type})
                    </span>
                    <Badge variant={opp.stage === 'CLOSED_WON' ? 'success' : 'default'} size="sm">
                      {opp.stage}
                    </Badge>
                  </div>
                  <div className="text-xs text-neutral-500 space-y-1">
                    <p>Deal Value: <span className="font-bold text-neutral-900">{opp.value ? `${Number(opp.value).toLocaleString()} ${opp.currency}` : 'N/A'}</span></p>
                    {opp.notes && <p className="text-neutral-400">{opp.notes}</p>}
                  </div>
                </div>
              ))}
              {requests.map((req) => (
                <div key={req.id} className="bg-white rounded-2xl border border-neutral-200/80 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-neutral-900">
                      Buyer Mandate: {req.title}
                    </span>
                    <Badge variant="info" size="sm">
                      {req.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-neutral-500 space-y-1">
                    <p>Target Budget: <span className="font-bold text-neutral-900">{req.budget_max ? `Up to ${Number(req.budget_max).toLocaleString()} ${req.currency}` : 'Flexible'}</span></p>
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
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-neutral-900">
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
            <Card className="p-6 bg-white space-y-4">
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider pb-3 border-b border-neutral-100">
                Client Activity Feed ({activities.length})
              </h3>
              <ActivityTimeline activities={activities} />
            </Card>
          </div>
          <div className="space-y-4">
            <Card className="p-5 bg-white space-y-3">
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Log New Interaction &amp; Next Follow-up
              </h3>
              <ActivityForm clientId={client.id} onActivityCreated={() => router.refresh()} />
            </Card>
          </div>
        </div>
      )}

      {/* TAB 8: FOLLOW-UPS & FOLLOW-UP HISTORY */}
      {activeTab === 'follow-ups' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <span>Next Follow-up &amp; Istoric Interacțiuni ({followUps.length})</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Programare apeluri de revenire, check-in-uri și istoric complet al touchpoint-urilor
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleOpenNewFollowUp}
              className="gap-1.5 text-xs bg-slate-900 text-white hover:bg-slate-800"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Programează Next Follow-up</span>
            </Button>
          </div>

          {/* Section: NEXT FOLLOW-UP / ACTIVE QUEUE */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Next Follow-up Programat</span>
            </h4>

            {/* Recurring Birthday Follow-up Card */}
            {birthdayInfo.hasDob && (
              <div className="p-4 rounded-2xl border border-pink-200/80 bg-gradient-to-r from-pink-50/50 via-white to-amber-50/40 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-pink-100 text-pink-700">
                      <Cake className="w-3 h-3 text-pink-600" />
                      <span>🎂 ZI DE NAȘTERE</span>
                    </span>
                    <Badge variant={birthdayFelicitat ? 'success' : birthdayInfo.isToday ? 'danger' : birthdayInfo.isUpcoming ? 'warning' : 'info'} size="sm">
                      {birthdayFelicitat ? 'FELICITAT' : birthdayInfo.isToday ? 'AZI' : birthdayInfo.isUpcoming ? 'UPCOMING' : 'ANUAL'}
                    </Badge>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    🎂 Zi de naștere — Sună {client.first_name} {client.last_name}
                  </h4>
                  <p className="text-xs font-semibold text-slate-700">
                    📅 {birthdayInfo.formattedDayMonth} · 🕒 10:00 (Europe/Bucharest)
                    {birthdayInfo.currentAge !== null && (
                      <span className="text-pink-700 font-bold ml-2">
                        ({birthdayInfo.isToday ? birthdayInfo.currentAge : birthdayInfo.turningAge} ani)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500">
                    Sună clientul pentru a-i transmite La mulți ani 🎊 · {birthdayInfo.statusTextRo}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {client.phone && (
                    <a
                      href={getTelUrl(client.phone)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 shadow-xs transition-all"
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-600" />
                      <span>Sună</span>
                    </a>
                  )}
                  {client.phone && (
                    <a
                      href={getWhatsAppBirthdayLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                  {!birthdayFelicitat && (
                    <Button
                      size="sm"
                      disabled={birthdayAckLoading}
                      onClick={handleAcknowledgeBirthdayInWorkspace}
                      className="text-xs h-8 px-3 bg-pink-600 hover:bg-pink-700 text-white font-bold gap-1 shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{birthdayAckLoading ? 'Se marchează...' : 'Marchează Felicitat'}</span>
                    </Button>
                  )}
                </div>
              </div>
            )}

            {pendingFollowUps.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center space-y-2">
                <p className="text-xs font-bold text-slate-700">Nu există niciun follow-up activ programat.</p>
                <p className="text-[11px] text-slate-500">Setează o dată de revenire pentru a primi notificări automate.</p>
                <Button size="sm" variant="outline" onClick={handleOpenNewFollowUp} className="text-xs mt-2">
                  + Setează Follow-up
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingFollowUps.map((f) => {
                  const isOverdue = new Date(f.due_date) < now
                  const dueDateObj = new Date(f.due_date)

                  return (
                    <div
                      key={f.id}
                      className={`p-4 rounded-2xl border transition-all space-y-3 ${
                        isOverdue
                          ? 'bg-amber-50/70 border-amber-300'
                          : 'bg-white border-slate-200 shadow-xs'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">{f.reason}</span>
                            <Badge
                              variant={f.priority === 'URGENT' ? 'danger' : f.priority === 'HIGH' ? 'warning' : 'info'}
                              size="sm"
                            >
                              {f.priority}
                            </Badge>
                            <Badge variant={isOverdue ? 'danger' : 'warning'} size="sm">
                              {isOverdue ? 'OVERDUE' : 'PLANNED'}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-600 font-mono">
                            📅 {dueDateObj.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })} · 🕒 {dueDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenEditFollowUp(f)}
                            disabled={followUpLoading}
                            className="h-8 text-xs font-bold gap-1 bg-white"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleCompleteFollowUp(f.id)}
                            disabled={followUpLoading}
                            className="h-8 text-xs font-bold gap-1 bg-emerald-600 text-white hover:bg-emerald-700"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Complete</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelFollowUp(f.id)}
                            disabled={followUpLoading}
                            className="h-8 text-xs font-bold gap-1 text-red-600 hover:bg-red-50 bg-white"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Cancel</span>
                          </Button>
                        </div>
                      </div>

                      {f.notes && (
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 whitespace-pre-wrap">
                          {f.notes}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Section: FOLLOW-UP HISTORY */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-slate-400" />
              <span>Follow-up History (Istoric Complet)</span>
            </h4>

            {followUps.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Niciun istoric de follow-up disponibil.</p>
            ) : (
              <div className="space-y-2.5">
                {followUps.map((item) => {
                  const isCompleted = item.status === 'COMPLETED'
                  const isCancelled = item.status === 'CANCELLED'
                  const isPending = item.status === 'PENDING'
                  const d = new Date(item.due_date)

                  return (
                    <div
                      key={item.id}
                      className="p-3 bg-white rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                              isCompleted
                                ? 'bg-emerald-100 text-emerald-800'
                                : isCancelled
                                ? 'bg-slate-100 text-slate-600 line-through'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {isCompleted && '✓ Completed'}
                            {isCancelled && '✕ Cancelled'}
                            {isPending && 'Upcoming'}
                          </span>
                          <span className="font-bold text-slate-900">{item.reason}</span>
                          {item.priority && (
                            <Badge variant={item.priority === 'URGENT' ? 'danger' : 'default'} size="sm">
                              {item.priority}
                            </Badge>
                          )}
                        </div>
                        {item.notes && <p className="text-slate-500 text-xs line-clamp-1">{item.notes}</p>}
                      </div>

                      <div className="sm:text-right shrink-0">
                        <span className="font-mono font-bold text-slate-700 block">
                          {d.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="font-mono text-[11px] text-slate-400">
                          {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 9: TIMELINE / HISTORY */}
      {activeTab === 'history' && (
        <Card className="p-6 bg-white space-y-4">
          <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider pb-3 border-b border-neutral-100 flex items-center gap-2">
            <History className="w-4 h-4 text-neutral-400" />
            <span>Chronological Relationship History ({timelineEvents.length} Events)</span>
          </h3>

          {timelineEvents.length === 0 ? (
            <p className="text-xs text-neutral-500 py-6 text-center">No history events recorded yet.</p>
          ) : (
            <div className="space-y-4 relative">
              <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-neutral-100" />
              {timelineEvents.map((evt) => (
                <div key={evt.id} className="flex gap-4 relative">
                  <div className="w-8 h-8 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-sm shrink-0 z-10 shadow-2xs">
                    {evt.icon}
                  </div>
                  <div className="flex-1 bg-neutral-50 p-3.5 rounded-xl border border-neutral-100 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-900">{evt.title}</span>
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

      {/* 4. SET / EDIT NEXT FOLLOW-UP MODAL */}
      {followUpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {editingFollowUp ? 'Editează Follow-up' : 'Programează Next Follow-up'}
                </h3>
              </div>
              <button
                onClick={() => setFollowUpModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveFollowUp} className="space-y-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-700 uppercase tracking-wider">
                  Motiv Follow-up (Reason) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Revenire ofertă apartament / discuție CASCO"
                  value={followUpForm.reason}
                  onChange={(e) => setFollowUpForm({ ...followUpForm, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-700 uppercase tracking-wider">
                    Dată (Date) *
                  </label>
                  <input
                    type="date"
                    required
                    value={followUpForm.due_date}
                    onChange={(e) => setFollowUpForm({ ...followUpForm, due_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-700 uppercase tracking-wider">
                    Ora (Time)
                  </label>
                  <input
                    type="time"
                    value={followUpForm.due_time}
                    onChange={(e) => setFollowUpForm({ ...followUpForm, due_time: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-700 uppercase tracking-wider">Prioritate</label>
                  <select
                    value={followUpForm.priority}
                    onChange={(e) => setFollowUpForm({ ...followUpForm, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 text-xs"
                  >
                    <option value="LOW">LOW</option>
                    <option value="NORMAL">NORMAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-700 uppercase tracking-wider">Status</label>
                  <select
                    value={followUpForm.status}
                    onChange={(e) => setFollowUpForm({ ...followUpForm, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 text-xs"
                  >
                    <option value="PENDING">PLANNED / PENDING</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-700 uppercase tracking-wider">Notiță (Follow-up Note)</label>
                <textarea
                  rows={3}
                  placeholder="Notează contextul pentru această revenire..."
                  value={followUpForm.notes}
                  onChange={(e) => setFollowUpForm({ ...followUpForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 text-xs"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                <span>Reminders automate vor fi trimise cu 7 zile înainte, 2 zile înainte și în ziua respectivă.</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFollowUpModalOpen(false)}
                >
                  Anulează
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={followUpLoading}
                  className="bg-slate-900 text-white hover:bg-slate-800"
                >
                  {followUpLoading ? 'Se salvează...' : 'Salvează Follow-up'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
