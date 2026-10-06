import https from 'https'
import http from 'http'

const prodBase = 'https://sales.cristianvaduva.com'

const routes = [
  '/',
  '/properties',
  '/admin/follow-ups',
  '/admin/follow-ups?view=today&type=all',
  '/admin/follow-ups?view=this_week&type=birthdays',
  '/admin/follow-ups?view=upcoming&type=follow_ups',
  '/admin/calendar',
  '/admin/clients',
  '/admin/contacts',
  '/admin/insurance',
  '/admin/credit',
  '/admin/notifications',
]

async function checkRoute(path: string): Promise<{ path: string; status: number; ok: boolean }> {
  return new Promise((resolve) => {
    const url = `${prodBase}${path}`
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 CRM Verification Bot' } }, (res) => {
      resolve({
        path,
        status: res.statusCode || 0,
        ok: (res.statusCode || 0) < 400 || (res.statusCode || 0) === 307 || (res.statusCode || 0) === 302,
      })
    }).on('error', (err) => {
      console.error(`Error requesting ${path}:`, err.message)
      resolve({ path, status: 500, ok: false })
    })
  })
}

async function runLiveAudit() {
  console.log('\n======================================================')
  console.log('🌐 PRODUCTION LIVE AUDIT — sales.cristianvaduva.com')
  console.log('======================================================\n')

  let passCount = 0
  for (const r of routes) {
    const res = await checkRoute(r)
    if (res.ok) {
      console.log(`  ✅ HTTP ${res.status} — ${r}`)
      passCount++
    } else {
      console.error(`  ❌ HTTP ${res.status} — ${r}`)
    }
  }

  console.log(`\nVerified ${passCount}/${routes.length} production endpoints.`)
  if (passCount !== routes.length) {
    process.exit(1)
  }
}

runLiveAudit()
