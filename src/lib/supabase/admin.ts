import { createClient } from '@supabase/supabase-js'

if (typeof global !== 'undefined' && !global.WebSocket) {
  ;(global as unknown as { WebSocket: unknown }).WebSocket = class { constructor() {} }
}

export function createAdminClient() {
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  let serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl && typeof window === 'undefined') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs = require('fs')
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const path = require('path')
      const envPath = path.resolve(process.cwd(), '.env.local')
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8')
        const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)
        const keyMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/) || envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)
        if (urlMatch) supabaseUrl = urlMatch[1].trim()
        if (keyMatch) serviceRoleKey = keyMatch[1].trim()
      }
    } catch {
      // Ignore in production runtime
    }
  }

  supabaseUrl = supabaseUrl || 'https://placeholder.supabase.co'
  serviceRoleKey = serviceRoleKey || 'placeholder-key'

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

