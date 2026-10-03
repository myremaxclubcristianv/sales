/**
 * VERIFIED INSURANCE FINANCIAL DATASET — CIF ASIGURĂRI 2026
 * SOURCE:
 * 1. EVIDENȚĂ CHELTUIELI – CIF ASIGURĂRI 2026
 * 2. EVIDENȚĂ ÎNCASĂRI (COMISIOANE) – CIF ASIGURĂRI 2026
 *
 * NOTE: All transaction records are dated "2026" (Financial Year: 2026).
 * Preserved with ZERO data loss, ZERO guessing, EXACT values, and canonical normalization.
 */

import crypto from 'crypto'

export interface VerifiedExpenseRecord {
  id: string
  expense_date: string // YYYY-MM-DD
  raw_date: string // DD/MM/YYYY
  document_number: string | null
  description: string
  category: string // Canonical: 'MASINA' | 'TRANSPORT'
  raw_category: string // Original source casing
  supplier: string // Canonical: 'OMV' | 'MOL' | 'PETROM' | 'METROREX' | 'AUTONOM'
  raw_supplier: string // Original source casing
  net_amount: number
  vat_amount: number | null
  total_amount: number
  observations: string | null
  source: 'import' | 'manual'
  source_row: number
  source_file: string
  source_year_label: number
  record_year: number
  year_discrepancy_flag: boolean
  fingerprint: string
  created_at: string
  updated_at: string
}

export interface VerifiedIncomeRecord {
  id: string
  income_date: string // YYYY-MM-DD
  raw_date: string // DD/MM/YYYY
  document_number: string | null
  description: string
  insurance_type: string | null
  insurer: string | null
  policy_value: number | null
  commission_percent: number | null
  commission_received: number
  tax_1_percent: number
  observations: string | null
  source: 'import' | 'manual'
  source_row: number
  source_file: string
  source_year_label: number
  record_year: number
  year_discrepancy_flag: boolean
  fingerprint: string
  created_at: string
  updated_at: string
}

export function normalizeExpenseCategory(cat: string): string {
  const c = cat.trim().toUpperCase()
  if (c === 'MASINA' || c === 'MAȘINĂ') return 'MASINA'
  if (c === 'TRANSPORT') return 'TRANSPORT'
  return c
}

export function normalizeExpenseSupplier(sup: string): string {
  const s = sup.trim().toUpperCase()
  if (s === 'OMV') return 'OMV'
  if (s === 'MOL') return 'MOL'
  if (s === 'PETROM') return 'PETROM'
  if (s === 'METROREX') return 'METROREX'
  if (s === 'AUTONOM') return 'AUTONOM'
  return s
}

export function generateExpenseFingerprint(row: number, date: string, doc: string | null, desc: string, supplier: string, total: number): string {
  const canonSupplier = normalizeExpenseSupplier(supplier)
  const payload = `exp|${row}|${date}|${doc || ''}|${desc.trim()}|${canonSupplier}|${total.toFixed(2)}`
  return crypto.createHash('sha256').update(payload).digest('hex')
}

export function generateIncomeFingerprint(row: number, date: string, desc: string, received: number, tax: number): string {
  const payload = `inc|${row}|${date}|${desc.trim()}|${received.toFixed(4)}|${tax.toFixed(4)}`
  return crypto.createHash('sha256').update(payload).digest('hex')
}

// Raw expense rows exactly from source (45 records)
const RAW_EXPENSES: Array<{
  row: number
  raw_date: string
  doc: string | null
  desc: string
  cat: string
  supplier: string
  net: number
  vat: number | null
  total: number
  obs: string | null
}> = [
  { row: 1, raw_date: '08/04/2026', doc: null, desc: 'Motorina', cat: 'Masina', supplier: 'OMV', net: 100.09, vat: null, total: 100.09, obs: '50%' },
  { row: 2, raw_date: '08/04/2026', doc: null, desc: 'Motorina', cat: 'Masina', supplier: 'OMV', net: 100.80, vat: null, total: 100.80, obs: '50%' },
  { row: 3, raw_date: '09/04/2026', doc: null, desc: 'Motorina', cat: 'Masina', supplier: 'OMV', net: 99.90, vat: null, total: 99.90, obs: '50%' },
  { row: 4, raw_date: '11/04/2026', doc: 'AS/03732', desc: 'Abonament Asistenta Rutiera', cat: 'Masina', supplier: 'Autonom', net: 89.00, vat: null, total: 89.00, obs: '50%' },
  { row: 5, raw_date: '16/04/2026', doc: null, desc: 'Trecere Fetesti', cat: 'Masina', supplier: 'OMV', net: 38.00, vat: null, total: 38.00, obs: '50%' },
  { row: 6, raw_date: '23/04/2026', doc: null, desc: 'Metrorex abonament', cat: 'Transport', supplier: 'Metrorex', net: 100.00, vat: null, total: 100.00, obs: '50%' },
  { row: 7, raw_date: '16/04/2026', doc: null, desc: 'Motorina', cat: 'Masina', supplier: 'OMV', net: 200.45, vat: null, total: 200.45, obs: '50%' },
  { row: 8, raw_date: '16/04/2026', doc: null, desc: 'Motorina', cat: 'Masina', supplier: 'OMV', net: 149.96, vat: null, total: 149.96, obs: '50%' },
  { row: 9, raw_date: '17/04/2026', doc: null, desc: 'Motorina', cat: 'Masina', supplier: 'OMV', net: 149.96, vat: null, total: 149.96, obs: '50%' },
  { row: 10, raw_date: '23/04/2026', doc: null, desc: 'Motorina', cat: 'Masina', supplier: 'OMV', net: 200.06, vat: null, total: 200.06, obs: '50%' },
  { row: 11, raw_date: '24/04/2026', doc: null, desc: 'Spalatorie Masina', cat: 'Masina', supplier: 'OMV', net: 25.00, vat: null, total: 25.00, obs: '50%' },
  { row: 12, raw_date: '24/04/2026', doc: null, desc: 'Motorina', cat: 'Masina', supplier: 'OMV', net: 100.00, vat: null, total: 100.00, obs: '50%' },
  { row: 13, raw_date: '26/05/2026', doc: null, desc: 'Metrorex abonament', cat: 'Transport', supplier: 'Metrorex', net: 100.00, vat: null, total: 100.00, obs: '50%' },
  { row: 14, raw_date: '30/04/2026', doc: null, desc: 'Motorina', cat: 'Masina', supplier: 'OMV', net: 150.21, vat: null, total: 150.21, obs: '50%' },
  { row: 15, raw_date: '03/05/2026', doc: null, desc: 'Motorina', cat: 'Masina', supplier: 'OMV', net: 99.97, vat: null, total: 99.97, obs: '50%' },
  { row: 16, raw_date: '07/05/2026', doc: null, desc: 'Motorina', cat: 'Masina', supplier: 'OMV', net: 99.99, vat: null, total: 99.99, obs: '50%' },
  { row: 17, raw_date: '10/05/2026', doc: null, desc: 'Motorina', cat: 'Masina', supplier: 'OMV', net: 120.09, vat: null, total: 120.09, obs: '50%' },
  { row: 18, raw_date: '25/05/2026', doc: null, desc: 'Motorina', cat: 'Masina', supplier: 'OMV', net: 160.01, vat: null, total: 160.01, obs: '50%' },
  { row: 19, raw_date: '25/05/2026', doc: null, desc: 'Spalatorie Masina', cat: 'Masina', supplier: 'OMV', net: 25.00, vat: null, total: 25.00, obs: '50%' },
  { row: 20, raw_date: '10/06/2026', doc: null, desc: 'motorina', cat: 'Masina', supplier: 'petrom', net: 200.38, vat: null, total: 200.38, obs: '50%' },
  { row: 21, raw_date: '01/06/2026', doc: null, desc: 'motorina', cat: 'Masina', supplier: 'OMV', net: 120.26, vat: null, total: 120.26, obs: '50%' },
  { row: 22, raw_date: '28/06/2026', doc: null, desc: 'motorina', cat: 'Masina', supplier: 'OMV', net: 100.90, vat: null, total: 100.90, obs: '50%' },
  { row: 23, raw_date: '28/06/2026', doc: null, desc: 'motorina', cat: 'Masina', supplier: 'OMV', net: 120.00, vat: null, total: 120.00, obs: '50%' },
  { row: 24, raw_date: '26/06/2026', doc: null, desc: 'motorina', cat: 'Masina', supplier: 'petrom', net: 140.00, vat: null, total: 140.00, obs: '50%' },
  { row: 25, raw_date: '20/06/2026', doc: null, desc: 'Spalatorie Masina', cat: 'Masina', supplier: 'mol', net: 25.00, vat: null, total: 25.00, obs: '50%' },
  { row: 26, raw_date: '19/06/2026', doc: null, desc: 'motorina', cat: 'Masina', supplier: 'OMV', net: 120.73, vat: null, total: 120.73, obs: '50%' },
  { row: 27, raw_date: '01/07/2026', doc: null, desc: 'Metrorex abonament', cat: 'transport', supplier: 'Metrorex', net: 100.00, vat: null, total: 100.00, obs: '50%' },
  { row: 28, raw_date: '06/07/2026', doc: null, desc: 'motorina', cat: 'Masina', supplier: 'OMV', net: 120.11, vat: null, total: 120.11, obs: '50%' },
  { row: 29, raw_date: '10/07/2026', doc: null, desc: 'motorina', cat: 'Masina', supplier: 'MOL', net: 121.12, vat: null, total: 121.12, obs: '50%' },
  { row: 30, raw_date: '23/07/2026', doc: null, desc: 'motorina', cat: 'masina', supplier: 'omv', net: 160.22, vat: null, total: 160.22, obs: '50%' },
  { row: 31, raw_date: '30/07/2026', doc: null, desc: 'motorina', cat: 'masina', supplier: 'omv', net: 250.08, vat: null, total: 250.08, obs: '50%' },
  { row: 32, raw_date: '01/08/2026', doc: null, desc: 'motorina', cat: 'masina', supplier: 'omv', net: 160.16, vat: null, total: 160.16, obs: '50%' },
  { row: 33, raw_date: '07/08/2026', doc: null, desc: 'motorina', cat: 'masina', supplier: 'omv', net: 160.35, vat: null, total: 160.35, obs: '50%' },
  { row: 34, raw_date: '12/08/2026', doc: null, desc: 'motorina', cat: 'masina', supplier: 'omv', net: 140.52, vat: null, total: 140.52, obs: '50%' },
  { row: 35, raw_date: '17/08/2026', doc: null, desc: 'motorina', cat: 'masina', supplier: 'omv', net: 140.06, vat: null, total: 140.06, obs: '50%' },
  { row: 36, raw_date: '22/08/2026', doc: null, desc: 'motorina', cat: 'masina', supplier: 'petrom', net: 126.04, vat: null, total: 126.04, obs: '50%' },
  { row: 37, raw_date: '23/08/2026', doc: null, desc: 'motorina', cat: 'masina', supplier: 'mol', net: 25.00, vat: null, total: 25.00, obs: '50%' },
  { row: 38, raw_date: '28/08/2026', doc: null, desc: 'motorina', cat: 'masina', supplier: 'omv', net: 140.03, vat: null, total: 140.03, obs: '50%' },
  { row: 39, raw_date: '02/09/2026', doc: null, desc: 'motorina', cat: 'masina', supplier: 'omv', net: 200.30, vat: null, total: 200.30, obs: '50%' },
  { row: 40, raw_date: '06/09/2026', doc: null, desc: 'motorina', cat: 'masina', supplier: 'omv', net: 200.08, vat: null, total: 200.08, obs: '50%' },
  { row: 41, raw_date: '11/09/2026', doc: null, desc: 'motorina', cat: 'masina', supplier: 'omv', net: 150.05, vat: null, total: 150.05, obs: '50%' },
  { row: 42, raw_date: '16/09/2026', doc: null, desc: 'motorina', cat: 'masina', supplier: 'omv', net: 160.03, vat: null, total: 160.03, obs: '50%' },
  { row: 43, raw_date: '27/09/2026', doc: null, desc: 'motorina', cat: 'masina', supplier: 'omv', net: 160.05, vat: null, total: 160.05, obs: '50%' },
  { row: 44, raw_date: '29/09/2026', doc: null, desc: 'motorina', cat: 'masina', supplier: 'omv', net: 90.01, vat: null, total: 90.01, obs: '50%' },
  { row: 45, raw_date: '02/10/2026', doc: null, desc: 'motorina', cat: 'masina', supplier: 'omv', net: 200.20, vat: null, total: 200.20, obs: '50%' },
]

// Raw income rows exactly from source (6 records)
const RAW_INCOMES: Array<{
  row: number
  raw_date: string
  desc: string
  received: number
  tax: number
}> = [
  { row: 1, raw_date: '09/04/2026', desc: 'Generali Bonus Prima Luna', received: 985.00, tax: 9.85 },
  { row: 2, raw_date: '15/05/2026', desc: 'Fluturas Aprilie', received: 100.35, tax: 1.0035 },
  { row: 3, raw_date: '15/06/2026', desc: 'fluturas Mai', received: 214.76, tax: 2.1476 },
  { row: 4, raw_date: '15/07/2026', desc: 'fluturas iunie', received: 225.57, tax: 2.2557 },
  { row: 5, raw_date: '14/08/2026', desc: 'fluturas iulie', received: 0.00, tax: 0.00 },
  { row: 6, raw_date: '15/09/2026', desc: 'fluturas august', received: 619.75, tax: 6.1975 },
]

function parseRoDateToISO(roDate: string): string {
  const parts = roDate.split('/')
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0')
    const month = parts[1].padStart(2, '0')
    const year = parts[2]
    return `${year}-${month}-${day}`
  }
  return roDate
}

export const VERIFIED_FINANCIAL_EXPENSES: VerifiedExpenseRecord[] = RAW_EXPENSES.map((item) => {
  const isoDate = parseRoDateToISO(item.raw_date)
  const recYear = parseInt(isoDate.slice(0, 4), 10) || 2026
  const canonCat = normalizeExpenseCategory(item.cat)
  const canonSup = normalizeExpenseSupplier(item.supplier)
  const fingerprint = generateExpenseFingerprint(item.row, isoDate, item.doc, item.desc, canonSup, item.total)
  // Deterministic UUID based on fingerprint
  const idHash = crypto.createHash('md5').update(`exp-${fingerprint}`).digest('hex')
  const uuid = `${idHash.slice(0, 8)}-${idHash.slice(8, 12)}-4${idHash.slice(13, 16)}-a${idHash.slice(17, 20)}-${idHash.slice(20, 32)}`

  return {
    id: uuid,
    expense_date: isoDate,
    raw_date: item.raw_date,
    document_number: item.doc,
    description: item.desc,
    category: canonCat,
    raw_category: item.cat,
    supplier: canonSup,
    raw_supplier: item.supplier,
    net_amount: item.net,
    vat_amount: item.vat,
    total_amount: item.total,
    observations: item.obs,
    source: 'import',
    source_row: item.row,
    source_file: 'EVIDENȚĂ CHELTUIELI – CIF ASIGURĂRI 2026',
    source_year_label: 2026,
    record_year: recYear,
    year_discrepancy_flag: false,
    fingerprint,
    created_at: '2026-10-03T12:00:00.000Z',
    updated_at: '2026-10-03T12:00:00.000Z',
  }
})

export const VERIFIED_FINANCIAL_INCOMES: VerifiedIncomeRecord[] = RAW_INCOMES.map((item) => {
  const isoDate = parseRoDateToISO(item.raw_date)
  const recYear = parseInt(isoDate.slice(0, 4), 10) || 2026
  const fingerprint = generateIncomeFingerprint(item.row, isoDate, item.desc, item.received, item.tax)
  // Deterministic UUID based on fingerprint
  const idHash = crypto.createHash('md5').update(`inc-${fingerprint}`).digest('hex')
  const uuid = `${idHash.slice(0, 8)}-${idHash.slice(8, 12)}-4${idHash.slice(13, 16)}-a${idHash.slice(17, 20)}-${idHash.slice(20, 32)}`

  return {
    id: uuid,
    income_date: isoDate,
    raw_date: item.raw_date,
    document_number: null,
    description: item.desc,
    insurance_type: null,
    insurer: null,
    policy_value: null,
    commission_percent: null,
    commission_received: item.received,
    tax_1_percent: item.tax,
    observations: null,
    source: 'import',
    source_row: item.row,
    source_file: 'EVIDENȚĂ ÎNCASĂRI (COMISIOANE) – CIF ASIGURĂRI 2026',
    source_year_label: 2026,
    record_year: recYear,
    year_discrepancy_flag: false,
    fingerprint,
    created_at: '2026-10-03T12:00:00.000Z',
    updated_at: '2026-10-03T12:00:00.000Z',
  }
})

export interface FinancialOverviewSummary {
  totalExpenses: number
  totalIncome: number
  totalTax1Percent: number
  netResult: number
  expenseCount: number
  incomeCount: number
  yearDiscrepancyCount: number
  categoriesBreakdown: Array<{ category: string; amount: number; count: number }>
  suppliersBreakdown: Array<{ supplier: string; amount: number; count: number }>
  monthlyBreakdown: Array<{
    month: string // '2026-04'
    monthLabel: string // 'Aprilie 2026'
    expenses: number
    income: number
    tax: number
    net: number
  }>
}

const MONTH_NAMES_RO: Record<string, string> = {
  '01': 'Ianuarie',
  '02': 'Februarie',
  '03': 'Martie',
  '04': 'Aprilie',
  '05': 'Mai',
  '06': 'Iunie',
  '07': 'Iulie',
  '08': 'August',
  '09': 'Septembrie',
  '10': 'Octombrie',
  '11': 'Noiembrie',
  '12': 'Decembrie',
}

export function computeFinancialOverview(
  expenses: VerifiedExpenseRecord[],
  incomes: VerifiedIncomeRecord[]
): FinancialOverviewSummary {
  const totalExpensesCents = expenses.reduce((acc, curr) => acc + Math.round((Number(curr.total_amount) || 0) * 100), 0)
  const totalIncomeCents = incomes.reduce((acc, curr) => acc + Math.round((Number(curr.commission_received) || 0) * 100), 0)
  const totalTax1Percent = incomes.reduce((acc, curr) => acc + (Number(curr.tax_1_percent) || 0), 0)
  const totalExpenses = totalExpensesCents / 100
  const totalIncome = totalIncomeCents / 100
  const netResult = (totalIncomeCents - totalExpensesCents) / 100

  // Categories breakdown
  const catMap = new Map<string, { amount: number; count: number }>()
  for (const exp of expenses) {
    const cat = normalizeExpenseCategory(exp.category || 'Nespecificat')
    const curr = catMap.get(cat) || { amount: 0, count: 0 }
    curr.amount += Number(exp.total_amount) || 0
    curr.count += 1
    catMap.set(cat, curr)
  }
  const categoriesBreakdown = Array.from(catMap.entries())
    .map(([category, data]) => ({ category, amount: Math.round(data.amount * 100) / 100, count: data.count }))
    .sort((a, b) => b.amount - a.amount)

  // Suppliers breakdown
  const supMap = new Map<string, { amount: number; count: number }>()
  for (const exp of expenses) {
    const sup = normalizeExpenseSupplier(exp.supplier || 'Nespecificat')
    const curr = supMap.get(sup) || { amount: 0, count: 0 }
    curr.amount += Number(exp.total_amount) || 0
    curr.count += 1
    supMap.set(sup, curr)
  }
  const suppliersBreakdown = Array.from(supMap.entries())
    .map(([supplier, data]) => ({ supplier, amount: Math.round(data.amount * 100) / 100, count: data.count }))
    .sort((a, b) => b.amount - a.amount)

  // Monthly breakdown
  const monthMap = new Map<string, { expenses: number; income: number; tax: number }>()
  for (const exp of expenses) {
    const m = exp.expense_date.slice(0, 7) // '2026-04'
    const curr = monthMap.get(m) || { expenses: 0, income: 0, tax: 0 }
    curr.expenses += Number(exp.total_amount) || 0
    monthMap.set(m, curr)
  }
  for (const inc of incomes) {
    const m = inc.income_date.slice(0, 7)
    const curr = monthMap.get(m) || { expenses: 0, income: 0, tax: 0 }
    curr.income += Number(inc.commission_received) || 0
    curr.tax += Number(inc.tax_1_percent) || 0
    monthMap.set(m, curr)
  }

  const sortedMonths = Array.from(monthMap.keys()).sort()
  const monthlyBreakdown = sortedMonths.map((m) => {
    const data = monthMap.get(m)!
    const [year, monthNum] = m.split('-')
    const monthLabel = `${MONTH_NAMES_RO[monthNum] || monthNum} ${year}`
    return {
      month: m,
      monthLabel,
      expenses: Math.round(data.expenses * 100) / 100,
      income: Math.round(data.income * 100) / 100,
      tax: Math.round(data.tax * 10000) / 10000,
      net: Math.round((data.income - data.expenses) * 100) / 100,
    }
  })

  return {
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    totalIncome: Math.round(totalIncome * 100) / 100,
    totalTax1Percent: Math.round(totalTax1Percent * 10000) / 10000,
    netResult: Math.round(netResult * 100) / 100,
    expenseCount: expenses.length,
    incomeCount: incomes.length,
    yearDiscrepancyCount: expenses.filter((e) => e.year_discrepancy_flag).length + incomes.filter((i) => i.year_discrepancy_flag).length,
    categoriesBreakdown,
    suppliersBreakdown,
    monthlyBreakdown,
  }
}

/**
 * Format Romanian currency string (e.g. 100.09 -> "100,09 lei")
 */
export function formatCurrencyRo(amount: number | null | undefined, currency: string = 'RON'): string {
  if (amount === null || amount === undefined || isNaN(amount)) return '-'
  const parts = Number(amount).toFixed(2).split('.')
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  const decPart = parts[1]
  return `${intPart},${decPart} ${currency}`
}

/**
 * Format 4-decimal tax string (e.g. 1.0035 -> "1,0035 RON")
 */
export function formatTaxRo(amount: number | null | undefined, currency: string = 'RON'): string {
  if (amount === null || amount === undefined || isNaN(amount)) return '-'
  const num = Number(amount)
  // If has more than 2 decimals, format up to 4
  const fixed = num % 1 !== 0 && (num * 100) % 1 !== 0 ? num.toFixed(4) : num.toFixed(2)
  const parts = fixed.split('.')
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  const decPart = parts[1]
  return `${intPart},${decPart} ${currency}`
}
