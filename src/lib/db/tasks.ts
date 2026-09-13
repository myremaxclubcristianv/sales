import { createClient as createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types'

type TaskInsert = Database['public']['Tables']['tasks']['Insert']
type TaskUpdate = Database['public']['Tables']['tasks']['Update']

export interface TaskFilterParams {
  status?: string
  priority?: string
  clientId?: string
  propertyId?: string
}

export async function getTasks(filters?: TaskFilterParams) {
  const supabase = await createServerClient()
  let query = supabase
    .from('tasks')
    .select(`
      *,
      client:clients!tasks_client_id_fkey (
        id,
        first_name,
        last_name,
        phone,
        email
      ),
      property:properties!tasks_property_id_fkey (
        id,
        title,
        price,
        location
      ),
      opportunity:opportunities!tasks_opportunity_id_fkey (
        id,
        title,
        value,
        stage
      )
    `)
    .order('due_date', { ascending: true })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.priority) {
    query = query.eq('priority', filters.priority)
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

export async function getTaskById(id: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      client:clients!tasks_client_id_fkey (
        id,
        first_name,
        last_name,
        phone,
        email
      ),
      property:properties!tasks_property_id_fkey (
        id,
        title,
        price,
        location
      ),
      opportunity:opportunities!tasks_opportunity_id_fkey (
        id,
        title,
        value,
        stage
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createTask(task: TaskInsert) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('tasks')
    .insert(task)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateTask(id: string, updates: TaskUpdate) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteTask(id: string) {
  const supabase = await createServerClient()
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}
