import { createClient as createServerClient } from '@/lib/supabase/server'
import { createFollowUp } from '@/lib/db/follow-ups'
import { createActivity } from '@/lib/db/activities'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = await createServerClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { log_activity = false, ...followUpPayload } = body

    if (!followUpPayload.client_id || !followUpPayload.reason || !followUpPayload.due_date) {
      return NextResponse.json(
        { error: 'Câmpurile client_id, reason și due_date sunt obligatorii.' },
        { status: 400 }
      )
    }

    // 1. If log_activity is requested, attempt database-level atomic RPC transaction first (Migration 022)
    if (log_activity) {
      const { data: rpcData, error: rpcError } = await supabase.rpc('create_scheduled_follow_up', {
        p_client_id: followUpPayload.client_id,
        p_reason: followUpPayload.reason,
        p_due_date: followUpPayload.due_date,
        p_priority: followUpPayload.priority || 'NORMAL',
        p_notes: followUpPayload.notes || null,
      })

      // If RPC executed successfully, return atomic result
      if (!rpcError && rpcData) {
        return NextResponse.json(rpcData, { status: 201 })
      }

      if (rpcError) {
        const isRpcMissing =
          rpcError.code === 'PGRST202' ||
          (typeof rpcError.message === 'string' &&
            rpcError.message.includes('Could not find the function public.create_scheduled_follow_up'))

        if (!isRpcMissing) {
          // Real RPC error: permissions, validation, client not found, or constraint violation
          // DO NOT fallback! Return the actual error directly.
          const msg = rpcError.message || 'Eroare la executarea tranzacției de programare.'
          const isForbidden =
            rpcError.code === '42501' ||
            msg.toLowerCase().includes('unauthorized') ||
            msg.toLowerCase().includes('nu sunteți autentificat')
          return NextResponse.json({ error: msg }, { status: isForbidden ? 403 : 400 })
        }
      }
    }

    // 2. Fallback: Server-side operation with compensating rollback
    const followUp = await createFollowUp(followUpPayload)

    let activity = null

    if (log_activity && followUp?.id) {
      try {
        const dueDateObj = new Date(followUpPayload.due_date)
        const dateFormatted = !isNaN(dueDateObj.getTime())
          ? dueDateObj.toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' })
          : followUpPayload.due_date
        const timeFormatted = !isNaN(dueDateObj.getTime())
          ? dueDateObj.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })
          : ''

        activity = await createActivity({
          client_id: followUpPayload.client_id,
          type: 'FOLLOW_UP',
          title: `Programat: ${followUpPayload.reason.trim()}`,
          notes: `Dată: ${dateFormatted}${timeFormatted ? ` la ${timeFormatted}` : ''}${
            followUpPayload.notes ? ` · Note: ${followUpPayload.notes}` : ''
          }`,
          date: new Date().toISOString(),
          created_by: user.id,
        })
      } catch (activityError: unknown) {
        // Rollback follow-up if activity insertion fails to ensure zero orphan records
        console.error('[FollowUps] Failed to create activity, rolling back follow-up:', activityError)
        await supabase.from('follow_ups').delete().eq('id', followUp.id)
        throw new Error(
          activityError instanceof Error
            ? `Eroare la crearea activității: ${activityError.message}`
            : 'Eroare la înregistrarea activității asociate. Operațiunea a fost anulată pentru consistență.'
        )
      }
    }

    return NextResponse.json({ followUp, activity }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create follow-up'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
