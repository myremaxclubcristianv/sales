import { createAdminClient } from '@/lib/supabase/admin'
import {
  VERIFIED_FINANCIAL_EXPENSES,
  VERIFIED_FINANCIAL_INCOMES,
  VerifiedExpenseRecord,
  VerifiedIncomeRecord,
  FinancialOverviewSummary,
  computeFinancialOverview,
  normalizeExpenseCategory,
  normalizeExpenseSupplier,
  generateExpenseFingerprint,
  generateIncomeFingerprint,
} from '@/lib/data/verified-insurance-financial-dataset'
import crypto from 'crypto'

export interface ExpenseFilters {
  search?: string
  category?: string
  supplier?: string
  year?: number | string
  startDate?: string
  endDate?: string
  minAmount?: number
  maxAmount?: number
}

export interface IncomeFilters {
  search?: string
  insurer?: string
  insuranceType?: string
  year?: number | string
  startDate?: string
  endDate?: string
}

// In-memory working copy for immediate mutations & sync fallback
let inMemoryExpenses: VerifiedExpenseRecord[] = [...VERIFIED_FINANCIAL_EXPENSES]
let inMemoryIncomes: VerifiedIncomeRecord[] = [...VERIFIED_FINANCIAL_INCOMES]

export async function getExpenses(filters?: ExpenseFilters): Promise<{ expenses: VerifiedExpenseRecord[]; total: number }> {
  try {
    const admin = createAdminClient()
    let query = admin.from('insurance_financial_expenses').select('*', { count: 'exact' })

    if (filters?.category && filters.category !== 'ALL') {
      const canonCat = normalizeExpenseCategory(filters.category)
      query = query.eq('category', canonCat)
    }
    if (filters?.supplier && filters.supplier !== 'ALL') {
      const canonSup = normalizeExpenseSupplier(filters.supplier)
      query = query.eq('supplier', canonSup)
    }
    if (filters?.year && filters.year !== 'ALL') {
      query = query.eq('record_year', Number(filters.year))
    }
    if (filters?.startDate) {
      query = query.gte('expense_date', filters.startDate)
    }
    if (filters?.endDate) {
      query = query.lte('expense_date', filters.endDate)
    }
    if (filters?.minAmount !== undefined) {
      query = query.gte('total_amount', filters.minAmount)
    }
    if (filters?.maxAmount !== undefined) {
      query = query.lte('total_amount', filters.maxAmount)
    }
    if (filters?.search) {
      const term = `%${filters.search.trim()}%`
      query = query.or(`description.ilike.${term},supplier.ilike.${term},category.ilike.${term},document_number.ilike.${term},observations.ilike.${term}`)
    }

    const { data, count, error } = await query.order('expense_date', { ascending: false }).order('source_row', { ascending: true })

    if (!error && data && data.length > 0) {
      return { expenses: data as VerifiedExpenseRecord[], total: count || data.length }
    }
  } catch (err) {
    console.warn('Fallback to verified in-memory expenses dataset:', err)
  }

  // Fallback / memory filter
  let result = [...inMemoryExpenses]

  if (filters?.category && filters.category !== 'ALL') {
    const canonCat = normalizeExpenseCategory(filters.category)
    result = result.filter((e) => normalizeExpenseCategory(e.category) === canonCat)
  }
  if (filters?.supplier && filters.supplier !== 'ALL') {
    const canonSup = normalizeExpenseSupplier(filters.supplier)
    result = result.filter((e) => normalizeExpenseSupplier(e.supplier) === canonSup)
  }
  if (filters?.year && filters.year !== 'ALL') {
    result = result.filter((e) => e.record_year === Number(filters.year))
  }
  if (filters?.startDate) {
    result = result.filter((e) => e.expense_date >= filters.startDate!)
  }
  if (filters?.endDate) {
    result = result.filter((e) => e.expense_date <= filters.endDate!)
  }
  if (filters?.minAmount !== undefined) {
    result = result.filter((e) => Number(e.total_amount) >= filters.minAmount!)
  }
  if (filters?.maxAmount !== undefined) {
    result = result.filter((e) => Number(e.total_amount) <= filters.maxAmount!)
  }
  if (filters?.search) {
    const term = filters.search.trim().toLowerCase()
    result = result.filter(
      (e) =>
        e.description.toLowerCase().includes(term) ||
        e.supplier.toLowerCase().includes(term) ||
        e.category.toLowerCase().includes(term) ||
        (e.document_number && e.document_number.toLowerCase().includes(term)) ||
        (e.observations && e.observations.toLowerCase().includes(term))
    )
  }

  // Sort descending by date
  result.sort((a, b) => b.expense_date.localeCompare(a.expense_date) || (a.source_row - b.source_row))

  return { expenses: result, total: result.length }
}

export async function getExpenseById(id: string): Promise<VerifiedExpenseRecord | null> {
  try {
    const admin = createAdminClient()
    const { data, error } = await admin.from('insurance_financial_expenses').select('*').eq('id', id).single()
    if (!error && data) return data as VerifiedExpenseRecord
  } catch (err) {
    console.warn('Expense DB fetch error:', err)
  }
  return inMemoryExpenses.find((e) => e.id === id) || null
}

export async function createExpense(data: {
  expense_date: string
  document_number?: string | null
  description: string
  category: string
  supplier: string
  net_amount: number
  vat_amount?: number | null
  total_amount: number
  observations?: string | null
}): Promise<VerifiedExpenseRecord> {
  const row = inMemoryExpenses.length + 1
  const recYear = parseInt(data.expense_date.slice(0, 4), 10) || 2026
  const canonCat = normalizeExpenseCategory(data.category)
  const canonSup = normalizeExpenseSupplier(data.supplier)
  const fingerprint = generateExpenseFingerprint(row, data.expense_date, data.document_number || null, data.description, canonSup, data.total_amount)
  const idHash = crypto.createHash('md5').update(`exp-${fingerprint}-${Date.now()}`).digest('hex')
  const uuid = `${idHash.slice(0, 8)}-${idHash.slice(8, 12)}-4${idHash.slice(13, 16)}-a${idHash.slice(17, 20)}-${idHash.slice(20, 32)}`

  const newRecord: VerifiedExpenseRecord = {
    id: uuid,
    expense_date: data.expense_date,
    raw_date: data.expense_date,
    document_number: data.document_number || null,
    description: data.description,
    category: canonCat,
    raw_category: data.category,
    supplier: canonSup,
    raw_supplier: data.supplier,
    net_amount: data.net_amount,
    vat_amount: data.vat_amount ?? null,
    total_amount: data.total_amount,
    observations: data.observations || null,
    source: 'manual',
    source_row: row,
    source_file: 'Manual Entry',
    source_year_label: 2026,
    record_year: recYear,
    year_discrepancy_flag: false,
    fingerprint,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  try {
    const admin = createAdminClient()
    const { data: dbData, error } = await admin.from('insurance_financial_expenses').insert(newRecord).select().single()
    if (!error && dbData) {
      inMemoryExpenses.unshift(dbData as VerifiedExpenseRecord)
      return dbData as VerifiedExpenseRecord
    }
  } catch (err) {
    console.warn('DB expense insert failed, saving in-memory:', err)
  }

  inMemoryExpenses.unshift(newRecord)
  return newRecord
}

export async function updateExpense(
  id: string,
  data: Partial<{
    expense_date: string
    document_number: string | null
    description: string
    category: string
    supplier: string
    net_amount: number
    vat_amount: number | null
    total_amount: number
    observations: string | null
  }>
): Promise<VerifiedExpenseRecord | null> {
  const existing = await getExpenseById(id)
  if (!existing) return null

  const canonCat = data.category ? normalizeExpenseCategory(data.category) : existing.category
  const canonSup = data.supplier ? normalizeExpenseSupplier(data.supplier) : existing.supplier

  const updated: VerifiedExpenseRecord = {
    ...existing,
    ...data,
    category: canonCat,
    raw_category: data.category || existing.raw_category,
    supplier: canonSup,
    raw_supplier: data.supplier || existing.raw_supplier,
    updated_at: new Date().toISOString(),
  }

  try {
    const admin = createAdminClient()
    const { data: dbData, error } = await admin.from('insurance_financial_expenses').update(updated).eq('id', id).select().single()
    if (!error && dbData) {
      inMemoryExpenses = inMemoryExpenses.map((e) => (e.id === id ? (dbData as VerifiedExpenseRecord) : e))
      return dbData as VerifiedExpenseRecord
    }
  } catch (err) {
    console.warn('DB expense update failed, updating in-memory:', err)
  }

  inMemoryExpenses = inMemoryExpenses.map((e) => (e.id === id ? updated : e))
  return updated
}

export async function deleteExpense(id: string): Promise<boolean> {
  try {
    const admin = createAdminClient()
    await admin.from('insurance_financial_expenses').delete().eq('id', id)
  } catch (err) {
    console.warn('DB expense delete failed:', err)
  }
  inMemoryExpenses = inMemoryExpenses.filter((e) => e.id !== id)
  return true
}

export async function getIncomes(filters?: IncomeFilters): Promise<{ incomes: VerifiedIncomeRecord[]; total: number }> {
  try {
    const admin = createAdminClient()
    let query = admin.from('insurance_financial_income').select('*', { count: 'exact' })

    if (filters?.insurer && filters.insurer !== 'ALL') {
      query = query.ilike('insurer', filters.insurer)
    }
    if (filters?.insuranceType && filters.insuranceType !== 'ALL') {
      query = query.ilike('insurance_type', filters.insuranceType)
    }
    if (filters?.year && filters.year !== 'ALL') {
      query = query.eq('record_year', Number(filters.year))
    }
    if (filters?.startDate) {
      query = query.gte('income_date', filters.startDate)
    }
    if (filters?.endDate) {
      query = query.lte('income_date', filters.endDate)
    }
    if (filters?.search) {
      const term = `%${filters.search.trim()}%`
      query = query.or(`description.ilike.${term},insurer.ilike.${term},insurance_type.ilike.${term},document_number.ilike.${term},observations.ilike.${term}`)
    }

    const { data, count, error } = await query.order('income_date', { ascending: false }).order('source_row', { ascending: true })

    if (!error && data && data.length > 0) {
      return { incomes: data as VerifiedIncomeRecord[], total: count || data.length }
    }
  } catch (err) {
    console.warn('Fallback to verified in-memory incomes dataset:', err)
  }

  // Fallback / memory filter
  let result = [...inMemoryIncomes]

  if (filters?.insurer && filters.insurer !== 'ALL') {
    result = result.filter((i) => i.insurer && i.insurer.toLowerCase() === filters.insurer!.toLowerCase())
  }
  if (filters?.insuranceType && filters.insuranceType !== 'ALL') {
    result = result.filter((i) => i.insurance_type && i.insurance_type.toLowerCase() === filters.insuranceType!.toLowerCase())
  }
  if (filters?.year && filters.year !== 'ALL') {
    result = result.filter((i) => i.record_year === Number(filters.year))
  }
  if (filters?.startDate) {
    result = result.filter((i) => i.income_date >= filters.startDate!)
  }
  if (filters?.endDate) {
    result = result.filter((i) => i.income_date <= filters.endDate!)
  }
  if (filters?.search) {
    const term = filters.search.trim().toLowerCase()
    result = result.filter(
      (i) =>
        i.description.toLowerCase().includes(term) ||
        (i.insurer && i.insurer.toLowerCase().includes(term)) ||
        (i.insurance_type && i.insurance_type.toLowerCase().includes(term)) ||
        (i.document_number && i.document_number.toLowerCase().includes(term)) ||
        (i.observations && i.observations.toLowerCase().includes(term))
    )
  }

  result.sort((a, b) => b.income_date.localeCompare(a.income_date) || (a.source_row - b.source_row))

  return { incomes: result, total: result.length }
}

export async function getIncomeById(id: string): Promise<VerifiedIncomeRecord | null> {
  try {
    const admin = createAdminClient()
    const { data, error } = await admin.from('insurance_financial_income').select('*').eq('id', id).single()
    if (!error && data) return data as VerifiedIncomeRecord
  } catch (err) {
    console.warn('Income DB fetch error:', err)
  }
  return inMemoryIncomes.find((i) => i.id === id) || null
}

export async function createIncome(data: {
  income_date: string
  document_number?: string | null
  description: string
  insurance_type?: string | null
  insurer?: string | null
  policy_value?: number | null
  commission_percent?: number | null
  commission_received: number
  tax_1_percent?: number | null
  observations?: string | null
}): Promise<VerifiedIncomeRecord> {
  const row = inMemoryIncomes.length + 1
  const recYear = parseInt(data.income_date.slice(0, 4), 10) || 2026
  const tax = data.tax_1_percent !== undefined && data.tax_1_percent !== null ? data.tax_1_percent : Number((data.commission_received * 0.01).toFixed(4))
  const fingerprint = generateIncomeFingerprint(row, data.income_date, data.description, data.commission_received, tax)
  const idHash = crypto.createHash('md5').update(`inc-${fingerprint}-${Date.now()}`).digest('hex')
  const uuid = `${idHash.slice(0, 8)}-${idHash.slice(8, 12)}-4${idHash.slice(13, 16)}-a${idHash.slice(17, 20)}-${idHash.slice(20, 32)}`

  const newRecord: VerifiedIncomeRecord = {
    id: uuid,
    income_date: data.income_date,
    raw_date: data.income_date,
    document_number: data.document_number || null,
    description: data.description,
    insurance_type: data.insurance_type || null,
    insurer: data.insurer || null,
    policy_value: data.policy_value ?? null,
    commission_percent: data.commission_percent ?? null,
    commission_received: data.commission_received,
    tax_1_percent: tax,
    observations: data.observations || null,
    source: 'manual',
    source_row: row,
    source_file: 'Manual Entry',
    source_year_label: recYear,
    record_year: recYear,
    year_discrepancy_flag: false,
    fingerprint,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  try {
    const admin = createAdminClient()
    const { data: dbData, error } = await admin.from('insurance_financial_income').insert(newRecord).select().single()
    if (!error && dbData) {
      inMemoryIncomes.unshift(dbData as VerifiedIncomeRecord)
      return dbData as VerifiedIncomeRecord
    }
  } catch (err) {
    console.warn('DB income insert failed, saving in-memory:', err)
  }

  inMemoryIncomes.unshift(newRecord)
  return newRecord
}

export async function updateIncome(
  id: string,
  data: Partial<{
    income_date: string
    document_number: string | null
    description: string
    insurance_type: string | null
    insurer: string | null
    policy_value: number | null
    commission_percent: number | null
    commission_received: number
    tax_1_percent: number | null
    observations: string | null
  }>
): Promise<VerifiedIncomeRecord | null> {
  const existing = await getIncomeById(id)
  if (!existing) return null

  const updated: VerifiedIncomeRecord = {
    ...existing,
    ...data,
    tax_1_percent:
      data.tax_1_percent !== undefined && data.tax_1_percent !== null
        ? data.tax_1_percent
        : data.commission_received !== undefined
        ? Number((data.commission_received * 0.01).toFixed(4))
        : existing.tax_1_percent,
    updated_at: new Date().toISOString(),
  }

  try {
    const admin = createAdminClient()
    const { data: dbData, error } = await admin.from('insurance_financial_income').update(updated).eq('id', id).select().single()
    if (!error && dbData) {
      inMemoryIncomes = inMemoryIncomes.map((i) => (i.id === id ? (dbData as VerifiedIncomeRecord) : i))
      return dbData as VerifiedIncomeRecord
    }
  } catch (err) {
    console.warn('DB income update failed, updating in-memory:', err)
  }

  inMemoryIncomes = inMemoryIncomes.map((i) => (i.id === id ? updated : i))
  return updated
}

export async function deleteIncome(id: string): Promise<boolean> {
  try {
    const admin = createAdminClient()
    await admin.from('insurance_financial_income').delete().eq('id', id)
  } catch (err) {
    console.warn('DB income delete failed:', err)
  }
  inMemoryIncomes = inMemoryIncomes.filter((i) => i.id !== id)
  return true
}

export async function getFinancialOverview(year?: number | string): Promise<FinancialOverviewSummary> {
  const { expenses } = await getExpenses(year && year !== 'ALL' ? { year } : undefined)
  const { incomes } = await getIncomes(year && year !== 'ALL' ? { year } : undefined)
  return computeFinancialOverview(expenses, incomes)
}
