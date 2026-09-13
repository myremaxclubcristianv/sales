import { createBrowserClient } from '@/lib/supabase/client'
import type { Database } from '@/types'

type PersonalEventRow = Database['public']['Tables']['personal_events']['Row']

export async function getClientsClient() {
  const supabase = createBrowserClient()
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getFollowUpsByViewClient(view: string) {
  const supabase = createBrowserClient()
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

export async function getUpcomingBirthdaysClient(days: number = 30) {
  const supabase = createBrowserClient()
  const { data, error } = await supabase
    .from('personal_events')
    .select(`
      *,
      clients (
        first_name,
        last_name,
        phone,
        whatsapp,
        email
      )
    `)
    .eq('event_type', 'birthday')
    .order('event_date', { ascending: true })

  if (error) throw error

  const currentYear = new Date().getFullYear()

  const upcomingEvents = (data || []).filter((event: PersonalEventRow) => {
    const eventDate = new Date(event.event_date)
    const thisYearBirthday = new Date(currentYear, eventDate.getMonth(), eventDate.getDate())
    const daysUntil = Math.ceil((thisYearBirthday.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntil < 0) {
      const nextYearBirthday = new Date(currentYear + 1, eventDate.getMonth(), eventDate.getDate())
      const daysUntilNextYear = Math.ceil((nextYearBirthday.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      return daysUntilNextYear <= days
    }
    
    return daysUntil <= days
  })

  return upcomingEvents
}
