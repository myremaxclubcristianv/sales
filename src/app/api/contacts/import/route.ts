import { createContactImportRecord } from '@/lib/db/contacts'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { getPhoneVariants, normalizeEmail, normalizePhone, sanitizeSpreadsheetValue } from '@/lib/utils/phone'
import type { Database } from '@/types'
import { NextResponse } from 'next/server'

interface ImportContactInput {
  first_name?: string
  last_name?: string
  name?: string
  phone?: string
  whatsapp?: string
  email?: string
  company_name?: string
  organization?: string
  role?: string
  category?: string
  source?: string
  notes?: string
  address?: string
  city?: string
  country?: string
  raw_data?: Record<string, unknown>
}

interface ImportRequestBody {
  filename: string
  contacts: ImportContactInput[]
  mode?: 'skip' | 'update_empty'
  importRecordId?: string
  isFinalBatch?: boolean
  totalExpectedRows?: number
}

type ContactInsert = Database['public']['Tables']['contacts']['Insert']

interface ExistingContactSummary {
  id?: string
  first_name?: string | null
  last_name?: string | null
  phone?: string | null
  whatsapp?: string | null
  email?: string | null
  company_name?: string | null
  notes?: string | null
  address?: string | null
  city?: string | null
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: ImportRequestBody = await request.json()
    const {
      filename = 'import.csv',
      contacts = [],
      mode = 'skip',
      isFinalBatch = true,
      totalExpectedRows = contacts.length,
    } = body

    if (!Array.isArray(contacts) || contacts.length === 0) {
      return NextResponse.json({ error: 'Niciun contact furnizat pentru import' }, { status: 400 })
    }

    // Safety limit on batch size: max 1000 per request
    if (contacts.length > 1000) {
      return NextResponse.json(
        { error: 'Batch-ul depășește limita maximă de 1000 contacte per cerere' },
        { status: 400 }
      )
    }

    // 1. Preload existing contacts for fast in-memory phone/email duplicate checking
    // Fetch phones & emails from contacts
    const { data: existingContacts } = await supabase
      .from('contacts')
      .select('id, first_name, last_name, phone, whatsapp, email, company_name, notes, address, city')

    const phoneToContactMap = new Map<string, ExistingContactSummary>()
    const emailToContactMap = new Map<string, ExistingContactSummary>()

    if (existingContacts) {
      for (const ec of existingContacts) {
        if (ec.phone) {
          const variants = getPhoneVariants(ec.phone)
          variants.forEach((v) => phoneToContactMap.set(v, ec))
        }
        if (ec.whatsapp) {
          const variants = getPhoneVariants(ec.whatsapp)
          variants.forEach((v) => phoneToContactMap.set(v, ec))
        }
        if (ec.email) {
          emailToContactMap.set(normalizeEmail(ec.email), ec)
        }
      }
    }

    let importedCount = 0
    let skippedCount = 0
    let duplicateCount = 0
    let invalidCount = 0
    const errors: Array<{ index: number; name: string; error: string }> = []
    const toInsert: ContactInsert[] = []

    for (let i = 0; i < contacts.length; i++) {
      const c = contacts[i]

      // Extract & clean name
      let firstName = c.first_name ? sanitizeSpreadsheetValue(c.first_name) : ''
      let lastName = c.last_name ? sanitizeSpreadsheetValue(c.last_name) : ''

      if (!firstName && !lastName && c.name) {
        const parts = c.name.trim().split(/\s+/)
        firstName = sanitizeSpreadsheetValue(parts[0])
        lastName = sanitizeSpreadsheetValue(parts.slice(1).join(' '))
      }

      const rawPhone = c.phone || c.whatsapp || ''
      const normPhone = rawPhone ? normalizePhone(rawPhone) : null
      const normEmail = c.email ? normalizeEmail(c.email) : null
      const companyName = sanitizeSpreadsheetValue(c.company_name || c.organization || '')
      const role = sanitizeSpreadsheetValue(c.role || '')
      const notes = sanitizeSpreadsheetValue(c.notes || '')
      const address = sanitizeSpreadsheetValue(c.address || '')
      const city = sanitizeSpreadsheetValue(c.city || '')
      const category = c.category || null
      const source = c.source || 'DIRECT_CONTACT'

      // Validation check
      if (!firstName && !lastName && !normPhone && !normEmail) {
        invalidCount++
        errors.push({
          index: i + 1,
          name: 'Rând incomplet',
          error: 'Lipsește numele, telefonul și adresa de email',
        })
        continue
      }

      if (!firstName && !lastName) {
        firstName = normPhone || normEmail || 'Contact'
      }

      // Check if duplicate exists in existing contacts or previously processed in this batch
      let matchedContact: ExistingContactSummary | undefined
      if (normPhone) {
        matchedContact = phoneToContactMap.get(normPhone)
      }
      if (!matchedContact && normEmail) {
        matchedContact = emailToContactMap.get(normEmail)
      }

      if (matchedContact) {
        duplicateCount++
        if (mode === 'skip') {
          skippedCount++
          continue
        } else if (mode === 'update_empty' && matchedContact.id) {
          // Update only empty fields on the matched contact
          const updates: Record<string, unknown> = {}
          if (!matchedContact.email && normEmail) updates.email = normEmail
          if (!matchedContact.phone && normPhone) updates.phone = normPhone
          if (!matchedContact.company_name && companyName) updates.company_name = companyName
          if (!matchedContact.address && address) updates.address = address
          if (!matchedContact.city && city) updates.city = city
          if (!matchedContact.notes && notes) updates.notes = notes

          if (Object.keys(updates).length > 0) {
            await supabase.from('contacts').update(updates).eq('id', matchedContact.id)
            importedCount++
          } else {
            skippedCount++
          }
          continue
        }
      }

      // Register into maps to prevent duplicate within the same batch
      const contactRecord: ContactInsert = {
        first_name: firstName,
        last_name: lastName,
        phone: normPhone,
        whatsapp: normPhone,
        email: normEmail,
        company_name: companyName || null,
        role: role || null,
        category: category,
        source: source,
        notes: notes || null,
        address: address || null,
        city: city || null,
        country: 'Romania',
        raw_data: c.raw_data || null,
      }

      toInsert.push(contactRecord)

      // Add to map for rest of this batch
      const summaryItem: ExistingContactSummary = {
        first_name: firstName,
        last_name: lastName,
        phone: normPhone,
        whatsapp: normPhone,
        email: normEmail,
        company_name: companyName,
        address,
        city,
        notes,
      }
      if (normPhone) {
        phoneToContactMap.set(normPhone, summaryItem)
      }
      if (normEmail) {
        emailToContactMap.set(normEmail, summaryItem)
      }
    }

    // Perform bulk insert
    if (toInsert.length > 0) {
      const { data: inserted, error: insertErr } = await supabase
        .from('contacts')
        .insert(toInsert)
        .select('id')

      if (insertErr) {
        console.error('Batch insert error:', insertErr)
        throw insertErr
      }
      importedCount += inserted ? inserted.length : toInsert.length
    }

    // If final batch or tracking record, create or update contact_imports
    if (isFinalBatch) {
      await createContactImportRecord({
        filename,
        imported_by: user.id,
        total_rows: totalExpectedRows,
        imported_count: importedCount,
        skipped_count: skippedCount,
        duplicate_count: duplicateCount,
        invalid_count: invalidCount,
        summary: {
          errors_count: errors.length,
          errors_sample: errors.slice(0, 50),
          completed_at: new Date().toISOString(),
        },
      }).catch((err) => console.error('Failed to log contact_imports record:', err))
    }

    return NextResponse.json({
      success: true,
      importedCount,
      skippedCount,
      duplicateCount,
      invalidCount,
      errors,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Eroare la importul contactelor'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
