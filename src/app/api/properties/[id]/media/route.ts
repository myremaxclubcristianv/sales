import { createClient as createServerClient } from '@/lib/supabase/server'
import { addPropertyMedia, deletePropertyMedia } from '@/lib/db/properties'
import { NextResponse } from 'next/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, props: RouteParams) {
  try {
    const params = await props.params
    const propertyId = params.id

    const formData = await request.formData()
    const file = formData.get('file') as File
    const isPrimary = formData.get('is_primary') === 'true'
    const displayOrder = parseInt((formData.get('display_order') as string) || '0', 10)

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!propertyId || typeof propertyId !== 'string') {
      return NextResponse.json({ error: 'Valid property_id is required' }, { status: 400 })
    }

    const MAX_MEDIA_SIZE = 25 * 1024 * 1024
    if (file.size > MAX_MEDIA_SIZE) {
      return NextResponse.json({ error: 'Media file size exceeds 25MB limit' }, { status: 400 })
    }

    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const fileExt = (file.name.split('.').pop() || 'jpg').replace(/[^a-zA-Z0-9]/g, '')
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `properties/${propertyId}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file)

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const media = await addPropertyMedia({
      property_id: propertyId,
      file_path: filePath,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      is_primary: isPrimary,
      display_order: displayOrder,
    })

    return NextResponse.json({ media }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to upload media'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const mediaId = searchParams.get('mediaId')

    if (!mediaId) {
      return NextResponse.json({ error: 'mediaId required' }, { status: 400 })
    }

    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await deletePropertyMedia(mediaId)
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete media'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
