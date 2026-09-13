import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Database } from '@/types'

type InsurancePolicyInsert = Database['public']['Tables']['insurance_policies']['Insert']
type InsurancePolicyUpdate = Database['public']['Tables']['insurance_policies']['Update']
type InsuranceOpportunityInsert = Database['public']['Tables']['insurance_opportunities']['Insert']
type InsuranceOpportunityUpdate = Database['public']['Tables']['insurance_opportunities']['Update']
type InsuranceClaimInsert = Database['public']['Tables']['insurance_claims']['Insert']
type InsuranceClaimUpdate = Database['public']['Tables']['insurance_claims']['Update']

export interface PolicyFilterParams {
  clientId?: string
  status?: string
  product?: string
  insurer?: string
  source?: string
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
        preferred_communication,
        lead_source
      ),
      vehicle:client_vehicles (
        id,
        vin,
        make,
        model,
        year,
        plate_number
      ),
      property:client_properties (
        id,
        property_type,
        address,
        city,
        county
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
  if (filters?.insurer) {
    query = query.eq('insurer', filters.insurer)
  }
  if (filters?.expiringInDays !== undefined) {
    const today = new Date()
    const targetDate = new Date()
    targetDate.setDate(today.getDate() + filters.expiringInDays)
    
    query = query
      .gte('expiry_date', today.toISOString().split('T')[0])
      .lte('expiry_date', targetDate.toISOString().split('T')[0])
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
        preferred_communication,
        lead_source
      ),
      vehicle:client_vehicles (
        id,
        vin,
        make,
        model,
        year,
        plate_number,
        fuel_type,
        engine_capacity,
        power_hp,
        value,
        details
      ),
      property:client_properties (
        id,
        property_type,
        address,
        city,
        county,
        surface_sqm,
        property_value,
        insured_value,
        construction_year,
        details
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

// Client Vehicles
export async function getClientVehicles(clientId: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('client_vehicles')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Client Properties
export async function getClientProperties(clientId: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('client_properties')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Claims
export async function getInsuranceClaims(clientId?: string) {
  const supabase = await createServerClient()
  let query = supabase
    .from('insurance_claims')
    .select(`
      *,
      policy:insurance_policies (
        id,
        policy_number,
        product,
        insurer
      ),
      client:clients (
        id,
        first_name,
        last_name
      )
    `)
    .order('incident_date', { ascending: false })

  if (clientId) {
    query = query.eq('client_id', clientId)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function createInsuranceClaim(claim: InsuranceClaimInsert) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('insurance_claims')
    .insert(claim)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateInsuranceClaim(id: string, claim: InsuranceClaimUpdate) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('insurance_claims')
    .update(claim)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
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
  return data || []
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

// Full Atomic Creation
export async function createInsuranceClientFull(payload: Record<string, unknown>) {
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc('create_insurance_client_full', { payload })

  if (error) throw error
  return data as {
    success: boolean
    client_id: string
    policy_id: string | null
    vehicle_id: string | null
    property_id: string | null
    opportunity_id: string | null
    activity_id: string | null
    follow_up_id: string | null
    claim_id: string | null
  }
}
