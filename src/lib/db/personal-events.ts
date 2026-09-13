import { createClient as createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types'

type PersonalEventInsert = Database['public']['Tables']['personal_events']['Insert']

export async function getUpcomingBirthdays(days: number = 30) {
  const supabase = await createServerClient()
  const now = new Date()
  const futureDate = new Date()
  futureDate.setDate(futureDate.getDate() + days)

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

  const currentYear = now.getFullYear()
  const upcomingEvents = (data || []).filter((event: Database['public']['Tables']['personal_events']['Row']) => {
    const eventDate = new Date(event.event_date)
    const thisYearBirthday = new Date(currentYear, eventDate.getMonth(), eventDate.getDate())
    const daysUntil = Math.ceil((thisYearBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntil < 0) {
      const nextYearBirthday = new Date(currentYear + 1, eventDate.getMonth(), eventDate.getDate())
      const daysUntilNextYear = Math.ceil((nextYearBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return daysUntilNextYear <= days
    }
    
    return daysUntil <= days
  })

  return upcomingEvents
}

export async function getClientPersonalEvents(clientId: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('personal_events')
    .select('*')
    .eq('client_id', clientId)
    .order('event_date', { ascending: true })

  if (error) throw error
  return data
}

export async function createPersonalEvent(event: PersonalEventInsert) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('personal_events')
    .insert(event)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updatePersonalEvent(id: string, event: Partial<PersonalEventInsert>) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('personal_events')
    .update(event)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}
