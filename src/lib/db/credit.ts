import { createClient as createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types'

type CreditCaseInsert = Database['public']['Tables']['credit_cases']['Insert']
type CreditCaseUpdate = Database['public']['Tables']['credit_cases']['Update']
type CreditDocumentInsert = Database['public']['Tables']['credit_documents']['Insert']

export interface CreditFilterParams {
  clientId?: string
  status?: string
}

export async function getCreditCases(filters?: CreditFilterParams) {
  const supabase = await createServerClient()
  let query = supabase
    .from('credit_cases')
    .select(`
      *,
      client:clients!credit_cases_client_id_fkey (
        id,
        first_name,
        last_name,
        phone,
        email,
        preferred_communication
      )
    `)
    .order('updated_at', { ascending: false })

  if (filters?.clientId) {
    query = query.eq('client_id', filters.clientId)
  }
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getCreditCaseById(id: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('credit_cases')
    .select(`
      *,
      client:clients!credit_cases_client_id_fkey (
        id,
        first_name,
        last_name,
        phone,
        email,
        preferred_communication
      ),
      documents:credit_documents (
        id,
        file_path,
        file_name,
        file_type,
        category,
        description,
        created_at
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createCreditCase(creditCase: CreditCaseInsert) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('credit_cases')
    .insert(creditCase)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateCreditCase(id: string, creditCase: CreditCaseUpdate) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('credit_cases')
    .update(creditCase)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteCreditCase(id: string) {
  const supabase = await createServerClient()
  const { error } = await supabase
    .from('credit_cases')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

export async function addCreditDocument(doc: CreditDocumentInsert) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('credit_documents')
    .insert(doc)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteCreditDocument(docId: string) {
  const supabase = await createServerClient()
  const { error } = await supabase
    .from('credit_documents')
    .delete()
    .eq('id', docId)

  if (error) throw error
  return true
}
