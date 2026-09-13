import { createClient as createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types'

type OfferInsert = Database['public']['Tables']['offers']['Insert']
type OfferUpdate = Database['public']['Tables']['offers']['Update']

export interface OfferFilterParams {
  clientId?: string
  propertyId?: string
  status?: string
}

export async function getOffers(filters?: OfferFilterParams) {
  const supabase = await createServerClient()
  let query = supabase
    .from('offers')
    .select(`
      *,
      client:clients!offers_client_id_fkey (
        id,
        first_name,
        last_name,
        phone,
        email
      ),
      property:properties!offers_property_id_fkey (
        id,
        title,
        slug,
        location,
        area,
        price,
        currency,
        minimum_internal_price
      )
    `)
    .order('offer_date', { ascending: false })

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

export async function getOfferById(id: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('offers')
    .select(`
      *,
      client:clients!offers_client_id_fkey (
        id,
        first_name,
        last_name,
        phone,
        email
      ),
      property:properties!offers_property_id_fkey (
        id,
        title,
        slug,
        location,
        area,
        price,
        currency,
        minimum_internal_price
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createOffer(offer: OfferInsert) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('offers')
    .insert(offer)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateOffer(id: string, offer: OfferUpdate) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('offers')
    .update(offer)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteOffer(id: string) {
  const supabase = await createServerClient()
  const { error } = await supabase
    .from('offers')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}
