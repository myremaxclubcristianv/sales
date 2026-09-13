import { createTask, getTasks } from '@/lib/db/tasks'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined
    const priority = searchParams.get('priority') || undefined
    const clientId = searchParams.get('clientId') || undefined
    const propertyId = searchParams.get('propertyId') || undefined

    const tasks = await getTasks({ status, priority, clientId, propertyId })
    return NextResponse.json({ tasks })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch tasks'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, due_date, priority, status, client_id, property_id, opportunity_id } = body

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const task = await createTask({
      title: title.trim(),
      description: description ? description.trim() : null,
      due_date: due_date || null,
      priority: priority || 'NORMAL',
      status: status || 'TODO',
      client_id: client_id || null,
      property_id: property_id || null,
      opportunity_id: opportunity_id || null,
      created_by: user.id,
    })

    return NextResponse.json({ task }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create task'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
