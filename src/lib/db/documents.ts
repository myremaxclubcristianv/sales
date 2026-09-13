import { createClient as createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types'

type DocumentInsert = Database['public']['Tables']['documents']['Insert']
type DocumentFolderInsert = Database['public']['Tables']['document_folders']['Insert']

export async function getClientDocuments(clientId: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getClientDocumentFolders(clientId: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('document_folders')
    .select('*')
    .eq('client_id', clientId)
    .is('parent_folder_id', null)
    .order('name', { ascending: true })

  if (error) throw error
  return data
}

export async function createDocument(document: DocumentInsert) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('documents')
    .insert(document)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function createDocumentFolder(folder: DocumentFolderInsert) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('document_folders')
    .insert(folder)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteDocument(id: string) {
  const supabase = await createServerClient()
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function updateDocument(id: string, document: Partial<DocumentInsert>) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('documents')
    .update(document)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}
