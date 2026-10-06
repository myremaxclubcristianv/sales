// Mock global WebSocket for supabase-js in Node
;(global as unknown as { WebSocket: unknown }).WebSocket = class { constructor() {} }

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import { parseAndValidateCnp } from '../src/lib/utils/cnp'
import { VERIFIED_INSURANCE_CLIENTS } from '../src/lib/data/verified-insurance-dataset'

const envPath = path.join(__dirname, '../.env.local')
const env = fs.readFileSync(envPath, 'utf8')
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)
const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)

if (!urlMatch || !keyMatch) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim(), {
  auth: { persistSession: false },
})

async function runAudit() {
  console.log('========================================')
  console.log('   CRM PERSON & BIRTHDAY SOURCE AUDIT   ')
  console.log('========================================\n')

  // 1. Clients table
  const { data: clients, error: clientErr } = await supabase
    .from('clients')
    .select(`
      id,
      first_name,
      last_name,
      category,
      cnp,
      date_of_birth,
      phone,
      email,
      created_at,
      client_relationships ( relationship_type )
    `)

  if (clientErr) {
    console.error('Error fetching clients:', clientErr)
    return
  }

  console.log(`[CLIENTS TABLE] Total records: ${clients?.length || 0}`)
  let clientsWithDob = 0
  let clientsWithCnp = 0
  let clientsCnpValid = 0
  let clientsCnpInvalid = 0
  let clientsMissingDobWithValidCnp = 0
  let clientsDobCnpConflict = 0

  const clientCategories: Record<string, number> = {}

  for (const c of clients || []) {
    const cat = c.category || 'UNASSIGNED'
    clientCategories[cat] = (clientCategories[cat] || 0) + 1
    if (c.date_of_birth) clientsWithDob++
    if (c.cnp) {
      clientsWithCnp++
      const validation = parseAndValidateCnp(c.cnp)
      if (validation.isValid && validation.dateOfBirth) {
        clientsCnpValid++
        if (!c.date_of_birth) {
          clientsMissingDobWithValidCnp++
          console.log(`  [CAN BACKFILL] Client: ${c.first_name} ${c.last_name} | Derived DOB: ${validation.dateOfBirth} | Sex: ${validation.sex} | Age: ${validation.age}`)
        } else if (c.date_of_birth !== validation.dateOfBirth) {
          clientsDobCnpConflict++
          console.log(`  [CONFLICT] Client: ${c.first_name} ${c.last_name} | Existing DOB: ${c.date_of_birth} vs CNP: ${validation.dateOfBirth}`)
        }
      } else {
        clientsCnpInvalid++
        console.log(`  [INVALID CNP] Client: ${c.first_name} ${c.last_name} | Reason: ${validation.error}`)
      }
    }
  }

  console.log(`  Categories:`, clientCategories)
  console.log(`  With DOB: ${clientsWithDob}`)
  console.log(`  With CNP: ${clientsWithCnp} (Valid: ${clientsCnpValid}, Invalid: ${clientsCnpInvalid})`)
  console.log(`  Missing DOB with Valid CNP: ${clientsMissingDobWithValidCnp}`)
  console.log(`  DOB/CNP Conflicts: ${clientsDobCnpConflict}\n`)

  // 2. Verified Insurance Dataset
  console.log(`[VERIFIED INSURANCE DATASET] Total records: ${VERIFIED_INSURANCE_CLIENTS.length}`)
  let insWithCnp = 0
  let insCnpValid = 0
  for (const ic of VERIFIED_INSURANCE_CLIENTS) {
    if (ic.cnp) {
      insWithCnp++
      const val = parseAndValidateCnp(ic.cnp)
      if (val.isValid) {
        insCnpValid++
        console.log(`  [INSURANCE PERSON] ${ic.full_name} | Valid CNP -> DOB: ${val.dateOfBirth} | Policies: ${ic.policies.length}`)
      } else {
        console.log(`  [INSURANCE PERSON] ${ic.full_name} | Invalid CNP (${val.error})`)
      }
    } else {
      console.log(`  [INSURANCE PERSON] ${ic.full_name} | No CNP | Policies: ${ic.policies.length}`)
    }
  }
  console.log(`  Insurance with CNP: ${insWithCnp} (Valid: ${insCnpValid})\n`)

  // 3. Contacts table
  const { data: contacts, error: contactErr } = await supabase
    .from('contacts')
    .select('id, first_name, last_name, category, phone, email, client_id, company_id')

  console.log(`[CONTACTS TABLE] Total records: ${contacts?.length || 0}`)

  // Check insurance client matching
  console.log(`\n[CHECKING INSURANCE DATASET MATCHING]`)
  let matchedIns = 0
  let unmatchedIns = 0
  for (const ic of VERIFIED_INSURANCE_CLIENTS) {
    const val = ic.cnp ? parseAndValidateCnp(ic.cnp) : { isValid: false, dateOfBirth: null }
    const match = (clients || []).find((c) => {
      const cName = `${c.first_name} ${c.last_name}`.toLowerCase().trim()
      const icName = ic.full_name.toLowerCase().trim()
      const cPhone = (c.phone || '').replace(/\D/g, '')
      const icPhone = (ic.canonical_phone || ic.phone || '').replace(/\D/g, '')
      return (cPhone && icPhone && cPhone.length >= 8 && cPhone === icPhone) ||
        cName === icName ||
        (Boolean(c.cnp) && Boolean(ic.cnp) && c.cnp === ic.cnp)
    })
    if (match) {
      matchedIns++
      console.log(`  MATCH: ${ic.full_name} -> Client ID: ${match.id} (DOB: ${match.date_of_birth || 'none'}, CNP in client: ${Boolean(match.cnp)})`)
    } else {
      unmatchedIns++
      console.log(`  UNMATCHED: ${ic.full_name} (CNP: ${ic.cnp ? 'YES' : 'NO'}, DOB from CNP: ${val.dateOfBirth || 'none'})`)
    }
  }
  console.log(`  Matched: ${matchedIns}, Unmatched: ${unmatchedIns}`)
}

runAudit()
