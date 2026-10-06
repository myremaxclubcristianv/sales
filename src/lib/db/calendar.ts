import { createClient as createServerClient } from '@/lib/supabase/server'
import { calculateAge } from '@/lib/utils/cnp'
import type { SupabaseClient } from '@supabase/supabase-js'

export type CalendarEventType =
  | 'birthday'
  | 'follow_up'
  | 'viewing'
  | 'insurance_expiry'
  | 'credit_case'
  | 'task'
  | 'meeting'

export interface MasterCalendarEvent {
  id: string
  type: CalendarEventType
  title: string
  date: string // ISO string or YYYY-MM-DD
  time?: string | null
  client_id?: string | null
  client_name?: string | null
  phone?: string | null
  email?: string | null
  company_name?: string | null
  categories: string[] // e.g. ['INSURANCE', 'REAL ESTATE']
  category_label: string // e.g. 'INSURANCE · REAL ESTATE'
  // Birthday specific
  date_of_birth?: string | null
  age?: number | null
  recurrence?: string
  // Follow-up specific
  follow_up_id?: string
  reason?: string | null
  notes?: string | null
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' | string | null
  status?: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'SNOOZED' | string | null
  // Details metadata
  metadata?: Record<string, unknown>
}

export interface GetCalendarEventsOptions {
  year?: number
  month?: number // 1-12
  startDate?: string // YYYY-MM-DD
  endDate?: string // YYYY-MM-DD
  categoryFilter?: 'ALL' | 'BIRTHDAYS' | 'FOLLOW-UPS' | 'INSURANCE' | 'REAL ESTATE' | 'CREDITE' | 'CONTACTS' | string
}

function unwrap<T>(item: T | T[] | null | undefined): T | null {
  if (!item) return null
  return Array.isArray(item) ? item[0] || null : item
}

/**
 * Derives the unified category list and label for a client record.
 */
export function deriveClientCategories(client: {
  category?: string | null
  client_relationships?: { relationship_type: string }[] | null
  insurance_policies?: { id: string }[] | null
  credit_cases?: { id: string }[] | null
  properties?: { id: string }[] | null
  requests?: { id: string }[] | null
}): { categories: string[]; label: string } {
  const cats = new Set<string>()

  const rawCat = (client.category || '').toUpperCase()
  if (rawCat === 'INSURANCE') cats.add('INSURANCE')
  else if (rawCat === 'REAL_ESTATE' || rawCat === 'REAL ESTATE') cats.add('REAL ESTATE')
  else if (rawCat === 'CREDIT' || rawCat === 'CREDITE') cats.add('CREDITE')

  // Check explicit relationships
  const rels = (client.client_relationships || []).map((r) => r.relationship_type.toLowerCase())
  if (rels.includes('insurance')) cats.add('INSURANCE')
  if (rels.includes('credit')) cats.add('CREDITE')
  if (rels.some((r) => ['buyer', 'seller', 'landlord', 'investor'].includes(r))) cats.add('REAL ESTATE')

  // Check policy associations
  if (client.insurance_policies && client.insurance_policies.length > 0) {
    cats.add('INSURANCE')
  }
  // Check credit case associations
  if (client.credit_cases && client.credit_cases.length > 0) {
    cats.add('CREDITE')
  }

  if (cats.size === 0) {
    cats.add('CONTACT')
  }

  const sortedCats = Array.from(cats)
  return {
    categories: sortedCats,
    label: sortedCats.join(' · '),
  }
}

/**
 * Loads all Master Calendar events from the unified CRM data sources:
 * - Birthdays (yearly recurring, dynamically aged, zero CNP)
 * - Follow-ups
 * - Real Estate Viewings
 * - Insurance Policy Expirations
 * - Credit Milestones
 * - Tasks
 */
export async function getMasterCalendarEvents(
  options: GetCalendarEventsOptions = {},
  supabaseClient?: SupabaseClient
): Promise<{
  events: MasterCalendarEvent[]
  upcoming: {
    today: MasterCalendarEvent[]
    next7Days: MasterCalendarEvent[]
    next30Days: MasterCalendarEvent[]
  }
}> {
  const supabase = supabaseClient || (await createServerClient())
  const now = new Date()
  const targetYear = options.year || now.getFullYear()

  // 1. Fetch all clients with DOB & category details
  const { data: clientsData } = await supabase
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

  // 2. Fetch all follow-ups
  const { data: followUpsData } = await supabase
    .from('follow_ups')
    .select(`
      id,
      client_id,
      reason,
      due_date,
      priority,
      status,
      notes,
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
    .order('due_date', { ascending: true })

  // 3. Fetch viewings
  const { data: viewingsData } = await supabase
    .from('viewings')
    .select(`
      id,
      date,
      status,
      notes,
      properties ( id, title, location ),
      clients ( id, first_name, last_name, phone )
    `)
    .order('date', { ascending: true })

  // 4. Fetch insurance policy expirations
  const { data: policiesData } = await supabase
    .from('insurance_policies')
    .select(`
      id,
      policy_number,
      product,
      insurer,
      expiry_date,
      premium,
      currency,
      status,
      clients ( id, first_name, last_name, phone, email )
    `)
    .eq('status', 'ACTIVE')

  // 5. Fetch tasks
  const { data: tasksData } = await supabase
    .from('tasks')
    .select(`
      id,
      title,
      due_date,
      priority,
      status,
      clients ( id, first_name, last_name )
    `)

  const allEvents: MasterCalendarEvent[] = []

  // Process Birthdays
  const yearsToRender = [targetYear - 1, targetYear, targetYear + 1]

  for (const client of clientsData || []) {
    if (!client.date_of_birth) continue

    const { categories, label } = deriveClientCategories(client)
    const [, bMonth, bDay] = client.date_of_birth.split('-').map(Number)
    if (!bMonth || !bDay) continue

    const company = unwrap(client.companies)

    for (const yr of yearsToRender) {
      const occurrenceDate = `${yr}-${String(bMonth).padStart(2, '0')}-${String(bDay).padStart(2, '0')}`
      const age = calculateAge(client.date_of_birth, new Date(yr, bMonth - 1, bDay))

      allEvents.push({
        id: `birthday-${client.id}-${yr}`,
        type: 'birthday',
        title: `🎂 ${client.first_name} ${client.last_name}`,
        date: occurrenceDate,
        time: null,
        client_id: client.id,
        client_name: `${client.first_name} ${client.last_name}`.trim(),
        phone: client.phone,
        email: client.email,
        company_name: company?.name || null,
        categories,
        category_label: label,
        date_of_birth: client.date_of_birth,
        age,
        recurrence: 'RRULE:FREQ=YEARLY',
      })
    }
  }

  // Process Follow-ups
  for (const f of followUpsData || []) {
    const client = unwrap(f.clients)
    const company = client ? unwrap(client.companies) : null
    const categories = client?.category ? [client.category.toUpperCase().replace('_', ' ')] : ['FOLLOW-UP']
    const catLabel = categories.join(' · ')

    const dueDateObj = new Date(f.due_date)
    const dateStr = !isNaN(dueDateObj.getTime())
      ? dueDateObj.toISOString().slice(0, 10)
      : f.due_date.slice(0, 10)
    const timeStr = !isNaN(dueDateObj.getTime())
      ? dueDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : null

    allEvents.push({
      id: `followup-${f.id}`,
      follow_up_id: f.id,
      type: 'follow_up',
      title: `📞 ${client ? `${client.first_name} ${client.last_name}` : 'Client'} — ${f.reason}`,
      date: dateStr,
      time: timeStr,
      client_id: f.client_id,
      client_name: client ? `${client.first_name} ${client.last_name}`.trim() : 'Client',
      phone: client?.phone,
      email: client?.email,
      company_name: company?.name || null,
      categories: [...categories, 'FOLLOW-UPS'],
      category_label: catLabel,
      reason: f.reason,
      notes: f.notes,
      priority: f.priority,
      status: f.status,
    })
  }

  // Process Viewings
  for (const v of viewingsData || []) {
    const client = unwrap(v.clients)
    const prop = unwrap(v.properties)
    const dateObj = new Date(v.date)
    const dateStr = !isNaN(dateObj.getTime()) ? dateObj.toISOString().slice(0, 10) : v.date.slice(0, 10)
    const timeStr = !isNaN(dateObj.getTime()) ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null

    allEvents.push({
      id: `viewing-${v.id}`,
      type: 'viewing',
      title: `🏠 Vizionare: ${prop?.title || 'Proprietate'} (${client?.first_name || ''} ${client?.last_name || ''})`,
      date: dateStr,
      time: timeStr,
      client_id: client?.id,
      client_name: client ? `${client.first_name} ${client.last_name}`.trim() : null,
      phone: client?.phone,
      categories: ['REAL ESTATE'],
      category_label: 'REAL ESTATE',
      status: v.status,
      notes: v.notes,
      metadata: { property: prop },
    })
  }

  // Process Insurance Expirations
  for (const p of policiesData || []) {
    const client = unwrap(p.clients)
    allEvents.push({
      id: `policy-exp-${p.id}`,
      type: 'insurance_expiry',
      title: `🛡️ Expirare ${p.product}: ${client?.first_name || ''} ${client?.last_name || ''} (${p.insurer})`,
      date: p.expiry_date,
      time: null,
      client_id: client?.id,
      client_name: client ? `${client.first_name} ${client.last_name}`.trim() : null,
      phone: client?.phone,
      email: client?.email,
      categories: ['INSURANCE'],
      category_label: 'INSURANCE',
      status: p.status,
      metadata: {
        policyNumber: p.policy_number,
        product: p.product,
        insurer: p.insurer,
        premium: p.premium,
        currency: p.currency,
      },
    })
  }

  // Process Tasks
  for (const t of tasksData || []) {
    if (!t.due_date) continue
    const client = unwrap(t.clients)
    allEvents.push({
      id: `task-${t.id}`,
      type: 'task',
      title: `📋 Task: ${t.title}`,
      date: t.due_date,
      time: null,
      client_id: client?.id,
      client_name: client ? `${client.first_name} ${client.last_name}`.trim() : null,
      categories: ['CONTACT'],
      category_label: 'TASK',
      priority: t.priority,
      status: t.status,
    })
  }

  // Calculate upcoming panels (Today, Next 7 Days, Next 30 Days)
  const todayStr = now.toISOString().slice(0, 10)
  const next7DaysEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const next30DaysEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  const upcomingToday: MasterCalendarEvent[] = []
  const upcoming7: MasterCalendarEvent[] = []
  const upcoming30: MasterCalendarEvent[] = []

  // For upcoming calculation, use current year's events
  for (const ev of allEvents) {
    // Only active items for follow-ups (ignore COMPLETED or CANCELLED in upcoming queue)
    if (ev.type === 'follow_up' && (ev.status === 'COMPLETED' || ev.status === 'CANCELLED')) {
      continue
    }

    if (ev.date === todayStr) {
      upcomingToday.push(ev)
    }
    if (ev.date >= todayStr && ev.date <= next7DaysEnd) {
      upcoming7.push(ev)
    }
    if (ev.date >= todayStr && ev.date <= next30DaysEnd) {
      upcoming30.push(ev)
    }
  }

  // Sort chronologically
  const sortByDate = (a: MasterCalendarEvent, b: MasterCalendarEvent) => a.date.localeCompare(b.date)
  upcomingToday.sort(sortByDate)
  upcoming7.sort(sortByDate)
  upcoming30.sort(sortByDate)
  allEvents.sort(sortByDate)

  return {
    events: allEvents,
    upcoming: {
      today: upcomingToday,
      next7Days: upcoming7,
      next30Days: upcoming30,
    },
  }
}
