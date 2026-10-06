// Mock global WebSocket for supabase-js in Node
;(global as unknown as { WebSocket: unknown }).WebSocket = class { constructor() {} }

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import { parseAndValidateCnp } from '../src/lib/utils/cnp'

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

async function runBackfill() {
  console.log('=== STARTING CONTROLLED AUDITED BIRTHDAY BACKFILL ===\n')

  const { data: clients, error } = await supabase
    .from('clients')
    .select(`
      id,
      first_name,
      last_name,
      cnp,
      date_of_birth,
      category,
      client_relationships (relationship_type)
    `)

  if (error) {
    console.error('Fetch error:', error)
    process.exit(1)
  }

  const clientList = clients || []
  console.log(`Scanned ${clientList.length} total clients in database.\n`)

  let dobDerived = 0
  let dobAlreadyPresent = 0
  let dobConflicts = 0
  let invalidCnp = 0
  let birthdayEventsCreated = 0

  const categories = {
    insurance: 0,
    realEstate: 0,
    credite: 0,
    contacts: 0,
  }

  for (const client of clientList) {
    const rawCnp = client.cnp
    const existingDob = client.date_of_birth

    // Classify category
    const cat = (client.category || '').toUpperCase()
    const rels = (client.client_relationships || []).map((r: { relationship_type: string }) => r.relationship_type.toLowerCase())

    const isIns = cat === 'INSURANCE' || rels.includes('insurance')
    const isRe = cat === 'REAL_ESTATE' || cat === 'REAL ESTATE' || rels.some((r: string) => ['buyer', 'seller', 'landlord', 'investor'].includes(r))
    const isCredit = cat === 'CREDIT' || cat === 'CREDITE' || rels.includes('credit')
    const isContact = !isIns && !isRe && !isCredit

    if (isIns) categories.insurance++
    if (isRe) categories.realEstate++
    if (isCredit) categories.credite++
    if (isContact) categories.contacts++

    if (rawCnp) {
      const cnpValidation = parseAndValidateCnp(rawCnp)

      if (!cnpValidation.isValid || !cnpValidation.dateOfBirth) {
        console.warn(`  ⚠️ Invalid CNP for ${client.first_name} ${client.last_name}: ${cnpValidation.error}`)
        invalidCnp++
      } else {
        const derivedDob = cnpValidation.dateOfBirth

        if (existingDob) {
          if (existingDob === derivedDob) {
            dobAlreadyPresent++
          } else {
            console.warn(`  ⚠️ DISCREPANCY for ${client.first_name} ${client.last_name}: existing DOB = ${existingDob} vs CNP derived = ${derivedDob}. PRESERVING EXISTING.`)
            dobConflicts++
          }
        } else {
          // Missing DOB + Valid CNP -> Populate!
          const { error: updateErr } = await supabase
            .from('clients')
            .update({ date_of_birth: derivedDob })
            .eq('id', client.id)

          if (updateErr) {
            console.error(`  ❌ Failed to update DOB for ${client.id}:`, updateErr)
          } else {
            dobDerived++
            console.log(`  ✔ Populated DOB for ${client.first_name} ${client.last_name}: ${derivedDob} (Sex: ${cnpValidation.sex}, Age: ${cnpValidation.age})`)

            // Audit log without exposing raw CNP
            await supabase.from('audit_logs').insert({
              action: 'DOB_DERIVED',
              entity_type: 'clients',
              entity_id: client.id,
              old_values: { date_of_birth: null },
              new_values: {
                date_of_birth: derivedDob,
                source: 'CNP',
                timestamp: new Date().toISOString(),
              },
            })

            // Sync personal_events
            const { data: existingEvent } = await supabase
              .from('personal_events')
              .select('id')
              .eq('client_id', client.id)
              .eq('event_type', 'birthday')
              .maybeSingle()

            if (!existingEvent) {
              await supabase.from('personal_events').insert({
                client_id: client.id,
                event_type: 'birthday',
                event_date: derivedDob,
                title: `Zi de naștere: ${client.first_name} ${client.last_name}`,
                reminder_days: 7,
              })
              birthdayEventsCreated++
            }
          }
        }
      }
    } else if (existingDob) {
      dobAlreadyPresent++
      // Sync personal_events
      const { data: existingEvent } = await supabase
        .from('personal_events')
        .select('id')
        .eq('client_id', client.id)
        .eq('event_type', 'birthday')
        .maybeSingle()

      if (!existingEvent) {
        await supabase.from('personal_events').insert({
          client_id: client.id,
          event_type: 'birthday',
          event_date: existingDob,
          title: `Zi de naștere: ${client.first_name} ${client.last_name}`,
          reminder_days: 7,
        })
        birthdayEventsCreated++
      }
    }
  }

  // Fetch final total birthday events in personal_events
  const { count: totalBirthdays } = await supabase
    .from('personal_events')
    .select('id', { count: 'exact', head: true })
    .eq('event_type', 'birthday')

  console.log('\n=== BACKFILL EXECUTION SUMMARY ===')
  console.log(`People scanned: ${clientList.length}`)
  console.log(`DOB derived: ${dobDerived}`)
  console.log(`DOB already present: ${dobAlreadyPresent}`)
  console.log(`DOB conflicts: ${dobConflicts}`)
  console.log(`Invalid CNP: ${invalidCnp}`)
  console.log(`Birthday events: ${totalBirthdays || birthdayEventsCreated}`)
  console.log(`\nINSURANCE: ${categories.insurance}`)
  console.log(`REAL ESTATE: ${categories.realEstate}`)
  console.log(`CREDITE: ${categories.credite}`)
  console.log(`CONTACTS: ${categories.contacts}`)
}

runBackfill()
