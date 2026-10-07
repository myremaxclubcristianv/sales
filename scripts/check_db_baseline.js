global.WebSocket = class { constructor() {} };
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(__dirname, '../.env.local');
const env = fs.readFileSync(envPath, 'utf8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);

if (!urlMatch || !keyMatch) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim(), {
  auth: { persistSession: false },
});

async function checkBaseline() {
  console.log('=== DATABASE BASELINE CHECK ===');

  const tables = [
    'clients',
    'leads',
    'properties',
    'requests',
    'opportunities',
    'activities',
    'insurance_clients',
    'insurance_client_policies',
    'insurance_financial_ledger',
    'profiles',
    'companies',
    'contacts'
  ];

  for (const table of tables) {
    try {
      const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
      if (error) {
        console.log(`Table ${table}: ERROR -> ${error.message}`);
      } else {
        console.log(`Table ${table}: ${count} records`);
      }
    } catch (e) {
      console.log(`Table ${table}: EXCEPTION -> ${e.message}`);
    }
  }
}

checkBaseline();
