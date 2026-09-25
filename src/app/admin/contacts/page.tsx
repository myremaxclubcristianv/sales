import React from 'react'
import { PrivateLayout } from '@/components/layout/private/PrivateLayout'
import { getContacts, getContactsCounts } from '@/lib/db/contacts'
import { ContactsView } from './ContactsView'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{
    search?: string
    category?: string
    clientFilter?: 'all' | 'clients_only' | 'agenda_only'
  }>
}

import type { ContactRow } from '@/lib/db/contacts'

export default async function ContactsPage(props: PageProps) {
  const searchParams = await props.searchParams
  const search = searchParams?.search || ''
  const category = searchParams?.category || 'ALL'
  const clientFilter = searchParams?.clientFilter || 'all'

  let contacts: ContactRow[] = []
  let counts = { total: 0, clientsCount: 0, nonClientsCount: 0 }

  try {
    const [contactsRes, countsRes] = await Promise.all([
      getContacts({
        search: search || undefined,
        category: category !== 'ALL' ? category : undefined,
        clientFilter: clientFilter !== 'all' ? clientFilter : undefined,
      }),
      getContactsCounts(),
    ])

    contacts = contactsRes.data
    counts = countsRes
  } catch (err) {
    console.error('Error fetching contacts in page:', err)
  }

  return (
    <PrivateLayout>
      <ContactsView
        initialContacts={contacts}
        totalCount={counts.total}
        clientsCount={counts.clientsCount}
        nonClientsCount={counts.nonClientsCount}
        initialCategory={category}
        initialClientFilter={clientFilter}
        initialSearch={search}
      />
    </PrivateLayout>
  )
}
