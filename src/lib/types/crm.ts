export type ClientCategory = 'REAL_ESTATE' | 'INSURANCE' | 'CREDIT'

export const CLIENT_CATEGORIES: { id: ClientCategory; label: string; shortLabel: string; color: string; badgeVariant: 'default' | 'success' | 'warning' | 'danger' | 'info' }[] = [
  { id: 'REAL_ESTATE', label: 'Real Estate', shortLabel: 'Real Estate', color: 'blue', badgeVariant: 'info' },
  { id: 'INSURANCE', label: 'Asigurări (Insurance)', shortLabel: 'Insurance', color: 'emerald', badgeVariant: 'success' },
  { id: 'CREDIT', label: 'Credite & Finanțare', shortLabel: 'Credite', color: 'amber', badgeVariant: 'warning' },
]

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
