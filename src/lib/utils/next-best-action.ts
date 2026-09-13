import { createClient as createServerClient } from '@/lib/supabase/server'
import { calculatePropertyRequestMatch } from '@/lib/utils/matching-engine'
import type { Database } from '@/types'

type PropertyRow = Database['public']['Tables']['properties']['Row']
type RequestRow = Database['public']['Tables']['requests']['Row']

export interface NextBestAction {
  id: string
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'URGENT'
  category: 'LEAD' | 'FOLLOW_UP' | 'INSURANCE_RENEWAL' | 'CREDIT_PIPELINE' | 'PROPERTY_MATCH' | 'PERSONAL_DATE'
  title: string
  description: string
  reason: string
  actionLabel: string
  actions: string[]
  actionHref: string
  clientName?: string
  entityId?: string
  badgeText?: string
}

export async function getNextBestActions(targetClientId?: string, targetClientName?: string): Promise<NextBestAction[]> {
  const supabase = await createServerClient()
  const actions: NextBestAction[] = []
  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  const thirtyDaysAhead = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  try {
    const leadsQuery = supabase.from('leads').select('*').eq('status', 'NEW').order('created_at', { ascending: false }).limit(5)
    let followUpsQuery = supabase.from('follow_ups').select('*, clients(first_name, last_name)').eq('status', 'PENDING').order('due_date', { ascending: true }).limit(10)
    let insuranceQuery = supabase.from('insurance_policies').select('*, clients(first_name, last_name)').eq('status', 'ACTIVE').lte('expiry_date', thirtyDaysAhead).order('expiry_date', { ascending: true }).limit(5)
    let creditQuery = supabase.from('credit_cases').select('*, clients(first_name, last_name)').in('status', ['LEAD', 'ANALYSIS', 'DOCUMENTS']).order('updated_at', { ascending: true }).limit(5)
    let requestsQuery = supabase.from('requests').select('*, clients(first_name, last_name)').eq('status', 'ACTIVE').limit(10)
    let personalEventsQuery = supabase.from('personal_events').select('*, clients(first_name, last_name)').gte('event_date', todayStr).order('event_date', { ascending: true }).limit(5)

    if (targetClientId) {
      followUpsQuery = followUpsQuery.eq('client_id', targetClientId)
      insuranceQuery = insuranceQuery.eq('client_id', targetClientId)
      creditQuery = creditQuery.eq('client_id', targetClientId)
      requestsQuery = requestsQuery.eq('client_id', targetClientId)
      personalEventsQuery = personalEventsQuery.eq('client_id', targetClientId)
    }

    const [
      leadsRes,
      followUpsRes,
      insuranceRes,
      creditRes,
      requestsRes,
      propertiesRes,
      personalEventsRes,
    ] = await Promise.all([
      targetClientId ? Promise.resolve({ data: [] }) : leadsQuery,
      followUpsQuery,
      insuranceQuery,
      creditQuery,
      requestsQuery,
      supabase.from('properties').select('*').eq('property_status', 'PUBLIC').limit(20),
      personalEventsQuery,
    ])

    // 1. Uncontacted NEW Leads (CRITICAL)
    const newLeads = (leadsRes.data || []) as Database['public']['Tables']['leads']['Row'][]
    for (const lead of newLeads) {
      const desc = `Inquiry from ${lead.source || 'website'}: "${lead.message?.slice(0, 100) || 'Interested in properties/services'}"`
      actions.push({
        id: `lead-${lead.id}`,
        priority: 'CRITICAL',
        category: 'LEAD',
        title: `Urgent: Uncontacted Inbound Lead (${lead.name})`,
        description: desc,
        reason: desc,
        actionLabel: 'Contact & Convert Lead',
        actions: ['Contact & Convert Lead'],
        actionHref: `/admin/leads`,
        entityId: lead.id,
        badgeText: 'New Lead',
      })
    }

    // 2. Overdue / Due Today Follow-ups (HIGH)
    const followUps = followUpsRes.data || []
    for (const f of followUps) {
      const isOverdue = f.due_date < todayStr
      const clientName = f.clients ? `${(f.clients as unknown as { first_name: string; last_name: string }).first_name} ${(f.clients as unknown as { first_name: string; last_name: string }).last_name}` : (targetClientName || 'Client')
      const desc = f.notes || 'Scheduled relationship touchpoint'
      actions.push({
        id: `followup-${f.id}`,
        priority: isOverdue ? 'CRITICAL' : 'HIGH',
        category: 'FOLLOW_UP',
        title: isOverdue ? `Overdue Follow-up: ${clientName}` : `Today's Follow-up: ${clientName}`,
        description: desc,
        reason: desc,
        actionLabel: 'Complete Follow-up',
        actions: ['Complete Follow-up'],
        actionHref: `/admin/follow-ups`,
        clientName,
        entityId: f.id,
        badgeText: isOverdue ? 'Overdue' : 'Due Today',
      })
    }

    // 3. 30-Day Insurance Policy Renewals (HIGH)
    const expiringPolicies = insuranceRes.data || []
    for (const p of expiringPolicies) {
      const clientName = p.clients ? `${(p.clients as unknown as { first_name: string; last_name: string }).first_name} ${(p.clients as unknown as { first_name: string; last_name: string }).last_name}` : (targetClientName || 'Client')
      const desc = `${p.product} policy #${p.policy_number} with ${p.provider} expires on ${p.expiry_date} (${p.premium ? `${p.premium} ${p.currency}` : 'active'}).`
      actions.push({
        id: `insurance-${p.id}`,
        priority: 'HIGH',
        category: 'INSURANCE_RENEWAL',
        title: `Insurance Policy Expiry in <30 Days: ${clientName}`,
        description: desc,
        reason: desc,
        actionLabel: 'Open Policy Renewal',
        actions: ['Open Policy Renewal'],
        actionHref: `/admin/insurance/${p.id}`,
        clientName,
        entityId: p.id,
        badgeText: 'Expiring Soon',
      })
    }

    // 4. Stalled Credit Applications (MEDIUM)
    const creditCases = creditRes.data || []
    for (const c of creditCases) {
      const clientName = c.clients ? `${(c.clients as unknown as { first_name: string; last_name: string }).first_name} ${(c.clients as unknown as { first_name: string; last_name: string }).last_name}` : (targetClientName || 'Client')
      const desc = `${c.bank || 'Mortgage'} file in ${c.stage || c.status} stage for ${c.amount ? `${c.amount.toLocaleString()} ${c.currency}` : 'financing'}.`
      actions.push({
        id: `credit-${c.id}`,
        priority: 'MEDIUM',
        category: 'CREDIT_PIPELINE',
        title: `Financing Case Pending: ${clientName}`,
        description: desc,
        reason: desc,
        actionLabel: 'Advance Credit Case',
        actions: ['Advance Credit Case'],
        actionHref: `/admin/credit/${c.id}`,
        clientName,
        entityId: c.id,
        badgeText: c.stage || c.status,
      })
    }

    // 5. High-Score Property Matches (80%+) for Buyer Requests
    const requests = (requestsRes.data || []) as RequestRow[]
    const properties = (propertiesRes.data || []) as PropertyRow[]
    for (const r of requests) {
      const clientName = targetClientName || 'Buyer'
      for (const p of properties) {
        const match = calculatePropertyRequestMatch(p, r)
        if (match.score >= 80) {
          const desc = `Listing "${p.title}" matches buyer criteria (${match.score}% score).`
          actions.push({
            id: `match-${r.id}-${p.id}`,
            priority: 'HIGH',
            category: 'PROPERTY_MATCH',
            title: `High Affinity Property Match (${match.score}%): ${clientName}`,
            description: desc,
            reason: desc,
            actionLabel: 'Schedule Viewing',
            actions: ['Schedule Viewing', 'Send Dossier'],
            actionHref: `/admin/requests/${r.id}`,
            clientName,
            entityId: r.id,
            badgeText: `${match.score}% Match`,
          })
          break
        }
      }
    }

    // 6. Upcoming Personal Dates & Anniversaries (MEDIUM)
    const personalEvents = personalEventsRes.data || []
    for (const ev of personalEvents) {
      const clientName = ev.clients ? `${(ev.clients as unknown as { first_name: string; last_name: string }).first_name} ${(ev.clients as unknown as { first_name: string; last_name: string }).last_name}` : (targetClientName || 'Client')
      const desc = `Date: ${ev.event_date}. Personal touchpoint opportunity to maintain long-term relationship.`
      actions.push({
        id: `personal-${ev.id}`,
        priority: 'MEDIUM',
        category: 'PERSONAL_DATE',
        title: `Upcoming Date: ${ev.title || ev.event_type} (${clientName})`,
        description: desc,
        reason: desc,
        actionLabel: 'View Client Profile',
        actions: ['Send Greetings', 'Schedule Call'],
        actionHref: `/admin/clients/${ev.client_id}`,
        clientName,
        entityId: ev.client_id,
        badgeText: ev.event_type,
      })
    }
  } catch (err) {
    console.error('Error generating next best actions:', err)
  }

  // Sort: CRITICAL -> HIGH -> MEDIUM -> LOW
  const priorityOrder: Record<string, number> = {
    CRITICAL: 0,
    URGENT: 0,
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3,
  }

  return actions.sort((a, b) => (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4))
}
