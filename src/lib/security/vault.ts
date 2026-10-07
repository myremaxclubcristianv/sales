import crypto from 'crypto'

/**
 * Generate a cryptographically secure random vault password in format:
 * CV-VLT-XXXX-XXXX-XXXX
 * Uses unambiguous characters (excluding 0, 1, I, O to avoid manual transcription errors).
 */
export function generateVaultPassword(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
  const getChunk = () => {
    const bytes = crypto.randomBytes(4)
    let str = ''
    for (let i = 0; i < 4; i++) {
      str += chars[bytes[i] % chars.length]
    }
    return str
  }
  return `CV-VLT-${getChunk()}-${getChunk()}-${getChunk()}`
}

/**
 * Hash a vault password using scrypt with a cryptographically secure 16-byte random salt.
 */
export function hashVaultPassword(password: string): string {
  const cleanPwd = password.trim()
  const salt = crypto.randomBytes(16).toString('hex')
  const derivedKey = crypto.scryptSync(cleanPwd, salt, 64)
  return `${salt}:${derivedKey.toString('hex')}`
}

/**
 * Verify a vault password against a stored scrypt hash using timing-safe comparison.
 */
export function verifyVaultPassword(password: string, storedHash: string): boolean {
  try {
    const cleanPwd = password.trim()
    const [salt, keyHex] = storedHash.split(':')
    if (!salt || !keyHex) return false

    const expectedKey = Buffer.from(keyHex, 'hex')
    const actualKey = crypto.scryptSync(cleanPwd, salt, 64)

    if (expectedKey.length !== actualKey.length) return false
    return crypto.timingSafeEqual(expectedKey, actualKey)
  } catch {
    return false
  }
}

const VAULT_SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || 'vault-secure-session-secret-key-crm'

/**
 * Generate a short-lived HMAC-SHA256 signed session token for an unlocked vault session (default: 30 minutes).
 */
export function signVaultSession(clientId: string, expiresInMinutes: number = 30): string {
  const expiresAt = Date.now() + expiresInMinutes * 60 * 1000
  const payload = `${clientId}:${expiresAt}`
  const signature = crypto
    .createHmac('sha256', VAULT_SECRET)
    .update(payload)
    .digest('hex')
  return `${payload}:${signature}`
}

/**
 * Verify a vault session token for a specific client.
 */
export function verifyVaultSession(token: string | null | undefined, clientId: string): boolean {
  if (!token) return false
  try {
    const parts = token.split(':')
    if (parts.length !== 3) return false
    const [tokenClientId, expiresAtStr, signature] = parts

    if (tokenClientId !== clientId) return false

    const expiresAt = parseInt(expiresAtStr, 10)
    if (isNaN(expiresAt) || Date.now() > expiresAt) return false

    const payload = `${tokenClientId}:${expiresAtStr}`
    const expectedSig = crypto
      .createHmac('sha256', VAULT_SECRET)
      .update(payload)
      .digest('hex')

    const sigBuf = Buffer.from(signature, 'hex')
    const expBuf = Buffer.from(expectedSig, 'hex')

    if (sigBuf.length !== expBuf.length) return false
    return crypto.timingSafeEqual(sigBuf, expBuf)
  } catch {
    return false
  }
}

/**
 * Allowed Document Categories for Private Client Vault
 */
export const VAULT_DOCUMENT_CATEGORIES = [
  'BULETIN',
  'CONTRACT',
  'RAPORT',
  'FINANCIAR',
  'ASIGURARE',
  'IMOBIL',
  'IDENTITATE',
  'ALTELE',
] as const

export type VaultDocumentCategory = (typeof VAULT_DOCUMENT_CATEGORIES)[number]

/**
 * Allowed File Extensions for Private Document Vault
 */
export const ALLOWED_DOCUMENT_EXTENSIONS = [
  'pdf',
  'jpg',
  'jpeg',
  'png',
  'webp',
  'doc',
  'docx',
  'xls',
  'xlsx',
] as const

export const MAX_DOCUMENT_FILE_SIZE = 50 * 1024 * 1024 // 50MB

/**
 * Sanitize filename to prevent directory traversal and null byte injections
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .trim()
    .replace(/\0/g, '')
    .replace(/[\/\\]/g, '_')
    .replace(/\.\.+/g, '')
    .replace(/[^a-zA-Z0-9._\-]/g, '_')
}

/**
 * Strict file validation checking extensions, size, dangerous types, and magic bytes.
 */
export function validateUploadedDocument(
  fileBuffer: Buffer,
  originalFilename: string,
  declaredMimeType: string
): { valid: boolean; error?: string; safeFilename: string; ext: string } {
  // 1. File size check
  if (fileBuffer.length > MAX_DOCUMENT_FILE_SIZE) {
    return { valid: false, error: 'Dimensiunea fișierului depășește limita maximă de 50MB.', safeFilename: '', ext: '' }
  }

  // 2. Sanitize filename & extract extension
  const cleanOriginal = sanitizeFilename(originalFilename)
  if (!cleanOriginal || cleanOriginal.includes('\0') || cleanOriginal.includes('..')) {
    return { valid: false, error: 'Nume de fișier invalid sau nesigur.', safeFilename: '', ext: '' }
  }

  const parts = cleanOriginal.split('.')
  if (parts.length < 2) {
    return { valid: false, error: 'Fișierul nu are o extensie validă.', safeFilename: '', ext: '' }
  }

  const ext = (parts.pop() || '').toLowerCase().replace(/[^a-z0-9]/g, '')
  const baseName = parts.join('_').replace(/[^a-zA-Z0-9_\-]/g, '_').substring(0, 80)

  // 3. Dangerous extension check
  const DANGEROUS_EXTENSIONS = [
    'html', 'htm', 'svg', 'exe', 'bat', 'sh', 'php', 'phtml', 'js', 'vbs', 'cmd', 'ps1',
    'cgi', 'jar', 'apk', 'msi', 'com', 'scr', 'dll', 'bin', 'py', 'pl', 'jsp', 'asp', 'aspx',
  ]
  if (DANGEROUS_EXTENSIONS.includes(ext)) {
    return { valid: false, error: 'Tipul de fișier este periculos și a fost respins.', safeFilename: '', ext: '' }
  }

  if (!ALLOWED_DOCUMENT_EXTENSIONS.includes(ext as unknown as (typeof ALLOWED_DOCUMENT_EXTENSIONS)[number])) {
    return {
      valid: false,
      error: `Extensia .${ext} nu este permisă. Formate acceptate: PDF, JPG, PNG, WEBP, DOC, DOCX, XLS, XLSX.`,
      safeFilename: '',
      ext: '',
    }
  }

  // 4. Magic Bytes Validation
  const isMagicValid = verifyMagicBytes(fileBuffer, ext, declaredMimeType)
  if (!isMagicValid) {
    return { valid: false, error: 'Conținutul binar al fișierului nu corespunde extensiei declarate.', safeFilename: '', ext: '' }
  }

  const safeFilename = `${baseName}.${ext}`
  return { valid: true, safeFilename, ext }
}

/**
 * Validate binary file header against declared extension
 */
function verifyMagicBytes(buffer: Buffer, ext: string, _declaredMime: string): boolean {
  if (buffer.length < 4) return false

  // PDF: %PDF- (0x25, 0x50, 0x44, 0x46)
  if (ext === 'pdf') {
    return buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46
  }

  // PNG: \x89PNG (0x89, 0x50, 0x4E, 0x47)
  if (ext === 'png') {
    return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47
  }

  // JPEG/JPG: 0xFF 0xD8 0xFF
  if (ext === 'jpg' || ext === 'jpeg') {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
  }

  // WEBP: RIFF....WEBP (0x52 0x49 0x46 0x46 ... 0x57 0x45 0x42 0x50)
  if (ext === 'webp') {
    if (buffer.length < 12) return false
    const isRiff = buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46
    const isWebp = buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
    return isRiff && isWebp
  }

  // DOCX / XLSX: ZIP container (PK\x03\x04 = 0x50 0x4B 0x03 0x04)
  if (ext === 'docx' || ext === 'xlsx') {
    return buffer[0] === 0x50 && buffer[1] === 0x4b && (buffer[2] === 0x03 || buffer[2] === 0x05 || buffer[2] === 0x07)
  }

  // Legacy DOC / XLS: OLE Compound Document (0xD0 0xCF 0x11 0xE0)
  if (ext === 'doc' || ext === 'xls') {
    return buffer[0] === 0xd0 && buffer[1] === 0xcf && buffer[2] === 0x11 && buffer[3] === 0xe0
  }

  return true
}
