import { createClient as createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types'

type FollowUpInsert = Database['public']['Tables']['follow_ups']['Insert']
type FollowUpUpdate = Database['public']['Tables']['follow_ups']['Update']

export async function getFollowUpsByView(view: string) {
  const supabase = await createServerClient()
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const weekEnd = new Date(today)
  weekEnd.setDate(weekEnd.getDate() + 7)

  let query = supabase
    .from('follow_ups')
    .select(`
      *,
      clients (
        first_name,
        last_name,
        phone,
        email
      )
    `)

  switch (view) {
    case 'today':
      query = query.gte('due_date', today.toISOString()).lt('due_date', tomorrow.toISOString())
      break
    case 'tomorrow':
      query = query.gte('due_date', tomorrow.toISOString()).lt('due_date', new Date(tomorrow.getTime() + 86400000).toISOString())
      break
    case 'this_week':
      query = query.gte('due_date', today.toISOString()).lt('due_date', weekEnd.toISOString())
      break
    case 'overdue':
      query = query.lt('due_date', today.toISOString()).eq('status', 'PENDING')
      break
    case 'upcoming':
      query = query.gte('due_date', today.toISOString()).eq('status', 'PENDING')
      break
    case 'completed':
      query = query.eq('status', 'COMPLETED')
      break
  }

  const { data, error } = await query.order('due_date', { ascending: true })
  if (error) throw error
  return data
}

export async function getClientFollowUps(clientId: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('follow_ups')
    .select('*')
    .eq('client_id', clientId)
    .order('due_date', { ascending: true })

  if (error) throw error
  return data
}

export async function createFollowUp(followUp: FollowUpInsert) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('follow_ups')
    .insert(followUp)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateFollowUp(id: string, followUp: FollowUpUpdate) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('follow_ups')
    .update(followUp)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function completeFollowUp(id: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('follow_ups')
    .update({
      status: 'COMPLETED',
      completed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}
