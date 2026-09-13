import { createClient as createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types'

type RequestInsert = Database['public']['Tables']['requests']['Insert']
type RequestUpdate = Database['public']['Tables']['requests']['Update']

export interface RequestFilterParams {
  status?: string
  propertyType?: string
  buyerId?: string
}

export async function getRequests(filters?: RequestFilterParams) {
  const supabase = await createServerClient()
  let query = supabase
    .from('requests')
    .select(`
      *,
      buyer:clients!requests_buyer_id_fkey (
        id,
        first_name,
        last_name,
        phone,
        email,
        preferred_communication
      )
    `)
    .order('created_at', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.propertyType) {
    query = query.eq('property_type', filters.propertyType)
  }
  if (filters?.buyerId) {
    query = query.eq('buyer_id', filters.buyerId)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getPublicRequests() {
  const supabase = await createServerClient()
  // STRICT DATA SEPARATION: Never select buyer_id, buyer contact, notes, or internal details
  const { data, error } = await supabase
    .from('requests')
    .select(`
      id,
      title,
      property_type,
      preferred_locations,
      budget_min,
      budget_max,
      currency,
      bedrooms,
      bathrooms,
      minimum_area,
      desired_features,
      timeline,
      financing_required,
      status,
      created_at
    `)
    .eq('public_visibility', true)
    .eq('status', 'ACTIVE')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getPublicRequestById(id: string) {
  const supabase = await createServerClient()
  // STRICT DATA SEPARATION: Never select buyer_id, buyer contact, notes, or internal details
  const { data, error } = await supabase
    .from('requests')
    .select(`
      id,
      title,
      property_type,
      preferred_locations,
      budget_min,
      budget_max,
      currency,
      bedrooms,
      bathrooms,
      minimum_area,
      desired_features,
      timeline,
      financing_required,
      status,
      created_at
    `)
    .eq('id', id)
    .eq('public_visibility', true)
    .eq('status', 'ACTIVE')
    .single()

  if (error) throw error
  return data
}

export async function getRequestById(id: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('requests')
    .select(`
      *,
      buyer:clients!requests_buyer_id_fkey (
        id,
        first_name,
        last_name,
        phone,
        email,
        preferred_communication
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createRequest(req: RequestInsert) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('requests')
    .insert(req)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateRequest(id: string, req: RequestUpdate) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('requests')
    .update(req)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}
