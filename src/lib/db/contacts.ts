import { createClient as createServerClient } from '@/lib/supabase/server'
import { getPhoneVariants, normalizeEmail, normalizePhone } from '@/lib/utils/phone'
import type { Database } from '@/types'

export type ContactRow = Database['public']['Tables']['contacts']['Row'] & {
  clients?: {
    id: string
    first_name: string
    last_name: string
    status: string
    category: string | null
    phone: string | null
    email: string | null
  } | null
}
export type ContactInsert = Database['public']['Tables']['contacts']['Insert']
export type ContactUpdate = Database['public']['Tables']['contacts']['Update']
export type ContactImportRow = Database['public']['Tables']['contact_imports']['Row']

export interface GetContactsOptions {
  search?: string
  category?: string
  clientFilter?: 'all' | 'clients_only' | 'agenda_only'
  limit?: number
  offset?: number
}

export async function getContacts(options: GetContactsOptions = {}) {
  const supabase = await createServerClient()
  const { search, category, clientFilter, limit = 1000, offset = 0 } = options

  let query = supabase
    .from('contacts')
    .select(`
      *,
      clients:client_id (
        id,
        first_name,
        last_name,
        status,
        category,
        phone,
        email
      )
    `)
    .order('created_at', { ascending: false })

  if (category && category !== 'ALL') {
    query = query.eq('category', category)
  }

  if (clientFilter === 'clients_only') {
    query = query.not('client_id', 'is', null)
  } else if (clientFilter === 'agenda_only') {
    query = query.is('client_id', null)
  }

  if (search && search.trim()) {
    const q = search.trim()
    query = query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,phone.ilike.%${q}%,email.ilike.%${q}%,company_name.ilike.%${q}%,notes.ilike.%${q}%`)
  }

  if (limit) {
    query = query.range(offset, offset + limit - 1)
  }

  const { data, error, count } = await query
  if (error) throw error
  return { data: (data as ContactRow[]) || [], count }
}

export async function getContactById(id: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('contacts')
    .select(`
      *,
      clients:client_id (
        id,
        first_name,
        last_name,
        status,
        category,
        phone,
        email
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data as ContactRow
}

export async function createContact(contact: ContactInsert) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('contacts')
    .insert(contact)
    .select()
    .single()

  if (error) throw error
  return data as ContactRow
}

export async function updateContact(id: string, contact: ContactUpdate) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('contacts')
    .update({ ...contact, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as ContactRow
}

export async function deleteContact(id: string) {
  const supabase = await createServerClient()
  const { error } = await supabase
    .from('contacts')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

/**
 * Checks duplicates across contacts and clients
 */
export async function checkDuplicateContacts(phone?: string, email?: string) {
  const supabase = await createServerClient()
  const phoneVariants = phone ? getPhoneVariants(phone) : []
  const normEmail = email ? normalizeEmail(email) : ''

  const conditions: string[] = []
  phoneVariants.forEach((v) => conditions.push(`phone.eq.${v}`))
  if (normEmail) conditions.push(`email.ilike.${normEmail}`)

  if (conditions.length === 0) return { contacts: [], clients: [] }

  const [contactsRes, clientsRes] = await Promise.all([
    supabase.from('contacts').select('*').or(conditions.join(',')).limit(10),
    supabase.from('clients').select('*').or(conditions.join(',')).limit(10),
  ])

  return {
    contacts: contactsRes.data || [],
    clients: clientsRes.data || [],
  }
}

/**
 * Converts an Agenda Contact into a full CRM Client record, linking them atomically
 */
export async function convertContactToClient(
  contactId: string,
  conversionData: {
    category: string
    source: string
    interest_summary?: string
  }
) {
  const supabase = await createServerClient()

  // 1. Fetch contact
  const { data: contact, error: fetchErr } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', contactId)
    .single()

  if (fetchErr || !contact) {
    throw new Error('Contact not found')
  }

  // If already linked to a client
  if (contact.client_id) {
    const { data: existingClient } = await supabase
      .from('clients')
      .select('*')
      .eq('id', contact.client_id)
      .single()

    if (existingClient) {
      return { client: existingClient, contact }
    }
  }

  // 2. Insert into clients
  const normPhone = contact.phone ? normalizePhone(contact.phone) : contact.phone
  const normWhatsapp = contact.whatsapp ? normalizePhone(contact.whatsapp) : normPhone

  const clientPayload = {
    first_name: contact.first_name,
    last_name: contact.last_name || '(Contact)',
    phone: normPhone,
    whatsapp: normWhatsapp,
    email: contact.email,
    address: contact.address,
    city: contact.city,
    country: contact.country || 'Romania',
    role: contact.role,
    category: conversionData.category || 'REAL_ESTATE',
    lead_source: conversionData.source || 'DIRECT_CONTACT',
    interest_summary: conversionData.interest_summary || contact.interest_summary || null,
    personal_notes: contact.notes || null,
    status: 'ACTIVE' as const,
    client_type: 'INDIVIDUAL' as const,
  }

  const { data: newClient, error: clientErr } = await supabase
    .from('clients')
    .insert(clientPayload)
    .select()
    .single()

  if (clientErr || !newClient) {
    throw clientErr || new Error('Failed to create client from contact')
  }

  // 3. Link contact to new client
  const { data: updatedContact, error: linkErr } = await supabase
    .from('contacts')
    .update({
      client_id: newClient.id,
      category: conversionData.category,
      source: conversionData.source,
      interest_summary: conversionData.interest_summary || contact.interest_summary,
      updated_at: new Date().toISOString(),
    })
    .eq('id', contactId)
    .select()
    .single()

  if (linkErr) {
    console.error('Warning: could not link contact to client:', linkErr)
  }

  return { client: newClient, contact: updatedContact || contact }
}

/**
 * Creates import log record in contact_imports
 */
export async function createContactImportRecord(data: Database['public']['Tables']['contact_imports']['Insert']) {
  const supabase = await createServerClient()
  const { data: record, error } = await supabase
    .from('contact_imports')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return record as ContactImportRow
}

/**
 * Fetches contacts summary counts
 */
export async function getContactsCounts() {
  const supabase = await createServerClient()

  const [totalRes, clientsRes] = await Promise.all([
    supabase.from('contacts').select('id', { count: 'exact', head: true }),
    supabase.from('contacts').select('id', { count: 'exact', head: true }).not('client_id', 'is', null),
  ])

  const total = totalRes.count || 0
  const clientsCount = clientsRes.count || 0
  const nonClientsCount = total - clientsCount

  return {
    total,
    clientsCount,
    nonClientsCount,
  }
}
