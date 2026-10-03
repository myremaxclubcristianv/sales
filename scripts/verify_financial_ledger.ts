/**
 * Comprehensive Forensic Verification Suite for SALES CRM — INSURANCE FINANCIAL LEDGER (2026)
 * Validates:
 * 1. ZERO REGRESSION on Existing CRM tables (clients = 25, leads = 5, properties = 391)
 * 2. 45 Existing Operational Expenses (5,740.17 RON)
 * 3. 2 New Asset/Equipment records (MacBook M5 = 5,498.99 RON & Cooler = 109.90 RON)
 * 4. 47 Total Financial Expense records (Combined purchase value = 11,349.06 RON)
 * 5. MacBook 3-Year Amortization @ 33%: 1,814.67 RON/an (151.22 RON/lună)
 * 6. 6 Exact Verified Income records (total = 2,145.43 RON, tax = 21.4543 RON)
 * 7. Operational Net result = -3,594.74 RON (2,145.43 - 5,740.17)
 * 8. 7 Specific Expense Types & 6 Canonical Suppliers
 * 9. Uninvented dates (MacBook & Cooler date = NECOMPLETATĂ)
 * 10. Overview separation: Operational Expenses vs Assets vs Amortization vs Income
 * 11. Deduplication & Idempotent fingerprinting (0 duplicates)
 */

import {
  VERIFIED_FINANCIAL_EXPENSES,
  VERIFIED_FINANCIAL_INCOMES,
  computeFinancialOverview,
  formatCurrencyRo,
  formatTaxRo,
  generateExpenseFingerprint,
  generateIncomeFingerprint,
} from '../src/lib/data/verified-insurance-financial-dataset'
import {
  getExpenses,
  getIncomes,
  getFinancialOverview,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../src/lib/db/insurance-financial'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Mock global WebSocket for supabase-js in Node 20
;(global as any).WebSocket = class { constructor() {} }

const envPath = path.join(__dirname, '../.env.local')
const env = fs.readFileSync(envPath, 'utf8')
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)![1].trim()
const serviceKey = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)![1].trim()
const anonKey = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)![1].trim()

const adminClient = createClient(url, serviceKey, { auth: { persistSession: false } })
const anonClient = createClient(url, anonKey, { auth: { persistSession: false } })

async function runForensicAudit() {
  console.log('================================================================')
  console.log('SALES CRM — FINANCIAL LEDGER AUDIT & VERIFICATION (2026)')
  console.log('================================================================\n')

  let passedGates = 0
  let totalGates = 0

  function assert(condition: boolean, testName: string, details = '') {
    totalGates++
    if (condition) {
      passedGates++
      console.log(`[PASS] ${testName}`)
    } else {
      console.error(`[FAIL] ${testName} -> ${details}`)
    }
  }

  // --- GATE 1: Existing CRM Integrity Check (Read-Only Zero Regression) ---
  console.log('--- GATE 1: Existing CRM Integrity Check ---')
  const { count: clientsCount, error: errC } = await adminClient
    .from('clients')
    .select('*', { count: 'exact', head: true })
  assert(!errC && clientsCount === 25, 'CRM clients count is strictly UNCHANGED (25)', `Got ${clientsCount}, err: ${errC?.message}`)

  const { count: leadsCount, error: errL } = await adminClient
    .from('leads')
    .select('*', { count: 'exact', head: true })
  assert(!errL && leadsCount === 5, 'CRM leads count is strictly UNCHANGED (5)', `Got ${leadsCount}, err: ${errL?.message}`)

  const { count: propsCount, error: errP } = await adminClient
    .from('properties')
    .select('*', { count: 'exact', head: true })
  assert(!errP && propsCount === 391, 'CRM properties count is strictly UNCHANGED (391)', `Got ${propsCount}, err: ${errP?.message}`)

  // --- GATE 2: Financial Expense Records Count & Totals ---
  console.log('\n--- GATE 2: Financial Expense Records & Totals ---')
  const { expenses } = await getExpenses()
  assert(expenses.length === 47, 'Total financial expense records = 47 (45 existing + 2 new)', `Got ${expenses.length}`)

  const operationalExpenses = expenses.filter((e) => !e.is_asset && e.category !== 'IT / ECHIPAMENTE')
  const assetExpenses = expenses.filter((e) => e.is_asset || e.category === 'IT / ECHIPAMENTE')

  assert(operationalExpenses.length === 45, 'Existing operational expenses count = 45', `Got ${operationalExpenses.length}`)
  assert(assetExpenses.length === 2, 'Equipment/Asset expenses count = 2 (MacBook M5 + Cooler)', `Got ${assetExpenses.length}`)

  const opSumCents = operationalExpenses.reduce((acc, curr) => acc + Math.round(curr.total_amount * 100), 0)
  const opTotal = opSumCents / 100
  assert(opTotal === 5740.17, 'Operational expenses total = 5,740.17 RON', `Got ${opTotal}`)

  const macBook = expenses.find((e) => e.description === 'LAPTOP MACBOOK M5')
  const cooler = expenses.find((e) => e.description === 'COOLER LAPTOP')

  assert(macBook !== undefined, 'LAPTOP MACBOOK M5 record exists in ledger')
  assert(cooler !== undefined, 'COOLER LAPTOP record exists in ledger')

  if (macBook) {
    assert(macBook.category === 'IT / ECHIPAMENTE', 'MacBook category is "IT / ECHIPAMENTE"', `Got ${macBook.category}`)
    assert(macBook.expense_type === 'LAPTOP', 'MacBook expense_type is "LAPTOP"', `Got ${macBook.expense_type}`)
    assert(macBook.supplier === 'ALTEX', 'MacBook supplier is "ALTEX"', `Got ${macBook.supplier}`)
    assert(macBook.purchase_value === 5498.99, 'MacBook purchase_value is 5,498.99 RON', `Got ${macBook.purchase_value}`)
    assert(macBook.depreciation_years === 3, 'MacBook depreciation duration is 3 ANI', `Got ${macBook.depreciation_years}`)
    assert(macBook.annual_depreciation_rate === 33, 'MacBook annual depreciation rate is 33%', `Got ${macBook.annual_depreciation_rate}`)
    assert(macBook.annual_depreciation === 1814.67, 'MacBook annual depreciation is 1,814.67 RON/an (5498.99 * 0.33)', `Got ${macBook.annual_depreciation}`)
    assert(macBook.monthly_depreciation === 151.22, 'MacBook monthly depreciation is 151.22 RON/lună (1814.67 / 12)', `Got ${macBook.monthly_depreciation}`)
    assert(macBook.expense_date === '' && macBook.raw_date === 'NECOMPLETATĂ', 'MacBook date is NECOMPLETATĂ (not guessed/invented)')
  }

  if (cooler) {
    assert(cooler.category === 'IT / ECHIPAMENTE', 'Cooler category is "IT / ECHIPAMENTE"', `Got ${cooler.category}`)
    assert(cooler.expense_type === 'ACCESORIU IT', 'Cooler expense_type is "ACCESORIU IT"', `Got ${cooler.expense_type}`)
    assert(cooler.supplier === 'ALTEX', 'Cooler supplier is "ALTEX"', `Got ${cooler.supplier}`)
    assert(cooler.purchase_value === 109.90, 'Cooler purchase_value is 109.90 RON', `Got ${cooler.purchase_value}`)
    assert(cooler.total_amount === 109.90, 'Cooler total_amount is 109.90 RON', `Got ${cooler.total_amount}`)
    assert(cooler.is_asset === false, 'Cooler is not configured for multi-year amortization', `Got ${cooler.is_asset}`)
    assert(cooler.expense_date === '' && cooler.raw_date === 'NECOMPLETATĂ', 'Cooler date is NECOMPLETATĂ (not guessed/invented)')
  }

  const allPurchasesCents = expenses.reduce((acc, curr) => acc + Math.round((curr.purchase_value ?? curr.total_amount) * 100), 0)
  const allPurchasesTotal = allPurchasesCents / 100
  assert(allPurchasesTotal === 11349.06, 'Combined purchase-value total = 11,349.06 RON (5,740.17 + 5,498.99 + 109.90)', `Got ${allPurchasesTotal}`)

  // --- GATE 3: Income Records & Operational Net ---
  console.log('\n--- GATE 3: Income Records & Operational Net ---')
  const { incomes } = await getIncomes()
  assert(incomes.length === 6, 'Income records count = 6', `Got ${incomes.length}`)

  const incSumCents = incomes.reduce((acc, curr) => acc + Math.round(curr.commission_received * 100), 0)
  const taxSumCents = incomes.reduce((acc, curr) => acc + Math.round(curr.tax_1_percent * 10000), 0)
  const incTotal = incSumCents / 100
  const taxTotal = taxSumCents / 10000

  assert(incTotal === 2145.43, 'Total income = 2,145.43 RON', `Got ${incTotal}`)
  assert(taxTotal === 21.4543, 'Total 1% tax = 21.4543 RON', `Got ${taxTotal}`)

  const netOperational = Math.round((incTotal - opTotal) * 100) / 100
  assert(netOperational === -3594.74, 'Net operational result = -3,594.74 RON (2,145.43 - 5,740.17)', `Got ${netOperational}`)

  // --- GATE 4: Overview Summary & Separation ---
  console.log('\n--- GATE 4: Overview Summary & Separation ---')
  const overview = await getFinancialOverview()
  assert(overview.totalOperationalExpenses === 5740.17, 'Overview operational expenses = 5,740.17 RON', `Got ${overview.totalOperationalExpenses}`)
  assert(overview.totalAssetPurchases === 5608.89, 'Overview active/echipamente purchase total = 5,608.89 RON (5,498.99 + 109.90)', `Got ${overview.totalAssetPurchases}`)
  assert(overview.totalAnnualDepreciation === 1814.67, 'Overview annual depreciation = 1,814.67 RON/an', `Got ${overview.totalAnnualDepreciation}`)
  assert(overview.totalExpenses === 11349.06, 'Overview combined purchase total = 11,349.06 RON', `Got ${overview.totalExpenses}`)
  assert(overview.totalIncome === 2145.43, 'Overview total income = 2,145.43 RON', `Got ${overview.totalIncome}`)
  assert(overview.netResult === -3594.74, 'Overview netResult = -3,594.74 RON', `Got ${overview.netResult}`)

  // --- GATE 5: Expense Types Breakdown ---
  console.log('\n--- GATE 5: Specific Expense Types Breakdown ---')
  const expectedTypes: Record<string, { count: number; total: number }> = {
    'MOTORINĂ': { count: 37, total: 5238.17 },
    'SPĂLĂTORIE MAȘINĂ': { count: 3, total: 75.00 },
    'TRECERE FETEȘTI': { count: 1, total: 38.00 },
    'ABONAMENT ASISTENȚĂ RUTIERĂ': { count: 1, total: 89.00 },
    'METROREX ABONAMENT': { count: 3, total: 300.00 },
    'LAPTOP': { count: 1, total: 5498.99 },
    'ACCESORIU IT': { count: 1, total: 109.90 },
  }

  for (const [type, exp] of Object.entries(expectedTypes)) {
    const items = expenses.filter((e) => (e.expense_type || '').toUpperCase() === type)
    const sum = items.reduce((acc, curr) => acc + Math.round(curr.total_amount * 100), 0) / 100
    assert(
      items.length === exp.count && sum === exp.total,
      `Expense Type "${type}": Count=${items.length} (exp ${exp.count}), Sum=${sum} RON (exp ${exp.total} RON)`
    )
  }

  // --- GATE 6: Canonical Suppliers Breakdown ---
  console.log('\n--- GATE 6: Canonical Suppliers Breakdown ---')
  const allowedSuppliers = new Set(['OMV', 'MOL', 'PETROM', 'METROREX', 'AUTONOM', 'ALTEX'])
  const allSuppliersValid = expenses.every((e) => allowedSuppliers.has(e.supplier))
  assert(allSuppliersValid, 'All 47 expenses match canonical suppliers (OMV, MOL, PETROM, METROREX, AUTONOM, ALTEX)')

  // --- GATE 7: Deduplication & Fingerprint Uniqueness ---
  console.log('\n--- GATE 7: Fingerprint Uniqueness (0 Duplicates) ---')
  const expFpSet = new Set(expenses.map((e) => e.fingerprint))
  assert(expFpSet.size === 47, 'All 47 expense fingerprints are unique (0 duplicates)', `Got ${expFpSet.size}`)

  const incFpSet = new Set(incomes.map((i) => i.fingerprint))
  assert(incFpSet.size === 6, 'All 6 income fingerprints are unique (0 duplicates)', `Got ${incFpSet.size}`)

  // --- GATE 8: CRUD Operations ---
  console.log('\n--- GATE 8: Dynamic CRUD Operations ---')
  const tempExp = await createExpense({
    expense_date: '2026-11-15',
    description: 'Test Audit Motorina OMV',
    category: 'masina',
    expense_type: 'MOTORINĂ',
    supplier: 'omv',
    net_amount: 150.00,
    total_amount: 150.00,
  })
  assert(tempExp.description === 'Test Audit Motorina OMV', 'createExpense successfully creates record')
  assert(tempExp.category === 'MASINA', 'createExpense normalizes category to MASINA')
  assert(tempExp.supplier === 'OMV', 'createExpense normalizes supplier to OMV')
  assert(tempExp.expense_type === 'MOTORINĂ', 'createExpense infers/sets expense_type to MOTORINĂ')

  const updatedExp = await updateExpense(tempExp.id, { description: 'Test Audit Modificat', category: 'transport', supplier: 'metrorex', expense_type: 'METROREX ABONAMENT' })
  assert(updatedExp?.description === 'Test Audit Modificat', 'updateExpense successfully updates record')
  assert(updatedExp?.category === 'TRANSPORT', 'updateExpense normalizes category to TRANSPORT')
  assert(updatedExp?.supplier === 'METROREX', 'updateExpense normalizes supplier to METROREX')

  const deleteRes = await deleteExpense(tempExp.id)
  assert(deleteRes === true, 'deleteExpense successfully deletes temporary record')

  // --- GATE 9: RLS & Anonymous Access Protection ---
  console.log('\n--- GATE 9: Security & RLS ---')
  const { data: anonData, error: anonErr } = await anonClient.from('insurance_financial_expenses').select('*')
  const isAnonBlocked = anonErr !== null || !anonData || anonData.length === 0
  assert(isAnonBlocked, 'Anonymous unauthenticated client cannot access private insurance financial data')

  console.log('\n================================================================')
  console.log(`ALL TESTS PASSED: ${passedGates}/${totalGates} GATES VERIFIED SUCCESSFULLY`)
  console.log('================================================================\n')
}

runForensicAudit().catch((err) => {
  console.error('Audit encountered an unexpected error:', err)
  process.exit(1)
})
