import { createClient as createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types'

type CampaignInsert = Database['public']['Tables']['campaigns']['Insert']
type CampaignUpdate = Database['public']['Tables']['campaigns']['Update']

export async function getCampaigns() {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getCampaignById(id: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('campaigns')
    .select(`
      *,
      leads:leads (
        id,
        name,
        phone,
        email,
        status,
        created_at
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createCampaign(campaign: CampaignInsert) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('campaigns')
    .insert(campaign)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateCampaign(id: string, campaign: CampaignUpdate) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('campaigns')
    .update(campaign)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteCampaign(id: string) {
  const supabase = await createServerClient()
  const { error } = await supabase
    .from('campaigns')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}
