export type ClientCategory = 'REAL_ESTATE' | 'INSURANCE' | 'CREDIT'

export const CLIENT_CATEGORIES: { id: ClientCategory; label: string; shortLabel: string; color: string; badgeVariant: 'default' | 'success' | 'warning' | 'danger' | 'info' }[] = [
  { id: 'REAL_ESTATE', label: 'Real Estate', shortLabel: 'Real Estate', color: 'blue', badgeVariant: 'info' },
  { id: 'INSURANCE', label: 'Asigurări (Insurance)', shortLabel: 'Insurance', color: 'emerald', badgeVariant: 'success' },
  { id: 'CREDIT', label: 'Credite & Finanțare', shortLabel: 'Credite', color: 'amber', badgeVariant: 'warning' },
]

export type ClientStatus =
  | 'NEW'
  | 'NOT_CONTACTED'
  | 'CONTACTED'
  | 'IN_DISCUSSION'
  | 'ACTIVE'
  | 'OFFERING'
  | 'IN_PROGRESS'
  | 'FOLLOW_UP'
  | 'CALL_BACK'
  | 'WAITING_CLIENT'
  | 'WAITING_DOCUMENTS'
  | 'CONVERTED'
  | 'REFUSED'
  | 'NO_RESPONSE'
  | 'INACTIVE'
  | 'LOST'
  | 'ARCHIVED'
  | 'IDIOT'

export interface ClientStatusMeta {
  id: ClientStatus
  label: string
  shortLabel?: string
  description?: string
  badgeBg: string
  badgeText: string
  badgeBorder: string
  dotColor: string
}

export const CLIENT_STATUSES: ClientStatusMeta[] = [
  {
    id: 'NEW',
    label: 'Nou',
    description: 'Client nou intrat în sistem',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    badgeBorder: 'border-blue-200',
    dotColor: 'bg-blue-500',
  },
  {
    id: 'NOT_CONTACTED',
    label: 'Nesunat',
    description: 'Necontactat încă de un consultant',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
    badgeBorder: 'border-slate-300',
    dotColor: 'bg-slate-400',
  },
  {
    id: 'CONTACTED',
    label: 'Sunat',
    description: 'A fost efectuat primul apel',
    badgeBg: 'bg-cyan-50',
    badgeText: 'text-cyan-700',
    badgeBorder: 'border-cyan-200',
    dotColor: 'bg-cyan-500',
  },
  {
    id: 'IN_DISCUSSION',
    label: 'În discuții',
    description: 'Discuții active despre nevoi și oferte',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
    badgeBorder: 'border-indigo-200',
    dotColor: 'bg-indigo-500',
  },
  {
    id: 'ACTIVE',
    label: 'Activ',
    description: 'Client activ cu portofoliu sau interacțiune curentă',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
    dotColor: 'bg-emerald-500',
  },
  {
    id: 'OFFERING',
    label: 'Fac ofertă',
    description: 'Pregătire sau trimitere ofertă comercială',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    badgeBorder: 'border-purple-200',
    dotColor: 'bg-purple-500',
  },
  {
    id: 'IN_PROGRESS',
    label: 'În lucru',
    description: 'Dosar sau tranzacție în derulare',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-200',
    dotColor: 'bg-amber-500',
  },
  {
    id: 'FOLLOW_UP',
    label: 'Follow-up',
    description: 'Programat pentru urmărire / follow-up',
    badgeBg: 'bg-orange-50',
    badgeText: 'text-orange-700',
    badgeBorder: 'border-orange-200',
    dotColor: 'bg-orange-500',
  },
  {
    id: 'CALL_BACK',
    label: 'Revin',
    description: 'Clientul a cerut revenire la o dată ulterioară',
    badgeBg: 'bg-yellow-50',
    badgeText: 'text-yellow-800',
    badgeBorder: 'border-yellow-300',
    dotColor: 'bg-yellow-500',
  },
  {
    id: 'WAITING_CLIENT',
    label: 'Aștept clientul',
    description: 'Se așteaptă răspuns sau confirmare de la client',
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-700',
    badgeBorder: 'border-sky-200',
    dotColor: 'bg-sky-500',
  },
  {
    id: 'WAITING_DOCUMENTS',
    label: 'Aștept documente',
    description: 'Se așteaptă acte sau documente solicitate',
    badgeBg: 'bg-teal-50',
    badgeText: 'text-teal-700',
    badgeBorder: 'border-teal-200',
    dotColor: 'bg-teal-500',
  },
  {
    id: 'CONVERTED',
    label: 'Convertit',
    description: 'Contract semnat / tranzacție încheiată cu succes',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-300',
    dotColor: 'bg-emerald-600',
  },
  {
    id: 'REFUSED',
    label: 'Refuz',
    description: 'Clientul a refuzat oferta sau colaborarea',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    badgeBorder: 'border-rose-200',
    dotColor: 'bg-rose-500',
  },
  {
    id: 'NO_RESPONSE',
    label: 'Fără răspuns',
    description: 'Nu răspunde la apeluri / mesaje',
    badgeBg: 'bg-zinc-100',
    badgeText: 'text-zinc-700',
    badgeBorder: 'border-zinc-300',
    dotColor: 'bg-zinc-400',
  },
  {
    id: 'INACTIVE',
    label: 'Inactiv',
    description: 'Fără activitate recentă',
    badgeBg: 'bg-gray-100',
    badgeText: 'text-gray-600',
    badgeBorder: 'border-gray-300',
    dotColor: 'bg-gray-400',
  },
  {
    id: 'LOST',
    label: 'Pierdut',
    description: 'Oportunitate pierdută / a ales concurența',
    badgeBg: 'bg-red-50',
    badgeText: 'text-red-700',
    badgeBorder: 'border-red-200',
    dotColor: 'bg-red-500',
  },
  {
    id: 'ARCHIVED',
    label: 'Arhivat',
    description: 'Înregistrare arhivată',
    badgeBg: 'bg-neutral-100',
    badgeText: 'text-neutral-600',
    badgeBorder: 'border-neutral-300',
    dotColor: 'bg-neutral-400',
  },
  {
    id: 'IDIOT',
    label: 'IDIOT',
    description: 'Client nepotrivit / necooperant',
    badgeBg: 'bg-rose-100 dark:bg-rose-950/40',
    badgeText: 'text-rose-800 dark:text-rose-300 font-extrabold',
    badgeBorder: 'border-rose-300 dark:border-rose-800',
    dotColor: 'bg-rose-600',
  },
]

export function getClientStatusMeta(status?: string | null): ClientStatusMeta {
  if (!status) return CLIENT_STATUSES[1] // NOT_CONTACTED
  const sUpper = status.toUpperCase().trim()
  const found = CLIENT_STATUSES.find((s) => s.id === sUpper)
  if (found) return found

  // Fallback for Romanian text or non-standard inputs
  const byLabel = CLIENT_STATUSES.find((s) => s.label.toUpperCase() === sUpper)
  if (byLabel) return byLabel

  return {
    id: 'NOT_CONTACTED',
    label: status,
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
    badgeBorder: 'border-slate-200',
    dotColor: 'bg-slate-400',
  }
}

export function getClientStatusLabel(status?: string | null): string {
  return getClientStatusMeta(status).label
}

export type ClientSource =
  | 'GENERALI_CRM'
  | 'DIRECT_CONTACT'
  | 'PHONE'
  | 'WHATSAPP'
  | 'WHATSAPP_GROUPS'
  | 'EMAIL'
  | 'JOTFORM'
  | 'LINKEDIN'
  | 'WEBSITE_INSURANCE'
  | 'WEBSITE_HOMEFIND'
  | 'WEBSITE_CREDITE'
  | 'WEBSITE_OS'
  | 'INSTAGRAM'
  | 'FACEBOOK'
  | 'TELEGRAM'
  | 'REFERRAL'
  | 'OTHER'
  | 'website'
  | 'whatsapp'
  | 'telegram'
  | 'instagram'
  | 'facebook'
  | 'referral'
  | 'phone'
  | 'email'
  | 'property'
  | 'campaign'
  | 'other'

export const CLIENT_SOURCES: { id: string; label: string; group?: string }[] = [
  { id: 'GENERALI_CRM', label: 'Generali CRM' },
  { id: 'DIRECT_CONTACT', label: 'Contact direct' },
  { id: 'PHONE', label: 'Telefon' },
  { id: 'WHATSAPP', label: 'WhatsApp' },
  { id: 'WHATSAPP_GROUPS', label: 'WhatsApp Groups' },
  { id: 'EMAIL', label: 'Email' },
  { id: 'JOTFORM', label: 'Jotform' },
  { id: 'LINKEDIN', label: 'LinkedIn' },
  { id: 'WEBSITE_INSURANCE', label: 'Website Insurance' },
  { id: 'WEBSITE_HOMEFIND', label: 'Website HomeFind' },
  { id: 'WEBSITE_CREDITE', label: 'Website Credite' },
  { id: 'WEBSITE_OS', label: 'Website OS' },
  { id: 'INSTAGRAM', label: 'Instagram' },
  { id: 'FACEBOOK', label: 'Facebook' },
  { id: 'TELEGRAM', label: 'Telegram' },
  { id: 'REFERRAL', label: 'Referral / Recomandare' },
  { id: 'OTHER', label: 'Altă sursă' },
]

export function getSourceLabel(source?: string | null): string {
  if (!source) return 'Necunoscută'
  const sUpper = source.toUpperCase()
  const found = CLIENT_SOURCES.find((s) => s.id.toUpperCase() === sUpper)
  if (found) return found.label
  // Fallback for legacy lowercase
  switch (source.toLowerCase()) {
    case 'website':
      return 'Website'
    case 'whatsapp':
      return 'WhatsApp'
    case 'telegram':
      return 'Telegram'
    case 'instagram':
      return 'Instagram'
    case 'facebook':
      return 'Facebook'
    case 'referral':
      return 'Referral'
    case 'phone':
      return 'Telefon'
    case 'email':
      return 'Email'
    case 'property':
      return 'Proprietate'
    case 'campaign':
      return 'Campanie'
    case 'other':
      return 'Altă sursă'
    default:
      return source
  }
}

export function getCategoryLabel(category?: string | null): string {
  if (!category) return 'General'
  const cUpper = category.toUpperCase()
  if (cUpper === 'REAL_ESTATE' || cUpper === 'REAL ESTATE' || cUpper === 'IMOBILIARE') return 'Real Estate'
  if (cUpper === 'INSURANCE' || cUpper === 'ASIGURARI' || cUpper === 'ASIGURĂRI') return 'Insurance'
  if (cUpper === 'CREDIT' || cUpper === 'CREDITE' || cUpper === 'MORTGAGE') return 'Credite'
  return category
}
