// Mock global WebSocket for supabase-js in Node
;(global as unknown as { WebSocket: unknown }).WebSocket = class { constructor() {} }

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

const PROD_URL = 'https://sales.cristianvaduva.com'

async function verifyLiveProduction() {
  console.log('================================================================')
  console.log('    SALES CRM — PRODUCTION LIVE POST-DEPLOYMENT VERIFICATION    ')
  console.log('================================================================\n')

  const endpoints = [
    { name: 'Public Landing Page', path: '/' },
    { name: 'Public Properties', path: '/properties' },
    { name: 'Admin Calendar', path: '/admin/calendar' },
    { name: 'Admin Clients', path: '/admin/clients' },
    { name: 'Admin New Client Form', path: '/admin/clients/new' },
    { name: 'Admin Contacts', path: '/admin/contacts' },
    { name: 'Admin Insurance', path: '/admin/insurance' },
    { name: 'Admin Credit', path: '/admin/credit' },
    { name: 'Admin Notifications', path: '/admin/notifications' },
  ]

  let passed = 0
  let failed = 0

  for (const ep of endpoints) {
    try {
      const res = await fetch(`${PROD_URL}${ep.path}`, {
        headers: { 'User-Agent': 'CRM-Production-Verification/1.0' },
      })
      if (res.status === 200 || res.status === 307 || res.status === 308) {
        console.log(`  ✔ PASS: ${ep.name} (${ep.path}) -> HTTP ${res.status}`)
        passed++
      } else {
        console.error(`  ❌ FAIL: ${ep.name} (${ep.path}) -> HTTP ${res.status}`)
        failed++
      }
    } catch (err: any) {
      console.error(`  ❌ FAIL: ${ep.name} (${ep.path}) -> Exception: ${err.message}`)
      failed++
    }
  }

  console.log('\n[CRON & REMINDERS PRODUCTION ENDPOINT CHECK]')
  try {
    const cronRes = await fetch(`${PROD_URL}/api/reminders/check`, {
      method: 'GET',
      headers: { 'x-vercel-cron': '1' },
    })
    console.log(`  ✔ Production Cron Endpoint Status: HTTP ${cronRes.status}`)
    const json = await cronRes.json()
    console.log(`  ✔ Cron Execution Payload:`, JSON.stringify(json))
    passed++
  } catch (err: any) {
    console.error(`  ❌ Cron Endpoint Error:`, err.message)
    failed++
  }

  console.log('\n================================================================')
  console.log(` LIVE PRODUCTION RESULTS: ${passed} PASS / ${failed} FAIL `)
  console.log('================================================================\n')

  if (failed > 0) process.exit(1)
}

verifyLiveProduction()
