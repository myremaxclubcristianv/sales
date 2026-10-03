/**
 * Comprehensive Forensic Verification Suite for SALES CRM — INSURANCE FINANCIAL LEDGER
 * Validates:
 * 1. ZERO REGRESSION on Existing CRM tables (clients = 25, leads = 5, properties = 391)
 * 2. 45 Exact Verified Expenses (reconciled total = 5,740.17 RON)
 * 3. 6 Exact Verified Income records (total = 2,145.43 RON, tax = 21.4543 RON)
 * 4. Net result = -3,594.74 RON
 * 5. Exact Row-by-Row reconciliation table (DIFFERENCE = 0 for all 45 expenses and 6 incomes)
 * 6. Year discrepancy tracking (Source Title 2025 vs Records 2026)
 * 7. Deduplication & Idempotent fingerprinting
 * 8. CRUD operations (Add, Edit, Delete)
 * 9. Security, RLS & Private authorization enforcement
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
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getFinancialOverview,
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
  console.log('SALES CRM — FINANCIAL LEDGER FORENSIC RECONCILIATION & AUDIT')
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
  console.log('--- GATE 1: Existing CRM Integrity ---')
  const { count: clientsCount, error: errC } = await adminClient
    .from('clients')
    .select('*', { count: 'exact', head: true })
  assert(!errC && clientsCount === 25, 'Existing CRM clients count is strictly UNCHANGED (25)', `Got ${clientsCount}, err: ${errC?.message}`)

  const { count: leadsCount, error: errL } = await adminClient
    .from('leads')
    .select('*', { count: 'exact', head: true })
  assert(!errL && leadsCount === 5, 'Existing CRM leads count is strictly UNCHANGED (5)', `Got ${leadsCount}, err: ${errL?.message}`)

  const { count: propsCount, error: errP } = await adminClient
    .from('properties')
    .select('*', { count: 'exact', head: true })
  assert(!errP && propsCount === 391, 'Existing CRM properties count is strictly UNCHANGED (391)', `Got ${propsCount}, err: ${errP?.message}`)

  // --- GATE 2: Row-By-Row Expense Reconciliation Table ---
  console.log('\n--- GATE 2: Row-By-Row Expense Reconciliation ---')
  const { expenses: dbExpenses } = await getExpenses()
  assert(dbExpenses.length === 45, 'EXPECT EXPENSE COUNT = 45', `Got ${dbExpenses.length}`)

  let expenseRowMismatches = 0
  let expenseFingerprintMismatches = 0
  let expenseSumCents = 0

  console.log('---------------------------------------------------------------------------------------------------------')
  console.log('| ROW | DATE       | DESCRIPTION                  | SUPPLIER   | SOURCE AMT | DB AMT     | DIFF  | FP MATCH |')
  console.log('---------------------------------------------------------------------------------------------------------')

  for (let i = 0; i < VERIFIED_FINANCIAL_EXPENSES.length; i++) {
    const src = VERIFIED_FINANCIAL_EXPENSES[i]
    const db = dbExpenses.find((d) => d.source_row === src.source_row)

    const srcCents = Math.round(src.total_amount * 100)
    const dbCents = db ? Math.round(db.total_amount * 100) : -1
    const diff = srcCents - dbCents

    expenseSumCents += srcCents

    const expectedFp = generateExpenseFingerprint(src.source_row, src.expense_date, src.document_number, src.description, src.supplier, src.total_amount)
    const fpMatch = db?.fingerprint === expectedFp

    if (diff !== 0) expenseRowMismatches++
    if (!fpMatch) expenseFingerprintMismatches++

    const descPad = (src.description || '').padEnd(28, ' ').slice(0, 28)
    const supPad = (src.supplier || '').padEnd(10, ' ').slice(0, 10)
    const rowPad = String(src.source_row).padStart(3, ' ')
    const srcAmtPad = src.total_amount.toFixed(2).padStart(10, ' ')
    const dbAmtPad = db ? db.total_amount.toFixed(2).padStart(10, ' ') : 'N/A'.padStart(10, ' ')
    const diffPad = (diff / 100).toFixed(2).padStart(5, ' ')

    console.log(`| ${rowPad} | ${src.expense_date} | ${descPad} | ${supPad} | ${srcAmtPad} | ${dbAmtPad} | ${diffPad} | ${fpMatch ? 'YES     ' : 'NO      '} |`)
  }
  console.log('---------------------------------------------------------------------------------------------------------')

  assert(expenseRowMismatches === 0, 'Expense Row-Level Mismatches = 0', `Got ${expenseRowMismatches}`)
  assert(expenseFingerprintMismatches === 0, 'Expense Fingerprint Mismatches = 0', `Got ${expenseFingerprintMismatches}`)

  const calculatedExpenseTotal = expenseSumCents / 100
  assert(calculatedExpenseTotal === 5740.17, 'EXPECT EXPENSE TOTAL = 5740.17 RON', `Got ${calculatedExpenseTotal}`)

  // --- GATE 3: Row-By-Row Income Reconciliation Table ---
  console.log('\n--- GATE 3: Row-By-Row Income Reconciliation ---')
  const { incomes: dbIncomes } = await getIncomes()
  assert(dbIncomes.length === 6, 'EXPECT INCOME COUNT = 6', `Got ${dbIncomes.length}`)

  let incomeRowMismatches = 0
  let incomeFingerprintMismatches = 0
  let incomeSumCents = 0
  let taxSumCents = 0

  console.log('-------------------------------------------------------------------------------------------------------')
  console.log('| ROW | DATE       | DESCRIPTION                  | SOURCE COM | DB COM     | TAX 1%     | FP MATCH |')
  console.log('-------------------------------------------------------------------------------------------------------')

  for (let i = 0; i < VERIFIED_FINANCIAL_INCOMES.length; i++) {
    const src = VERIFIED_FINANCIAL_INCOMES[i]
    const db = dbIncomes.find((d) => d.source_row === src.source_row)

    const srcCents = Math.round(src.commission_received * 100)
    const dbCents = db ? Math.round(db.commission_received * 100) : -1
    const diff = srcCents - dbCents

    incomeSumCents += srcCents
    taxSumCents += Math.round(src.tax_1_percent * 10000)

    const expectedFp = generateIncomeFingerprint(src.source_row, src.income_date, src.description, src.commission_received, src.tax_1_percent)
    const fpMatch = db?.fingerprint === expectedFp

    if (diff !== 0) incomeRowMismatches++
    if (!fpMatch) incomeFingerprintMismatches++

    const descPad = (src.description || '').padEnd(28, ' ').slice(0, 28)
    const rowPad = String(src.source_row).padStart(3, ' ')
    const srcAmtPad = src.commission_received.toFixed(2).padStart(10, ' ')
    const dbAmtPad = db ? db.commission_received.toFixed(2).padStart(10, ' ') : 'N/A'.padStart(10, ' ')
    const taxPad = src.tax_1_percent.toFixed(4).padStart(10, ' ')

    console.log(`| ${rowPad} | ${src.income_date} | ${descPad} | ${srcAmtPad} | ${dbAmtPad} | ${taxPad} | ${fpMatch ? 'YES     ' : 'NO      '} |`)
  }
  console.log('-------------------------------------------------------------------------------------------------------')

  assert(incomeRowMismatches === 0, 'Income Row-Level Mismatches = 0', `Got ${incomeRowMismatches}`)
  assert(incomeFingerprintMismatches === 0, 'Income Fingerprint Mismatches = 0', `Got ${incomeFingerprintMismatches}`)

  const calculatedIncomeTotal = incomeSumCents / 100
  const calculatedTaxTotal = taxSumCents / 10000
  assert(calculatedIncomeTotal === 2145.43, 'EXPECT INCOME TOTAL = 2145.43 RON', `Got ${calculatedIncomeTotal}`)
  assert(calculatedTaxTotal === 21.4543, 'EXPECT TAX TOTAL = 21.4543 RON', `Got ${calculatedTaxTotal}`)

  // --- GATE 4: Net Calculation & Overview Aggregation ---
  console.log('\n--- GATE 4: Mathematical Accuracy & Net Calculation ---')
  const overview = await getFinancialOverview()
  assert(overview.totalExpenses === 5740.17, 'Overview total expenses = 5740.17 RON', `Got ${overview.totalExpenses}`)
  assert(overview.totalIncome === 2145.43, 'Overview total income = 2145.43 RON', `Got ${overview.totalIncome}`)
  assert(overview.totalTax1Percent === 21.4543, 'Overview total 1% tax = 21.4543 RON', `Got ${overview.totalTax1Percent}`)

  const calculatedNet = Math.round((calculatedIncomeTotal - calculatedExpenseTotal) * 100) / 100
  assert(calculatedNet === -3594.74, 'EXPECT NET = -3594.74 RON (2145.43 - 5740.17)', `Got ${calculatedNet}`)
  assert(overview.netResult === -3594.74, 'Overview netResult = -3594.74 RON', `Got ${overview.netResult}`)

  // --- GATE 5: Year 2026 Normalization & NULL Field Integrity ---
  console.log('\n--- GATE 5: Year 2026 Normalization & NULL Field Integrity ---')
  const allExp2026 = dbExpenses.every((e) => e.record_year === 2026 && e.source_year_label === 2026 && !e.year_discrepancy_flag)
  assert(allExp2026, 'All 45 expense records are year 2026 (source_year_label = 2026, year_discrepancy_flag = false)')

  const allInc2026 = dbIncomes.every((i) => i.record_year === 2026 && i.source_year_label === 2026 && !i.year_discrepancy_flag)
  assert(allInc2026, 'All 6 income records are year 2026 (source_year_label = 2026, year_discrepancy_flag = false)')

  const no2025Dates = dbExpenses.every((e) => e.expense_date.startsWith('2026-')) && dbIncomes.every((i) => i.income_date.startsWith('2026-'))
  assert(no2025Dates, 'No 2025 transaction dates exist (all are 2026)')

  const inc1 = dbIncomes.find((i) => i.source_row === 1)
  assert(inc1?.insurer === null && inc1?.insurance_type === null && inc1?.policy_value === null && inc1?.commission_percent === null, 'Income NULL fields strictly preserved without guessing')

  // --- GATE 6: Canonical Categories & Suppliers Normalization ---
  console.log('\n--- GATE 6: Canonical Categories & Suppliers Normalization ---')
  const allowedCategories = new Set(['MASINA', 'TRANSPORT'])
  const allowedSuppliers = new Set(['OMV', 'MOL', 'PETROM', 'METROREX', 'AUTONOM'])

  const expCategoriesValid = dbExpenses.every((e) => allowedCategories.has(e.category))
  assert(expCategoriesValid, 'All expenses have canonical category values (MASINA, TRANSPORT only)')

  const expSuppliersValid = dbExpenses.every((e) => allowedSuppliers.has(e.supplier))
  assert(expSuppliersValid, 'All expenses have canonical supplier values (OMV, MOL, PETROM, METROREX, AUTONOM only)')

  const rawTraceable = dbExpenses.every((e) => e.raw_category && e.raw_supplier)
  assert(rawTraceable, 'All expenses preserve raw source category and raw source supplier')

  const uniqueCategories = new Set(overview.categoriesBreakdown.map((c) => c.category))
  assert(uniqueCategories.size === 2 && uniqueCategories.has('MASINA') && uniqueCategories.has('TRANSPORT'), 'Overview aggregates exactly into 2 canonical categories (MASINA, TRANSPORT)')

  const uniqueSuppliers = new Set(overview.suppliersBreakdown.map((s) => s.supplier))
  assert(uniqueSuppliers.size === 5, 'Overview aggregates exactly into 5 canonical suppliers (AUTONOM, METROREX, MOL, OMV, PETROM)')

  // --- GATE 7: Deduplication & Fingerprint Uniqueness ---
  console.log('\n--- GATE 7: Fingerprint Uniqueness & Idempotency ---')
  const expFpSet = new Set(dbExpenses.map((e) => e.fingerprint))
  assert(expFpSet.size === 45, 'All 45 expense fingerprints are unique (0 duplicates)')
  const incFpSet = new Set(dbIncomes.map((i) => i.fingerprint))
  assert(incFpSet.size === 6, 'All 6 income fingerprints are unique (0 duplicates)')

  // --- GATE 8: Currency & Tax Formatting ---
  console.log('\n--- GATE 8: Romanian Currency Formatting ---')
  assert(formatCurrencyRo(100.00) === '100,00 RON', '100.00 formats as "100,00 RON"')
  assert(formatCurrencyRo(5740.17) === '5.740,17 RON', '5740.17 formats as "5.740,17 RON"')
  assert(formatTaxRo(1.0035) === '1,0035 RON', '1.0035 tax formats as "1,0035 RON"')
  assert(formatTaxRo(0) === '0,00 RON', '0 tax formats as "0,00 RON"')

  // --- GATE 9: CRUD Operations ---
  console.log('\n--- GATE 9: CRUD Database Operations ---')
  const tempExp = await createExpense({
    expense_date: '2026-11-01',
    description: 'Test Reconciliere Audit',
    category: 'masina',
    supplier: 'omv',
    net_amount: 50.00,
    total_amount: 50.00,
  })
  assert(tempExp.description === 'Test Reconciliere Audit', 'createExpense successfully creates record')
  assert(tempExp.category === 'MASINA', 'createExpense normalizes category to MASINA')
  assert(tempExp.supplier === 'OMV', 'createExpense normalizes supplier to OMV')

  const updatedExp = await updateExpense(tempExp.id, { description: 'Test Reconciliere Audit Modificat', category: 'transport', supplier: 'metrorex' })
  assert(updatedExp?.description === 'Test Reconciliere Audit Modificat', 'updateExpense successfully updates record')
  assert(updatedExp?.category === 'TRANSPORT', 'updateExpense normalizes category to TRANSPORT')
  assert(updatedExp?.supplier === 'METROREX', 'updateExpense normalizes supplier to METROREX')

  const deleteRes = await deleteExpense(tempExp.id)
  assert(deleteRes === true, 'deleteExpense successfully deletes record')

  // --- GATE 10: Security & RLS ---
  console.log('\n--- GATE 10: Security & Authorization ---')
  const { data: anonData, error: anonErr } = await anonClient.from('insurance_financial_expenses').select('*')
  const isAnonBlocked = anonErr !== null || !anonData || anonData.length === 0
  assert(isAnonBlocked, 'Anonymous unauthenticated client cannot access private insurance financial expenses')

  console.log('\n================================================================')
  console.log(`FORENSIC RECONCILIATION COMPLETE: ${passedGates}/${totalGates} GATES PASSED`)
  console.log('================================================================\n')
}

runForensicAudit().catch(console.error)
