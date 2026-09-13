import { createClient as createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types'

type OpportunityInsert = Database['public']['Tables']['opportunities']['Insert']
type OpportunityUpdate = Database['public']['Tables']['opportunities']['Update']

export interface OpportunityFilterParams {
  stage?: string
  type?: string
  clientId?: string
  propertyId?: string
}

export async function getOpportunities(filters?: OpportunityFilterParams) {
  const supabase = await createServerClient()
  let query = supabase
    .from('opportunities')
    .select(`
      *,
      client:clients!opportunities_client_id_fkey (
        id,
        first_name,
        last_name,
        phone,
        email
      ),
      property:properties!opportunities_property_id_fkey (
        id,
        title,
        price,
        location,
        type
      ),
      request:requests!opportunities_request_id_fkey (
        id,
        title,
        budget_max,
        property_type
      )
    `)
    .order('created_at', { ascending: false })

  if (filters?.stage) {
    query = query.eq('stage', filters.stage)
  }
  if (filters?.type) {
    query = query.eq('type', filters.type)
  }
  if (filters?.clientId) {
    query = query.eq('client_id', filters.clientId)
  }
  if (filters?.propertyId) {
    query = query.eq('property_id', filters.propertyId)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getOpportunityById(id: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('opportunities')
    .select(`
      *,
      client:clients!opportunities_client_id_fkey (
        id,
        first_name,
        last_name,
        phone,
        email
      ),
      property:properties!opportunities_property_id_fkey (
        id,
        title,
        price,
        location,
        type
      ),
      request:requests!opportunities_request_id_fkey (
        id,
        title,
        budget_max,
        property_type
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createOpportunity(opportunity: OpportunityInsert) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('opportunities')
    .insert(opportunity)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateOpportunity(id: string, updates: OpportunityUpdate) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('opportunities')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteOpportunity(id: string) {
  const supabase = await createServerClient()
  const { error } = await supabase
    .from('opportunities')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

export async function getPipelineSummary() {
  const opportunities = await getOpportunities()
  const stages = ['PROSPECT', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'] as const

  const summary = stages.map((stage) => {
    const stageItems = opportunities.filter((op) => op.stage === stage)
    const count = stageItems.length
    const totalValue = stageItems.reduce((sum, item) => sum + (Number(item.value) || 0), 0)
    const weightedValue = stageItems.reduce(
      (sum, item) => sum + (Number(item.value) || 0) * ((item.probability || 0) / 100),
      0
    )
    return {
      stage,
      count,
      totalValue,
      weightedValue,
      items: stageItems,
    }
  })

  return summary
}
