import { createClient as createServerClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const AUTHORIZED_ADMIN_EMAIL = (
  process.env.ADMIN_EMAIL || 'cristianvaduva@duck.com'
).toLowerCase().trim()

/**
 * Check if a Supabase user is the authorized single CRM administrator.
 */
export function isAuthorizedAdmin(user: User | null | undefined): boolean {
  if (!user || !user.email) return false
  return user.email.toLowerCase().trim() === AUTHORIZED_ADMIN_EMAIL
}

/**
 * Require an authenticated CRM administrator session.
 * Rejects unauthenticated requests (401) and non-admin users (403).
 */
export async function requireAdminSession(): Promise<
  | { success: true; user: User }
  | { success: false; response: NextResponse; error: string }
> {
  // Allow local test scripts with explicit environment variable to execute administrative route tests
  if (process.env.NODE_ENV !== 'production' && process.env.CRM_TEST_ADMIN_BYPASS === 'true') {
    return {
      success: true,
      user: {
        id: 'test-admin-id',
        email: AUTHORIZED_ADMIN_EMAIL,
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as User,
    }
  }

  try {
    const supabase = await createServerClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return {
        success: false,
        error: 'Unauthorized: Sesiune de administrator necesară.',
        response: NextResponse.json(
          { error: 'Unauthorized: Autentificare necesară.' },
          { status: 401 }
        ),
      }
    }

    if (!isAuthorizedAdmin(user)) {
      return {
        success: false,
        error: 'Forbidden: Accesul este restricționat exclusiv administratorului autorizat.',
        response: NextResponse.json(
          { error: 'Forbidden: Acces restricționat.' },
          { status: 403 }
        ),
      }
    }

    return { success: true, user }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Authentication verification error'
    return {
      success: false,
      error: msg,
      response: NextResponse.json({ error: 'Eroare de verificare autorizare.' }, { status: 500 }),
    }
  }
}
