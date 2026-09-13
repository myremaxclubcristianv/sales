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
      property:properties (
        id,
        title,
        slug,
        price,
        currency
      ),
      request:requests (
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
  if (!data || data.length === 0) return []

  const campaignIds = Array.from(new Set(data.map((l) => l.campaign_id).filter(Boolean))) as string[]
  if (campaignIds.length > 0) {
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('id, name')
      .in('id', campaignIds)
    const campaignMap = new Map((campaigns || []).map((c) => [c.id, c]))
    return data.map((l) => ({
      ...l,
      campaign: l.campaign_id ? campaignMap.get(l.campaign_id) || null : null,
    }))
  }

  return data.map((l) => ({ ...l, campaign: null }))
}

export async function getLeadById(id: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('leads')
    .select(`
      *,
      property:properties (
        id,
        title,
        slug,
        location,
        area,
        price,
        currency
      ),
      request:requests (
        id,
        title
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  if (!data) return null

  let campaign = null
  if (data.campaign_id) {
    const { data: camp } = await supabase
      .from('campaigns')
      .select('id, name')
      .eq('id', data.campaign_id)
      .single()
    campaign = camp || null
  }

  return { ...data, campaign }
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
