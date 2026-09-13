'use client'

import React, { useState, useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { DocumentVault } from '@/components/DocumentVault'
import { ActivityTimeline } from '@/components/ActivityTimeline'
import { ActivityForm } from '@/components/ActivityForm'
import {
  User,
  Shield,
  Car,
  Home,
  MessageSquare,
  TrendingUp,
  FileText,
  AlertTriangle,
  History,
  Clock,
  Phone,
  Mail,
  Plus,
  ArrowLeft,
  Layers
} from 'lucide-react'
import Link from 'next/link'

export type WorkspaceTab =
  | 'overview'
  | 'client'
  | 'policies'
  | 'auto'
  | 'home'
  | 'opportunities'
  | 'claims'
  | 'documents'
  | 'activities'
  | 'follow-ups'
  | 'history'

export interface ClientData {
  id: string
  first_name: string
  last_name: string
  phone?: string | null
  whatsapp?: string | null
  email?: string | null
  city?: string | null
  county?: string | null
  address?: string | null
  status?: string
  client_type?: string
  lead_source?: string | null
  preferred_communication?: string
  role?: string | null
  created_at: string
  personal_notes?: string | null
}

interface PolicyItem {
  id: string
  client_id: string
  product: string
  insurer: string
  policy_number?: string | null
  premium?: number | null
  commission?: number | null
  currency?: string
  start_date: string
  issue_date?: string | null
  expiry_date: string
  status: string
  notes?: string | null
  details?: string | null
}

interface VehicleItem {
  id: string
  vin: string
  make: string
  model: string
  year?: number | null
  plate_number?: string | null
  fuel_type?: string | null
  engine_capacity?: number | null
  power_hp?: number | null
  value?: number | null
  details?: string | null
}

interface PropertyItem {
  id: string
  property_type: string
  address: string
  city?: string | null
  county?: string | null
  surface_sqm?: number | null
  property_value?: number | null
  insured_value?: number | null
  construction_year?: number | null
  details?: string | null
}

interface OpportunityItem {
  id: string
  product: string
  estimated_premium?: number | null
  currency?: string
  status: string
  notes?: string | null
}

interface ClaimItem {
  id: string
  incident_date: string
  claim_type: string
  claim_number?: string | null
  insurer?: string | null
  estimated_amount?: number | null
  currency?: string
  status: string
  description?: string | null
  notes?: string | null
  next_action?: string | null
}

interface ActivityItem {
  id: string
  client_id?: string | null
  type: string
  title: string
  notes?: string | null
  date?: string | null
  created_at?: string
  property?: { title: string } | null
}

interface FollowUpItem {
  id: string
  reason: string
  due_date: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED'
  notes?: string | null
}

interface DocumentItem {
  id: string
  file_name: string
  file_path: string
  file_type: string
  file_size?: number | null
  category?: string | null
  created_at: string
}

interface FolderItem {
  id: string
  name: string
}

interface InsuranceClientWorkspaceProps {
  client: ClientData
  policies?: PolicyItem[]
  vehicles?: VehicleItem[]
  properties?: PropertyItem[]
  opportunities?: OpportunityItem[]
  claims?: ClaimItem[]
  activities?: ActivityItem[]
  followUps?: FollowUpItem[]
  documents?: DocumentItem[]
  folders?: FolderItem[]
  initialTab?: WorkspaceTab
}

export function InsuranceClientWorkspace({
  client,
  policies = [],
  vehicles = [],
  properties = [],
  opportunities = [],
  claims = [],
  activities = [],
  followUps = [],
  documents = [],
  folders = [],
  initialTab = 'overview',
}: InsuranceClientWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>(initialTab)

  const now = useMemo(() => new Date(), [])
  const thirtyDaysFromNow = useMemo(() => new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), [now])

  // Policies metrics
  const activePolicies = useMemo(() => {
    return policies.filter((p) => p.status === 'ACTIVE' && new Date(p.expiry_date) >= now)
  }, [policies, now])

  const expiringSoon = useMemo(() => {
    return policies.filter((p) => {
      if (p.status !== 'ACTIVE') return false
      const exp = new Date(p.expiry_date)
      return exp >= now && exp <= thirtyDaysFromNow
    })
  }, [policies, now, thirtyDaysFromNow])

  const totalPremium = useMemo(() => {
    return activePolicies.reduce((sum, p) => sum + (Number(p.premium) || 0), 0)
  }, [activePolicies])

  const pendingFollowUps = useMemo(() => {
    return followUps.filter((f) => f.status === 'PENDING')
  }, [followUps])

  const tabsConfig = [
    { id: 'overview', label: '1. Overview', icon: Layers, count: null },
    { id: 'client', label: '2. Date Client', icon: User, count: null },
    { id: 'policies', label: '3. Polițe', icon: Shield, count: policies.length },
    { id: 'auto', label: '4. Auto', icon: Car, count: vehicles.length },
    { id: 'home', label: '5. Locuință', icon: Home, count: properties.length },
    { id: 'opportunities', label: '6. Oportunități', icon: TrendingUp, count: opportunities.length },
    { id: 'claims', label: '7. Daune', icon: AlertTriangle, count: claims.length, alert: claims.some(c => c.status === 'OPEN') },
    { id: 'documents', label: '8. Documente', icon: FileText, count: documents.length },
    { id: 'activities', label: '9. Activitate', icon: MessageSquare, count: activities.length },
    { id: 'follow-ups', label: '10. Follow-up', icon: Clock, count: pendingFollowUps.length, alert: pendingFollowUps.some(f => new Date(f.due_date) < now) },
    { id: 'history', label: '11. Istoric', icon: History, count: null },
  ]

  return (
    <div className="space-y-6">
      {/* Top Breadcrumbs & Back link */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/insurance"
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Înapoi la Master Table Asigurări</span>
        </Link>
        <span className="text-xs font-mono text-neutral-400">ID Client: {client.id}</span>
      </div>

      {/* Context Header Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-6 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-sm shrink-0">
              {client.first_name?.[0] || ''}{client.last_name?.[0] || 'C'}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                  {client.first_name} {client.last_name}
                </h1>
                <Badge variant={client.status === 'ACTIVE' ? 'success' : 'default'} size="sm">
                  {client.client_type || 'INDIVIDUAL'}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-neutral-500 font-medium">
                {client.phone && (
                  <a href={`tel:${client.phone}`} className="flex items-center gap-1 hover:text-blue-600">
                    <Phone className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{client.phone}</span>
                  </a>
                )}
                {client.email && (
                  <a href={`mailto:${client.email}`} className="flex items-center gap-1 hover:text-blue-600">
                    <Mail className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{client.email}</span>
                  </a>
                )}
                {client.city && (
                  <span>{client.city}{client.county ? `, ${client.county}` : ''}</span>
                )}
                <span className="text-neutral-400">• Sursă: {client.lead_source || 'Direct'}</span>
              </div>
            </div>
          </div>

          {/* Context Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {client.phone && (
              <a
                href={`tel:${client.phone}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-xl text-xs font-semibold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Apelează</span>
              </a>
            )}
            {client.whatsapp || client.phone ? (
              <a
                href={`https://wa.me/${(client.whatsapp || client.phone || '').replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition"
              >
                <span>WhatsApp</span>
              </a>
            ) : null}
            {client.email && (
              <a
                href={`mailto:${client.email}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-xl text-xs font-semibold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
              >
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span>Email</span>
              </a>
            )}
            <Link
              href={`/admin/insurance/new?client_id=${client.id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-xl text-xs font-semibold hover:opacity-90 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adaugă Poliță</span>
            </Link>
          </div>
        </div>

        {/* Top Mini Key Metric Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs">
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl">
            <span className="text-[10px] font-bold uppercase text-neutral-400">Polițe Active</span>
            <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">{activePolicies.length}</p>
          </div>
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl">
            <span className="text-[10px] font-bold uppercase text-neutral-400">Primă Anuală Portofoliu</span>
            <p className="text-lg font-bold text-blue-600 mt-0.5">{totalPremium.toLocaleString()} RON</p>
          </div>
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl">
            <span className="text-[10px] font-bold uppercase text-neutral-400">Vehicule / Imobile</span>
            <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">{vehicles.length} Auto / {properties.length} Imobile</p>
          </div>
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl">
            <span className="text-[10px] font-bold uppercase text-neutral-400">Expirări &lt; 30 Zile</span>
            <p className={`text-lg font-bold mt-0.5 ${expiringSoon.length > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {expiringSoon.length > 0 ? `${expiringSoon.length} Necesită Reînnoire` : 'Toate în termen'}
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation (Horizontal Scrollable on Mobile) */}
      <div className="flex items-center gap-1.5 p-1.5 bg-neutral-100 dark:bg-neutral-800/80 rounded-2xl overflow-x-auto no-scrollbar">
        {tabsConfig.map((t) => {
          const Icon = t.icon
          const isActive = activeTab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as WorkspaceTab)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-neutral-400'}`} />
              <span>{t.label}</span>
              {t.count !== null && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                  t.alert ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Expiring alert banner if any */}
          {expiringSoon.length > 0 && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
                    {expiringSoon.length} Polițe Expiră în Următoarele 30 de Zile
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    {expiringSoon.map((p) => `${p.product} (${p.insurer} - Expiră: ${p.expiry_date})`).join(', ')}
                  </p>
                </div>
              </div>
              <Button size="sm" onClick={() => setActiveTab('policies')} className="text-xs bg-amber-600 hover:bg-amber-700">
                Vezi Polițele
              </Button>
            </div>
          )}

          {/* 2-Column Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Active Policies List Preview */}
              <Card className="p-5 bg-white dark:bg-neutral-900 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span>Polițe Active ({activePolicies.length})</span>
                  </h3>
                  <button onClick={() => setActiveTab('policies')} className="text-xs font-semibold text-blue-600 hover:underline">
                    Toate Polițele ({policies.length})
                  </button>
                </div>

                {activePolicies.length === 0 ? (
                  <p className="text-xs text-neutral-500 py-4 text-center">Nicio poliță activă în acest moment.</p>
                ) : (
                  <div className="space-y-2.5">
                    {activePolicies.map((p) => {
                      const exp = new Date(p.expiry_date)
                      const days = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                      return (
                        <div key={p.id} className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
                          <div>
                            <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-neutral-100">
                              <span>{p.product}</span>
                              <span className="font-normal text-neutral-500">• {p.insurer}</span>
                              {p.policy_number && <span className="font-mono text-neutral-400">#{p.policy_number}</span>}
                            </div>
                            <p className="text-neutral-500 mt-0.5">
                              Expiră: {p.expiry_date} • {days} zile rămase
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-neutral-900 dark:text-neutral-100">
                              {Number(p.premium).toLocaleString()} {p.currency || 'RON'}
                            </span>
                            {p.commission && (
                              <p className="text-[10px] text-emerald-600">Comision: {Number(p.commission).toLocaleString()} {p.currency || 'RON'}</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </Card>

              {/* Assets: Vehicles and Properties */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="p-5 bg-white dark:bg-neutral-900 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-blue-600" />
                      <span>Vehicule ({vehicles.length})</span>
                    </span>
                    <button onClick={() => setActiveTab('auto')} className="text-xs text-blue-600 font-semibold hover:underline">
                      Gestionează
                    </button>
                  </div>
                  {vehicles.length === 0 ? (
                    <p className="text-xs text-neutral-400 py-2">Niciun vehicul înregistrat</p>
                  ) : (
                    <div className="space-y-1.5 text-xs">
                      {vehicles.slice(0, 3).map((v) => (
                        <div key={v.id} className="font-medium text-neutral-800 dark:text-neutral-200 truncate">
                          {v.make} {v.model} {v.plate_number ? `(${v.plate_number})` : ''}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                <Card className="p-5 bg-white dark:bg-neutral-900 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                      <Home className="w-3.5 h-3.5 text-blue-600" />
                      <span>Locuințe ({properties.length})</span>
                    </span>
                    <button onClick={() => setActiveTab('home')} className="text-xs text-blue-600 font-semibold hover:underline">
                      Gestionează
                    </button>
                  </div>
                  {properties.length === 0 ? (
                    <p className="text-xs text-neutral-400 py-2">Nicio proprietate înregistrată</p>
                  ) : (
                    <div className="space-y-1.5 text-xs">
                      {properties.slice(0, 3).map((pr) => (
                        <div key={pr.id} className="font-medium text-neutral-800 dark:text-neutral-200 truncate">
                          {pr.property_type}: {pr.address}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            </div>

            {/* Right Col: Follow-ups & Activity Quick Log */}
            <div className="space-y-6">
              <Card className="p-5 bg-white dark:bg-neutral-900 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Follow-up &amp; Task-uri ({pendingFollowUps.length})</span>
                  </span>
                  <button onClick={() => setActiveTab('follow-ups')} className="text-xs text-blue-600 font-semibold hover:underline">
                    Toate
                  </button>
                </div>
                {pendingFollowUps.length === 0 ? (
                  <p className="text-xs text-neutral-400 py-2">Niciun task programat.</p>
                ) : (
                  <div className="space-y-2 text-xs">
                    {pendingFollowUps.slice(0, 3).map((f) => (
                      <div key={f.id} className="p-2.5 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-100 dark:border-neutral-800">
                        <div className="font-bold text-neutral-900 dark:text-neutral-100">{f.reason}</div>
                        <div className="text-neutral-500 text-[11px] mt-0.5">Scadent: {new Date(f.due_date).toLocaleDateString()}</div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Quick Log Form */}
              <Card className="p-5 bg-white dark:bg-neutral-900 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
                  Logare Rapidă Interacțiune
                </h3>
                <ActivityForm clientId={client.id} />
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DATE CLIENT */}
      {activeTab === 'client' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 bg-white dark:bg-neutral-900 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              Coordonate &amp; Identitate
            </h3>
            <dl className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-neutral-100 dark:border-neutral-800/50">
                <dt className="text-neutral-400">Nume Complet</dt>
                <dd className="font-bold text-neutral-900 dark:text-neutral-100">{client.first_name} {client.last_name}</dd>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100 dark:border-neutral-800/50">
                <dt className="text-neutral-400">Telefon Principal</dt>
                <dd className="font-mono font-semibold text-neutral-900 dark:text-neutral-100">{client.phone || '—'}</dd>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100 dark:border-neutral-800/50">
                <dt className="text-neutral-400">WhatsApp</dt>
                <dd className="font-mono font-semibold text-emerald-600">{client.whatsapp || '—'}</dd>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100 dark:border-neutral-800/50">
                <dt className="text-neutral-400">Email</dt>
                <dd className="font-medium text-neutral-900 dark:text-neutral-100">{client.email || '—'}</dd>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100 dark:border-neutral-800/50">
                <dt className="text-neutral-400">Canal Preferat</dt>
                <dd className="font-bold uppercase text-neutral-900 dark:text-neutral-100">{client.preferred_communication || 'Telefon'}</dd>
              </div>
              <div className="flex justify-between py-1.5">
                <dt className="text-neutral-400">Sursă Lead / Atragere</dt>
                <dd className="font-semibold text-neutral-900 dark:text-neutral-100">{client.lead_source || 'Website'}</dd>
              </div>
            </dl>
          </Card>

          <Card className="p-6 bg-white dark:bg-neutral-900 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              Adresă &amp; Date Companie
            </h3>
            <dl className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-neutral-100 dark:border-neutral-800/50">
                <dt className="text-neutral-400">Tip Client</dt>
                <dd className="font-bold uppercase text-neutral-900 dark:text-neutral-100">{client.client_type || 'INDIVIDUAL'}</dd>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100 dark:border-neutral-800/50">
                <dt className="text-neutral-400">Companie / Angajator</dt>
                <dd className="font-bold text-neutral-900 dark:text-neutral-100">{client.role || '—'}</dd>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100 dark:border-neutral-800/50">
                <dt className="text-neutral-400">Adresă</dt>
                <dd className="font-medium text-neutral-900 dark:text-neutral-100">{client.address || '—'}</dd>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100 dark:border-neutral-800/50">
                <dt className="text-neutral-400">Oraș / Județ</dt>
                <dd className="font-medium text-neutral-900 dark:text-neutral-100">{client.city || '—'}{client.county ? `, ${client.county}` : ''}</dd>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100 dark:border-neutral-800/50">
                <dt className="text-neutral-400">Data Înregistrării</dt>
                <dd className="font-mono text-neutral-500">{new Date(client.created_at).toLocaleDateString()}</dd>
              </div>
              <div className="flex justify-between py-1.5">
                <dt className="text-neutral-400">Note Generale</dt>
                <dd className="text-neutral-700 dark:text-neutral-300 italic">{client.personal_notes || '—'}</dd>
              </div>
            </dl>
          </Card>
        </div>
      )}

      {/* TAB 3: POLIȚE */}
      {activeTab === 'policies' && (
        <Card className="p-6 bg-white dark:bg-neutral-900 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>Polițe de Asigurare Portofoliu ({policies.length})</span>
            </h3>
            <Link
              href={`/admin/insurance/new?client_id=${client.id}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-xl text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adaugă Poliță</span>
            </Link>
          </div>

          {policies.length === 0 ? (
            <p className="text-xs text-neutral-500 py-8 text-center">Nicio poliță înregistrată pentru acest client.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-400 font-bold uppercase">
                  <tr>
                    <th className="p-3">Tip / Produs</th>
                    <th className="p-3">Asigurător</th>
                    <th className="p-3">Nr. Poliță</th>
                    <th className="p-3">Emitere / Expirare</th>
                    <th className="p-3">Zile Rămase</th>
                    <th className="p-3 text-right">Primă</th>
                    <th className="p-3 text-right">Comision</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {policies.map((p) => {
                    const exp = new Date(p.expiry_date)
                    const days = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                    return (
                      <tr key={p.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition">
                        <td className="p-3 font-bold text-neutral-900 dark:text-neutral-100">{p.product}</td>
                        <td className="p-3 text-neutral-600 dark:text-neutral-400">{p.insurer}</td>
                        <td className="p-3 font-mono text-neutral-500">{p.policy_number || '—'}</td>
                        <td className="p-3 text-neutral-500">{p.start_date || p.issue_date} $\rightarrow$ {p.expiry_date}</td>
                        <td className="p-3">
                          <Badge variant={days <= 30 && days >= 0 ? 'warning' : days < 0 ? 'danger' : 'success'} size="sm">
                            {days >= 0 ? `${days} zile` : 'Expirată'}
                          </Badge>
                        </td>
                        <td className="p-3 text-right font-bold text-neutral-900 dark:text-neutral-100">
                          {Number(p.premium).toLocaleString()} {p.currency || 'RON'}
                        </td>
                        <td className="p-3 text-right text-emerald-600 font-semibold">
                          {p.commission ? `${Number(p.commission).toLocaleString()} ${p.currency || 'RON'}` : '—'}
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant={p.status === 'ACTIVE' ? 'success' : 'default'} size="sm">
                            {p.status}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* TAB 4: AUTO (VEHICULE) */}
      {activeTab === 'auto' && (
        <Card className="p-6 bg-white dark:bg-neutral-900 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Car className="w-4 h-4 text-blue-600" />
              <span>Vehicule Asigurate ({vehicles.length})</span>
            </h3>
          </div>

          {vehicles.length === 0 ? (
            <p className="text-xs text-neutral-500 py-8 text-center">Niciun vehicul înregistrat pentru acest client.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vehicles.map((v) => (
                <div key={v.id} className="p-5 bg-neutral-50 dark:bg-neutral-800/40 rounded-2xl border border-neutral-100 dark:border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">{v.make} {v.model}</span>
                    {v.plate_number && <Badge variant="default" size="sm">{v.plate_number}</Badge>}
                  </div>
                  <dl className="grid grid-cols-2 gap-2 text-xs text-neutral-500">
                    <div><span className="text-neutral-400">VIN:</span> <span className="font-mono font-semibold">{v.vin}</span></div>
                    <div><span className="text-neutral-400">An:</span> {v.year || '—'}</div>
                    <div><span className="text-neutral-400">Combustibil:</span> {v.fuel_type || '—'}</div>
                    <div><span className="text-neutral-400">Motorizare:</span> {v.engine_capacity ? `${v.engine_capacity} cm³` : ''} {v.power_hp ? `(${v.power_hp} CP)` : ''}</div>
                    {v.value && <div className="col-span-2"><span className="text-neutral-400">Valoare Vehicul:</span> <span className="font-bold text-neutral-900 dark:text-neutral-100">{Number(v.value).toLocaleString()} EUR</span></div>}
                  </dl>
                  {v.details && <p className="text-xs text-neutral-500 pt-2 border-t border-neutral-200/50 dark:border-neutral-700/50">{v.details}</p>}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* TAB 5: LOCUINȚĂ (PROPRIETĂȚI) */}
      {activeTab === 'home' && (
        <Card className="p-6 bg-white dark:bg-neutral-900 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Home className="w-4 h-4 text-blue-600" />
              <span>Proprietăți &amp; Locuințe Asigurate ({properties.length})</span>
            </h3>
          </div>

          {properties.length === 0 ? (
            <p className="text-xs text-neutral-500 py-8 text-center">Nicio proprietate înregistrată pentru acest client.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {properties.map((pr) => (
                <div key={pr.id} className="p-5 bg-neutral-50 dark:bg-neutral-800/40 rounded-2xl border border-neutral-100 dark:border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">{pr.property_type}: {pr.address}</span>
                    <Badge variant="info" size="sm">{pr.city || 'România'}</Badge>
                  </div>
                  <dl className="grid grid-cols-2 gap-2 text-xs text-neutral-500">
                    <div><span className="text-neutral-400">Suprafață:</span> {pr.surface_sqm ? `${pr.surface_sqm} mp` : '—'}</div>
                    <div><span className="text-neutral-400">An Construcție:</span> {pr.construction_year || '—'}</div>
                    {pr.property_value && <div><span className="text-neutral-400">Valoare Imobil:</span> {Number(pr.property_value).toLocaleString()} EUR</div>}
                    {pr.insured_value && <div><span className="text-neutral-400">Sumă Asigurată:</span> <span className="font-bold text-neutral-900 dark:text-neutral-100">{Number(pr.insured_value).toLocaleString()} EUR</span></div>}
                  </dl>
                  {pr.details && <p className="text-xs text-neutral-500 pt-2 border-t border-neutral-200/50 dark:border-neutral-700/50">{pr.details}</p>}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* TAB 6: OPORTUNITĂȚI */}
      {activeTab === 'opportunities' && (
        <Card className="p-6 bg-white dark:bg-neutral-900 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>Oportunități de Cross-Sell ({opportunities.length})</span>
            </h3>
          </div>

          {opportunities.length === 0 ? (
            <p className="text-xs text-neutral-500 py-8 text-center">Nicio oportunitate înregistrată pentru acest client.</p>
          ) : (
            <div className="space-y-3">
              {opportunities.map((opp) => (
                <div key={opp.id} className="p-4 bg-neutral-50 dark:bg-neutral-800/40 rounded-2xl border border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">{opp.product}</span>
                    <p className="text-neutral-500 mt-0.5">{opp.notes || 'Identificat pentru cross-sell'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {opp.estimated_premium && (
                      <span className="font-bold text-neutral-900 dark:text-neutral-100">
                        {Number(opp.estimated_premium).toLocaleString()} {opp.currency || 'RON'}
                      </span>
                    )}
                    <Badge variant={opp.status === 'CLOSED_WON' ? 'success' : 'default'} size="sm">
                      {opp.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* TAB 7: DAUNE (CLAIMS) */}
      {activeTab === 'claims' && (
        <Card className="p-6 bg-white dark:bg-neutral-900 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Dosare de Daună &amp; Incidente ({claims.length})</span>
            </h3>
          </div>

          {claims.length === 0 ? (
            <p className="text-xs text-neutral-500 py-8 text-center">Niciun dosar de daună înregistrat pentru acest client.</p>
          ) : (
            <div className="space-y-3">
              {claims.map((c) => (
                <div key={c.id} className="p-5 bg-neutral-50 dark:bg-neutral-800/40 rounded-2xl border border-neutral-100 dark:border-neutral-800 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">{c.claim_type} {c.claim_number ? `(#${c.claim_number})` : ''}</span>
                    <Badge variant={c.status === 'OPEN' ? 'warning' : c.status === 'PAID' ? 'success' : 'default'} size="sm">
                      {c.status}
                    </Badge>
                  </div>
                  <dl className="grid grid-cols-3 gap-2 text-neutral-500">
                    <div><span className="text-neutral-400">Data Incident:</span> {c.incident_date}</div>
                    <div><span className="text-neutral-400">Asigurător:</span> {c.insurer || '—'}</div>
                    <div><span className="text-neutral-400">Valoare Estimată:</span> <span className="font-bold text-neutral-900 dark:text-neutral-100">{c.estimated_amount ? `${Number(c.estimated_amount).toLocaleString()} ${c.currency || 'RON'}` : '—'}</span></div>
                  </dl>
                  {c.description && <p className="text-neutral-600 dark:text-neutral-400">{c.description}</p>}
                  {c.next_action && <div className="p-2.5 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200/60 dark:border-neutral-700 font-medium">Următorul pas: {c.next_action}</div>}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* TAB 8: DOCUMENTE */}
      {activeTab === 'documents' && (
        <Card className="p-6 bg-white dark:bg-neutral-900 space-y-4">
          <DocumentVault
            clientId={client.id}
            documents={documents.map((d) => ({
              id: d.id,
              file_name: d.file_name,
              file_type: d.file_type,
              category: d.category || null,
              folder_name: null,
              created_at: d.created_at
            }))}
            folders={folders}
          />
        </Card>
      )}

      {/* TAB 9: ACTIVITATE */}
      {activeTab === 'activities' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-6 bg-white dark:bg-neutral-900 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                Feed Activități &amp; Interacțiuni ({activities.length})
              </h3>
              <ActivityTimeline
                activities={activities.map((a) => ({
                  id: a.id,
                  type: a.type,
                  title: a.title,
                  notes: a.notes,
                  date: a.date || a.created_at || new Date().toISOString()
                }))}
              />
            </Card>
          </div>
          <div>
            <Card className="p-5 bg-white dark:bg-neutral-900 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
                Adaugă Notă / Activitate
              </h3>
              <ActivityForm clientId={client.id} />
            </Card>
          </div>
        </div>
      )}

      {/* TAB 10: FOLLOW-UP */}
      {activeTab === 'follow-ups' && (
        <Card className="p-6 bg-white dark:bg-neutral-900 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Programări &amp; Task-uri Follow-up ({followUps.length})</span>
            </h3>
          </div>

          {followUps.length === 0 ? (
            <p className="text-xs text-neutral-500 py-8 text-center">Niciun follow-up programat pentru acest client.</p>
          ) : (
            <div className="space-y-3">
              {followUps.map((f) => {
                const isOverdue = new Date(f.due_date) < now && f.status === 'PENDING'
                return (
                  <div
                    key={f.id}
                    className={`p-4 rounded-2xl border text-xs space-y-2 ${
                      isOverdue
                        ? 'bg-amber-50/30 border-amber-300 dark:border-amber-900/60'
                        : 'bg-neutral-50 dark:bg-neutral-800/40 border-neutral-100 dark:border-neutral-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-900 dark:text-neutral-100">{f.reason}</span>
                      <Badge variant={f.status === 'COMPLETED' ? 'success' : isOverdue ? 'danger' : 'default'} size="sm">
                        {isOverdue ? 'OVERDUE' : f.status}
                      </Badge>
                    </div>
                    <p className="text-neutral-500">Scadent: {new Date(f.due_date).toLocaleDateString()} • Prioritate: {f.priority}</p>
                    {f.notes && <p className="text-neutral-600 dark:text-neutral-400">{f.notes}</p>}
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      )}

      {/* TAB 11: ISTORIC */}
      {activeTab === 'history' && (
        <Card className="p-6 bg-white dark:bg-neutral-900 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 pb-3 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-2">
            <History className="w-4 h-4 text-neutral-400" />
            <span>Cronologie Relație Client</span>
          </h3>
          <div className="space-y-3 text-xs text-neutral-500">
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl">
              <span className="font-bold text-neutral-900 dark:text-neutral-100">Profil Creat</span>
              <p className="text-neutral-400 text-[11px] mt-0.5">{new Date(client.created_at).toLocaleString()}</p>
            </div>
            {policies.map((p) => (
              <div key={p.id} className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl">
                <span className="font-bold text-neutral-900 dark:text-neutral-100">Poliță Emisă: {p.product} (#{p.policy_number || 'Fără număr'})</span>
                <p className="text-neutral-400 text-[11px] mt-0.5">{p.insurer} • {p.start_date || p.issue_date} $\rightarrow$ {p.expiry_date}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
