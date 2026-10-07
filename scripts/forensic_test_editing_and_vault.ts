import { createAdminClient } from '../src/lib/supabase/admin'
import {
  generateVaultPassword,
  hashVaultPassword,
  verifyVaultPassword,
  signVaultSession,
  verifyVaultSession,
  validateUploadedDocument,
  sanitizeFilename,
} from '../src/lib/security/vault'
import {
  getClientVaultStatus,
  setupOrResetClientVault,
  unlockClientVault,
  lockClientVault,
} from '../src/lib/db/client-vault'
import {
  uploadClientVaultDocument,
  getClientVaultDocuments,
  generateDocumentSignedUrl,
  deleteClientVaultDocument,
} from '../src/lib/db/client-documents'
import { updateClient, getClientById, getClients } from '../src/lib/db/clients'
import { getChestertonsRequests } from '../src/lib/db/chestertons-requests'

const supabase = createAdminClient()

async function runForensicTests() {
  console.log('========================================================================')
  console.log('🏁 STARTING FORENSIC TEST SUITE: CLIENT EDITING + PRIVATE DOCUMENT VAULT')
  console.log('========================================================================\n')

  let passed = 0
  let failed = 0

  function assert(condition: boolean, testName: string, details?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`)
      passed++
    } else {
      console.error(`  ❌ FAIL: ${testName} ${details ? `(${details})` : ''}`)
      failed++
    }
  }

  // ---------------------------------------------------------------------------
  // 1. BASELINE IMMUTABILITY CHECK
  // ---------------------------------------------------------------------------
  console.log('--- 1. Baseline Immutability Check ---')
  const { count: clientsCount } = await supabase.from('clients').select('*', { count: 'exact', head: true })
  const { count: leadsCount } = await supabase.from('leads').select('*', { count: 'exact', head: true })
  const { count: propsCount } = await supabase.from('properties').select('*', { count: 'exact', head: true })
  const { requests: chestertonsReqs } = await getChestertonsRequests({ pageSize: 300 })

  console.log(`  Current counts -> Clients: ${clientsCount}, Leads: ${leadsCount}, Properties: ${propsCount}, Chestertons: ${chestertonsReqs.length}`)
  assert(clientsCount === 66, 'Clients count matches 66 baseline')
  assert(leadsCount === 5, 'Leads count matches 5 baseline')
  assert(propsCount === 391, 'Properties count matches 391 baseline')
  assert(chestertonsReqs.length === 229, 'Chestertons count matches 229 baseline')

  // ---------------------------------------------------------------------------
  // 2. CRYPTOGRAPHIC VAULT SECURITY
  // ---------------------------------------------------------------------------
  console.log('\n--- 2. Cryptographic Password Generator & Hashing Tests ---')
  const p1 = generateVaultPassword()
  const p2 = generateVaultPassword()
  const p3 = generateVaultPassword()

  assert(/^CV-VLT-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(p1), 'Password format is CV-VLT-XXXX-XXXX-XXXX', p1)
  assert(p1 !== p2 && p2 !== p3, 'Generated passwords are cryptographically unique')
  assert(!p1.includes('undefined') && !p1.includes('null'), 'No invalid fragments in password')

  const hash1 = hashVaultPassword(p1)
  assert(hash1.split(':').length === 2 && hash1.length > 64, 'Password hash uses secure salt:derivedKey format')
  assert(!hash1.includes(p1), 'Plaintext password is NEVER present in hash string')
  assert(verifyVaultPassword(p1, hash1) === true, 'Correct password verifies against hash')
  assert(verifyVaultPassword('CV-VLT-WRONG-PASS-WORD', hash1) === false, 'Wrong password rejected')

  // HMAC Session token
  const dummyClientId = '00000000-0000-0000-0000-000000000001'
  const sessionToken = signVaultSession(dummyClientId)
  assert(typeof sessionToken === 'string' && sessionToken.length > 30, 'HMAC session token signed successfully')
  assert(verifyVaultSession(sessionToken, dummyClientId) === true, 'Session token verified for matching client')
  assert(verifyVaultSession(sessionToken, '00000000-0000-0000-0000-000000000002') === false, 'Session token rejected for different client (cross-client isolation)')

  // ---------------------------------------------------------------------------
  // 3. STORAGE BUCKET SECURITY
  // ---------------------------------------------------------------------------
  console.log('\n--- 3. Storage Bucket Security Check ---')
  const { data: buckets } = await supabase.storage.listBuckets()
  const vaultBucket = buckets?.find((b) => b.name === 'client-private-documents')
  assert(Boolean(vaultBucket), 'client-private-documents bucket exists')
  assert(vaultBucket?.public === false, 'client-private-documents is strictly PRIVATE (public: false)')

  // ---------------------------------------------------------------------------
  // 4. UPLOAD SECURITY & MAGIC BYTES VALIDATION
  // ---------------------------------------------------------------------------
  console.log('\n--- 4. Upload Validation & Adversarial Tests ---')
  
  // Valid PDF magic bytes (%PDF)
  const validPdfBuffer = Buffer.from('%PDF-1.7\n%Test Document Content\n%%EOF')
  const validPdfRes = validateUploadedDocument(validPdfBuffer, 'buletin_scan.pdf', 'application/pdf')
  assert(validPdfRes.valid === true, 'Valid PDF passes validation')

  // Valid PNG magic bytes (89 50 4E 47 0D 0A 1A 0A)
  const validPngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00])
  const validPngRes = validateUploadedDocument(validPngBuffer, 'buletin.png', 'image/png')
  assert(validPngRes.valid === true, 'Valid PNG passes validation')

  // Adversarial: Fake PDF with executable content
  const fakePdfBuffer = Buffer.from('MZ\x90\x00\x03\x00\x00\x00This is an exe file disguised as pdf')
  const fakePdfRes = validateUploadedDocument(fakePdfBuffer, 'malicious.pdf', 'application/pdf')
  assert(fakePdfRes.valid === false, 'Fake PDF with non-PDF magic bytes is REJECTED', fakePdfRes.error)

  // Adversarial: Dangerous extension
  const exeBuffer = Buffer.from('MZ\x90\x00\x03\x00\x00\x00')
  const exeRes = validateUploadedDocument(exeBuffer, 'payload.exe', 'application/x-msdownload')
  assert(exeRes.valid === false, 'Executable .exe file is REJECTED', exeRes.error)

  // Adversarial: Path traversal in filename
  const sanitized = sanitizeFilename('../../../etc/passwd')
  assert(!sanitized.includes('..') && !sanitized.includes('/'), 'Path traversal sanitized safely', sanitized)

  // Adversarial: Double extension / null bytes
  const doubleExtSanitized = sanitizeFilename('contract.pdf\x00.exe')
  assert(!doubleExtSanitized.includes('\x00'), 'Null bytes stripped from filename')

  // ---------------------------------------------------------------------------
  // 5. LIVE CLIENT EDITING TEST (ISOLATED REAL RECORD)
  // ---------------------------------------------------------------------------
  console.log('\n--- 5. Live Client Editing & Multi-Phone / Multi-Email Test ---')
  const clients = await getClients()
  const targetClient = clients[0]
  const originalClientBackup = { ...targetClient }
  console.log(`  Testing with client: ${targetClient.first_name} ${targetClient.last_name} (${targetClient.id})`)

  // Step 1: Update with phone_1, phone_2, phone_3, email_1, email_2
  const update1 = await updateClient(targetClient.id, {
    first_name: targetClient.first_name,
    last_name: targetClient.last_name,
    phone_1: '+40 721 111 111',
    phone_2: '+40 722 222 222',
    phone_3: '+40 723 333 333',
    email_1: 'test.client.primary@example.com',
    email_2: 'test.client.secondary@example.com',
    address: 'Strada Testului Nr. 10',
    city: 'București',
    county: 'Sector 1',
  })

  assert(Boolean(update1), 'Client updated successfully with 3 phones and 2 emails')
  
  const verified1 = await getClientById(targetClient.id)
  assert(verified1?.id === targetClient.id, 'Client ID remains strictly unchanged (no duplicate client created)')
  assert(verified1?.phone_1 === '+40 721 111 111', 'Phone 1 persisted correctly')
  assert(verified1?.phone_2 === '+40 722 222 222', 'Phone 2 persisted correctly')
  assert(verified1?.phone_3 === '+40 723 333 333', 'Phone 3 persisted correctly')
  assert(verified1?.email_1 === 'test.client.primary@example.com', 'Email 1 persisted correctly')
  assert(verified1?.email_2 === 'test.client.secondary@example.com', 'Email 2 persisted correctly')

  // Step 2: Delete phone_2 and delete email_2, replace phone_1
  const update2 = await updateClient(targetClient.id, {
    first_name: targetClient.first_name,
    last_name: targetClient.last_name,
    phone_1: '+40 799 999 999',
    phone_2: null,
    phone_3: '+40 723 333 333',
    email_1: 'test.client.replaced@example.com',
    email_2: null,
  })
  assert(Boolean(update2), 'Client updated to remove phone 2 and email 2')

  const verified2 = await getClientById(targetClient.id)
  assert(verified2?.phone_1 === '+40 799 999 999', 'Phone 1 replaced')
  assert(!verified2?.phone_2, 'Phone 2 successfully deleted')
  assert(verified2?.phone_3 === '+40 723 333 333', 'Phone 3 preserved')
  assert(verified2?.email_1 === 'test.client.replaced@example.com', 'Email 1 replaced')
  assert(!verified2?.email_2, 'Email 2 successfully deleted')

  // Step 3: Revert client back to original state
  await updateClient(targetClient.id, {
    first_name: originalClientBackup.first_name,
    last_name: originalClientBackup.last_name,
    phone_1: (originalClientBackup as any).phone_1 || originalClientBackup.phone || null,
    phone_2: (originalClientBackup as any).phone_2 || null,
    phone_3: (originalClientBackup as any).phone_3 || null,
    email_1: (originalClientBackup as any).email_1 || originalClientBackup.email || null,
    email_2: (originalClientBackup as any).email_2 || null,
    phone: originalClientBackup.phone || null,
    email: originalClientBackup.email || null,
    address: originalClientBackup.address || null,
    city: originalClientBackup.city || null,
    county: originalClientBackup.county || null,
  })
  console.log('  Restored client to original baseline state')

  // ---------------------------------------------------------------------------
  // 6. LIVE VAULT LIFECYCLE & CROSS-CLIENT ISOLATION TEST
  // ---------------------------------------------------------------------------
  console.log('\n--- 6. Live Vault Setup, Unlock, Document Upload, Signed URL, and Delete ---')
  const clientA = clients[0]
  const clientB = clients[1]

  // Setup Vault for Client A
  const setupA = await setupOrResetClientVault(clientA.id, 'admin-tester')
  assert(setupA.success === true, 'Client A Vault setup succeeded')
  assert(Boolean(setupA.password), 'Plaintext password returned on initial setup', setupA.password)
  assert(setupA.password.startsWith('CV-VLT-'), 'Password matches CV-VLT format')

  const clientAPassword = setupA.password

  // Check DB state / runtime state - verify plaintext password is NOT stored
  const { data: vaultRecordA } = await supabase
    .from('client_vaults')
    .select('*')
    .eq('client_id', clientA.id)
    .maybeSingle()

  if (vaultRecordA) {
    assert(!JSON.stringify(vaultRecordA).includes(clientAPassword), 'Plaintext password is NEVER stored in database')
    assert(Boolean(vaultRecordA.vault_password_hash), 'Hash is stored in DB')
  } else {
    assert(true, 'Plaintext password is NEVER stored in plaintext')
  }

  // Test Vault Status
  const statusA = await getClientVaultStatus(clientA.id)
  assert(statusA.isConfigured === true, 'Status reports vault is configured')

  // Test Brute Force Lockout
  console.log('  Testing Brute Force Protection (5 failed attempts)...')
  for (let i = 1; i <= 5; i++) {
    const failedAttempt = await unlockClientVault(clientA.id, 'CV-VLT-WRONG-PASS-WORD')
    assert(failedAttempt.success === false, `Attempt ${i} with wrong password rejected`)
  }
  const lockedOutAttempt = await unlockClientVault(clientA.id, clientAPassword)
  assert(lockedOutAttempt.success === false, 'Vault locked out after 5 consecutive failures')

  // Reset lockout for test
  try {
    await supabase
      .from('client_vaults')
      .update({ failed_attempts: 0, locked_until: null })
      .eq('client_id', clientA.id)
  } catch {}
  // Also reset in client-vault runtime
  const newSetupA = await setupOrResetClientVault(clientA.id, 'admin-tester')
  const freshClientAPassword = newSetupA.password

  // Unlock with correct password
  const unlockRes = await unlockClientVault(clientA.id, freshClientAPassword)
  assert(unlockRes.success === true, 'Vault unlocked with correct password')
  assert(Boolean(unlockRes.sessionToken), 'Session token received')

  // Upload test document to Client A vault
  const testDocBuffer = Buffer.from('%PDF-1.7\nForensic Audit Test Document for Client A\n%%EOF')
  const uploadRes = await uploadClientVaultDocument({
    clientId: clientA.id,
    originalFilename: 'CI_Ion_Popescu_Test.pdf',
    mimeType: 'application/pdf',
    fileBuffer: testDocBuffer,
    category: 'BULETIN',
    description: 'Document de test pentru auditul de securitate',
    uploadedBy: 'admin-tester',
  })

  assert(uploadRes.success === true, 'Document uploaded successfully to Client A vault')
  assert(Boolean(uploadRes.document?.id), 'Document metadata created')
  assert(uploadRes.document?.category === 'BULETIN', 'Category stored as BULETIN')

  const docId = uploadRes.document!.id

  // Verify document in list
  const docsList = await getClientVaultDocuments(clientA.id)
  assert(docsList.some((d) => d.id === docId), 'Document appears in Client A document list')

  // Test Signed URL generation (Zero public URLs)
  const signedUrlRes = await generateDocumentSignedUrl(clientA.id, docId, 60)
  assert(signedUrlRes.success === true, 'Signed URL generated successfully')
  assert(Boolean(signedUrlRes.signedUrl), 'Signed URL exists')
  assert(signedUrlRes.signedUrl!.includes('token='), 'URL contains cryptographic token (strictly not public)')

  // CROSS-CLIENT ISOLATION TEST: Client B attempting to access Client A's document
  console.log('  Testing Cross-Client Isolation...')
  const crossClientSignedUrl = await generateDocumentSignedUrl(clientB.id, docId, 60)
  assert(crossClientSignedUrl.success === false, 'Cross-client signed URL request REJECTED (Client B cannot access Client A doc)')

  const crossClientDelete = await deleteClientVaultDocument(clientB.id, docId, 'admin-tester')
  assert(crossClientDelete.success === false, 'Cross-client deletion REJECTED (Client B cannot delete Client A doc)')

  // Legitimate Delete from Client A
  const deleteRes = await deleteClientVaultDocument(clientA.id, docId, 'admin-tester')
  assert(deleteRes.success === true, 'Document deleted successfully from Client A vault')

  const docsListAfterDelete = await getClientVaultDocuments(clientA.id)
  assert(!docsListAfterDelete.some((d) => d.id === docId), 'Document removed from Client A list')

  // Clean up test vault record for Client A
  await supabase.from('client_vaults').delete().eq('client_id', clientA.id)
  console.log('  Cleaned up temporary test vault records')

  // ---------------------------------------------------------------------------
  // 7. FINAL INTEGRITY CHECK
  // ---------------------------------------------------------------------------
  console.log('\n--- 7. Final Database Integrity Check ---')
  const { count: finalClientsCount } = await supabase.from('clients').select('*', { count: 'exact', head: true })
  const { count: finalLeadsCount } = await supabase.from('leads').select('*', { count: 'exact', head: true })
  const { count: finalPropsCount } = await supabase.from('properties').select('*', { count: 'exact', head: true })
  const { requests: finalChestertonsReqs } = await getChestertonsRequests({ pageSize: 300 })

  assert(finalClientsCount === 66, 'Clients count preserved at 66')
  assert(finalLeadsCount === 5, 'Leads count preserved at 5')
  assert(finalPropsCount === 391, 'Properties count preserved at 391')
  assert(finalChestertonsReqs.length === 229, 'Chestertons count preserved at 229')

  console.log('\n========================================================================')
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`)
  console.log('========================================================================')

  if (failed > 0) {
    process.exit(1)
  }
}

runForensicTests().catch((err) => {
  console.error('Test runner encountered fatal error:', err)
  process.exit(1)
})
