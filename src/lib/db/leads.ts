import { createClient as createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types'

type LeadInsert = Database['public']['Tables']['leads']['Insert']
type LeadUpdate = Database['public']['Tables']['leads']['Update']

export interface LeadFilterParams {
  status?: string
  source?: string
  campaignId?: string
}

export async function getLeads(filters?: LeadFilterParams) {
  const supabase = await createServerClient()
  let query = supabase
    .from('leads')
    .select(`
      *,
      campaign:campaigns!leads_campaign_id_fkey (
        id,
        name
      ),
      property:properties!leads_property_id_fkey (
        id,
        title,
        slug,
        price,
        currency
      ),
      request:requests!leads_request_id_fkey (
        id,
        title
      )
    `)
    .order('created_at', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.source) {
    query = query.eq('source', filters.source)
  }
  if (filters?.campaignId) {
    query = query.eq('campaign_id', filters.campaignId)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getLeadById(id: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('leads')
    .select(`
      *,
      campaign:campaigns!leads_campaign_id_fkey (
        id,
        name
      ),
      property:properties!leads_property_id_fkey (
        id,
        title,
        slug,
        location,
        area,
        price,
        currency
      ),
      request:requests!leads_request_id_fkey (
        id,
        title
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createLead(lead: LeadInsert) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('leads')
    .insert(lead)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateLead(id: string, lead: LeadUpdate) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('leads')
    .update(lead)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteLead(id: string) {
  const supabase = await createServerClient()
  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}
