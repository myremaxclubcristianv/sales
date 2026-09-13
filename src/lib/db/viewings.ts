import { createClient as createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types'

type ViewingInsert = Database['public']['Tables']['viewings']['Insert']
type ViewingUpdate = Database['public']['Tables']['viewings']['Update']

export interface ViewingFilterParams {
  clientId?: string
  propertyId?: string
  status?: string
}

export async function getViewings(filters?: ViewingFilterParams) {
  const supabase = await createServerClient()
  let query = supabase
    .from('viewings')
    .select(`
      *,
      client:clients!viewings_client_id_fkey (
        id,
        first_name,
        last_name,
        phone,
        email,
        preferred_communication
      ),
      property:properties!viewings_property_id_fkey (
        id,
        title,
        slug,
        location,
        area,
        price,
        currency,
        property_status
      )
    `)
    .order('date', { ascending: false })

  if (filters?.clientId) {
    query = query.eq('client_id', filters.clientId)
  }
  if (filters?.propertyId) {
    query = query.eq('property_id', filters.propertyId)
  }
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getViewingById(id: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('viewings')
    .select(`
      *,
      client:clients!viewings_client_id_fkey (
        id,
        first_name,
        last_name,
        phone,
        email,
        preferred_communication
      ),
      property:properties!viewings_property_id_fkey (
        id,
        title,
        slug,
        location,
        area,
        price,
        currency,
        property_status
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createViewing(viewing: ViewingInsert) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('viewings')
    .insert(viewing)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateViewing(id: string, viewing: ViewingUpdate) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('viewings')
    .update(viewing)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteViewing(id: string) {
  const supabase = await createServerClient()
  const { error } = await supabase
    .from('viewings')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}
