import { createClient as createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types'

export type NotificationRow = Database['public']['Tables']['notifications']['Row']
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert']

export async function getNotifications(options?: { unreadOnly?: boolean; limit?: number }) {
  const supabase = await createServerClient()
  let query = supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })

  if (options?.unreadOnly) {
    query = query.eq('is_read', false)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query
  if (error) {
    console.error('Error fetching notifications:', error)
    return []
  }
  return data
}

export async function createNotification(input: NotificationInsert) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('notifications')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function markNotificationAsRead(id: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function markAllNotificationsAsRead() {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('is_read', false)
    .select()

  if (error) throw error
  return data
}
