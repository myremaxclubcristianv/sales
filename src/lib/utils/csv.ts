import { sanitizeSpreadsheetValue } from './phone'
import { getCategoryLabel, getSourceLabel } from '../types/crm'

/**
 * Robust CSV parser handling commas, semicolons, quotes, multiline values, and BOM
 */
export function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  // Remove BOM if present
  const cleanText = text.replace(/^\uFEFF/, '')
  
  // Detect delimiter (comma vs semicolon vs tab)
  const firstLine = cleanText.split(/\r?\n/)[0] || ''
  const commaCount = (firstLine.match(/,/g) || []).length
  const semiCount = (firstLine.match(/;/g) || []).length
  const tabCount = (firstLine.match(/\t/g) || []).length
  
  let delimiter = ','
  if (semiCount > commaCount && semiCount > tabCount) delimiter = ';'
  else if (tabCount > commaCount && tabCount > semiCount) delimiter = '\t'

  const rows: string[][] = []
  let currentRow: string[] = []
  let currentVal = ''
  let inQuotes = false

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i]
    const nextChar = cleanText[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"'
        i++ // skip escaped quote
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === delimiter && !inQuotes) {
      currentRow.push(currentVal.trim())
      currentVal = ''
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++
      }
      currentRow.push(currentVal.trim())
      if (currentRow.some((v) => v.length > 0)) {
        rows.push(currentRow)
      }
      currentRow = []
      currentVal = ''
    } else {
      currentVal += char
    }
  }

  if (currentVal.length > 0 || currentRow.length > 0) {
    currentRow.push(currentVal.trim())
    if (currentRow.some((v) => v.length > 0)) {
      rows.push(currentRow)
    }
  }

  if (rows.length === 0) return { headers: [], rows: [] }

  const headers = rows[0].map((h) => h.replace(/^["']|["']$/g, '').trim())
  const dataRows = rows.slice(1)

  return { headers, rows: dataRows }
}

/**
 * Parses simple vCard format (.vcf)
 */
export function parseVCF(text: string): Array<Record<string, string>> {
  const cards = text.split(/BEGIN:VCARD/i).filter((c) => c.trim().length > 0)
  const contacts: Array<Record<string, string>> = []

  for (const card of cards) {
    const lines = card.split(/\r?\n/)
    let fn = ''
    let n = ''
    let phone = ''
    let email = ''
    let org = ''
    let title = ''
    let note = ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.startsWith('FN:')) {
        fn = trimmed.slice(3).trim()
      } else if (trimmed.startsWith('N:')) {
        n = trimmed.slice(2).trim()
      } else if (trimmed.includes('TEL')) {
        const parts = trimmed.split(':')
        if (parts.length > 1 && !phone) {
          phone = parts[1].trim()
        }
      } else if (trimmed.includes('EMAIL')) {
        const parts = trimmed.split(':')
        if (parts.length > 1 && !email) {
          email = parts[1].trim()
        }
      } else if (trimmed.startsWith('ORG:')) {
        org = trimmed.slice(4).replace(/;/g, ' ').trim()
      } else if (trimmed.startsWith('TITLE:')) {
        title = trimmed.slice(6).trim()
      } else if (trimmed.startsWith('NOTE:')) {
        note = trimmed.slice(5).trim()
      }
    }

    let firstName = ''
    let lastName = ''

    if (n) {
      const nParts = n.split(';')
      lastName = nParts[0] || ''
      firstName = nParts[1] || ''
    }
    if (!firstName && !lastName && fn) {
      const fnParts = fn.split(/\s+/)
      firstName = fnParts[0] || ''
      lastName = fnParts.slice(1).join(' ')
    }

    if (firstName || lastName || phone || email) {
      contacts.push({
        first_name: firstName,
        last_name: lastName,
        phone,
        email,
        company_name: org,
        role: title,
        notes: note,
      })
    }
  }

  return contacts
}

/**
 * Column matching dictionary for auto-detection
 */
export const COLUMN_SYNONYMS: Record<string, string[]> = {
  first_name: ['first name', 'firstname', 'prenume', 'given name', 'first', 'fname'],
  last_name: ['last name', 'lastname', 'nume', 'family name', 'surname', 'lname'],
  name: ['name', 'full name', 'fullname', 'nume complet', 'contact name', 'display name', 'persoana'],
  phone: ['phone', 'telefon', 'mobile', 'mobile phone', 'telefon mobil', 'tel', 'cell', 'cellular', 'nr tel', 'numar telefon'],
  whatsapp: ['whatsapp', 'wa', 'wa number', 'whatsapp phone'],
  email: ['email', 'e-mail', 'mail', 'adresa email', 'email address'],
  company_name: ['company', 'organization', 'companie', 'organizatie', 'firma', 'business', 'societate'],
  role: ['role', 'title', 'job title', 'functie', 'pozitie', 'post'],
  notes: ['notes', 'note', 'observatii', 'detalii', 'comments', 'description'],
  category: ['category', 'categorie', 'domeniu', 'sector'],
  source: ['source', 'sursa', 'provenienta', 'lead source', 'canal'],
  interest_summary: ['ce doreste', 'interes', 'nevoie', 'cerere', 'interest', 'need', 'demand'],
  address: ['address', 'adresa', 'street', 'strada'],
  city: ['city', 'oras', 'localitate', 'municipiu'],
}

export function autoDetectColumnMapping(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {}

  for (const header of headers) {
    const norm = header.toLowerCase().replace(/[_\W]+/g, ' ').trim()

    for (const [crmField, synonyms] of Object.entries(COLUMN_SYNONYMS)) {
      if (synonyms.some((syn) => norm === syn || norm.includes(syn))) {
        if (!Object.values(mapping).includes(crmField)) {
          mapping[header] = crmField
          break
        }
      }
    }
  }

  return mapping
}

import type { ContactRow } from '../db/contacts'

/**
 * Generate CSV string from contacts list safely without exposing sensitive CNP
 */
export function generateContactsCSV(contacts: ContactRow[]): string {
  const headers = [
    'Nume',
    'Prenume',
    'Telefon',
    'Email',
    'Companie',
    'Functie',
    'Categorie',
    'Sursa',
    'Status CRM',
    'Ce doreste',
    'Note',
    'Oras',
    'Data Adaugare',
  ]

  const escapeCSV = (val: string | null | undefined): string => {
    if (val === null || val === undefined) return '""'
    const str = String(val)
    const sanitized = sanitizeSpreadsheetValue(str)
    return `"${sanitized.replace(/"/g, '""')}"`
  }

  const rows = contacts.map((c) => [
    escapeCSV(c.last_name || ''),
    escapeCSV(c.first_name || ''),
    escapeCSV(c.phone || ''),
    escapeCSV(c.email || ''),
    escapeCSV(c.company_name || ''),
    escapeCSV(c.role || ''),
    escapeCSV(getCategoryLabel(c.category)),
    escapeCSV(getSourceLabel(c.source)),
    escapeCSV(c.client_id ? 'Client CRM' : 'Contact Agenda'),
    escapeCSV(c.interest_summary || ''),
    escapeCSV(c.notes || ''),
    escapeCSV(c.city || ''),
    escapeCSV(c.created_at ? new Date(c.created_at).toLocaleDateString('ro-RO') : ''),
  ])

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n')
}
