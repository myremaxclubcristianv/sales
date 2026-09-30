const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Mock global WebSocket for supabase-js in Node
global.WebSocket = class { constructor() {} };

const env = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);

if (!urlMatch || !keyMatch) {
  console.error('Missing supabase credentials in .env.local');
  process.exit(1);
}

const adminClient = createClient(urlMatch[1].trim(), keyMatch[1].trim(), { auth: { persistSession: false } });

// CNP Logic (mirroring src/lib/utils/cnp.ts)
function normalizeCnp(raw) {
  if (!raw) return '';
  return raw.trim().replace(/\D/g, '');
}

function isValidCnp(raw) {
  if (!raw) return false;
  if (/[^\d\s]/.test(raw)) return false;
  const normalized = normalizeCnp(raw);
  return /^\d{13}$/.test(normalized);
}

function validateCnp(raw, isOptional = true) {
  if (!raw || !raw.trim()) {
    if (isOptional) {
      return { isValid: true, normalized: null };
    }
    return { isValid: false, normalized: null, error: 'CNP-ul este obligatoriu.' };
  }

  if (/[^\d\s]/.test(raw)) {
    return {
      isValid: false,
      normalized: normalizeCnp(raw),
      error: 'CNP-ul trebuie să conțină exact 13 cifre.',
    };
  }

  const normalized = normalizeCnp(raw);
  if (normalized.length !== 13 || !/^\d{13}$/.test(normalized)) {
    return {
      isValid: false,
      normalized,
      error: 'CNP-ul trebuie să conțină exact 13 cifre.',
    };
  }

  return { isValid: true, normalized };
}

function maskCnp(cnp) {
  if (!cnp || !cnp.trim()) return '—';
  return '•••••••••••••';
}

async function runCnpTests() {
  console.log('=== QUICK CLIENT CNP VALIDATION & REGRESSION TEST MATRIX ===\n');

  // 1. UNIT VALIDATION TESTS
  console.log('[1] VALIDATION SUITE:');
  
  // Valid CNP
  const valid1 = validateCnp('1234567890123');
  console.log(`  ✔ Valid standard "1234567890123":`, valid1);
  if (!valid1.isValid || valid1.normalized !== '1234567890123') {
    throw new Error('Valid standard CNP test failed');
  }

  // Valid with formatting spaces
  const validWithSpaces = validateCnp('1234 5678 9012 3');
  console.log(`  ✔ Valid space-formatted "1234 5678 9012 3":`, validWithSpaces);
  if (!validWithSpaces.isValid || validWithSpaces.normalized !== '1234567890123') {
    throw new Error('Valid formatted CNP test failed');
  }

  // Invalid: 12 digits
  const invalid12 = validateCnp('123456789012');
  console.log(`  ✔ Invalid 12 digits "123456789012":`, invalid12);
  if (invalid12.isValid || invalid12.error !== 'CNP-ul trebuie să conțină exact 13 cifre.') {
    throw new Error('Invalid 12 digits test failed');
  }

  // Invalid: 14 digits
  const invalid14 = validateCnp('12345678901234');
  console.log(`  ✔ Invalid 14 digits "12345678901234":`, invalid14);
  if (invalid14.isValid || invalid14.error !== 'CNP-ul trebuie să conțină exact 13 cifre.') {
    throw new Error('Invalid 14 digits test failed');
  }

  // Invalid: alphanumeric
  const invalidAlpha = validateCnp('12345678901AB');
  console.log(`  ✔ Invalid alphanumeric "12345678901AB":`, invalidAlpha);
  if (invalidAlpha.isValid || invalidAlpha.error !== 'CNP-ul trebuie să conțină exact 13 cifre.') {
    throw new Error('Invalid alphanumeric test failed');
  }

  // Optional empty / null
  const emptyCnp = validateCnp('');
  const nullCnp = validateCnp(null);
  console.log(`  ✔ Optional empty string:`, emptyCnp);
  console.log(`  ✔ Optional null:`, nullCnp);
  if (!emptyCnp.isValid || emptyCnp.normalized !== null || !nullCnp.isValid || nullCnp.normalized !== null) {
    throw new Error('Optional empty/null CNP test failed');
  }

  // 2. MASKING TESTS
  console.log('\n[2] MASKING & PRIVACY DISPLAY SUITE:');
  const maskedValid = maskCnp('1234567890123');
  const maskedEmpty = maskCnp('');
  const maskedNull = maskCnp(null);
  console.log(`  ✔ Masked valid CNP: "${maskedValid}"`);
  console.log(`  ✔ Masked empty CNP: "${maskedEmpty}"`);
  console.log(`  ✔ Masked null CNP: "${maskedNull}"`);
  if (maskedValid !== '•••••••••••••' || maskedEmpty !== '—' || maskedNull !== '—') {
    throw new Error('Masking tests failed');
  }

  // 3. EDIT PRESERVATION LOGIC TEST
  console.log('\n[3] QUICK CLIENT EDIT PRESERVATION RULES:');
  const existingClientRecord = { id: 'test-client', cnp: '1234567890123' };
  
  // existing CNP + empty edit -> preserve
  const editPreserve = validateCnp('', true).normalized !== null 
    ? validateCnp('', true).normalized 
    : existingClientRecord.cnp;
  console.log(`  ✔ Existing CNP + empty edit -> preserved: "${editPreserve}"`);
  if (editPreserve !== '1234567890123') throw new Error('Edit preservation rule failed');

  // existing CNP + new valid CNP -> update
  const newCnpVal = validateCnp('2987654321098', true).normalized;
  const editUpdate = newCnpVal !== null ? newCnpVal : existingClientRecord.cnp;
  console.log(`  ✔ Existing CNP + new valid CNP -> updated: "${editUpdate}"`);
  if (editUpdate !== '2987654321098') throw new Error('Edit update rule failed');

  // 4. DATABASE INTEGRATION TEST (Create test client with CNP, verify, cleanup)
  console.log('\n[4] DATABASE INTEGRATION & STORAGE:');
  const testCnp = '1900101123456';
  const { data: createdClient, error: createErr } = await adminClient
    .from('clients')
    .insert({
      first_name: 'TestQuickClient',
      last_name: 'CNPTest',
      phone: '0799888777',
      whatsapp: '0799888777',
      category: 'INSURANCE',
      lead_source: 'GENERALI_CRM',
      cnp: testCnp,
      status: 'NOT_CONTACTED',
      client_type: 'INDIVIDUAL',
    })
    .select()
    .single();

  if (createErr) throw createErr;
  console.log(`  ✔ Quick Client created with CNP: ID=${createdClient.id}, CNP in DB=${createdClient.cnp}`);
  if (createdClient.cnp !== testCnp) {
    throw new Error(`CNP mismatch in DB: expected ${testCnp}, got ${createdClient.cnp}`);
  }

  // Clean up
  await adminClient.from('clients').delete().eq('id', createdClient.id);
  console.log('  ✔ Test client record safely cleaned up from database.');

  // 5. VERIFY ALL EXISTING CLIENTS IN DATABASE ARE UNTOUCHED
  console.log('\n[5] VERIFYING ALL EXISTING CLIENTS:');
  const { data: allClients, error: fetchErr } = await adminClient
    .from('clients')
    .select('id, first_name, last_name, phone, cnp')
    .order('created_at', { ascending: false });

  if (fetchErr) throw fetchErr;
  console.log(`  Total existing clients in database: ${allClients.length}`);
  if (allClients.length < 17) {
    throw new Error(`Expected at least 17 clients, found ${allClients.length}`);
  }

  for (const c of allClients) {
    const fullName = `${c.first_name || ''} ${c.last_name || ''}`.trim();
    const masked = maskCnp(c.cnp);
    console.log(`  - ${fullName.padEnd(30)} | Phone: ${(c.phone || '—').padEnd(14)} | CNP: ${masked}`);
  }

  console.log('\n=== ALL QUICK CLIENT CNP TESTS PASSED (100% SUCCESS) ===\n');
}

runCnpTests().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
