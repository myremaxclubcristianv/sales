// Mock global WebSocket for supabase-js in Node 20
;(global as any).WebSocket = class { constructor() {} }

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import { VERIFIED_CHESTERTONS_REQUESTS } from '../src/lib/data/verified-chestertons-requests-dataset'

const file1Path = '/Users/cristianvaduva/Downloads/exportcereri650861915202610713381138618.csv'
const file2Path = '/Users/cristianvaduva/Downloads/exportcereri650861915202610713383238394.csv'

function parseCSV(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf8')
  const rows: string[][] = []
  let currentRow: string[] = []
  let currentField = ''
  let insideQuotes = false

  for (let i = 0; i < content.length; i++) {
    const char = content[i]
    const nextChar = content[i + 1]

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"'
        i++
      } else {
        insideQuotes = !insideQuotes
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentField)
      currentField = ''
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++
      }
      currentRow.push(currentField)
      currentField = ''
      if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0].trim() !== '')) {
        rows.push(currentRow)
      }
      currentRow = []
    } else {
      currentField += char
    }
  }
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField)
    if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0].trim() !== '')) {
      rows.push(currentRow)
    }
  }
  return rows
}

const envPath = path.join(__dirname, '../.env.local')
const env = fs.readFileSync(envPath, 'utf8')
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)![1].trim()
const serviceKey = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)![1].trim()
const adminClient = createClient(url, serviceKey, { auth: { persistSession: false } })

async function runForensicAudit() {
  console.log('================================================================')
  console.log('  SALES CRM — CHESTERTONS REQUESTS FORENSIC AUDIT & VERIFICATION ')
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

  // --- GATE 1: SOURCE FILES PARSING & VERIFICATION ---
  console.log('--- GATE 1: Source Files Structure ---')
  const f1 = parseCSV(file1Path)
  const f2 = parseCSV(file2Path)
  const f1Rows = f1.slice(1)
  const f2Rows = f2.slice(1)

  assert(f1Rows.length === 120, 'Source File 1 has exactly 120 data rows', `Got ${f1Rows.length}`)
  assert(f2Rows.length === 109, 'Source File 2 has exactly 109 data rows', `Got ${f2Rows.length}`)
  assert(f1[0].length === 38 && f2[0].length === 38, 'Both source files have exactly 38 columns', `F1=${f1[0].length}, F2=${f2[0].length}`)

  // --- GATE 2: ID UNIQUENESS & ZERO OVERLAP ---
  console.log('\n--- GATE 2: Source ID Uniqueness & Non-Overlap ---')
  const f1Ids = new Set(f1Rows.map((r) => r[0]))
  const f2Ids = new Set(f2Rows.map((r) => r[0]))

  let overlapCount = 0
  f1Ids.forEach((id) => {
    if (f2Ids.has(id)) overlapCount++
  })

  assert(f1Ids.size === 120, 'Source File 1 has 120 unique IDs (0 duplicates)', `Got ${f1Ids.size}`)
  assert(f2Ids.size === 109, 'Source File 2 has 109 unique IDs (0 duplicates)', `Got ${f2Ids.size}`)
  assert(overlapCount === 0, 'Cross-file ID overlap is strictly 0', `Got ${overlapCount}`)

  // --- GATE 3: CRM IMPORTED DATASET COUNT ---
  console.log('\n--- GATE 3: CRM Dataset Totals ---')
  assert(VERIFIED_CHESTERTONS_REQUESTS.length === 229, 'Total imported records in CRM dataset is exactly 229', `Got ${VERIFIED_CHESTERTONS_REQUESTS.length}`)

  const importedIdSet = new Set(VERIFIED_CHESTERTONS_REQUESTS.map((r) => r.import_source_id))
  assert(importedIdSet.size === 229, 'All 229 imported records have distinct unique IDs', `Got ${importedIdSet.size}`)

  // --- GATE 4: TIP LEAD DISTRIBUTION ---
  console.log('\n--- GATE 4: Tip Lead Breakdown ---')
  const apartments = VERIFIED_CHESTERTONS_REQUESTS.filter((r) => r.tip_lead === 'Apartament').length
  const houses = VERIFIED_CHESTERTONS_REQUESTS.filter((r) => r.tip_lead === 'Casa').length
  assert(apartments === 120, 'Tip Lead: Apartament count is exactly 120', `Got ${apartments}`)
  assert(houses === 109, 'Tip Lead: Casa count is exactly 109', `Got ${houses}`)

  // --- GATE 5: STATUS BREAKDOWN ---
  console.log('\n--- GATE 5: Status Distribution ---')
  const activeCount = VERIFIED_CHESTERTONS_REQUESTS.filter((r) => r.parsed_status === 'Activa').length
  const retractedCount = VERIFIED_CHESTERTONS_REQUESTS.filter((r) => r.parsed_status === 'Retrasa').length
  const blankCount = VERIFIED_CHESTERTONS_REQUESTS.filter((r) => r.parsed_status === 'Blank').length
  assert(activeCount === 177, 'Status: Activa is exactly 177', `Got ${activeCount}`)
  assert(retractedCount === 51, 'Status: Retrasa is exactly 51', `Got ${retractedCount}`)
  assert(blankCount === 1, 'Status: Blank is exactly 1', `Got ${blankCount}`)

  // --- GATE 6: CONTACT INFORMATION ---
  console.log('\n--- GATE 6: Contact Information Verification ---')
  let contactValid = 0
  VERIFIED_CHESTERTONS_REQUESTS.forEach((r) => {
    if ((r.email && r.email.trim()) || (r.telefon && r.telefon.trim())) {
      contactValid++
    }
  })
  assert(contactValid === 229, 'All 229 records contain at least Email OR Phone', `Got ${contactValid}/229`)

  // --- GATE 7: ORIGINAL SURSA DISTRIBUTION PRESERVATION ---
  console.log('\n--- GATE 7: Original Sursa Field Distribution Preservation ---')
  const sursaMap: Record<string, number> = {}
  VERIFIED_CHESTERTONS_REQUESTS.forEach((r) => {
    const s = r.sursa || 'BLANK'
    sursaMap[s] = (sursaMap[s] || 0) + 1
  })
  assert(sursaMap['Storia.ro + Olx.ro'] === 67, 'Sursa: Storia.ro + Olx.ro is 67', `Got ${sursaMap['Storia.ro + Olx.ro']}`)
  assert(sursaMap['Imobiliare.ro'] === 89, 'Sursa: Imobiliare.ro is 89', `Got ${sursaMap['Imobiliare.ro']}`)
  assert(sursaMap['Altele'] === 29, 'Sursa: Altele is 29', `Got ${sursaMap['Altele']}`)
  assert(sursaMap['chestertons.ro'] === 11, 'Sursa: chestertons.ro is 11', `Got ${sursaMap['chestertons.ro']}`)
  assert(sursaMap['BLANK'] === 6, 'Sursa: Blank is 6', `Got ${sursaMap['BLANK']}`)

  // --- GATE 8: 100% FULL ROW-BY-ROW RECONCILIATION AGAINST RAW SOURCE FILES ---
  console.log('\n--- GATE 8: Full 229/229 Row-by-Row Reconciliation ---')
  const allSourceRows = [...f1Rows, ...f2Rows]
  const sourceMap = new Map<string, string[]>()
  allSourceRows.forEach((r) => {
    sourceMap.set(r[0].trim(), r)
  })

  let fieldMismatches = 0
  let checkedRecords = 0

  for (const crmReq of VERIFIED_CHESTERTONS_REQUESTS) {
    const srcRow = sourceMap.get(crmReq.import_source_id)
    if (!srcRow) {
      console.error(`Missing source row for ID ${crmReq.import_source_id}`)
      fieldMismatches++
      continue
    }
    checkedRecords++

    // Check key fields
    const getClean = (val: string | null | undefined) => (val ? val.trim() : '')

    if (getClean(crmReq.cumparator) !== getClean(srcRow[5])) {
      console.error(`Name mismatch on ${crmReq.id}: CRM="${crmReq.cumparator}" vs SRC="${srcRow[5]}"`)
      fieldMismatches++
    }
    if (getClean(crmReq.email) !== getClean(srcRow[6])) {
      console.error(`Email mismatch on ${crmReq.id}: CRM="${crmReq.email}" vs SRC="${srcRow[6]}"`)
      fieldMismatches++
    }
    if (getClean(crmReq.telefon) !== getClean(srcRow[7])) {
      console.error(`Phone mismatch on ${crmReq.id}: CRM="${crmReq.telefon}" vs SRC="${srcRow[7]}"`)
      fieldMismatches++
    }
    if (getClean(crmReq.tip_lead) !== getClean(srcRow[8])) {
      console.error(`Tip Lead mismatch on ${crmReq.id}: CRM="${crmReq.tip_lead}" vs SRC="${srcRow[8]}"`)
      fieldMismatches++
    }
    if (getClean(crmReq.sursa) !== getClean(srcRow[14])) {
      console.error(`Sursa mismatch on ${crmReq.id}: CRM="${crmReq.sursa}" vs SRC="${srcRow[14]}"`)
      fieldMismatches++
    }
    if (getClean(crmReq.buget1) !== getClean(srcRow[19])) {
      console.error(`Buget1 mismatch on ${crmReq.id}: CRM="${crmReq.buget1}" vs SRC="${srcRow[19]}"`)
      fieldMismatches++
    }
    if (getClean(crmReq.buget2) !== getClean(srcRow[20])) {
      console.error(`Buget2 mismatch on ${crmReq.id}: CRM="${crmReq.buget2}" vs SRC="${srcRow[20]}"`)
      fieldMismatches++
    }
    if (getClean(crmReq.nr_camere) !== getClean(srcRow[32])) {
      console.error(`Nr camere mismatch on ${crmReq.id}: CRM="${crmReq.nr_camere}" vs SRC="${srcRow[32]}"`)
      fieldMismatches++
    }
    if (getClean(crmReq.status_cerere) !== getClean(srcRow[37])) {
      console.error(`Status mismatch on ${crmReq.id}: CRM="${crmReq.status_cerere}" vs SRC="${srcRow[37]}"`)
      fieldMismatches++
    }
    if (getClean(crmReq.id_intern) !== getClean(srcRow[36])) {
      console.error(`Idintern mismatch on ${crmReq.id}: CRM="${crmReq.id_intern}" vs SRC="${srcRow[36]}"`)
      fieldMismatches++
    }
    if (getClean(crmReq.observatii) !== getClean(srcRow[15])) {
      console.error(`Observatii mismatch on ${crmReq.id}: CRM="${crmReq.observatii}" vs SRC="${srcRow[15]}"`)
      fieldMismatches++
    }
  }

  assert(checkedRecords === 229, 'Reconciled all 229 records row-by-row', `Checked ${checkedRecords}`)
  assert(fieldMismatches === 0, 'Total field mismatches across all 229 records is strictly 0', `Got ${fieldMismatches}`)

  // --- GATE 9: SPECIFIC KNOWN CHESTERTONS SAMPLES VERIFICATION ---
  console.log('\n--- GATE 9: Specific Sample Records Forensic Verification ---')
  const sampleIds = ['CC75240', 'CC76827', 'CC81774', 'CC88558', 'CC89500', 'CC91490', 'CC86572']
  sampleIds.forEach((sId) => {
    const req = VERIFIED_CHESTERTONS_REQUESTS.find((r) => r.import_source_id === sId)
    const src = sourceMap.get(sId)
    assert(
      !!req && !!src && req.cumparator.trim() === src[5].trim(),
      `Sample ${sId} (${req?.cumparator}) matches source exactly`,
      `CRM=${req?.cumparator}, SRC=${src?.[5]}`
    )
  })

  // --- GATE 10: CRM BASELINE INTEGRITY (ZERO REGRESSION) ---
  console.log('\n--- GATE 10: Existing CRM Zero-Regression Baseline Check ---')
  const { count: clientCount, error: cErr } = await adminClient
    .from('clients')
    .select('*', { count: 'exact', head: true })
  assert(!cErr && clientCount === 66, `Existing clients count is UNCHANGED (66 total / 25 personal)`, `Got ${clientCount}, err: ${cErr?.message}`)

  const { count: leadCount, error: lErr } = await adminClient
    .from('leads')
    .select('*', { count: 'exact', head: true })
  assert(!lErr && leadCount === 5, `Existing leads count is UNCHANGED (5)`, `Got ${leadCount}, err: ${lErr?.message}`)

  const { count: propCount, error: pErr } = await adminClient
    .from('properties')
    .select('*', { count: 'exact', head: true })
  assert(!pErr && propCount === 391, `Existing properties count is UNCHANGED (391)`, `Got ${propCount}, err: ${pErr?.message}`)

  console.log('\n================================================================')
  console.log(`FINAL RESULT: ${passedGates} / ${totalGates} GATES PASSED`)
  console.log('================================================================')

  if (passedGates === totalGates) {
    process.exit(0)
  } else {
    process.exit(1)
  }
}

runForensicAudit()
