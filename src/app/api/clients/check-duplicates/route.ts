import { checkDuplicateClients } from '@/lib/db/clients'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { phone, email } = body
    
    const duplicates = await checkDuplicateClients(phone, email)
    return NextResponse.json({ duplicates })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to check duplicate clients'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
