import { createClient as createServerClient } from '@/lib/supabase/server'
import { getPhoneVariants, normalizeEmail, normalizePhone } from '@/lib/utils/phone'
import { parseAndValidateCnp } from '@/lib/utils/cnp'
import type { Database } from '@/types'

export type ClientInsert = Database['public']['Tables']['clients']['Insert']
export type ClientUpdate = Database['public']['Tables']['clients']['Update']
export type ClientRow = Database['public']['Tables']['clients']['Row']

export interface GetClientsOptions {
  search?: string
  category?: string
  status?: string
  source?: string
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
  const { search, category, status, source, quickFilter } = options

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

  if (source && source.trim()) {
    query = query.eq('lead_source', source.trim())
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

import type { SupabaseClient } from '@supabase/supabase-js'

export async function createClientRecord(client: ClientInsert, customSupabase?: SupabaseClient) {
  const supabase = customSupabase || (await createServerClient())
  
  // Clean payload
  const normPhone = client.phone ? normalizePhone(client.phone) : client.phone
  const normWhatsapp = client.whatsapp ? normalizePhone(client.whatsapp) : (client.phone ? normalizePhone(client.phone) : client.whatsapp)

  // Auto-derive DOB from CNP if DOB not provided
  let effectiveDob = client.date_of_birth || null
  if (!effectiveDob && client.cnp) {
    const cnpRes = parseAndValidateCnp(client.cnp)
    if (cnpRes.isValid && cnpRes.dateOfBirth) {
      effectiveDob = cnpRes.dateOfBirth
    }
  }

  const payload: ClientInsert = {
    ...client,
    date_of_birth: effectiveDob,
    phone: normPhone,
    whatsapp: normWhatsapp,
    country: client.country || 'Romania',
    status: client.status || 'NOT_CONTACTED',
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
  const savedClient = data as ClientRow

  // Sync personal_events birthday event if DOB exists
  if (savedClient.date_of_birth) {
    try {
      const clientName = `${savedClient.first_name} ${savedClient.last_name}`.trim()
      const { data: existingEv } = await supabase
        .from('personal_events')
        .select('id')
        .eq('client_id', savedClient.id)
        .eq('event_type', 'birthday')
        .maybeSingle()

      if (!existingEv) {
        await supabase.from('personal_events').insert({
          client_id: savedClient.id,
          event_type: 'birthday',
          event_date: savedClient.date_of_birth,
          title: `Zi de naștere: ${clientName || 'Client'}`,
          reminder_days: 7,
        })
      } else {
        await supabase
          .from('personal_events')
          .update({
            event_date: savedClient.date_of_birth,
            title: `Zi de naștere: ${clientName || 'Client'}`,
          })
          .eq('id', existingEv.id)
      }
    } catch (evErr) {
      console.error('Error syncing birthday event on client creation:', evErr)
    }
  }

  return savedClient
}

export async function updateClient(id: string, client: ClientUpdate, customSupabase?: SupabaseClient) {
  const supabase = customSupabase || (await createServerClient())

  // Handle DOB derivation if CNP supplied without DOB
  let effectiveDob = client.date_of_birth
  if (effectiveDob === undefined && client.cnp) {
    const cnpRes = parseAndValidateCnp(client.cnp)
    if (cnpRes.isValid && cnpRes.dateOfBirth) {
      effectiveDob = cnpRes.dateOfBirth
    }
  }

  const payload: ClientUpdate = {
    ...client,
    ...(effectiveDob !== undefined ? { date_of_birth: effectiveDob } : {}),
    updated_at: new Date().toISOString()
  }

  if (payload.phone !== undefined) {
    payload.phone = payload.phone ? normalizePhone(payload.phone) : payload.phone
  }
  if (payload.whatsapp !== undefined) {
    payload.whatsapp = payload.whatsapp ? normalizePhone(payload.whatsapp) : payload.whatsapp
  }

  const { data, error } = await supabase
    .from('clients')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  const updatedClient = data as ClientRow

  // Sync personal_events
  if (payload.date_of_birth !== undefined) {
    try {
      if (updatedClient.date_of_birth) {
        const clientName = `${updatedClient.first_name} ${updatedClient.last_name}`.trim()
        const { data: existingEv } = await supabase
          .from('personal_events')
          .select('id')
          .eq('client_id', id)
          .eq('event_type', 'birthday')
          .maybeSingle()

        if (existingEv) {
          await supabase
            .from('personal_events')
            .update({
              event_date: updatedClient.date_of_birth,
              title: `Zi de naștere: ${clientName || 'Client'}`,
            })
            .eq('id', existingEv.id)
        } else {
          await supabase.from('personal_events').insert({
            client_id: id,
            event_type: 'birthday',
            event_date: updatedClient.date_of_birth,
            title: `Zi de naștere: ${clientName || 'Client'}`,
            reminder_days: 7,
          })
        }
      } else {
        // Date of birth cleared -> delete birthday event
        await supabase
          .from('personal_events')
          .delete()
          .eq('client_id', id)
          .eq('event_type', 'birthday')
      }
    } catch (evErr) {
      console.error('Error syncing birthday event on client update:', evErr)
    }
  }

  return updatedClient
}

export async function updateClientStatus(id: string, status: string) {
  return updateClient(id, { status })
}

export async function searchClients(query: string) {
  const supabase = await createServerClient()
  const sanitizedQuery = (query || '').replace(/[^a-zA-Z0-9\s@._+-]/g, '').trim()
  if (!sanitizedQuery) return []

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .or(
      `first_name.ilike.%${sanitizedQuery}%,last_name.ilike.%${sanitizedQuery}%,email.ilike.%${sanitizedQuery}%,phone.ilike.%${sanitizedQuery}%,interest_summary.ilike.%${sanitizedQuery}%`
    )
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function checkDuplicateClients(phone?: string, email?: string, name?: string) {
  const supabase = await createServerClient()
  const phoneVariants = phone ? getPhoneVariants(phone) : []
  const normEmail = email ? normalizeEmail(email).replace(/[^a-zA-Z0-9@._+-]/g, '') : ''

  const conditions: string[] = []
  phoneVariants.forEach((v) => {
    const safeV = v.replace(/[^0-9+]/g, '')
    if (safeV) {
      conditions.push(`phone.eq.${safeV}`)
      conditions.push(`whatsapp.eq.${safeV}`)
    }
  })
  if (normEmail) {
    conditions.push(`email.ilike.${normEmail}`)
  }

  // If no phone or email, but name provided
  if (conditions.length === 0 && name && name.trim().length >= 3) {
    const cleanName = name.replace(/[^a-zA-Z0-9\s-]/g, '').trim()
    const parts = cleanName.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      conditions.push(`and(first_name.ilike.%${parts[0]}%,last_name.ilike.%${parts[parts.length - 1]}%)`)
    } else if (cleanName) {
      conditions.push(`first_name.ilike.%${cleanName}%,last_name.ilike.%${cleanName}%`)
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
