import { createClient as createServerClient } from '@/lib/supabase/server'

export interface RealAnalyticsOverview {
  properties: {
    totalActive: number
    totalInventoryValue: number
    totalPublic: number
    totalSold: number
    avgPrice: number
  }
  requests: {
    totalActive: number
    totalBudgetCeiling: number
  }
  leads: {
    total: number
    newCount: number
    convertedCount: number
    conversionRate: number
    bySource: Record<string, number>
  }
  insurance: {
    totalActive: number
    totalAnnualPremium: number
    expiringSoonCount: number
  }
  credit: {
    totalPipelineVolume: number
    totalFundedVolume: number
    activeCasesCount: number
  }
  clients: {
    totalClients: number
    activeClients: number
  }
}

export async function getRealDatabaseAnalytics(): Promise<RealAnalyticsOverview> {
  const supabase = await createServerClient()

  const [
    propertiesRes,
    requestsRes,
    leadsRes,
    insuranceRes,
    creditRes,
    clientsRes,
  ] = await Promise.all([
    supabase.from('properties').select('price, property_status, public_visibility, currency'),
    supabase.from('requests').select('budget_max, status, currency'),
    supabase.from('leads').select('source, status, created_at'),
    supabase.from('insurance_policies').select('premium, status, expiry_date, currency'),
    supabase.from('credit_cases').select('amount, status, currency'),
    supabase.from('clients').select('status, created_at'),
  ])

  const properties = propertiesRes.data || []
  const requests = requestsRes.data || []
  const leads = leadsRes.data || []
  const insurance = insuranceRes.data || []
  const credit = creditRes.data || []
  const clients = clientsRes.data || []

  // 1. Properties
  const activeProps = properties.filter((p) => p.property_status !== 'SOLD' && p.property_status !== 'ARCHIVED')
  const totalInventoryValue = activeProps.reduce((sum, p) => sum + (Number(p.price) || 0), 0)
  const avgPrice = activeProps.length > 0 ? Math.round(totalInventoryValue / activeProps.length) : 0
  const totalPublic = properties.filter((p) => p.public_visibility && p.property_status === 'PUBLIC').length
  const totalSold = properties.filter((p) => p.property_status === 'SOLD').length

  // 2. Requests
  const activeRequests = requests.filter((r) => r.status === 'ACTIVE')
  const totalBudgetCeiling = activeRequests.reduce((sum, r) => sum + (Number(r.budget_max) || 0), 0)

  // 3. Leads & Attribution
  const totalLeads = leads.length
  const newLeads = leads.filter((l) => l.status === 'NEW').length
  const convertedLeads = leads.filter((l) => l.status === 'CONVERTED').length
  const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0

  const bySource: Record<string, number> = {}
  for (const l of leads) {
    const src = l.source || 'unspecified'
    bySource[src] = (bySource[src] || 0) + 1
  }

  // 4. Insurance
  const now = new Date()
  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  const activePolicies = insurance.filter((p) => p.status === 'ACTIVE')
  const totalAnnualPremium = activePolicies.reduce((sum, p) => sum + (Number(p.premium) || 0), 0)
  const expiringSoonCount = activePolicies.filter((p) => {
    const exp = new Date(p.expiry_date)
    return exp >= now && exp <= thirtyDays
  }).length

  // 5. Credit
  const activeCredit = credit.filter((c) => c.status !== 'COMPLETED' && c.status !== 'LOST')
  const totalPipelineVolume = activeCredit.reduce((sum, c) => sum + (Number(c.amount) || 0), 0)
  const completedCredit = credit.filter((c) => c.status === 'COMPLETED')
  const totalFundedVolume = completedCredit.reduce((sum, c) => sum + (Number(c.amount) || 0), 0)

  // 6. Clients
  const totalClients = clients.length
  const activeClients = clients.filter((c) => c.status === 'ACTIVE').length

  return {
    properties: {
      totalActive: activeProps.length,
      totalInventoryValue,
      totalPublic,
      totalSold,
      avgPrice,
    },
    requests: {
      totalActive: activeRequests.length,
      totalBudgetCeiling,
    },
    leads: {
      total: totalLeads,
      newCount: newLeads,
      convertedCount: convertedLeads,
      conversionRate,
      bySource,
    },
    insurance: {
      totalActive: activePolicies.length,
      totalAnnualPremium,
      expiringSoonCount,
    },
    credit: {
      totalPipelineVolume,
      totalFundedVolume,
      activeCasesCount: activeCredit.length,
    },
    clients: {
      totalClients,
      activeClients,
    },
  }
}
