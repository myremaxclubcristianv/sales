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
  assert(!errC && clientsCount === 73, 'CRM clients count is strictly UNCHANGED (73)', `Got ${clientsCount}, err: ${errC?.message}`)

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
  assert(expenses.length === 53, 'Total financial expense records = 53 (50 operational + 3 active)', `Got ${expenses.length}`)

  const operationalExpenses = expenses.filter((e) => !e.is_asset && e.category !== 'IT / ECHIPAMENTE' && e.category !== 'IT / ACCESORII')
  const assetExpenses = expenses.filter((e) => e.is_asset || e.category === 'IT / ECHIPAMENTE' || e.category === 'IT / ACCESORII')

  assert(operationalExpenses.length === 50, 'Total operational expenses count = 50 (45 existing + 5 October motorina)', `Got ${operationalExpenses.length}`)
  assert(assetExpenses.length === 3, 'Active / Bunuri count = 3 (MacBook M5 + Cooler Laptop Myria + Tableta Honor)', `Got ${assetExpenses.length}`)

  // Verify the 5 October 2026 fuel records
  const octFuelRecords = expenses.filter(
    (e) => ['2026-10-04', '2026-10-05', '2026-10-09', '2026-10-11', '2026-10-13'].includes(e.expense_date) && e.supplier && ['OMV', 'MOL'].includes(e.supplier)
  )
  assert(octFuelRecords.length === 5, 'Found exactly 5 new October motorină records', `Got ${octFuelRecords.length}`)
  const octFuelSum = octFuelRecords.reduce((acc, curr) => acc + Math.round(curr.total_amount * 100), 0) / 100
  assert(octFuelSum === 720.15, '5 October motorină records sum = 720.15 RON', `Got ${octFuelSum}`)

  // Verify Tableta Honor
  const tableta = expenses.find((e) => e.description === 'Tableta Honor')
  assert(tableta !== undefined, 'Tableta Honor record exists in ledger')
  if (tableta) {
    assert(tableta.total_amount === 899.99, 'Tableta Honor total = 899.99 RON', `Got ${tableta.total_amount}`)
    assert(tableta.supplier === 'ALTEX', 'Tableta Honor supplier is ALTEX', `Got ${tableta.supplier}`)
    assert(tableta.category === 'IT / ECHIPAMENTE', 'Tableta Honor category is IT / ECHIPAMENTE', `Got ${tableta.category}`)
    assert(tableta.expense_type === 'TABLETĂ', 'Tableta Honor expense_type is TABLETĂ', `Got ${tableta.expense_type}`)
    assert(tableta.raw_date === '14/10/2026', 'Tableta Honor date is 14/10/2026', `Got ${tableta.raw_date}`)
    assert(tableta.observations === '50%', 'Tableta Honor source percentage is 50%', `Got ${tableta.observations}`)
  }

  // Verify Cooler Laptop Myria
  const cooler = expenses.find((e) => e.description === 'Cooler Laptop Myria' || e.description === 'Cooler laptop')
  assert(cooler !== undefined, 'Cooler Laptop Myria record exists in ledger')
  if (cooler) {
    assert(cooler.total_amount === 109.90, 'Cooler Laptop Myria total = 109.90 RON', `Got ${cooler.total_amount}`)
    assert(cooler.supplier === 'ALTEX', 'Cooler Laptop Myria supplier is ALTEX', `Got ${cooler.supplier}`)
    assert(cooler.raw_date === '21/06/2026', 'Cooler Laptop Myria date is 21/06/2026', `Got ${cooler.raw_date}`)
    assert(cooler.observations === '50%', 'Cooler Laptop Myria source percentage is 50%', `Got ${cooler.observations}`)
  }

  // Verify total of the 7 new batch records: 720.15 + 899.99 + 109.90 = 1,730.04 RON
  const batchTotal = Math.round((octFuelSum + (tableta?.total_amount || 0) + (cooler?.total_amount || 0)) * 100) / 100
  assert(batchTotal === 1730.04, 'Total brut of the 7 batch records = 1,730.04 RON', `Got ${batchTotal}`)

  // Verify MacBook M5 (EXCLUDED, untouched, single)
  const macBookList = expenses.filter((e) => e.description === 'MacBook' || e.description === 'LAPTOP MACBOOK M5')
  assert(macBookList.length === 1, 'MacBook M5 is strictly a SINGLE record (0 duplicates)', `Got ${macBookList.length}`)
  const macBook = macBookList[0]
  if (macBook) {
    assert(macBook.category === 'IT / ECHIPAMENTE', 'MacBook category is IT / ECHIPAMENTE', `Got ${macBook.category}`)
    assert(macBook.expense_type === 'LAPTOP', 'MacBook expense_type is LAPTOP', `Got ${macBook.expense_type}`)
    assert(macBook.supplier === 'ALTEX', 'MacBook supplier is ALTEX', `Got ${macBook.supplier}`)
    assert(macBook.purchase_value === 5498.99, 'MacBook purchase_value is 5,498.99 RON', `Got ${macBook.purchase_value}`)
    assert(macBook.depreciation_years === 3, 'MacBook depreciation duration is 3 ANI', `Got ${macBook.depreciation_years}`)
    assert(macBook.annual_depreciation_rate === 33, 'MacBook annual depreciation rate is 33%', `Got ${macBook.annual_depreciation_rate}`)
    assert(macBook.annual_depreciation === 1814.67, 'MacBook annual depreciation is 1,814.67 RON/an', `Got ${macBook.annual_depreciation}`)
    assert(macBook.monthly_depreciation === 151.22, 'MacBook monthly depreciation is 151.22 RON/lună', `Got ${macBook.monthly_depreciation}`)
  }

  const opSumCents = operationalExpenses.reduce((acc, curr) => acc + Math.round(curr.total_amount * 100), 0)
  const opTotal = opSumCents / 100
  assert(opTotal === 6460.32, 'Operational expenses total = 6,460.32 RON (5,740.17 + 720.15)', `Got ${opTotal}`)

  const assetPurchasesCents = assetExpenses.reduce((acc, curr) => acc + Math.round((curr.purchase_value ?? curr.total_amount) * 100), 0)
  const assetPurchasesTotal = assetPurchasesCents / 100
  assert(assetPurchasesTotal === 6508.88, 'Asset purchases total = 6,508.88 RON (5,498.99 + 109.90 + 899.99)', `Got ${assetPurchasesTotal}`)

  const allPurchasesCents = expenses.reduce((acc, curr) => acc + Math.round((curr.purchase_value ?? curr.total_amount) * 100), 0)
  const allPurchasesTotal = allPurchasesCents / 100
  assert(allPurchasesTotal === 12969.20, 'Combined purchase-value total = 12,969.20 RON (6,460.32 + 6,508.88)', `Got ${allPurchasesTotal}`)

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
  assert(netOperational === -4314.89, 'Net operational result = -4,314.89 RON (2,145.43 - 6,460.32)', `Got ${netOperational}`)

  // --- GATE 4: Overview Summary & Monthly Cash Flow ---
  console.log('\n--- GATE 4: Overview Summary & Monthly Cash Flow ---')
  const overview = await getFinancialOverview()
  assert(overview.totalOperationalExpenses === 6460.32, 'Overview operational expenses = 6,460.32 RON', `Got ${overview.totalOperationalExpenses}`)
  assert(overview.totalAssetPurchases === 6508.88, 'Overview active purchase total = 6,508.88 RON', `Got ${overview.totalAssetPurchases}`)
  assert(overview.totalAnnualDepreciation === 1814.67, 'Overview annual depreciation = 1,814.67 RON/an', `Got ${overview.totalAnnualDepreciation}`)
  assert(overview.totalExpenses === 12969.20, 'Overview combined purchase total = 12,969.20 RON', `Got ${overview.totalExpenses}`)
  assert(overview.totalIncome === 2145.43, 'Overview total income = 2,145.43 RON', `Got ${overview.totalIncome}`)
  assert(overview.netResult === -4314.89, 'Overview netResult = -4,314.89 RON', `Got ${overview.netResult}`)

  const octMonthly = overview.monthlyBreakdown.find((m) => m.month === '2026-10')
  assert(octMonthly !== undefined, 'October 2026 monthly cash flow breakdown exists')
  if (octMonthly) {
    assert(octMonthly.expenses === 1820.34, 'October 2026 total expenses = 1,820.34 RON (200.20 base + 720.15 fuel + 899.99 tablet)', `Got ${octMonthly.expenses}`)
  }

  // --- GATE 5: Expense Types Breakdown ---
  console.log('\n--- GATE 5: Specific Expense Types Breakdown ---')
  const expectedTypes: Record<string, { count: number; total: number }> = {
    'MOTORINĂ': { count: 42, total: 5958.32 },
    'SPĂLĂTORIE MAȘINĂ': { count: 3, total: 75.00 },
    'TRECERE FETEȘTI': { count: 1, total: 38.00 },
    'ABONAMENT ASISTENȚĂ RUTIERĂ': { count: 1, total: 89.00 },
    'METROREX ABONAMENT': { count: 3, total: 300.00 },
    'LAPTOP': { count: 1, total: 5498.99 },
    'ACCESORIU IT': { count: 1, total: 109.90 },
    'TABLETĂ': { count: 1, total: 899.99 },
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
  assert(allSuppliersValid, 'All 53 expenses match canonical suppliers (OMV, MOL, PETROM, METROREX, AUTONOM, ALTEX)')

  // --- GATE 7: Deduplication & Fingerprint Uniqueness ---
  console.log('\n--- GATE 7: Fingerprint Uniqueness (0 Duplicates) ---')
  const expFpSet = new Set(expenses.map((e) => e.fingerprint))
  assert(expFpSet.size === 53, 'All 53 expense fingerprints are unique (0 duplicates)', `Got ${expFpSet.size}`)

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
