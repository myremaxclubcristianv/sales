import { createClient as createServerClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/utils/rate-limit'
import { notifyNewLeadTelegram } from '@/lib/telegram/telegram'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // Rate limit check: max 10 requests per minute per IP
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous'
    const rateLimit = checkRateLimit(clientIp, { limit: 10, windowMs: 60000 })
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment before trying again.' },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
          },
        }
      )
    }

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
    const sourceVal = property_id ? 'property' : (request_id ? 'website' : 'website')

    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        name: name.trim(),
        phone: phone ? phone.trim() : null,
        email: email ? email.trim() : null,
        message: message ? message.trim() : null,
        property_id: property_id || null,
        request_id: request_id || null,
        source: sourceVal,
        status: 'NEW',
      })
      .select()
      .single()

    if (error) {
      console.error('Lead creation error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Auto-create broker in-app notification (non-blocking)
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
      // Non-blocking internal notification creation
    }

    // Lookup optional property or request title for richer Telegram context
    let propertyTitle: string | null = null
    let requestTitle: string | null = null

    if (property_id) {
      try {
        const { data: prop } = await supabase
          .from('properties')
          .select('title')
          .eq('id', property_id)
          .single()
        if (prop?.title) propertyTitle = prop.title
      } catch {
        // Ignore lookup error
      }
    }

    if (request_id) {
      try {
        const { data: reqData } = await supabase
          .from('requests')
          .select('title')
          .eq('id', request_id)
          .single()
        if (reqData?.title) requestTitle = reqData.title
      } catch {
        // Ignore lookup error
      }
    }

    // Dispatch Telegram notification as safe side-effect
    try {
      await notifyNewLeadTelegram({
        id: lead.id,
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        message: lead.message,
        source: lead.source,
        property_title: propertyTitle,
        request_title: requestTitle,
        created_at: lead.created_at,
      })
    } catch (telegramErr) {
      // Telegram failure must never block lead confirmation
      console.warn('[Telegram Side-Effect] Notification skipped or failed safely:', telegramErr)
    }

    return NextResponse.json({ success: true, lead }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to register inquiry'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

