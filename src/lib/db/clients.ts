import { createClient as createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types'

type ClientInsert = Database['public']['Tables']['clients']['Insert']
type ClientUpdate = Database['public']['Tables']['clients']['Update']

export async function getClients() {
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
        name
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
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
  const { data, error } = await supabase
    .from('clients')
    .insert(client)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateClient(id: string, client: ClientUpdate) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('clients')
    .update(client)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function searchClients(query: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function checkDuplicateClients(phone?: string, email?: string) {
  const supabase = await createServerClient()
  const conditions: string[] = []
  
  if (phone) conditions.push(`phone.eq.${phone}`)
  if (email) conditions.push(`email.eq.${email}`)
  
  if (conditions.length === 0) return []
  
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .or(conditions.join(','))
    .limit(5)

  if (error) throw error
  return data
}
