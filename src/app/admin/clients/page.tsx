import React from 'react'
import Link from 'next/link'
import { PrivateLayout } from '@/components/layout/private/PrivateLayout'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { getClients } from '@/lib/db/clients'
import type { Database } from '@/types'

type ClientWithCompany = Database['public']['Tables']['clients']['Row'] & {
  companies?: { name?: string | null } | null
}

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ search?: string; status?: string }>
}

export default async function ClientsPage(props: PageProps) {
  const searchParams = await props.searchParams
  const search = searchParams?.search || ''
  const status = searchParams?.status || ''

  let clients: ClientWithCompany[] = []
  try {
    const data = await getClients()
    clients = (data as ClientWithCompany[]) || []
  } catch (err) {
    console.error('Error fetching clients:', err)
  }

  const filteredClients = clients.filter((client) => {
    const query = search.toLowerCase()
    const matchesSearch =
      !search ||
      client.first_name?.toLowerCase().includes(query) ||
      client.last_name?.toLowerCase().includes(query) ||
      client.email?.toLowerCase().includes(query) ||
      client.phone?.includes(search)

    const matchesStatus = !status || client.status === status

    return matchesSearch && matchesStatus
  })

  return (
    <PrivateLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Clients Directory
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Unified 360° client relationships across real estate, insurance, and financing.
            </p>
          </div>
          <Link href="/admin/clients/new">
            <Button size="sm">+ Add New Client</Button>
          </Link>
        </div>

        {/* Filter / Search Bar */}
        <Card className="p-4">
          <form method="GET" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              name="search"
              placeholder="Search by name, phone, email..."
              defaultValue={search}
              className="px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <select
              name="status"
              defaultValue={status}
              className="px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="ARCHIVED">Archived</option>
            </select>
            <div className="flex items-center gap-2">
              <Button type="submit" size="sm" className="w-full">
                Filter
              </Button>
              {(search || status) && (
                <Link href="/admin/clients">
                  <Button type="button" variant="outline" size="sm">
                    Reset
                  </Button>
                </Link>
              )}
            </div>
          </form>
        </Card>

        {/* Clients List */}
        {filteredClients.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200">
            <p className="text-base font-semibold text-slate-800">No clients matching query</p>
            <p className="text-xs text-slate-500 mt-1">Add a new client profile or adjust your filters.</p>
            <Link href="/admin/clients/new" className="mt-4 inline-block">
              <Button size="sm">+ Create Client Profile</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredClients.map((client) => (
              <Link
                key={client.id}
                href={`/admin/clients/${client.id}`}
                className="block bg-white rounded-xl border border-slate-200/80 hover:border-slate-300 p-4 transition-all hover:shadow-xs group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-semibold flex items-center justify-center text-sm flex-shrink-0">
                      {client.first_name?.[0] || ''}{client.last_name?.[0] || ''}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {client.first_name} {client.last_name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-0.5">
                        {client.phone && <span>📞 {client.phone}</span>}
                        {client.email && <span>✉️ {client.email}</span>}
                        {client.companies?.name && <span>🏢 {client.companies.name}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <Badge
                      variant={
                        client.status === 'ACTIVE'
                          ? 'success'
                          : client.status === 'INACTIVE'
                          ? 'default'
                          : 'danger'
                      }
                      size="sm"
                    >
                      {client.status}
                    </Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PrivateLayout>
  )
}
