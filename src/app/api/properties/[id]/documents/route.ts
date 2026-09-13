import { createClient as createServerClient } from '@/lib/supabase/server'
import { addPropertyDocument } from '@/lib/db/properties'
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
    const category = (formData.get('category') as 'contract' | 'ownership' | 'cadastral' | 'legal' | 'other') || 'contract'
    const description = (formData.get('description') as string) || null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `properties/${propertyId}/documents/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file)

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const document = await addPropertyDocument({
      property_id: propertyId,
      file_path: filePath,
      file_name: file.name,
      file_type: file.type,
      category,
      description,
      uploaded_by: user.id,
    })

    return NextResponse.json({ document }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to upload property document'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
