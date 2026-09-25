import { createClient as createServerClient } from '@/lib/supabase/server'
import { getPhoneVariants, normalizeEmail } from '@/lib/utils/phone'
import type { Database } from '@/types'

export type ClientInsert = Database['public']['Tables']['clients']['Insert']
export type ClientUpdate = Database['public']['Tables']['clients']['Update']
export type ClientRow = Database['public']['Tables']['clients']['Row']

export interface GetClientsOptions {
  search?: string
  category?: string
  status?: string
  quickFilter?: string
  limit?: number
  offset?: number
}

export type ClientWithRelations = ClientRow & {
  companies?: { name?: string | null } | null
  client_relationships?: { relationship_type: string; is_primary?: boolean | null }[] | null
  follow_ups?: { id: string; due_date: string; status: string; reason: string; priority: string }[] | null
  activities?: { id: string; date: string; type: string; title: string }[] | null
}

export async function getClients(options: GetClientsOptions = {}) {
  const supabase = await createServerClient()
  const { search, category, status, quickFilter } = options

  let query = supabase
    .from('clients')
    .select(`
      *,
      companies (
        name
      ),
      client_relationships (
        relationship_type,
        is_primary
      ),
      follow_ups (
        id,
        due_date,
        status,
        reason,
        priority
      ),
      activities (
        id,
        date,
        type,
        title
      )
    `)
    .order('created_at', { ascending: false })

  if (status && status.trim()) {
    query = query.eq('status', status.trim())
  }

  if (category && category !== 'ALL') {
    query = query.eq('category', category)
  }

  if (search && search.trim()) {
    const q = search.trim()
    query = query.or(
      `first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%,interest_summary.ilike.%${q}%`
    )
  }

  const { data, error } = await query
  if (error) throw error

  let results = (data as unknown as ClientWithRelations[]) || []

  // Apply quick filters if requested
  if (quickFilter) {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const todayEnd = todayStart + 24 * 60 * 60 * 1000 - 1
    const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000

    if (quickFilter === 'no_followup') {
      results = results.filter((c) => {
        const pending = (c.follow_ups || []).filter((f) => f.status === 'PENDING')
        return pending.length === 0
      })
    } else if (quickFilter === 'followup_today') {
      results = results.filter((c) => {
        return (c.follow_ups || []).some((f) => {
          if (f.status !== 'PENDING') return false
          const dueTime = new Date(f.due_date).getTime()
          return dueTime >= todayStart && dueTime <= todayEnd
        })
      })
    } else if (quickFilter === 'followup_overdue') {
      results = results.filter((c) => {
        return (c.follow_ups || []).some((f) => {
          if (f.status !== 'PENDING') return false
          return new Date(f.due_date).getTime() < todayStart
        })
      })
    } else if (quickFilter === 'new_clients') {
      results = results.filter((c) => new Date(c.created_at).getTime() >= sevenDaysAgo)
    }
  }

  return results
}

export async function getClientById(id: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('clients')
    .select(`
      *,
      client_relationships (
        relationship_type,
        is_primary
      ),
      companies (
        id,
        name,
        email,
        phone
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createClientRecord(client: ClientInsert) {
  const supabase = await createServerClient()
  
  // Clean payload
  const payload: ClientInsert = {
    ...client,
    country: client.country || 'Romania',
    status: client.status || 'ACTIVE',
    client_type: client.client_type || 'INDIVIDUAL',
    category: client.category || 'REAL_ESTATE',
    preferred_communication: client.preferred_communication || 'whatsapp',
  }

  const { data, error } = await supabase
    .from('clients')
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return data as ClientRow
}

export async function updateClient(id: string, client: ClientUpdate) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('clients')
    .update({ ...client, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as ClientRow
}

export async function searchClients(query: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .or(
      `first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%,interest_summary.ilike.%${query}%`
    )
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function checkDuplicateClients(phone?: string, email?: string, name?: string) {
  const supabase = await createServerClient()
  const phoneVariants = phone ? getPhoneVariants(phone) : []
  const normEmail = email ? normalizeEmail(email) : ''

  const conditions: string[] = []
  phoneVariants.forEach((v) => {
    conditions.push(`phone.eq.${v}`)
    conditions.push(`whatsapp.eq.${v}`)
  })
  if (normEmail) {
    conditions.push(`email.ilike.${normEmail}`)
  }

  // If no phone or email, but name provided
  if (conditions.length === 0 && name && name.trim().length >= 3) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      conditions.push(`and(first_name.ilike.%${parts[0]}%,last_name.ilike.%${parts[parts.length - 1]}%)`)
    } else {
      conditions.push(`first_name.ilike.%${name.trim()}%,last_name.ilike.%${name.trim()}%`)
    }
  }

  if (conditions.length === 0) return []

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .or(conditions.join(','))
    .limit(10)

  if (error) throw error
  return data as ClientRow[]
}
