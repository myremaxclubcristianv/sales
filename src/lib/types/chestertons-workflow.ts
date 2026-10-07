/**
 * CHESTERTONS REAL ESTATE REQUESTS — CRM WORKFLOW SYSTEM TYPES
 * Statuses, Activity Types, and Metadata Definitions
 */

export type ChestertonsCrmStatus =
  | 'NESUNAT'
  | 'AM_VORBIT'
  | 'A_RASPUNS'
  | 'FOLLOW_UP'
  | 'INTERESAT'
  | 'FOARTE_INTERESAT'
  | 'PROGRAMARE'
  | 'VIZIONARE'
  | 'OFERTA'
  | 'NEGOCIERE'
  | 'REZERVAT'
  | 'FINALIZAT'
  | 'NEINTERESAT'
  | 'NU_RASPUNDE'
  | 'NUMAR_INCORECT'
  | 'AMANAT'
  | 'PIERDUT'

export interface ChestertonsStatusMeta {
  value: ChestertonsCrmStatus
  label: string
  shortLabel?: string
  color: string
  bgLight: string
  textLight: string
  borderLight: string
  bgDark: string
  textDark: string
  borderDark: string
  dotColor: string
  category: 'NEW' | 'CONTACTED' | 'ACTIVE' | 'QUALIFIED' | 'DEAL' | 'WON' | 'LOST' | 'UNREACHABLE'
}

export const CHESTERTONS_CRM_STATUSES: ChestertonsStatusMeta[] = [
  {
    value: 'NESUNAT',
    label: 'Nesunat',
    shortLabel: 'Nesunat',
    color: 'slate',
    bgLight: 'bg-slate-100',
    textLight: 'text-slate-700',
    borderLight: 'border-slate-300',
    bgDark: 'dark:bg-slate-800',
    textDark: 'dark:text-slate-300',
    borderDark: 'dark:border-slate-700',
    dotColor: 'bg-slate-400',
    category: 'NEW',
  },
  {
    value: 'AM_VORBIT',
    label: 'Am vorbit',
    shortLabel: 'Am vorbit',
    color: 'blue',
    bgLight: 'bg-blue-50',
    textLight: 'text-blue-700',
    borderLight: 'border-blue-200',
    bgDark: 'dark:bg-blue-950/60',
    textDark: 'dark:text-blue-300',
    borderDark: 'dark:border-blue-800/60',
    dotColor: 'bg-blue-500',
    category: 'CONTACTED',
  },
  {
    value: 'A_RASPUNS',
    label: 'A răspuns',
    shortLabel: 'A răspuns',
    color: 'sky',
    bgLight: 'bg-sky-50',
    textLight: 'text-sky-700',
    borderLight: 'border-sky-200',
    bgDark: 'dark:bg-sky-950/60',
    textDark: 'dark:text-sky-300',
    borderDark: 'dark:border-sky-800/60',
    dotColor: 'bg-sky-500',
    category: 'CONTACTED',
  },
  {
    value: 'FOLLOW_UP',
    label: 'Follow-up',
    shortLabel: 'Follow-up',
    color: 'amber',
    bgLight: 'bg-amber-50',
    textLight: 'text-amber-800',
    borderLight: 'border-amber-200',
    bgDark: 'dark:bg-amber-950/60',
    textDark: 'dark:text-amber-300',
    borderDark: 'dark:border-amber-800/60',
    dotColor: 'bg-amber-500',
    category: 'ACTIVE',
  },
  {
    value: 'INTERESAT',
    label: 'Interesat',
    shortLabel: 'Interesat',
    color: 'emerald',
    bgLight: 'bg-emerald-50',
    textLight: 'text-emerald-700',
    borderLight: 'border-emerald-200',
    bgDark: 'dark:bg-emerald-950/60',
    textDark: 'dark:text-emerald-300',
    borderDark: 'dark:border-emerald-800/60',
    dotColor: 'bg-emerald-500',
    category: 'QUALIFIED',
  },
  {
    value: 'FOARTE_INTERESAT',
    label: 'Foarte interesat',
    shortLabel: 'Ft. Interesat',
    color: 'violet',
    bgLight: 'bg-violet-50',
    textLight: 'text-violet-700',
    borderLight: 'border-violet-200',
    bgDark: 'dark:bg-violet-950/60',
    textDark: 'dark:text-violet-300',
    borderDark: 'dark:border-violet-800/60',
    dotColor: 'bg-violet-500',
    category: 'QUALIFIED',
  },
  {
    value: 'PROGRAMARE',
    label: 'Programare stabilită',
    shortLabel: 'Programare',
    color: 'indigo',
    bgLight: 'bg-indigo-50',
    textLight: 'text-indigo-700',
    borderLight: 'border-indigo-200',
    bgDark: 'dark:bg-indigo-950/60',
    textDark: 'dark:text-indigo-300',
    borderDark: 'dark:border-indigo-800/60',
    dotColor: 'bg-indigo-500',
    category: 'ACTIVE',
  },
  {
    value: 'VIZIONARE',
    label: 'Vizionare',
    shortLabel: 'Vizionare',
    color: 'purple',
    bgLight: 'bg-purple-50',
    textLight: 'text-purple-700',
    borderLight: 'border-purple-200',
    bgDark: 'dark:bg-purple-950/60',
    textDark: 'dark:text-purple-300',
    borderDark: 'dark:border-purple-800/60',
    dotColor: 'bg-purple-500',
    category: 'ACTIVE',
  },
  {
    value: 'OFERTA',
    label: 'Ofertă',
    shortLabel: 'Ofertă',
    color: 'cyan',
    bgLight: 'bg-cyan-50',
    textLight: 'text-cyan-700',
    borderLight: 'border-cyan-200',
    bgDark: 'dark:bg-cyan-950/60',
    textDark: 'dark:text-cyan-300',
    borderDark: 'dark:border-cyan-800/60',
    dotColor: 'bg-cyan-500',
    category: 'DEAL',
  },
  {
    value: 'NEGOCIERE',
    label: 'Negociere',
    shortLabel: 'Negociere',
    color: 'teal',
    bgLight: 'bg-teal-50',
    textLight: 'text-teal-700',
    borderLight: 'border-teal-200',
    bgDark: 'dark:bg-teal-950/60',
    textDark: 'dark:text-teal-300',
    borderDark: 'dark:border-teal-800/60',
    dotColor: 'bg-teal-500',
    category: 'DEAL',
  },
  {
    value: 'REZERVAT',
    label: 'Rezervat',
    shortLabel: 'Rezervat',
    color: 'fuchsia',
    bgLight: 'bg-fuchsia-50',
    textLight: 'text-fuchsia-700',
    borderLight: 'border-fuchsia-200',
    bgDark: 'dark:bg-fuchsia-950/60',
    textDark: 'dark:text-fuchsia-300',
    borderDark: 'dark:border-fuchsia-800/60',
    dotColor: 'bg-fuchsia-500',
    category: 'WON',
  },
  {
    value: 'FINALIZAT',
    label: 'Finalizat',
    shortLabel: 'Finalizat',
    color: 'green',
    bgLight: 'bg-green-100',
    textLight: 'text-green-800',
    borderLight: 'border-green-300',
    bgDark: 'dark:bg-green-950',
    textDark: 'dark:text-green-300',
    borderDark: 'dark:border-green-800',
    dotColor: 'bg-green-600',
    category: 'WON',
  },
  {
    value: 'NEINTERESAT',
    label: 'Neinteresat',
    shortLabel: 'Neinteresat',
    color: 'zinc',
    bgLight: 'bg-zinc-100',
    textLight: 'text-zinc-600',
    borderLight: 'border-zinc-300',
    bgDark: 'dark:bg-zinc-800',
    textDark: 'dark:text-zinc-400',
    borderDark: 'dark:border-zinc-700',
    dotColor: 'bg-zinc-400',
    category: 'LOST',
  },
  {
    value: 'NU_RASPUNDE',
    label: 'Nu răspunde',
    shortLabel: 'Nu răspunde',
    color: 'orange',
    bgLight: 'bg-orange-50',
    textLight: 'text-orange-700',
    borderLight: 'border-orange-200',
    bgDark: 'dark:bg-orange-950/60',
    textDark: 'dark:text-orange-300',
    borderDark: 'dark:border-orange-800/60',
    dotColor: 'bg-orange-500',
    category: 'UNREACHABLE',
  },
  {
    value: 'NUMAR_INCORECT',
    label: 'Număr incorect',
    shortLabel: 'Nr. incorect',
    color: 'red',
    bgLight: 'bg-red-50',
    textLight: 'text-red-700',
    borderLight: 'border-red-200',
    bgDark: 'dark:bg-red-950/60',
    textDark: 'dark:text-red-300',
    borderDark: 'dark:border-red-800/60',
    dotColor: 'bg-red-500',
    category: 'LOST',
  },
  {
    value: 'AMANAT',
    label: 'Amânat',
    shortLabel: 'Amânat',
    color: 'yellow',
    bgLight: 'bg-yellow-50',
    textLight: 'text-yellow-800',
    borderLight: 'border-yellow-200',
    bgDark: 'dark:bg-yellow-950/60',
    textDark: 'dark:text-yellow-300',
    borderDark: 'dark:border-yellow-800/60',
    dotColor: 'bg-yellow-500',
    category: 'ACTIVE',
  },
  {
    value: 'PIERDUT',
    label: 'Pierdut',
    shortLabel: 'Pierdut',
    color: 'rose',
    bgLight: 'bg-rose-50',
    textLight: 'text-rose-700',
    borderLight: 'border-rose-200',
    bgDark: 'dark:bg-rose-950/60',
    textDark: 'dark:text-rose-300',
    borderDark: 'dark:border-rose-800/60',
    dotColor: 'bg-rose-500',
    category: 'LOST',
  },
]

export function normalizeCrmStatus(status?: string | null): ChestertonsCrmStatus {
  if (!status) return 'NESUNAT'
  const clean = status.trim().toUpperCase().replace(/\s+/g, '_')
  const found = CHESTERTONS_CRM_STATUSES.find((s) => s.value === clean || s.label.toUpperCase() === clean)
  return found ? found.value : 'NESUNAT'
}

export function getChestertonsStatusMeta(status?: string | null): ChestertonsStatusMeta {
  const norm = normalizeCrmStatus(status)
  return CHESTERTONS_CRM_STATUSES.find((s) => s.value === norm) || CHESTERTONS_CRM_STATUSES[0]
}

export type ChestertonsActivityType =
  | 'NOTE'
  | 'CALL'
  | 'WHATSAPP'
  | 'EMAIL'
  | 'FOLLOW_UP'
  | 'STATUS_CHANGE'
  | 'MEETING'
  | 'VIEWING'
  | 'OFFER'
  | 'OTHER'

export interface ChestertonsActivityItem {
  id: string
  request_id: string
  activity_type: ChestertonsActivityType
  status_from?: string | null
  status_to?: string | null
  note: string
  created_at: string
  created_by?: string | null
  user_id?: string | null
}
