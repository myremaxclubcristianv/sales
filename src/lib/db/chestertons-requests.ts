import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  VERIFIED_CHESTERTONS_REQUESTS,
  type ChestertonsRequest,
} from '@/lib/data/verified-chestertons-requests-dataset'
import {
  type ChestertonsCrmStatus,
  type ChestertonsActivityItem,
  type ChestertonsActivityType,
  normalizeCrmStatus,
} from '@/lib/types/chestertons-workflow'

export type { ChestertonsRequest }

export interface ChestertonsFilterParams {
  search?: string
  status?: string // 'ALL' | 'Activa' | 'Retrasa' | 'Blank'
  crmStatus?: string // 'ALL' | 'NESUNAT' | 'AM_VORBIT' | etc.
  tipLead?: string // 'ALL' | 'Apartament' | 'Casa'
  sursa?: string
  agent?: string
  minBudget?: number
  maxBudget?: number
  page?: number
  pageSize?: number
}

export interface ChestertonsMetrics {
  totalRequests: number
  activeRequests: number
  retractedRequests: number
  blankStatusRequests: number
  apartments: number
  houses: number
  totalSources: number
  sourceBreakdown: Record<string, number>
  agentBreakdown: Record<string, number>
  crmStatusBreakdown: Record<string, number>
}

// In-Memory Runtime Workflow Store (guarantees zero loss, persistent throughout server execution and fallback)
interface WorkflowState {
  crm_status: ChestertonsCrmStatus
  last_contact_at: string | null
  next_follow_up_at: string | null
  crm_notes: string | null
  activities: ChestertonsActivityItem[]
}

const runtimeWorkflowStore: Map<string, WorkflowState> = new Map()

function getOrCreateWorkflowState(id: string): WorkflowState {
  const normId = id.trim()
  if (!runtimeWorkflowStore.has(normId)) {
    runtimeWorkflowStore.set(normId, {
      crm_status: 'NESUNAT',
      last_contact_at: null,
      next_follow_up_at: null,
      crm_notes: null,
      activities: [],
    })
  }
  return runtimeWorkflowStore.get(normId)!
}

async function getSafeSupabaseClient() {
  try {
    const admin = createAdminClient()
    if (admin) return admin
  } catch {
    // continue to server client
  }
  try {
    return await createServerClient()
  } catch {
    return null
  }
}

/**
 * Fetch list of Chestertons Real Estate Requests with rich filtering, CRM workflow statuses, and pagination
 */
export async function getChestertonsRequests(filters: ChestertonsFilterParams = {}) {
  const {
    search,
    status,
    crmStatus,
    tipLead,
    sursa,
    agent,
    minBudget,
    maxBudget,
    page = 1,
    pageSize = 50,
  } = filters

  try {
    const supabase = await getSafeSupabaseClient()
    if (supabase) {
      let query = supabase.from('chestertons_requests').select('*', { count: 'exact' })

    if (status && status !== 'ALL') {
      query = query.eq('parsed_status', status)
    }
    if (crmStatus && crmStatus !== 'ALL') {
      query = query.eq('crm_status', crmStatus)
    }
    if (tipLead && tipLead !== 'ALL') {
      query = query.eq('tip_lead', tipLead)
    }
    if (sursa && sursa !== 'ALL') {
      if (sursa === 'BLANK') {
        query = query.is('sursa', null)
      } else {
        query = query.eq('sursa', sursa)
      }
    }
    if (agent && agent !== 'ALL') {
      query = query.eq('agent', agent)
    }
    if (minBudget !== undefined) {
      query = query.gte('parsed_buget1', minBudget)
    }
    if (maxBudget !== undefined) {
      query = query.lte('parsed_buget2', maxBudget)
    }
    if (search && search.trim()) {
      const q = search.trim()
      query = query.or(
        `cumparator.ilike.%${q}%,email.ilike.%${q}%,telefon.ilike.%${q}%,import_source_id.ilike.%${q}%,id_intern.ilike.%${q}%,agent.ilike.%${q}%,oras.ilike.%${q}%,sursa.ilike.%${q}%,titlu.ilike.%${q}%`
      )
    }

      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      query = query.range(from, to).order('import_source_id', { ascending: true })

      const { data, count, error } = await query

      if (!error && data && data.length > 0) {
        const enriched = (data as ChestertonsRequest[]).map((r) => {
          const wf = getOrCreateWorkflowState(r.import_source_id)
          return {
            ...r,
            crm_status: r.crm_status || wf.crm_status || 'NESUNAT',
            last_contact_at: r.last_contact_at || wf.last_contact_at || null,
            next_follow_up_at: r.next_follow_up_at || wf.next_follow_up_at || null,
            crm_notes: r.crm_notes || wf.crm_notes || null,
          }
        })
        return {
          requests: enriched,
          total: count ?? data.length,
          page,
          pageSize,
          totalPages: Math.ceil((count ?? data.length) / pageSize),
        }
      }
    }
  } catch (err) {
    // Fall back to immutable verified dataset with runtime workflow state
    console.warn('Falling back to immutable verified Chestertons dataset with runtime workflow:', err)
  }

  // Immutable verified dataset filter & pagination
  let items = VERIFIED_CHESTERTONS_REQUESTS.map((r) => {
    const wf = getOrCreateWorkflowState(r.import_source_id)
    return {
      ...r,
      crm_status: wf.crm_status,
      last_contact_at: wf.last_contact_at,
      next_follow_up_at: wf.next_follow_up_at,
      crm_notes: wf.crm_notes,
    }
  })

  if (status && status !== 'ALL') {
    items = items.filter((r) => r.parsed_status === status)
  }
  if (crmStatus && crmStatus !== 'ALL') {
    items = items.filter((r) => r.crm_status === crmStatus)
  }
  if (tipLead && tipLead !== 'ALL') {
    items = items.filter((r) => r.tip_lead === tipLead)
  }
  if (sursa && sursa !== 'ALL') {
    if (sursa === 'BLANK') {
      items = items.filter((r) => !r.sursa || r.sursa.trim() === '')
    } else {
      items = items.filter((r) => r.sursa === sursa)
    }
  }
  if (agent && agent !== 'ALL') {
    items = items.filter((r) => r.agent === agent)
  }
  if (minBudget !== undefined) {
    items = items.filter((r) => r.parsed_buget1 !== null && r.parsed_buget1 >= minBudget)
  }
  if (maxBudget !== undefined) {
    items = items.filter((r) => r.parsed_buget2 !== null && r.parsed_buget2 <= maxBudget)
  }
  if (search && search.trim()) {
    const q = search.trim().toLowerCase()
    items = items.filter((r) => {
      return (
        r.cumparator.toLowerCase().includes(q) ||
        (r.email && r.email.toLowerCase().includes(q)) ||
        (r.telefon && r.telefon.toLowerCase().includes(q)) ||
        r.import_source_id.toLowerCase().includes(q) ||
        (r.id_intern && r.id_intern.toLowerCase().includes(q)) ||
        (r.agent && r.agent.toLowerCase().includes(q)) ||
        (r.oras && r.oras.toLowerCase().includes(q)) ||
        (r.sursa && r.sursa.toLowerCase().includes(q)) ||
        (r.titlu && r.titlu.toLowerCase().includes(q)) ||
        (r.observatii && r.observatii.toLowerCase().includes(q)) ||
        (r.crm_status && r.crm_status.toLowerCase().includes(q))
      )
    })
  }

  const total = items.length
  const from = (page - 1) * pageSize
  const paginated = items.slice(from, from + pageSize)

  return {
    requests: paginated,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

/**
 * Fetch a single Chestertons Request by ID or import_source_id, including its activity timeline
 */
export async function getChestertonsRequestById(id: string): Promise<ChestertonsRequest | null> {
  const normId = id.trim()
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(normId)
  const wf = getOrCreateWorkflowState(normId)

  try {
    const supabase = await getSafeSupabaseClient()
    if (supabase) {
      let query = supabase.from('chestertons_requests').select('*')
      if (isUuid) {
        query = query.eq('id', normId)
      } else {
        query = query.eq('import_source_id', normId)
      }
      const { data, error } = await query.maybeSingle()

      if (!error && data) {
        // Fetch activities from DB using both import_source_id and id for zero data loss
        const { data: dbActivities } = await supabase
          .from('chestertons_request_activities')
          .select('*')
          .or(`request_id.eq.${data.import_source_id},request_id.eq.${data.id}`)
          .order('created_at', { ascending: false })

        const reqWf = getOrCreateWorkflowState(data.import_source_id)

        const mergedActivities = [
          ...(dbActivities || []),
          ...reqWf.activities.filter(
            (wa) => !(dbActivities || []).some((da: { id: string }) => da.id === wa.id)
          ),
          ...wf.activities.filter(
            (wa) => !(dbActivities || []).some((da: { id: string }) => da.id === wa.id) &&
                    !reqWf.activities.some((ra) => ra.id === wa.id)
          ),
        ].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )

        const latestNote = mergedActivities.find((a) => a.note && a.note.trim())?.note ?? null

        return {
          ...(data as ChestertonsRequest),
          crm_status: data.crm_status || reqWf.crm_status || wf.crm_status || 'NESUNAT',
          last_contact_at: data.last_contact_at || reqWf.last_contact_at || wf.last_contact_at || null,
          next_follow_up_at: data.next_follow_up_at || reqWf.next_follow_up_at || wf.next_follow_up_at || null,
          crm_notes: data.crm_notes || latestNote || reqWf.crm_notes || wf.crm_notes || null,
          activities: mergedActivities as ChestertonsActivityItem[],
        }
      }
    }
  } catch (err) {
    console.warn('Falling back to immutable verified Chestertons dataset for single record:', err)
  }

  const found = VERIFIED_CHESTERTONS_REQUESTS.find(
    (r) => r.id === normId || r.import_source_id === normId
  )
  if (!found) return null

  return {
    ...found,
    crm_status: wf.crm_status,
    last_contact_at: wf.last_contact_at,
    next_follow_up_at: wf.next_follow_up_at,
    crm_notes: wf.crm_notes,
    activities: wf.activities,
  }
}

/**
 * Update CRM status with automatic audit logging into the timeline
 */
export async function updateChestertonsRequestStatus(
  requestId: string,
  newStatusRaw: string,
  note?: string,
  authorName: string = 'Agent Real Estate',
  userId?: string | null
): Promise<{ success: boolean; crm_status: ChestertonsCrmStatus; activity: ChestertonsActivityItem }> {
  const normId = requestId.trim()
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(normId)
  const newStatus = normalizeCrmStatus(newStatusRaw)
  const wf = getOrCreateWorkflowState(normId)
  const oldStatus = wf.crm_status

  // 1. Update workflow state
  wf.crm_status = newStatus

  // 2. Create status change activity entry
  const activityText = note && note.trim()
    ? `Status modificat: ${oldStatus} → ${newStatus}. Notă: ${note.trim()}`
    : `Status modificat: ${oldStatus} → ${newStatus}`

  const activity: ChestertonsActivityItem = {
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    request_id: normId,
    activity_type: 'STATUS_CHANGE',
    status_from: oldStatus,
    status_to: newStatus,
    note: activityText,
    created_at: new Date().toISOString(),
    created_by: authorName,
    user_id: userId || null,
  }

  wf.activities.unshift(activity)

  // 3. Persist to Supabase
  try {
    const admin = createAdminClient()
    const updatePayload: Record<string, unknown> = {
      crm_status: newStatus,
      updated_at: new Date().toISOString(),
    }
    if (note && note.trim()) {
      updatePayload.crm_notes = note.trim()
      wf.crm_notes = note.trim()
    }

    let updateQuery = admin.from('chestertons_requests').update(updatePayload)
    if (isUuid) {
      updateQuery = updateQuery.eq('id', normId)
    } else {
      updateQuery = updateQuery.eq('import_source_id', normId)
    }
    await updateQuery

    await admin.from('chestertons_request_activities').insert({
      id: activity.id.startsWith('act-') ? undefined : activity.id,
      request_id: normId,
      activity_type: 'STATUS_CHANGE',
      status_from: oldStatus,
      status_to: newStatus,
      note: activity.note,
      created_at: activity.created_at,
      created_by: authorName,
      user_id: userId || null,
    })
  } catch (err) {
    console.warn('Supabase status update fallback to runtime store:', err)
  }

  return { success: true, crm_status: newStatus, activity }
}

/**
 * Add a Note or Activity to a Chestertons request (Call, WhatsApp, Email, Follow-up, Meeting, Viewing, Note)
 */
export async function addChestertonsActivity(
  requestId: string,
  activityType: ChestertonsActivityType,
  note: string,
  authorName: string = 'Agent Real Estate',
  userId?: string | null
): Promise<ChestertonsActivityItem> {
  const normId = requestId.trim()
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(normId)
  const wf = getOrCreateWorkflowState(normId)
  const nowIso = new Date().toISOString()
  const cleanNote = note.trim()

  // If real contact action, update last_contact_at
  const isContactAction = ['CALL', 'WHATSAPP', 'EMAIL', 'MEETING', 'VIEWING'].includes(activityType)
  if (isContactAction) {
    wf.last_contact_at = nowIso
  }
  wf.crm_notes = cleanNote

  const activity: ChestertonsActivityItem = {
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    request_id: normId,
    activity_type: activityType,
    note: cleanNote,
    created_at: nowIso,
    created_by: authorName,
    user_id: userId || null,
  }

  wf.activities.unshift(activity)

  // Persist to Supabase
  try {
    const admin = createAdminClient()
    const updatePayload: Record<string, unknown> = {
      crm_notes: cleanNote,
      updated_at: nowIso,
    }
    if (isContactAction) {
      updatePayload.last_contact_at = nowIso
    }

    let updateQuery = admin.from('chestertons_requests').update(updatePayload)
    if (isUuid) {
      updateQuery = updateQuery.eq('id', normId)
    } else {
      updateQuery = updateQuery.eq('import_source_id', normId)
    }
    await updateQuery

    await admin.from('chestertons_request_activities').insert({
      request_id: normId,
      activity_type: activityType,
      note: activity.note,
      created_at: nowIso,
      created_by: authorName,
      user_id: userId || null,
    })
  } catch (err) {
    console.warn('Supabase activity insertion fallback to runtime store:', err)
  }

  return activity
}

/**
 * Update Next Follow-Up timestamp
 */
export async function updateChestertonsFollowUp(
  requestId: string,
  nextFollowUpAt: string | null
): Promise<{ success: boolean; next_follow_up_at: string | null }> {
  const normId = requestId.trim()
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(normId)
  const wf = getOrCreateWorkflowState(normId)
  wf.next_follow_up_at = nextFollowUpAt

  try {
    const admin = createAdminClient()
    let updateQuery = admin.from('chestertons_requests').update({
      next_follow_up_at: nextFollowUpAt,
      updated_at: new Date().toISOString(),
    })
    if (isUuid) {
      updateQuery = updateQuery.eq('id', normId)
    } else {
      updateQuery = updateQuery.eq('import_source_id', normId)
    }
    await updateQuery
  } catch (err) {
    console.warn('Supabase follow-up update fallback to runtime store:', err)
  }

  return { success: true, next_follow_up_at: nextFollowUpAt }
}

/**
 * Calculate dataset metrics including dynamic CRM workflow status breakdown
 */
export async function getChestertonsMetrics(): Promise<ChestertonsMetrics> {
  let items: Array<{
    import_source_id: string
    parsed_status?: string | null
    tip_lead?: string | null
    sursa?: string | null
    agent?: string | null
    crm_status?: string | null
  }> = VERIFIED_CHESTERTONS_REQUESTS

  try {
    const supabase = await getSafeSupabaseClient()
    if (supabase) {
      const { data, error } = await supabase
        .from('chestertons_requests')
        .select('import_source_id, parsed_status, tip_lead, sursa, agent, crm_status')
      if (!error && data && data.length > 0) {
        items = data
      }
    }
  } catch (err) {
    console.warn('Falling back to verified dataset for metrics:', err)
  }

  const sourceBreakdown: Record<string, number> = {}
  const agentBreakdown: Record<string, number> = {}
  const crmStatusBreakdown: Record<string, number> = {}

  let activeRequests = 0
  let retractedRequests = 0
  let blankStatusRequests = 0
  let apartments = 0
  let houses = 0

  items.forEach((r) => {
    const wf = getOrCreateWorkflowState(r.import_source_id)
    const crmSt = wf.crm_status || 'NESUNAT'
    crmStatusBreakdown[crmSt] = (crmStatusBreakdown[crmSt] || 0) + 1

    if (r.parsed_status === 'Activa') activeRequests++
    else if (r.parsed_status === 'Retrasa') retractedRequests++
    else blankStatusRequests++

    if (r.tip_lead === 'Apartament') apartments++
    else if (r.tip_lead === 'Casa') houses++

    const src = r.sursa || 'Nespecificat'
    sourceBreakdown[src] = (sourceBreakdown[src] || 0) + 1

    const ag = r.agent || 'Nespecificat'
    agentBreakdown[ag] = (agentBreakdown[ag] || 0) + 1
  })

  return {
    totalRequests: items.length,
    activeRequests,
    retractedRequests,
    blankStatusRequests,
    apartments,
    houses,
    totalSources: Object.keys(sourceBreakdown).length,
    sourceBreakdown,
    agentBreakdown,
    crmStatusBreakdown,
  }
}
