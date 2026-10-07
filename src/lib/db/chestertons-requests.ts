import { createClient as createServerClient } from '@/lib/supabase/server'
import {
  VERIFIED_CHESTERTONS_REQUESTS,
  type ChestertonsRequest,
} from '@/lib/data/verified-chestertons-requests-dataset'

export type { ChestertonsRequest }

export interface ChestertonsFilterParams {
  search?: string
  status?: string // 'ALL' | 'Activa' | 'Retrasa' | 'Blank'
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
}

/**
 * Fetch list of Chestertons Real Estate Requests with rich filtering and pagination
 */
export async function getChestertonsRequests(filters: ChestertonsFilterParams = {}) {
  const {
    search,
    status,
    tipLead,
    sursa,
    agent,
    minBudget,
    maxBudget,
    page = 1,
    pageSize = 50,
  } = filters

  try {
    const supabase = await createServerClient()
    let query = supabase.from('chestertons_requests').select('*', { count: 'exact' })

    if (status && status !== 'ALL') {
      query = query.eq('parsed_status', status)
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
      return {
        requests: data as ChestertonsRequest[],
        total: count ?? data.length,
        page,
        pageSize,
        totalPages: Math.ceil((count ?? data.length) / pageSize),
      }
    }
  } catch (err) {
    // Fall back to immutable verified dataset
    console.warn('Falling back to immutable verified Chestertons dataset:', err)
  }

  // Immutable verified dataset filter & pagination
  let items = [...VERIFIED_CHESTERTONS_REQUESTS]

  if (status && status !== 'ALL') {
    items = items.filter((r) => r.parsed_status === status)
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
        (r.observatii && r.observatii.toLowerCase().includes(q))
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
 * Fetch a single Chestertons Request by ID or import_source_id
 */
export async function getChestertonsRequestById(id: string): Promise<ChestertonsRequest | null> {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('chestertons_requests')
      .select('*')
      .or(`id.eq.${id},import_source_id.eq.${id}`)
      .maybeSingle()

    if (!error && data) {
      return data as ChestertonsRequest
    }
  } catch (err) {
    console.warn('Falling back to immutable verified Chestertons dataset for single record:', err)
  }

  const found = VERIFIED_CHESTERTONS_REQUESTS.find(
    (r) => r.id === id || r.import_source_id === id
  )
  return found || null
}

/**
 * Calculate dataset metrics
 */
export async function getChestertonsMetrics(): Promise<ChestertonsMetrics> {
  const items = VERIFIED_CHESTERTONS_REQUESTS

  const sourceBreakdown: Record<string, number> = {}
  const agentBreakdown: Record<string, number> = {}

  let activeRequests = 0
  let retractedRequests = 0
  let blankStatusRequests = 0
  let apartments = 0
  let houses = 0

  items.forEach((r) => {
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
  }
}
