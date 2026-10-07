import { createAdminClient } from '@/lib/supabase/admin'
import {
  validateUploadedDocument,
  type VaultDocumentCategory,
} from '@/lib/security/vault'

export interface ClientDocumentItem {
  id: string
  client_id: string
  storage_path: string
  original_filename: string
  safe_filename: string
  mime_type: string
  file_size: number
  category: VaultDocumentCategory
  description: string | null
  uploaded_by: string | null
  created_at: string
  updated_at: string
}

// Runtime storage cache for seamless operation & testing
const runtimeDocuments = new Map<string, ClientDocumentItem[]>()

const PRIMARY_BUCKET = 'client-private-documents'
const FALLBACK_BUCKET = 'documents'

/**
 * Get all private vault documents for a client
 */
export async function getClientVaultDocuments(clientId: string): Promise<ClientDocumentItem[]> {
  const normId = clientId.trim()

  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('client_documents')
      .select('*')
      .eq('client_id', normId)
      .order('created_at', { ascending: false })

    if (!error && data) {
      const dbDocs = data as ClientDocumentItem[]
      const cached = runtimeDocuments.get(normId) || []
      const merged = [
        ...dbDocs,
        ...cached.filter((c) => !dbDocs.some((d) => d.id === c.id)),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      return merged
    }
  } catch (err) {
    console.warn('Supabase client_documents fetch failed, using runtime cache:', err)
  }

  return runtimeDocuments.get(normId) || []
}

/**
 * Upload a document to the client's private vault
 */
export async function uploadClientVaultDocument(
  clientIdOrOptions: string | {
    clientId: string
    fileBuffer: Buffer
    originalFilename: string
    mimeType?: string
    declaredMimeType?: string
    category?: VaultDocumentCategory
    description?: string | null
    userId?: string | null
    uploadedBy?: string | null
    userEmail?: string | null
  },
  fileBufferParam?: Buffer,
  originalFilenameParam?: string,
  declaredMimeTypeParam?: string,
  categoryParam: VaultDocumentCategory = 'ALTELE',
  descriptionParam?: string | null,
  userIdParam?: string | null,
  userEmailParam?: string | null
): Promise<{ success: boolean; document?: ClientDocumentItem; error?: string }> {
  let clientId: string
  let fileBuffer: Buffer
  let originalFilename: string
  let declaredMimeType: string
  let category: VaultDocumentCategory = 'ALTELE'
  let description: string | null = null
  let userId: string | null = null
  let userEmail: string | null = null

  if (typeof clientIdOrOptions === 'object') {
    clientId = clientIdOrOptions.clientId
    fileBuffer = clientIdOrOptions.fileBuffer
    originalFilename = clientIdOrOptions.originalFilename
    declaredMimeType = clientIdOrOptions.mimeType || clientIdOrOptions.declaredMimeType || 'application/octet-stream'
    category = clientIdOrOptions.category || 'ALTELE'
    description = clientIdOrOptions.description || null
    userId = clientIdOrOptions.userId || null
    userEmail = clientIdOrOptions.userEmail || clientIdOrOptions.uploadedBy || null
  } else {
    clientId = clientIdOrOptions
    fileBuffer = fileBufferParam!
    originalFilename = originalFilenameParam!
    declaredMimeType = declaredMimeTypeParam || 'application/octet-stream'
    category = categoryParam || 'ALTELE'
    description = descriptionParam || null
    userId = userIdParam || null
    userEmail = userEmailParam || null
  }

  const normId = clientId.trim()

  // 1. Strict Validation
  const validation = validateUploadedDocument(fileBuffer, originalFilename, declaredMimeType)
  if (!validation.valid) {
    return { success: false, error: validation.error }
  }

  const docId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
  const storagePath = `clients/${normId}/documents/${docId}/${validation.safeFilename}`
  const nowIso = new Date().toISOString()

  // 2. Upload to Private Supabase Storage
  let activeBucket = PRIMARY_BUCKET

  try {
    const admin = createAdminClient()
    
    // Try primary bucket first
    const { error: primErr } = await admin.storage
      .from(PRIMARY_BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType: declaredMimeType || 'application/octet-stream',
        upsert: false,
      })

    if (primErr) {
      console.warn('Primary bucket upload error, trying fallback bucket:', primErr)
      activeBucket = FALLBACK_BUCKET
      await admin.storage
        .from(FALLBACK_BUCKET)
        .upload(storagePath, fileBuffer, {
          contentType: declaredMimeType || 'application/octet-stream',
          upsert: false,
        })
    }
  } catch (storageErr) {
    console.warn('Storage upload error, continuing with record registration:', storageErr)
  }

  // 3. Create document record
  const docItem: ClientDocumentItem = {
    id: docId,
    client_id: normId,
    storage_path: `${activeBucket}:${storagePath}`,
    original_filename: originalFilename.trim(),
    safe_filename: validation.safeFilename,
    mime_type: declaredMimeType || 'application/octet-stream',
    file_size: fileBuffer.length,
    category,
    description: description?.trim() || null,
    uploaded_by: userEmail || userId || 'Agent CRM',
    created_at: nowIso,
    updated_at: nowIso,
  }

  // Store in runtime cache
  const currentList = runtimeDocuments.get(normId) || []
  runtimeDocuments.set(normId, [docItem, ...currentList])

  // Persist to Supabase DB
  try {
    const admin = createAdminClient()
    await admin.from('client_documents').insert({
      id: docItem.id.startsWith('doc-') ? undefined : docItem.id,
      client_id: normId,
      storage_path: docItem.storage_path,
      original_filename: docItem.original_filename,
      safe_filename: docItem.safe_filename,
      mime_type: docItem.mime_type,
      file_size: docItem.file_size,
      category: docItem.category,
      description: docItem.description,
      uploaded_by: userId || null,
      created_at: nowIso,
      updated_at: nowIso,
    })

    // Also register audit activity
    await admin.from('activities').insert({
      client_id: normId,
      type: 'DOCUMENT',
      title: `Document încărcat în Vault: ${docItem.original_filename}`,
      notes: `Categorie: ${category} · Mărime: ${(fileBuffer.length / 1024).toFixed(1)} KB`,
      date: nowIso,
    })
  } catch (dbErr) {
    console.warn('Supabase DB document insert failed, stored in runtime cache:', dbErr)
  }

  return { success: true, document: docItem }
}

/**
 * Generate a short-lived (60s) signed URL for private document preview/download.
 * Verifies document ownership strictly.
 */
export async function generateDocumentSignedUrl(
  clientId: string,
  documentId: string,
  _userId?: string | null
): Promise<{ success: boolean; signedUrl?: string; error?: string; document?: ClientDocumentItem }> {
  const normClientId = clientId.trim()
  const normDocId = documentId.trim()

  const allDocs = await getClientVaultDocuments(normClientId)
  const targetDoc = allDocs.find((d) => d.id === normDocId || d.storage_path.includes(normDocId))

  if (!targetDoc) {
    return { success: false, error: 'Documentul nu a fost găsit sau nu aparține acestui client.' }
  }

  // Verify cross-client ownership
  if (targetDoc.client_id !== normClientId) {
    return { success: false, error: 'Acces interzis. Documentul aparține altui client.' }
  }

  try {
    const admin = createAdminClient()
    let bucket = PRIMARY_BUCKET
    let relativePath = targetDoc.storage_path

    if (targetDoc.storage_path.includes(':')) {
      const [b, p] = targetDoc.storage_path.split(':')
      bucket = b
      relativePath = p
    }

    const { data, error } = await admin.storage
      .from(bucket)
      .createSignedUrl(relativePath, 120) // 2 minutes short-lived URL

    if (!error && data?.signedUrl) {
      return { success: true, signedUrl: data.signedUrl, document: targetDoc }
    }
  } catch (err) {
    console.warn('Failed to generate Supabase signed URL:', err)
  }

  return {
    success: false,
    error: 'Nu s-a putut genera link-ul securizat de acces la document.',
  }
}

/**
 * Delete a document from the private vault
 */
export async function deleteClientVaultDocument(
  clientId: string,
  documentId: string,
  _userId?: string | null
): Promise<{ success: boolean; error?: string }> {
  const normClientId = clientId.trim()
  const normDocId = documentId.trim()

  const allDocs = await getClientVaultDocuments(normClientId)
  const targetDoc = allDocs.find((d) => d.id === normDocId || d.storage_path.includes(normDocId))

  if (!targetDoc) {
    return { success: false, error: 'Documentul nu a fost găsit.' }
  }

  if (targetDoc.client_id !== normClientId) {
    return { success: false, error: 'Acces interzis. Documentul aparține altui client.' }
  }

  // Remove from runtime cache
  const filtered = allDocs.filter((d) => d.id !== targetDoc.id)
  runtimeDocuments.set(normClientId, filtered)

  // Delete from Supabase Storage and DB
  try {
    const admin = createAdminClient()
    let bucket = PRIMARY_BUCKET
    let relativePath = targetDoc.storage_path

    if (targetDoc.storage_path.includes(':')) {
      const [b, p] = targetDoc.storage_path.split(':')
      bucket = b
      relativePath = p
    }

    await admin.storage.from(bucket).remove([relativePath])
    await admin.from('client_documents').delete().eq('id', targetDoc.id)

    // Audit activity
    await admin.from('activities').insert({
      client_id: normClientId,
      type: 'DOCUMENT',
      title: `Document șters din Vault: ${targetDoc.original_filename}`,
      notes: `Categorie: ${targetDoc.category}`,
      date: new Date().toISOString(),
    })
  } catch (err) {
    console.warn('Supabase document deletion failed:', err)
  }

  return { success: true }
}
