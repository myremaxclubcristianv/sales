const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Mock global WebSocket for supabase-js in Node 20
global.WebSocket = class { constructor() {} };

const env = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);
const anonKeyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

if (!urlMatch || !keyMatch || !anonKeyMatch) {
  console.error('Missing supabase credentials in .env.local');
  process.exit(1);
}

const adminClient = createClient(urlMatch[1].trim(), keyMatch[1].trim(), { auth: { persistSession: false } });
const anonClient = createClient(urlMatch[1].trim(), anonKeyMatch[1].trim(), { auth: { persistSession: false } });

const ALL_STATUSES = [
  'NEW',
  'NOT_CONTACTED',
  'CONTACTED',
  'IN_DISCUSSION',
  'ACTIVE',
  'OFFERING',
  'IN_PROGRESS',
  'FOLLOW_UP',
  'CALL_BACK',
  'WAITING_CLIENT',
  'WAITING_DOCUMENTS',
  'CONVERTED',
  'REFUSED',
  'NO_RESPONSE',
  'INACTIVE',
  'LOST'
];

async function runStatusTestSuite() {
  console.log('=== RUNNING CLIENT STATUS VERIFICATION TEST SUITE ===\n');

  // 1. Initial State Check
  const { data: initialClients, error: initError } = await adminClient
    .from('clients')
    .select('id, first_name, last_name, status, category');
  
  if (initError) throw initError;
  console.log(`[1] INITIAL STATE: ${initialClients.length} clients in database.`);
  if (initialClients.length < 17) {
    throw new Error(`Expected at least 17 clients, found ${initialClients.length}`);
  }

  // Verify all have a status
  const withoutStatus = initialClients.filter(c => !c.status);
  if (withoutStatus.length > 0) {
    throw new Error(`Found ${withoutStatus.length} clients without status`);
  }
  console.log(`✔ All ${initialClients.length} existing clients have valid status values.`);

  // 2. Test inserting a test client with default status
  console.log('\n[2] TESTING DEFAULT STATUS ON INSERT:');
  const { data: testClient, error: insertError } = await adminClient
    .from('clients')
    .insert({
      first_name: 'StatusTest',
      last_name: 'Client',
      phone: '+40799887766',
      email: 'statustest@example.com',
      lead_source: 'phone'
    })
    .select()
    .single();

  if (insertError) throw insertError;
  console.log(`✔ Created test client: ${testClient.id} with status: ${testClient.status}`);
  if (testClient.status !== 'NOT_CONTACTED') {
    throw new Error(`Expected default NOT_CONTACTED, got ${testClient.status}`);
  }

  // 3. Test transitioning across all 16 statuses
  console.log('\n[3] TESTING ALL 16 STATUS VALUES PERSISTENCE:');
  for (const st of ALL_STATUSES) {
    const { data: updated, error: updateErr } = await adminClient
      .from('clients')
      .update({ status: st })
      .eq('id', testClient.id)
      .select('id, status')
      .single();

    if (updateErr) throw new Error(`Failed to update to ${st}: ${updateErr.message}`);
    if (updated.status !== st) throw new Error(`Expected ${st}, got ${updated.status}`);
  }
  console.log(`✔ Successfully cycled test client through all 16 operational statuses.`);

  // 4. Test invalid status rejection
  console.log('\n[4] TESTING INVALID STATUS REJECTION (CHECK CONSTRAINT):');
  const { error: badStatusError } = await adminClient
    .from('clients')
    .update({ status: 'INVALID_STATUS_XYZ' })
    .eq('id', testClient.id);

  if (!badStatusError) {
    throw new Error('Database allowed invalid status "INVALID_STATUS_XYZ"');
  }
  console.log(`✔ Database check constraint successfully blocked invalid status: "${badStatusError.message}"`);

  // 5. Test status filtering and count derivation
  console.log('\n[5] TESTING STATUS FILTERING AND COUNTS:');
  for (const st of ['NOT_CONTACTED', 'IN_DISCUSSION', 'FOLLOW_UP', 'CONVERTED']) {
    const { count, error: filterErr } = await adminClient
      .from('clients')
      .select('id', { count: 'exact', head: true })
      .eq('status', st);
    
    if (filterErr) throw filterErr;
    console.log(`  - Status [${st}]: ${count} real clients`);
  }
  console.log('✔ Real database-backed status queries operational.');

  // 6. Test RLS Security (Anonymous Access)
  console.log('\n[6] TESTING RLS ON CLIENT STATUS:');
  const { data: anonData } = await anonClient
    .from('clients')
    .select('id, status');
  
  if (anonData && anonData.length > 0) {
    throw new Error(`RLS Violation: Anonymous user read ${anonData.length} client records!`);
  }
  console.log('✔ RLS Verified: Anonymous user cannot read clients (0 records returned).');

  // Anonymous update attempt
  await anonClient
    .from('clients')
    .update({ status: 'ACTIVE' })
    .eq('id', testClient.id);

  const { data: verifyClient } = await adminClient
    .from('clients')
    .select('status')
    .eq('id', testClient.id)
    .single();

  if (verifyClient?.status === 'ACTIVE') {
    throw new Error('RLS Violation: Anonymous user was able to modify client status!');
  }
  console.log('✔ RLS Verified: Anonymous user cannot update client status.');

  // 7. Cleanup
  console.log('\n[7] CLEANING UP TEST CLIENT:');
  await adminClient.from('clients').delete().eq('id', testClient.id);
  
  const { data: finalClients } = await adminClient.from('clients').select('id');
  console.log(`✔ Cleanup complete. Final client count = ${finalClients?.length} (expected ${initialClients.length}).`);
  if (finalClients?.length !== initialClients.length) {
    throw new Error(`Data loss detected! Final client count = ${finalClients?.length}`);
  }

  console.log('\n=== ALL CLIENT STATUS TESTS PASSED (100% SUCCESS) ===');
}

runStatusTestSuite().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
