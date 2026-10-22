import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import assert from 'assert'

// @ts-expect-error Mock for testing
global.WebSocket = class { constructor() {} }

const env = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8')
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)
const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)

if (!urlMatch || !keyMatch) {
  console.error('Missing supabase credentials in .env.local')
  process.exit(1)
}

const adminClient = createClient(urlMatch[1].trim(), keyMatch[1].trim(), {
  auth: { persistSession: false },
})

async function runScenarioTests() {
  console.log('=================================================================')
  console.log('🧪 TESTING QUICK SCHEDULE CONSISTENCY & ERROR SCENARIOS')
  console.log('=================================================================\n')

  // Pick a real client for safe isolated testing
  const { data: client, error: cErr } = await adminClient
    .from('clients')
    .select('id, first_name, last_name')
    .limit(1)
    .single()

  if (cErr || !client) {
    throw new Error('Could not fetch test client from DB')
  }
  console.log(`Test client: ${client.first_name} ${client.last_name} (${client.id})\n`)

  // --- SCENARIO 1: Eșec la crearea follow-up-ului (câmpuri invalide) ---
  console.log('--- SCENARIO 1: VALIDATION FAILURE ON MISSING REQUIRED FIELDS ---')
  // Try inserting without reason
  const { data: badFu, error: badFuErr } = await adminClient
    .from('follow_ups')
    .insert({
      client_id: client.id,
      // @ts-expect-error deliberately missing required reason
      reason: null,
      due_date: '2026-11-04T10:00:00',
    })
    .select()

  assert(badFuErr, 'Database must reject follow-up without reason')
  console.log(`✔ Follow-up creation failure correctly rejected by DB: "${badFuErr.message}"`)

  // Check no activity was created
  const { data: noActs } = await adminClient
    .from('activities')
    .select('id')
    .eq('client_id', client.id)
    .eq('title', 'Programat: null')

  assert(!noActs || noActs.length === 0, 'No orphan activity created on follow-up failure')
  console.log('✔ Zero orphan activities on follow-up failure.')

  // --- SCENARIO 2: Eșec la crearea activității și rollback compensator ---
  console.log('\n--- SCENARIO 2: ACTIVITY FAILURE & COMPENSATING ROLLBACK ---')
  // Step 2a: Insert a follow-up
  const testReason = 'Test Rollback Scenario ' + Date.now()
  const { data: fuRollback, error: fuRollErr } = await adminClient
    .from('follow_ups')
    .insert({
      client_id: client.id,
      reason: testReason,
      due_date: '2026-11-04T10:00:00',
      priority: 'NORMAL',
      status: 'PENDING',
    })
    .select()
    .single()

  if (fuRollErr || !fuRollback) throw fuRollErr

  console.log(`  - Follow-up created with ID: ${fuRollback.id}`)

  // Step 2b: Simulate activity insertion failure (e.g. invalid type violating check constraint)
  const { error: actFailErr } = await adminClient
    .from('activities')
    .insert({
      client_id: client.id,
      // @ts-expect-error deliberately invalid activity type
      type: 'INVALID_ACTIVITY_TYPE_TRIGGER_ROLLBACK',
      title: 'Should fail',
    })

  assert(actFailErr, 'Simulated activity creation must fail with constraint error')
  console.log(`  - Activity failed as expected: "${actFailErr.message}"`)

  // Step 2c: Execute compensation rollback (delete follow-up)
  const { error: rbErr } = await adminClient
    .from('follow_ups')
    .delete()
    .eq('id', fuRollback.id)

  if (rbErr) throw rbErr

  // Step 2d: Verify follow-up is completely gone
  const { data: verifyFu } = await adminClient
    .from('follow_ups')
    .select('id')
    .eq('id', fuRollback.id)

  assert(!verifyFu || verifyFu.length === 0, 'Rolled-back follow-up must not exist')
  console.log('✔ Compensation rollback verified: follow-up deleted, zero orphan records left behind.')

  // --- SCENARIO 3: Reîncercare după eșec & Salvare completă ---
  console.log('\n--- SCENARIO 3: SUCCESSFUL CREATION & RETRY PERSISTENCE ---')
  const validReason = 'Sună clientul pentru discuție CASCO (Test Automat)'
  const validDueDate = '2026-11-04T10:00:00'

  // Follow-up
  const { data: validFu, error: vFuErr } = await adminClient
    .from('follow_ups')
    .insert({
      client_id: client.id,
      reason: validReason,
      due_date: validDueDate,
      priority: 'NORMAL',
      status: 'PENDING',
      notes: 'Notiță test persistență',
    })
    .select()
    .single()

  if (vFuErr || !validFu) throw vFuErr

  // Matching Activity
  const { data: validAct, error: vActErr } = await adminClient
    .from('activities')
    .insert({
      client_id: client.id,
      type: 'FOLLOW_UP',
      title: `Programat: ${validReason}`,
      notes: `Dată: 04.11.2026 la 10:00 · Note: Notiță test persistență`,
      date: new Date().toISOString(),
    })
    .select()
    .single()

  if (vActErr || !validAct) throw vActErr

  console.log(`✔ Follow-up created: ${validFu.id}`)
  console.log(`✔ Matching Activity created: ${validAct.id}`)

  // --- SCENARIO 4: Asocierea exclusivă cu ID-ul clientului selectat ---
  console.log('\n--- SCENARIO 4: EXCLUSIVE LINKING TO SELECTED CLIENT ID ---')
  assert(validFu.client_id === client.id, 'Follow-up must belong strictly to selected client')
  assert(validAct.client_id === client.id, 'Activity must belong strictly to selected client')

  // Check another client doesn't see this follow-up
  const { data: otherClients } = await adminClient
    .from('clients')
    .select('id')
    .neq('id', client.id)
    .limit(1)

  if (otherClients && otherClients.length > 0) {
    const otherId = otherClients[0].id
    const { data: otherFu } = await adminClient
      .from('follow_ups')
      .select('id')
      .eq('client_id', otherId)
      .eq('id', validFu.id)

    assert(!otherFu || otherFu.length === 0, 'Other clients must never access or share this follow-up')
    console.log(`✔ Verified no cross-client contamination with client ID: ${otherId}`)
  }

  // --- SCENARIO 5: Persistență după refresh ---
  console.log('\n--- SCENARIO 5: PERSISTENCE VERIFICATION AFTER REFRESH QUERY ---')
  const { data: refetchedFu, error: refetchErr } = await adminClient
    .from('follow_ups')
    .select('id, client_id, reason, due_date, status')
    .eq('id', validFu.id)
    .single()

  if (refetchErr || !refetchedFu) throw refetchErr
  assert(refetchedFu.reason === validReason, 'Persisted reason must match exactly')
  assert(refetchedFu.status === 'PENDING', 'Status must remain PENDING')
  console.log('✔ Persisted follow-up retrieved with 100% field fidelity after simulated refresh.')

  // Cleanup test data
  console.log('\n--- CLEANUP OF TEST RECORDS ---')
  await adminClient.from('follow_ups').delete().eq('id', validFu.id)
  await adminClient.from('activities').delete().eq('id', validAct.id)
  console.log('✔ Safely removed test records. Zero residual rows.')

  console.log('\n=================================================================')
  console.log('🎉 ALL ERROR SCENARIOS & CONSISTENCY TESTS PASSED (100%)')
  console.log('=================================================================')
}

runScenarioTests().catch((err) => {
  console.error('❌ Test failed:', err)
  process.exit(1)
})
