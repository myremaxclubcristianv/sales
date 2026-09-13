import { NextResponse } from 'next/server'
import { getLeadById, updateLead } from '@/lib/db/leads'
import { createClientRecord } from '@/lib/db/clients'
import { createActivity } from '@/lib/db/activities'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, props: RouteParams) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await props.params
    const lead = await getLeadById(id)

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // Split name into first and last name
    const parts = (lead.name || 'New Lead').trim().split(' ')
    const firstName = parts[0] || 'Unknown'
    const lastName = parts.slice(1).join(' ') || '-'

    // 1. Create client record
    const newClient = await createClientRecord({
      first_name: firstName,
      last_name: lastName,
      phone: lead.phone || null,
      email: lead.email || null,
      lead_source: lead.source || 'website',
      personal_notes: lead.message ? `Converted from Lead #${lead.id.slice(0, 8)}: "${lead.message}"` : null,
      status: 'ACTIVE',
    })

    // 2. Add client relationship
    const relationshipType = lead.request_id ? 'seller' : 'buyer'
    await supabase.from('client_relationships').insert({
      client_id: newClient.id,
      relationship_type: relationshipType,
      is_primary: true,
      notes: `Generated via lead inquiry on ${lead.property_id ? 'property' : lead.request_id ? 'buyer request' : 'website'}.`,
    })

    // 3. Log initial conversion activity
    try {
      await createActivity({
        client_id: newClient.id,
        property_id: lead.property_id || null,
        type: 'STATUS_CHANGE',
        title: `Lead converted to active client record`,
        notes: `Original inquiry: ${lead.message || 'Inquiry submitted'}`,
        date: new Date().toISOString(),
      })
    } catch {
      // Best effort
    }

    // 4. Update lead status to CONVERTED
    await updateLead(lead.id, {
      status: 'CONVERTED',
      notes: `Converted to client ID: ${newClient.id}`,
    })

    return NextResponse.json({ success: true, clientId: newClient.id })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to convert lead'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
