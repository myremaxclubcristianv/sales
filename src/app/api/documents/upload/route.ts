import { createClient as createServerClient } from '@/lib/supabase/server'
import { createDocument } from '@/lib/db/documents'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const clientId = formData.get('client_id') as string
    const folderName = formData.get('folder_name') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!clientId || typeof clientId !== 'string' || clientId.trim() === '') {
      return NextResponse.json({ error: 'Valid client_id is required' }, { status: 400 })
    }

    // 50MB file size limit
    const MAX_FILE_SIZE = 50 * 1024 * 1024
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds maximum 50MB limit' }, { status: 400 })
    }

    const supabase = await createServerClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const fileExt = (file.name.split('.').pop() || 'bin').replace(/[^a-zA-Z0-9]/g, '')
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${clientId.trim()}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file)

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const document = await createDocument({
      file_path: filePath,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      category: 'general',
      folder_name: folderName,
      client_id: clientId,
      uploaded_by: user.id,
    })

    return NextResponse.json({ document }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to upload document'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
