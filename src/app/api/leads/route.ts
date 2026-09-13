import { createClient as createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, phone, email, message, property_id, request_id, honeypot } = body

    // Basic spam bot protection
    if (honeypot) {
      return NextResponse.json({ success: true }, { status: 200 })
    }

    if (!name || (!phone && !email)) {
      return NextResponse.json(
        { error: 'Name and either phone or email are required' },
        { status: 400 }
      )
    }

    const supabase = await createServerClient()
    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        name: name.trim(),
        phone: phone ? phone.trim() : null,
        email: email ? email.trim() : null,
        message: message ? message.trim() : null,
        property_id: property_id || null,
        request_id: request_id || null,
        source: property_id ? 'property' : 'website',
        status: 'NEW',
      })
      .select()
      .single()

    if (error) {
      console.error('Lead creation error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Auto-create broker notification
    try {
      await supabase.from('notifications').insert({
        type: 'lead',
        title: `New Inbound Lead: ${name.trim()}`,
        message: message ? message.trim().slice(0, 150) : `Inquiry registered for ${property_id ? 'property' : 'general services'}.`,
        related_entity_type: 'lead',
        related_entity_id: lead.id,
        is_read: false,
      })
    } catch {
      // Non-blocking notification creation
    }

    return NextResponse.json({ success: true, lead }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to register inquiry'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
