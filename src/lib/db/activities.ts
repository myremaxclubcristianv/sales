import { createClient as createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types'

type ActivityInsert = Database['public']['Tables']['activities']['Insert']

export async function getClientActivities(clientId: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('client_id', clientId)
    .order('date', { ascending: false })

  if (error) throw error
  return data
}

export async function createActivity(activity: ActivityInsert) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('activities')
    .insert(activity)
    .select()
    .single()

  if (error) throw error
  return data
}
