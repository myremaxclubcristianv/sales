import { createClient as createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types'

type InsurancePolicyInsert = Database['public']['Tables']['insurance_policies']['Insert']
type InsurancePolicyUpdate = Database['public']['Tables']['insurance_policies']['Update']
type InsuranceOpportunityInsert = Database['public']['Tables']['insurance_opportunities']['Insert']
type InsuranceOpportunityUpdate = Database['public']['Tables']['insurance_opportunities']['Update']

export interface PolicyFilterParams {
  clientId?: string
  status?: string
  product?: string
  expiringInDays?: number
}

export async function getInsurancePolicies(filters?: PolicyFilterParams) {
  const supabase = await createServerClient()
  let query = supabase
    .from('insurance_policies')
    .select(`
      *,
      client:clients!insurance_policies_client_id_fkey (
        id,
        first_name,
        last_name,
        phone,
        email,
        preferred_communication
      )
    `)
    .order('expiry_date', { ascending: true })

  if (filters?.clientId) {
    query = query.eq('client_id', filters.clientId)
  }
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.product) {
    query = query.eq('product', filters.product)
  }
  if (filters?.expiringInDays !== undefined) {
    const today = new Date()
    const targetDate = new Date()
    targetDate.setDate(today.getDate() + filters.expiringInDays)
    
    query = query
      .gte('expiry_date', today.toISOString().split('T')[0])
      .lte('expiry_date', targetDate.toISOString().split('T')[0])
      .eq('status', 'ACTIVE')
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getInsurancePolicyById(id: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('insurance_policies')
    .select(`
      *,
      client:clients!insurance_policies_client_id_fkey (
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

export async function createInsurancePolicy(policy: InsurancePolicyInsert) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('insurance_policies')
    .insert(policy)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateInsurancePolicy(id: string, policy: InsurancePolicyUpdate) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('insurance_policies')
    .update(policy)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteInsurancePolicy(id: string) {
  const supabase = await createServerClient()
  const { error } = await supabase
    .from('insurance_policies')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

// Opportunities
export async function getInsuranceOpportunities(clientId?: string) {
  const supabase = await createServerClient()
  let query = supabase
    .from('insurance_opportunities')
    .select(`
      *,
      client:clients!insurance_opportunities_client_id_fkey (
        id,
        first_name,
        last_name,
        phone,
        email
      )
    `)
    .order('created_at', { ascending: false })

  if (clientId) {
    query = query.eq('client_id', clientId)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createInsuranceOpportunity(opp: InsuranceOpportunityInsert) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('insurance_opportunities')
    .insert(opp)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateInsuranceOpportunity(id: string, opp: InsuranceOpportunityUpdate) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('insurance_opportunities')
    .update(opp)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}
