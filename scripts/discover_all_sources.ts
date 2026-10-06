// Mock global WebSocket for supabase-js in Node
;(global as unknown as { WebSocket: unknown }).WebSocket = class { constructor() {} }

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

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

async function check() {
  const tables = [
    'clients',
    'insurance_clients',
    'contacts',
    'leads',
    'insurance_policies',
    'insurance_client_policies',
    'credit_cases',
    'companies',
    'personal_events',
    'properties',
    'viewings',
    'follow_ups',
    'tasks'
  ]
  for (const t of tables) {
    try {
      const { data, count, error } = await supabase.from(t).select('*', { count: 'exact', head: false }).limit(5)
      if (error) {
        console.log(`[${t}] ERROR:`, error.message)
      } else {
        console.log(`[${t}] COUNT: ${count}`)
        if (data && data.length > 0) {
          console.log(`  Columns: ${Object.keys(data[0]).join(', ')}`)
          console.log(`  Sample 1:`, JSON.stringify(data[0]).slice(0, 200))
        }
      }
    } catch (e: any) {
      console.log(`[${t}] EXCEPTION:`, e.message)
    }
  }
}

check()
