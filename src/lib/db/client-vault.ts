import { createAdminClient } from '@/lib/supabase/admin'
import {
  generateVaultPassword,
  hashVaultPassword,
  verifyVaultPassword,
  signVaultSession,
} from '@/lib/security/vault'

export interface ClientVaultStatus {
  isConfigured: boolean
  isLocked: boolean
  lockedUntil: string | null
  failedAttempts: number
}

// In-memory fallback cache for runtime resilience
interface RuntimeVaultState {
  passwordHash: string
  failedAttempts: number
  lockedUntil: number | null
  updatedAt: string
}
const runtimeVaults = new Map<string, RuntimeVaultState>()

/**
 * Get the Vault security status for a client
 */
export async function getClientVaultStatus(clientId: string): Promise<ClientVaultStatus> {
  const normId = clientId.trim()

  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('client_vaults')
      .select('vault_password_hash, failed_attempts, locked_until')
      .eq('client_id', normId)
      .maybeSingle()

    if (!error && data) {
      const isLocked = Boolean(data.locked_until && new Date(data.locked_until).getTime() > Date.now())
      return {
        isConfigured: true,
        isLocked,
        lockedUntil: data.locked_until,
        failedAttempts: data.failed_attempts || 0,
      }
    }
  } catch (err) {
    console.warn('Supabase client_vaults check failed, checking runtime cache:', err)
  }

  // Runtime cache fallback
  const cached = runtimeVaults.get(normId)
  if (cached) {
    const isLocked = Boolean(cached.lockedUntil && cached.lockedUntil > Date.now())
    return {
      isConfigured: true,
      isLocked,
      lockedUntil: cached.lockedUntil ? new Date(cached.lockedUntil).toISOString() : null,
      failedAttempts: cached.failedAttempts,
    }
  }

  return {
    isConfigured: false,
    isLocked: false,
    lockedUntil: null,
    failedAttempts: 0,
  }
}

/**
 * Setup or Reset a Client Vault.
 * Generates a cryptographically secure random password, hashes it with scrypt,
 * stores ONLY the hash in the database, and returns the plaintext password ONCE.
 */
export async function setupOrResetClientVault(
  clientId: string,
  _userId?: string | null
): Promise<{ success: boolean; password: string; plaintextPassword: string; isNew: boolean }> {
  const normId = clientId.trim()
  const plaintextPassword = generateVaultPassword()
  const hash = hashVaultPassword(plaintextPassword)
  const nowIso = new Date().toISOString()

  // Store in runtime cache
  runtimeVaults.set(normId, {
    passwordHash: hash,
    failedAttempts: 0,
    lockedUntil: null,
    updatedAt: nowIso,
  })

  // Persist to Supabase
  try {
    const admin = createAdminClient()
    
    // Check if vault already exists
    const { data: existing } = await admin
      .from('client_vaults')
      .select('id')
      .eq('client_id', normId)
      .maybeSingle()

    if (existing) {
      await admin
        .from('client_vaults')
        .update({
          vault_password_hash: hash,
          failed_attempts: 0,
          locked_until: null,
          updated_at: nowIso,
        })
        .eq('client_id', normId)
    } else {
      await admin.from('client_vaults').insert({
        client_id: normId,
        vault_password_hash: hash,
        failed_attempts: 0,
        locked_until: null,
        created_at: nowIso,
        updated_at: nowIso,
      })
    }
  } catch (err) {
    console.warn('Supabase client_vaults insert fallback to runtime cache:', err)
  }

  return { success: true, password: plaintextPassword, plaintextPassword, isNew: true }
}

/**
 * Unlock a Client Vault with password verification & rate limiting / brute-force protection.
 */
export async function unlockClientVault(
  clientId: string,
  passwordAttempt: string
): Promise<{ success: boolean; sessionToken?: string; error?: string; remainingAttempts?: number; lockedUntil?: string }> {
  const normId = clientId.trim()
  const cleanPassword = passwordAttempt.trim()
  let storedHash: string | null = null
  let currentFailedAttempts = 0
  let currentLockedUntil: string | null = null

  try {
    const admin = createAdminClient()
    const { data } = await admin
      .from('client_vaults')
      .select('vault_password_hash, failed_attempts, locked_until')
      .eq('client_id', normId)
      .maybeSingle()

    if (data) {
      storedHash = data.vault_password_hash
      currentFailedAttempts = data.failed_attempts || 0
      currentLockedUntil = data.locked_until
    }
  } catch (err) {
    console.warn('Supabase fetch failed during unlock:', err)
  }

  if (!storedHash) {
    const cached = runtimeVaults.get(normId)
    if (cached) {
      storedHash = cached.passwordHash
      currentFailedAttempts = cached.failedAttempts
      currentLockedUntil = cached.lockedUntil ? new Date(cached.lockedUntil).toISOString() : null
    }
  }

  if (!storedHash) {
    return { success: false, error: 'Vault-ul nu este configurat pentru acest client. Generați o parolă de acces.' }
  }

  // Check if locked due to brute-force protection
  if (currentLockedUntil) {
    const lockTime = new Date(currentLockedUntil).getTime()
    if (lockTime > Date.now()) {
      const minutesLeft = Math.ceil((lockTime - Date.now()) / (60 * 1000))
      return {
        success: false,
        error: `Vault-ul este blocat temporar din motive de securitate. Încercați din nou peste ${minutesLeft} minute.`,
        lockedUntil: currentLockedUntil,
      }
    }
  }

  // Timing-safe password verification
  const isMatch = verifyVaultPassword(cleanPassword, storedHash)

  if (isMatch) {
    // Reset failed attempts
    runtimeVaults.set(normId, {
      passwordHash: storedHash,
      failedAttempts: 0,
      lockedUntil: null,
      updatedAt: new Date().toISOString(),
    })

    try {
      const admin = createAdminClient()
      await admin
        .from('client_vaults')
        .update({
          failed_attempts: 0,
          locked_until: null,
          updated_at: new Date().toISOString(),
        })
        .eq('client_id', normId)
    } catch {
      // Ignore
    }

    const sessionToken = signVaultSession(normId, 30) // 30 min session
    return { success: true, sessionToken }
  } else {
    // Increment failed attempts
    const newFailed = currentFailedAttempts + 1
    let newLockedUntil: string | null = null

    // Rate limit: 5 failed attempts locks for 15 minutes
    if (newFailed >= 5) {
      newLockedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString()
    }

    runtimeVaults.set(normId, {
      passwordHash: storedHash,
      failedAttempts: newFailed,
      lockedUntil: newLockedUntil ? new Date(newLockedUntil).getTime() : null,
      updatedAt: new Date().toISOString(),
    })

    try {
      const admin = createAdminClient()
      await admin
        .from('client_vaults')
        .update({
          failed_attempts: newFailed,
          locked_until: newLockedUntil,
          updated_at: new Date().toISOString(),
        })
        .eq('client_id', normId)
    } catch {
      // Ignore
    }

    if (newLockedUntil) {
      return {
        success: false,
        error: 'Ați depășit numărul maxim de încercări (5). Vault-ul a fost blocat pentru 15 minute.',
        lockedUntil: newLockedUntil,
      }
    }

    const remaining = 5 - newFailed
    return {
      success: false,
      error: `Parolă incorectă. Încercări rămase: ${remaining}.`,
      remainingAttempts: remaining,
    }
  }
}
