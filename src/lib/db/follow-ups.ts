import { createClient as createServerClient } from '@/lib/supabase/server'
import { deriveClientCategories } from '@/lib/db/calendar'
import { getBucharestDateParts, calculateAge } from '@/lib/utils/cnp'
import type { Database } from '@/types'
import type { SupabaseClient } from '@supabase/supabase-js'

type FollowUpInsert = Database['public']['Tables']['follow_ups']['Insert']
type FollowUpUpdate = Database['public']['Tables']['follow_ups']['Update']

export type FollowUpType = 'follow_up' | 'birthday'

export interface UnifiedFollowUpItem {
  id: string
  client_id: string
  type: FollowUpType
  reason: string
  due_date: string // ISO string or YYYY-MM-DD
  due_date_formatted: string // e.g. "08 August 2026"
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' | string
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'SNOOZED' | 'UPCOMING' | string
  notes?: string | null
  completed_at?: string | null
  created_at?: string
  updated_at?: string
  is_birthday: boolean
  categories: string[]
  category_label: string
  age?: number | null
  date_of_birth?: string | null
  clients?: {
    id?: string
    first_name?: string
    last_name?: string
    phone?: string | null
    email?: string | null
    category?: string | null
    companies?: { name: string } | null
  } | null
}

function unwrap<T>(item: T | T[] | null | undefined): T | null {
  if (!item) return null
  return Array.isArray(item) ? item[0] || null : item
}

/**
 * Format date for display in Romanian (e.g. 08 August 2026)
 */
function formatRomanianDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    const months = [
      'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
      'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie',
    ]
    return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`
  } catch {
    return dateStr
  }
}

/**
 * Fetches unified follow-ups and birthday reminders for any timeframe view and filter.
 */
export async function getFollowUpsByView(
  view: string = 'today',
  typeFilter: 'all' | 'birthdays' | 'follow_ups' = 'all',
  customSupabase?: SupabaseClient
): Promise<UnifiedFollowUpItem[]> {
  const supabase = customSupabase || (await createServerClient())
  const todayParts = getBucharestDateParts(new Date())
  const currentYear = todayParts.year

  const todayStr = `${todayParts.year}-${String(todayParts.month).padStart(2, '0')}-${String(todayParts.day).padStart(2, '0')}`
  const todayDate = new Date(todayParts.year, todayParts.month - 1, todayParts.day)
  
  const tomorrowDate = new Date(todayDate)
  tomorrowDate.setDate(tomorrowDate.getDate() + 1)
  const tomorrowStr = `${tomorrowDate.getFullYear()}-${String(tomorrowDate.getMonth() + 1).padStart(2, '0')}-${String(tomorrowDate.getDate()).padStart(2, '0')}`

  const weekEndDate = new Date(todayDate)
  weekEndDate.setDate(weekEndDate.getDate() + 7)
  const weekEndStr = `${weekEndDate.getFullYear()}-${String(weekEndDate.getMonth() + 1).padStart(2, '0')}-${String(weekEndDate.getDate()).padStart(2, '0')}`

  const upcomingLimitDate = new Date(todayDate)
  upcomingLimitDate.setDate(upcomingLimitDate.getDate() + 90)
  const upcomingLimitStr = `${upcomingLimitDate.getFullYear()}-${String(upcomingLimitDate.getMonth() + 1).padStart(2, '0')}-${String(upcomingLimitDate.getDate()).padStart(2, '0')}`

  const results: UnifiedFollowUpItem[] = []

  // 1. Fetch Standard Follow-ups (unless typeFilter is specifically 'birthdays')
  if (typeFilter !== 'birthdays') {
    let query = supabase
      .from('follow_ups')
      .select(`
        *,
        clients (
          id,
          first_name,
          last_name,
          phone,
          email,
          category,
          companies ( name )
        )
      `)

    switch (view) {
      case 'today':
        query = query.gte('due_date', `${todayStr}T00:00:00`).lt('due_date', `${tomorrowStr}T00:00:00`)
        break
      case 'tomorrow':
        query = query.gte('due_date', `${tomorrowStr}T00:00:00`).lt('due_date', `${weekEndDate.toISOString().slice(0, 10)}T00:00:00`)
        break
      case 'this_week':
        query = query.gte('due_date', `${todayStr}T00:00:00`).lt('due_date', `${weekEndStr}T23:59:59`)
        break
      case 'overdue':
        query = query.lt('due_date', `${todayStr}T00:00:00`).eq('status', 'PENDING')
        break
      case 'upcoming':
        query = query.gte('due_date', `${todayStr}T00:00:00`).eq('status', 'PENDING')
        break
      case 'completed':
        query = query.eq('status', 'COMPLETED')
        break
      case 'all':
      default:
        // No date filters
        break
    }

    const { data: followUpsData, error: fuErr } = await query.order('due_date', { ascending: true })
    if (fuErr) {
      console.error('[FollowUps] Error fetching follow_ups:', fuErr)
    } else if (followUpsData) {
      for (const fu of followUpsData) {
        const client = unwrap(fu.clients)
        const company = client ? unwrap(client.companies) : null
        const cat = client?.category ? [client.category.toUpperCase().replace('_', ' ')] : ['FOLLOW-UP']

        results.push({
          id: fu.id,
          client_id: fu.client_id,
          type: 'follow_up',
          reason: fu.reason,
          due_date: fu.due_date,
          due_date_formatted: formatRomanianDate(fu.due_date),
          priority: fu.priority,
          status: fu.status,
          notes: fu.notes,
          completed_at: fu.completed_at,
          created_at: fu.created_at,
          updated_at: fu.updated_at,
          is_birthday: false,
          categories: [...cat, 'FOLLOW-UPS'],
          category_label: cat.join(' · '),
          clients: client
            ? {
                id: client.id,
                first_name: client.first_name,
                last_name: client.last_name,
                phone: client.phone,
                email: client.email,
                category: client.category,
                companies: company,
              }
            : null,
        })
      }
    }
  }

  // 2. Synthesize Birthday Follow-ups (unless typeFilter is specifically 'follow_ups' or view is 'overdue')
  if (typeFilter !== 'follow_ups' && view !== 'overdue') {
    // Fetch all clients with DOB & category details
    const { data: clientsData, error: clientsErr } = await supabase
      .from('clients')
      .select(`
        id,
        first_name,
        last_name,
        phone,
        email,
        category,
        date_of_birth,
        companies ( name ),
        client_relationships ( relationship_type ),
        insurance_policies ( id ),
        credit_cases ( id )
      `)
      .not('date_of_birth', 'is', null)

    // Fetch acknowledged birthday activities for current year
    const { data: birthdayActivities } = await supabase
      .from('activities')
      .select('client_id, date, title')
      .ilike('title', '%Urări de La Mulți Ani%')

    const acknowledgedClientIds = new Set<string>()
    for (const act of birthdayActivities || []) {
      if (act.client_id) {
        acknowledgedClientIds.add(act.client_id)
      }
    }

    if (clientsErr) {
      console.error('[FollowUps] Error fetching clients for birthday follow-ups:', clientsErr)
    } else if (clientsData) {
      for (const client of clientsData) {
        if (!client.date_of_birth) continue
        const [, bMonthStr, bDayStr] = client.date_of_birth.split('-')
        const bMonth = Number(bMonthStr)
        const bDay = Number(bDayStr)
        if (!bMonth || !bDay) continue

        // Calculate current year occurrence
        const thisYearOccurrence = `${currentYear}-${String(bMonth).padStart(2, '0')}-${String(bDay).padStart(2, '0')}`
        const nextYearOccurrence = `${currentYear + 1}-${String(bMonth).padStart(2, '0')}-${String(bDay).padStart(2, '0')}`

        const isPassedThisYear = thisYearOccurrence < todayStr
        const targetOccurrence = isPassedThisYear ? nextYearOccurrence : thisYearOccurrence
        const targetYear = isPassedThisYear ? currentYear + 1 : currentYear

        const isToday = thisYearOccurrence === todayStr
        const isTomorrow = thisYearOccurrence === tomorrowStr
        const isThisWeek = thisYearOccurrence >= todayStr && thisYearOccurrence <= weekEndStr
        const isUpcoming = targetOccurrence >= todayStr && targetOccurrence <= upcomingLimitStr
        const isAcknowledged = acknowledgedClientIds.has(client.id)

        let includeBirthday = false

        switch (view) {
          case 'today':
            includeBirthday = isToday
            break
          case 'tomorrow':
            includeBirthday = isTomorrow
            break
          case 'this_week':
            includeBirthday = isThisWeek
            break
          case 'upcoming':
            includeBirthday = isUpcoming
            break
          case 'completed':
            includeBirthday = isAcknowledged
            break
          case 'all':
            includeBirthday = true
            break
          default:
            includeBirthday = false
            break
        }

        if (includeBirthday) {
          const { categories, label } = deriveClientCategories(client)
          const age = calculateAge(client.date_of_birth, new Date(targetYear, bMonth - 1, bDay))
          const company = unwrap(client.companies)

          let status = 'UPCOMING'
          if (isAcknowledged) {
            status = 'COMPLETED'
          } else if (isToday) {
            status = 'PENDING'
          }

          results.push({
            id: `birthday-${client.id}-${targetYear}`,
            client_id: client.id,
            type: 'birthday',
            reason: `🎂 Zi de naștere — ${client.first_name} ${client.last_name}`,
            due_date: `${targetOccurrence}T09:00:00`,
            due_date_formatted: formatRomanianDate(targetOccurrence),
            priority: isToday ? 'HIGH' : 'NORMAL',
            status,
            notes: `Aniversare (${client.date_of_birth.slice(5)}) · Vârstă: ${age || ''} ani · Categorii: ${label}`,
            completed_at: isAcknowledged ? new Date().toISOString() : null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_birthday: true,
            categories: [...categories, 'BIRTHDAYS'],
            category_label: label,
            age,
            date_of_birth: client.date_of_birth,
            clients: {
              id: client.id,
              first_name: client.first_name,
              last_name: client.last_name,
              phone: client.phone,
              email: client.email,
              category: client.category,
              companies: company,
            },
          })
        }
      }
    }
  }

  // Sort chronologically by due_date
  results.sort((a, b) => a.due_date.localeCompare(b.due_date))
  return results
}

/**
 * Returns follow-ups for a specific client.
 */
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

/**
 * Creates a standard follow-up.
 */
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

/**
 * Updates a standard follow-up.
 */
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

/**
 * Completes a standard follow-up.
 */
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

/**
 * Acknowledges a birthday occurrence for a client for the current year.
 * Non-destructively records an activity, marks related notifications as read,
 * and preserves future recurring birthdays!
 */
export async function acknowledgeBirthday(
  clientId: string,
  year?: number,
  notes?: string,
  customSupabase?: SupabaseClient
) {
  const supabase = customSupabase || (await createServerClient())
  const targetYear = year || new Date().getFullYear()

  // 1. Insert activity
  const { data: activity, error: actErr } = await supabase
    .from('activities')
    .insert({
      client_id: clientId,
      type: 'NOTE',
      title: `🎂 Urări de La Mulți Ani transmise (${targetYear})`,
      notes: notes || `Aniversarea din anul ${targetYear} a fost felicitată / marcată ca finalizată.`,
      date: new Date().toISOString(),
    })
    .select()
    .single()

  if (actErr) {
    console.warn('[FollowUps] Error logging birthday wish activity:', actErr)
  }

  // 2. Mark unread notifications for this client as read
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('related_entity_id', clientId)
    .ilike('type', 'BIRTHDAY%')

  return { success: true, activity }
}
