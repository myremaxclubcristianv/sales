import { createAdminClient } from '@/lib/supabase/admin'
import {
  VERIFIED_INSURANCE_COMPANIES_DATASET,
  type RawInsuranceCompanyRecord,
  type ProspectStatus,
  type InsuranceCompany,
  type InsuranceCompanyActivity,
  getDeterministicUuid,
} from '@/lib/data/verified-insurance-companies-dataset'

export type { ProspectStatus, InsuranceCompany, InsuranceCompanyActivity }

export interface InsuranceCompaniesFilterParams {
  search?: string
  status?: string // 'ALL' | ProspectStatus
  tableNumber?: number // 1..4
  city?: string
  page?: number
  pageSize?: number
}

export interface InsuranceCompaniesMetrics {
  total: number
  statusBreakdown: Record<string, number>
  tableBreakdown: Record<number, number>
  cityBreakdown: Record<string, number>
  needsFollowUpToday: number
}

// In-Memory Runtime Store to guarantee instant, resilient state persistence across dev/preview/production
const runtimeStateStore: Map<
  string,
  {
    prospect_status: ProspectStatus
    last_contact_at: string | null
    next_follow_up_at: string | null
    crm_notes: string | null
    additional_phones: string[]
    additional_emails: string[]
    activities: InsuranceCompanyActivity[]
  }
> = new Map()

function getOrCreateRuntimeState(sourceId: string) {
  if (!runtimeStateStore.has(sourceId)) {
    runtimeStateStore.set(sourceId, {
      prospect_status: 'NECONTACTAT',
      last_contact_at: null,
      next_follow_up_at: null,
      crm_notes: null,
      additional_phones: [],
      additional_emails: [],
      activities: [],
    })
  }
  return runtimeStateStore.get(sourceId)!
}

interface DatabaseCompanyRow {
  id?: string
  name?: string
  industry?: string
  phone?: string
  email?: string
  website?: string
  address?: string
  city?: string
  country?: string
  registration_number?: string
  legal_name?: string | null
  notes?: string | null
  created_at?: string
  updated_at?: string
}

interface CompanyMetadataJson {
  table_number?: number
  table_name?: string
  row_index?: number
  nr?: string
  observations_header?: string
  prospect_status?: ProspectStatus
  last_contact_at?: string | null
  next_follow_up_at?: string | null
  crm_notes?: string | null
  additional_phones?: string[]
  additional_emails?: string[]
}

/**
 * Maps a database `companies` row + dataset fallback to InsuranceCompany model
 */
function mapToInsuranceCompany(dbRow: DatabaseCompanyRow, rawRecord?: RawInsuranceCompanyRecord): InsuranceCompany {
  const sourceId = dbRow.registration_number || rawRecord?.import_source_id || ''
  const rt = getOrCreateRuntimeState(sourceId)

  let metadata: CompanyMetadataJson = {}
  if (dbRow.legal_name) {
    try {
      metadata = typeof dbRow.legal_name === 'string' ? JSON.parse(dbRow.legal_name) : (dbRow.legal_name as unknown as CompanyMetadataJson)
    } catch {
      metadata = {}
    }
  }

  const tableNumber = metadata.table_number || rawRecord?.table_number || 1
  const tableName = metadata.table_name || rawRecord?.table_name || `Tabelul ${tableNumber}`
  const rowIndex = metadata.row_index || rawRecord?.row_index || 1
  const nr = metadata.nr || rawRecord?.nr || String(rowIndex)
  const obsHeader = metadata.observations_header || rawRecord?.observatii_header || 'Observații / Sursă'
  const prospectStatus: ProspectStatus =
    rt.prospect_status !== 'NECONTACTAT'
      ? rt.prospect_status
      : metadata.prospect_status || 'NECONTACTAT'

  const lastContact = rt.last_contact_at || metadata.last_contact_at || null
  const nextFollowUp = rt.next_follow_up_at || metadata.next_follow_up_at || null
  const crmNotes = rt.crm_notes || metadata.crm_notes || null
  const addPhones = rt.additional_phones.length > 0 ? rt.additional_phones : metadata.additional_phones || []
  const addEmails = rt.additional_emails.length > 0 ? rt.additional_emails : metadata.additional_emails || []

  return {
    id: dbRow.id || getDeterministicUuid(sourceId),
    import_source_id: sourceId,
    table_number: tableNumber,
    table_name: tableName,
    row_index: rowIndex,
    nr,
    name: dbRow.name || rawRecord?.denumire_firma || '',
    activity_type: dbRow.industry || rawRecord?.tip_activitate || '',
    phone: dbRow.phone || rawRecord?.telefon || '',
    email: dbRow.email || rawRecord?.email || '',
    website: dbRow.website || rawRecord?.website || '',
    address: dbRow.address || rawRecord?.adresa_sediu || '',
    city: dbRow.city || rawRecord?.oras_judet || '',
    original_observations: dbRow.notes || rawRecord?.observatii_sursa || '',
    observations_header: obsHeader,
    prospect_status: prospectStatus,
    last_contact_at: lastContact,
    next_follow_up_at: nextFollowUp,
    crm_notes: crmNotes,
    additional_phones: addPhones,
    additional_emails: addEmails,
    created_at: dbRow.created_at || new Date().toISOString(),
    updated_at: dbRow.updated_at || new Date().toISOString(),
  }
}

/**
 * Fetch companies with filtering, search, and pagination
 */
export async function getInsuranceCompanies(params: InsuranceCompaniesFilterParams = {}): Promise<{
  companies: InsuranceCompany[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}> {
  const {
    search = '',
    status = 'ALL',
    tableNumber,
    city,
    page = 1,
    pageSize = 50,
  } = params

  const supabase = createAdminClient()

  let dbCompanies: DatabaseCompanyRow[] = []
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('registration_number', { ascending: true })

    if (!error && data && data.length > 0) {
      dbCompanies = data
    }
  } catch (err) {
    console.warn('Supabase companies fetch warning (falling back to dataset):', err)
  }

  // If DB returned fewer than 107 records or errored, merge with immutable dataset
  const datasetMap = new Map<string, RawInsuranceCompanyRecord>()
  for (const r of VERIFIED_INSURANCE_COMPANIES_DATASET) {
    datasetMap.set(r.import_source_id, r)
  }

  const mergedList: InsuranceCompany[] = []
  const seenIds = new Set<string>()

  for (const dbRow of dbCompanies) {
    const sourceId = dbRow.registration_number
    if (sourceId && datasetMap.has(sourceId)) {
      mergedList.push(mapToInsuranceCompany(dbRow, datasetMap.get(sourceId)))
      seenIds.add(sourceId)
    } else if (sourceId) {
      mergedList.push(mapToInsuranceCompany(dbRow))
      seenIds.add(sourceId)
    }
  }

  // Add any from verified dataset not yet in DB
  for (const [sourceId, raw] of datasetMap.entries()) {
    if (!seenIds.has(sourceId)) {
      const fallbackDbRow = {
        id: getDeterministicUuid(sourceId),
        registration_number: sourceId,
        name: raw.denumire_firma,
        industry: raw.tip_activitate,
        phone: raw.telefon,
        email: raw.email,
        website: raw.website,
        address: raw.adresa_sediu,
        city: raw.oras_judet,
        notes: raw.observatii_sursa,
        legal_name: JSON.stringify({
          import_source_id: sourceId,
          table_number: raw.table_number,
          table_name: raw.table_name,
          row_index: raw.row_index,
          nr: raw.nr,
          observations_header: raw.observatii_header,
        }),
      }
      mergedList.push(mapToInsuranceCompany(fallbackDbRow, raw))
    }
  }

  // Sort by table number then row index
  mergedList.sort((a, b) => {
    if (a.table_number !== b.table_number) return a.table_number - b.table_number
    return a.row_index - b.row_index
  })

  // Apply filters in memory
  let filtered = mergedList

  if (search.trim()) {
    const q = search.trim().toLowerCase()
    filtered = filtered.filter((c) => {
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.activity_type.toLowerCase().includes(q) ||
        c.original_observations.toLowerCase().includes(q) ||
        (c.crm_notes && c.crm_notes.toLowerCase().includes(q)) ||
        c.additional_phones.some((p) => p.toLowerCase().includes(q)) ||
        c.additional_emails.some((e) => e.toLowerCase().includes(q))
      )
    })
  }

  if (status && status !== 'ALL') {
    filtered = filtered.filter((c) => c.prospect_status === status)
  }

  if (tableNumber) {
    filtered = filtered.filter((c) => c.table_number === tableNumber)
  }

  if (city && city !== 'ALL') {
    const cNorm = city.trim().toLowerCase()
    filtered = filtered.filter((c) => c.city.toLowerCase().includes(cNorm))
  }

  const total = filtered.length
  const totalPages = Math.ceil(total / pageSize) || 1
  const offset = (page - 1) * pageSize
  const paginated = filtered.slice(offset, offset + pageSize)

  return {
    companies: paginated,
    total,
    page,
    pageSize,
    totalPages,
  }
}

/**
 * Get a single company by ID or import_source_id
 */
export async function getInsuranceCompanyById(idOrSourceId: string): Promise<InsuranceCompany | null> {
  const norm = idOrSourceId.trim()
  const { companies } = await getInsuranceCompanies({ pageSize: 200 })
  return companies.find((c) => c.id === norm || c.import_source_id === norm) || null
}

/**
 * Update CRM Workflow state of a company
 */
export async function updateInsuranceCompany(
  id: string,
  updates: {
    prospect_status?: ProspectStatus
    last_contact_at?: string | null
    next_follow_up_at?: string | null
    crm_notes?: string | null
    additional_phones?: string[]
    additional_emails?: string[]
  }
): Promise<InsuranceCompany | null> {
  const company = await getInsuranceCompanyById(id)
  if (!company) return null

  const sourceId = company.import_source_id
  const rt = getOrCreateRuntimeState(sourceId)

  // Track status change activity if changed
  if (updates.prospect_status && updates.prospect_status !== company.prospect_status) {
    rt.activities.unshift({
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      company_id: sourceId,
      activity_type: 'STATUS_CHANGE',
      status_from: company.prospect_status,
      status_to: updates.prospect_status,
      content: `Status schimbat din ${company.prospect_status} în ${updates.prospect_status}`,
      created_at: new Date().toISOString(),
    })
    rt.prospect_status = updates.prospect_status
  }

  if (updates.last_contact_at !== undefined) rt.last_contact_at = updates.last_contact_at
  if (updates.next_follow_up_at !== undefined) rt.next_follow_up_at = updates.next_follow_up_at
  if (updates.crm_notes !== undefined) rt.crm_notes = updates.crm_notes
  if (updates.additional_phones !== undefined) rt.additional_phones = updates.additional_phones
  if (updates.additional_emails !== undefined) rt.additional_emails = updates.additional_emails

  // Persist into Supabase `companies` table
  const supabase = createAdminClient()
  try {
    const updatedMetadata = {
      import_source_id: sourceId,
      table_number: company.table_number,
      table_name: company.table_name,
      row_index: company.row_index,
      nr: company.nr,
      observations_header: company.observations_header,
      prospect_status: rt.prospect_status,
      last_contact_at: rt.last_contact_at,
      next_follow_up_at: rt.next_follow_up_at,
      crm_notes: rt.crm_notes,
      additional_phones: rt.additional_phones,
      additional_emails: rt.additional_emails,
    }

    await supabase
      .from('companies')
      .update({
        legal_name: JSON.stringify(updatedMetadata),
        updated_at: new Date().toISOString(),
      })
      .eq('id', company.id)
  } catch (err) {
    console.error('Failed to update company in Supabase:', err)
  }

  return getInsuranceCompanyById(id)
}

/**
 * Add an activity / note to a company
 */
export async function addInsuranceCompanyActivity(
  companyId: string,
  activity: {
    activity_type: InsuranceCompanyActivity['activity_type']
    content: string
    created_by?: string
  }
): Promise<InsuranceCompanyActivity> {
  const company = await getInsuranceCompanyById(companyId)
  if (!company) throw new Error('Company not found')

  const rt = getOrCreateRuntimeState(company.import_source_id)
  const newActivity: InsuranceCompanyActivity = {
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    company_id: company.import_source_id,
    activity_type: activity.activity_type,
    content: activity.content,
    created_at: new Date().toISOString(),
    created_by: activity.created_by || 'Admin CRM',
  }

  rt.activities.unshift(newActivity)
  return newActivity
}

/**
 * Get activities for a company
 */
export async function getInsuranceCompanyActivities(companyId: string): Promise<InsuranceCompanyActivity[]> {
  const company = await getInsuranceCompanyById(companyId)
  if (!company) return []
  const rt = getOrCreateRuntimeState(company.import_source_id)
  return rt.activities
}

/**
 * Aggregate metrics across all 107 companies
 */
export async function getInsuranceCompaniesMetrics(): Promise<InsuranceCompaniesMetrics> {
  const { companies } = await getInsuranceCompanies({ pageSize: 200 })

  const statusBreakdown: Record<string, number> = {}
  const tableBreakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 }
  const cityBreakdown: Record<string, number> = {}

  let needsFollowUpToday = 0
  const todayStr = new Date().toISOString().split('T')[0]

  for (const c of companies) {
    statusBreakdown[c.prospect_status] = (statusBreakdown[c.prospect_status] || 0) + 1
    tableBreakdown[c.table_number] = (tableBreakdown[c.table_number] || 0) + 1

    const cityNorm = c.city.split('/')[0].split('(')[0].trim() || 'Nespecificat'
    cityBreakdown[cityNorm] = (cityBreakdown[cityNorm] || 0) + 1

    if (c.next_follow_up_at && c.next_follow_up_at.startsWith(todayStr)) {
      needsFollowUpToday++
    }
  }

  return {
    total: companies.length,
    statusBreakdown,
    tableBreakdown,
    cityBreakdown,
    needsFollowUpToday,
  }
}
