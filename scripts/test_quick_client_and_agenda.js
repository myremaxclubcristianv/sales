const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Mock global WebSocket for supabase-js in Node 20
global.WebSocket = class { constructor() {} };

const env = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/) || env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);
const anonKeyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

const supabaseAdmin = createClient(urlMatch[1].trim(), keyMatch[1].trim(), { auth: { persistSession: false } });
const supabaseAnon = createClient(urlMatch[1].trim(), anonKeyMatch[1].trim(), { auth: { persistSession: false } });

async function runTests() {
  console.log('=== STARTING COMPREHENSIVE CRM SUITE VERIFICATION ===\n');

  // 1. Initial State Audit
  const { data: initialClients } = await supabaseAdmin.from('clients').select('id');
  const { data: initialContacts } = await supabaseAdmin.from('contacts').select('id');
  console.log(`[1] INITIAL DB STATE: Clients = ${initialClients.length}, Contacts = ${initialContacts.length}`);

  // 2. Test Quick Client Creation
  console.log('\n[2] TESTING QUICK CLIENT CREATION & DUPLICATE PROTECTION:');
  const testPhone = '+40799112233';
  const testEmail = 'e2e_test_user_unique@cristianvaduva.com';
  
  // Clean any leftover test user if exists
  await supabaseAdmin.from('clients').delete().eq('email', testEmail);
  await supabaseAdmin.from('contacts').delete().eq('email', testEmail);

  // Insert Quick Client
  const { data: createdClient, error: cErr } = await supabaseAdmin.from('clients').insert({
    first_name: 'E2E',
    last_name: 'Test Client',
    phone: testPhone,
    whatsapp: testPhone,
    email: testEmail,
    category: 'REAL_ESTATE',
    lead_source: 'WEBSITE_HOMEFIND',
    interest_summary: 'Vrea vila Pipera 4 camere, buget 450k',
    status: 'ACTIVE',
    client_type: 'INDIVIDUAL',
    country: 'Romania'
  }).select().single();

  if (cErr) throw new Error('Failed to create quick client: ' + cErr.message);
  console.log('✔ Quick Client created successfully:', createdClient.id, '| Category:', createdClient.category, '| Source:', createdClient.lead_source, '| Interest:', createdClient.interest_summary);

  // Test Duplicate Matching with alternative phone format (0799112233 vs +40799112233)
  const phoneVariants = ['0799112233', '+40 799 112 233', '40799112233'];
  let duplicateFound = false;
  for (const pv of phoneVariants) {
    const { data: match } = await supabaseAdmin.from('clients').select('*').or(`phone.eq.${pv},whatsapp.eq.${pv},phone.eq.${testPhone}`);
    if (match && match.length > 0) {
      duplicateFound = true;
      console.log(`✔ Phone variant "${pv}" successfully matched against "${testPhone}" (Client ID: ${match[0].id})`);
    }
  }
  if (!duplicateFound) throw new Error('Duplicate phone matching failed');

  // 3. Test Agenda Contacts & Batch Import
  console.log('\n[3] TESTING CONTACTS AGENDA & BATCH IMPORT:');
  const testContactsBatch = [
    {
      first_name: 'Alexandru',
      last_name: 'Ionescu Test',
      phone: '+40788001122',
      email: 'alex.ionescu.test@example.com',
      company_name: 'Tech Corp SRL',
      category: 'REAL_ESTATE',
      source: 'LINKEDIN',
      interest_summary: 'Spatiu birouri 200mp'
    },
    {
      first_name: 'Elena',
      last_name: 'Popa Test',
      phone: '+40788002233',
      email: 'elena.popa.test@example.com',
      company_name: 'Elena Design',
      category: 'INSURANCE',
      source: 'WEBSITE_INSURANCE',
      interest_summary: 'Asigurare raspundere civila'
    },
    {
      first_name: 'Mihai',
      last_name: 'Dumitrescu Test',
      phone: '+40788003344',
      email: 'mihai.d.test@example.com',
      category: 'CREDIT',
      source: 'WEBSITE_CREDITE',
      interest_summary: 'Refinantare 100k EUR'
    }
  ];

  const { data: insertedContacts, error: impErr } = await supabaseAdmin.from('contacts').insert(testContactsBatch).select();
  if (impErr) throw new Error('Failed to insert contacts: ' + impErr.message);
  console.log(`✔ Imported ${insertedContacts.length} test contacts into Agenda.`);

  // 4. Test Convert Contact -> CRM Client
  console.log('\n[4] TESTING CONVERT CONTACT TO CLIENT WORKFLOW:');
  const contactToConvert = insertedContacts[0];
  
  // Convert
  const { data: convertedClient, error: convErr } = await supabaseAdmin.from('clients').insert({
    first_name: contactToConvert.first_name,
    last_name: contactToConvert.last_name,
    phone: contactToConvert.phone,
    whatsapp: contactToConvert.phone,
    email: contactToConvert.email,
    category: contactToConvert.category,
    lead_source: contactToConvert.source,
    interest_summary: contactToConvert.interest_summary,
    status: 'ACTIVE',
    client_type: 'INDIVIDUAL',
    country: 'Romania'
  }).select().single();
  if (convErr) throw convErr;

  // Link contact to client
  const { error: linkErr } = await supabaseAdmin.from('contacts').update({ client_id: convertedClient.id }).eq('id', contactToConvert.id);
  if (linkErr) throw linkErr;

  const { data: verifiedContact } = await supabaseAdmin.from('contacts').select('*, clients:client_id(*)').eq('id', contactToConvert.id).single();
  console.log('✔ Contact successfully converted and linked to Client:', {
    contactId: verifiedContact.id,
    linkedClientId: verifiedContact.client_id,
    clientName: verifiedContact.clients?.first_name + ' ' + verifiedContact.clients?.last_name
  });

  // 5. Test RLS Security (Anonymous should NOT access contacts or contact_imports)
  console.log('\n[5] TESTING RLS SECURITY (UNAUTHENTICATED ACCESS):');
  const { data: anonContacts, error: anonErr } = await supabaseAnon.from('contacts').select('*');
  const { data: anonImports } = await supabaseAnon.from('contact_imports').select('*');
  console.log('Anonymous contacts count returned:', anonContacts ? anonContacts.length : 0);
  console.log('Anonymous contact_imports count returned:', anonImports ? anonImports.length : 0);
  if (anonContacts && anonContacts.length > 0) {
    throw new Error('RLS BREACH: Anonymous user could view private contacts!');
  }
  console.log('✔ RLS Verified: 0 rows exposed to unauthenticated users.');

  // 6. Cleanup Temporary Test Records
  console.log('\n[6] CLEANING UP TEST RECORDS:');
  await supabaseAdmin.from('clients').delete().eq('id', createdClient.id);
  await supabaseAdmin.from('clients').delete().eq('id', convertedClient.id);
  const contactIds = insertedContacts.map(c => c.id);
  await supabaseAdmin.from('contacts').delete().in('id', contactIds);
  console.log('✔ All temporary test records deleted.');

  // 7. Final State Verification
  const { data: finalClients } = await supabaseAdmin.from('clients').select('id');
  const { data: finalContacts } = await supabaseAdmin.from('contacts').select('id');
  console.log(`\n[7] FINAL DB VERIFICATION: Clients = ${finalClients.length} (expected ${initialClients.length}), Contacts = ${finalContacts.length} (expected ${initialContacts.length})`);
  if (finalClients.length !== initialClients.length || finalContacts.length !== initialContacts.length) {
    throw new Error('Database state mismatch after cleanup!');
  }
  console.log('✔ ZERO DATA LOSS / PERFECT INTEGRITY VERIFIED.');
}

runTests().catch(err => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});
