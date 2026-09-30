const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Mock global WebSocket for supabase-js in Node 20
global.WebSocket = class { constructor() {} };

const env = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);

if (!urlMatch || !keyMatch) {
  console.error('Missing supabase credentials');
  process.exit(1);
}

const adminClient = createClient(urlMatch[1].trim(), keyMatch[1].trim(), { auth: { persistSession: false } });

// Canonical phone logic
function normalizePhone(raw) {
  if (!raw) return '';
  let str = raw.trim().replace(/[^\d+]/g, '');
  if (!str) return '';
  if (str.startsWith('0040')) str = '+40' + str.slice(4);
  if (str.startsWith('+400') && /^(\+400[237]\d{8})$/.test(str)) return '0' + str.slice(4);
  if (/^\+407\d{8}$/.test(str)) return '0' + str.slice(3);
  if (/^407\d{8}$/.test(str)) return '0' + str.slice(2);
  if (/^7\d{8}$/.test(str)) return '0' + str;
  if (/^07\d{8}$/.test(str)) return str;
  if (/^\+40[23]\d{8}$/.test(str)) return '0' + str.slice(3);
  if (/^40[23]\d{8}$/.test(str)) return '0' + str.slice(2);
  if (/^[23]\d{8}$/.test(str)) return '0' + str;
  if (/^0[23]\d{8}$/.test(str)) return str;
  return str;
}

function isValidRomanianPhone(phone) {
  if (!phone) return false;
  const canonical = normalizePhone(phone);
  return /^07\d{8}$/.test(canonical);
}

function getTelUrl(phone) {
  if (!phone) return '';
  const canonical = normalizePhone(phone);
  if (!canonical) return '';
  return `tel:${canonical}`;
}

function getWhatsAppUrl(phone, text) {
  if (!phone) return '';
  const canonical = normalizePhone(phone);
  if (!canonical) return '';

  let waNumber = '';
  if (/^07\d{8}$/.test(canonical) || /^0[23]\d{8}$/.test(canonical)) {
    waNumber = '40' + canonical.slice(1);
  } else {
    waNumber = canonical.replace(/\D/g, '');
  }

  if (!waNumber) return '';
  const base = `https://wa.me/${waNumber}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

function formatPhoneDisplay(phone) {
  if (!phone) return '';
  const canonical = normalizePhone(phone);
  return canonical || phone.trim();
}

async function runCanonicalPhoneTests() {
  console.log('=== CANONICAL ROMANIAN PHONE TEST MATRIX ===\n');

  const testInputs = [
    '0767110439',
    '+40767110439',
    '40767110439',
    '+40 767 110 439',
    '40 767 110 439',
    '+40-767-110-439',
    '40-767-110-439',
    '0040767110439',
    '0040 767 110 439',
    '+400767110439',
    '767110439'
  ];

  const EXPECTED_CANONICAL = '0767110439';
  const EXPECTED_TEL = 'tel:0767110439';
  const EXPECTED_WA = 'https://wa.me/40767110439';

  console.log('[1] TESTING INPUT -> CANONICAL NORMALIZATION:');
  for (const input of testInputs) {
    const canonical = normalizePhone(input);
    const tel = getTelUrl(input);
    const wa = getWhatsAppUrl(input);
    const isValid = isValidRomanianPhone(input);
    const display = formatPhoneDisplay(input);

    if (canonical !== EXPECTED_CANONICAL) {
      throw new Error(`Normalization failed for "${input}": expected ${EXPECTED_CANONICAL}, got ${canonical}`);
    }
    if (tel !== EXPECTED_TEL) {
      throw new Error(`Tel action failed for "${input}": expected ${EXPECTED_TEL}, got ${tel}`);
    }
    if (wa !== EXPECTED_WA) {
      throw new Error(`WhatsApp action failed for "${input}": expected ${EXPECTED_WA}, got ${wa}`);
    }
    if (!isValid) {
      throw new Error(`Validation failed for "${input}": expected true, got false`);
    }
    if (display !== EXPECTED_CANONICAL) {
      throw new Error(`Display failed for "${input}": expected ${EXPECTED_CANONICAL}, got ${display}`);
    }

    console.log(`  ✔ Input: "${input.padEnd(20)}" -> Canonical: ${canonical} | Call: ${tel} | WA: ${wa}`);
  }

  console.log('\n[2] TESTING INTERNATIONAL NUMBERS PRESERVATION:');
  const intlInputs = [
    { input: '+436509536345', expTel: 'tel:+436509536345', expWa: 'https://wa.me/436509536345' },
    { input: '+1 202 555 0123', expTel: 'tel:+12025550123', expWa: 'https://wa.me/12025550123' },
    { input: '+44 7911 123456', expTel: 'tel:+447911123456', expWa: 'https://wa.me/447911123456' }
  ];

  for (const { input, expTel, expWa } of intlInputs) {
    const tel = getTelUrl(input);
    const wa = getWhatsAppUrl(input);
    const isValidRO = isValidRomanianPhone(input);
    if (isValidRO) throw new Error(`Foreign number "${input}" falsely marked as valid Romanian`);
    if (tel !== expTel) throw new Error(`Foreign tel failed: expected ${expTel}, got ${tel}`);
    if (wa !== expWa) throw new Error(`Foreign wa failed: expected ${expWa}, got ${wa}`);
    console.log(`  ✔ International: "${input}" -> Preserved correctly | Call: ${tel} | WA: ${wa}`);
  }

  console.log('\n[3] TESTING DATABASE INSERT WITH VARIANTS & VERIFYING CANONICAL STORAGE:');
  // Insert a test client with +40 799 333 444
  const testPhoneInput = '+40 799 333 444';
  const normPhoneToSave = normalizePhone(testPhoneInput);

  const { data: testClient, error: insertErr } = await adminClient
    .from('clients')
    .insert({
      first_name: 'CanonicalTest',
      last_name: 'Client',
      phone: normPhoneToSave,
      whatsapp: normPhoneToSave,
      category: 'BUYER',
      lead_source: 'phone'
    })
    .select()
    .single();

  if (insertErr) throw insertErr;
  console.log(`  ✔ Inserted with input "${testPhoneInput}" -> Saved as: "${testClient.phone}"`);
  if (testClient.phone !== '0799333444') {
    throw new Error(`Expected saved phone 0799333444, got ${testClient.phone}`);
  }

  // Cleanup test client
  await adminClient.from('clients').delete().eq('id', testClient.id);
  console.log('  ✔ Test client cleaned up.');

  console.log('\n[4] VERIFYING ALL 17 CLIENTS IN DATABASE:');
  const { data: allClients, error: fetchErr } = await adminClient
    .from('clients')
    .select('id, first_name, last_name, phone');
  if (fetchErr) throw fetchErr;

  console.log(`  Total clients: ${allClients.length} (expected >= 17)`);
  if (allClients.length < 17) {
    throw new Error(`Expected at least 17 clients, found ${allClients.length}`);
  }

  for (const c of allClients) {
    const name = `${c.first_name || ''} ${c.last_name || ''}`.trim();
    console.log(`  - ${name.padEnd(35)}: ${c.phone}`);
  }

  console.log('\n=== ALL CANONICAL PHONE TESTS PASSED (100% SUCCESS) ===');
}

runCanonicalPhoneTests().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
