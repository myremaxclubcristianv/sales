import React from 'react'
import { PrivateLayout } from '@/components/layout/private/PrivateLayout'
import { getClients, type ClientWithRelations } from '@/lib/db/clients'
import { ClientsView } from './ClientsView'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{
    search?: string
    status?: string
    category?: string
    quickFilter?: string
    source?: string
  }>
}

export default async function ClientsPage(props: PageProps) {
  const searchParams = await props.searchParams
  const search = searchParams?.search || ''
  const status = searchParams?.status || ''
  const category = searchParams?.category || 'ALL'
  const quickFilter = searchParams?.quickFilter || ''
  const source = searchParams?.source || ''

  let clients: ClientWithRelations[] = []
  try {
    clients = await getClients({
      search: search || undefined,
      status: status || undefined,
      category: category !== 'ALL' ? category : undefined,
      source: source || undefined,
      quickFilter: quickFilter || undefined,
    })
  } catch (err) {
    console.error('Error fetching clients:', err)
  }

  return (
    <PrivateLayout>
      <ClientsView
        initialClients={clients}
        initialCategory={category}
        initialQuickFilter={quickFilter}
        initialSearch={search}
        initialStatus={status}
        initialSource={source}
      />
    </PrivateLayout>
  )
}
