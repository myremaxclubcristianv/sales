import { getRequests } from '@/lib/db/requests'
import { PrivateLayout } from '@/components/layout/private/PrivateLayout'
import Link from 'next/link'
import { Plus, Search, ArrowUpRight } from 'lucide-react'

interface PageProps {
  searchParams: Promise<{
    status?: string
    property_type?: string
  }>
}

export const dynamic = 'force-dynamic'

export default async function AdminRequestsPage(props: PageProps) {
  const searchParams = await props.searchParams
  const requests = await getRequests({
    status: searchParams.status,
    propertyType: searchParams.property_type,
  })

  return (
    <PrivateLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Buyer Search Profiles
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Active buyer requirements matched against property inventory
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/requests/new"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-xl font-medium text-sm hover:opacity-95 transition active:scale-95 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Buyer Request
            </Link>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <Link
              href="/admin/requests"
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                !searchParams.status
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
              }`}
            >
              All Requests
            </Link>
            <Link
              href="/admin/requests?status=ACTIVE"
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                searchParams.status === 'ACTIVE'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
              }`}
            >
              Active ({requests.filter((r) => r.status === 'ACTIVE').length})
            </Link>
            <Link
              href="/admin/requests?status=PAUSED"
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                searchParams.status === 'PAUSED'
                  ? 'bg-amber-600 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
              }`}
            >
              Paused
            </Link>
            <Link
              href="/admin/requests?status=COMPLETED"
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                searchParams.status === 'COMPLETED'
                  ? 'bg-blue-600 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
              }`}
            >
              Completed
            </Link>
          </div>
          <div className="text-xs font-medium text-neutral-500">
            Showing {requests.length} criteria profiles
          </div>
        </div>

        {/* Requests Table / Grid */}
        {requests.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-12 text-center">
            <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              No buyer requests found
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
              Create a buyer search profile to automatically match potential buyers with active property listings.
            </p>
            <div className="mt-6">
              <Link
                href="/admin/requests/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-xl font-medium text-sm hover:opacity-95 transition"
              >
                <Plus className="w-4 h-4" />
                Add Buyer Request
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {requests.map((req) => {
              const buyer = req.buyer as unknown as {
                id: string
                first_name: string
                last_name: string
                phone: string | null
                email: string | null
              } | null

              return (
                <Link
                  key={req.id}
                  href={`/admin/requests/${req.id}`}
                  className="group bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 shadow-sm hover:border-neutral-400 dark:hover:border-neutral-700 transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                            req.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : req.status === 'PAUSED'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                              : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400'
                          }`}
                        >
                          {req.status}
                        </span>
                        {req.public_visibility && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
                            Portal Visible
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-neutral-400">
                        {new Date(req.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-semibold text-base text-neutral-900 dark:text-neutral-100 group-hover:text-primary transition line-clamp-1">
                        {req.title}
                      </h3>
                      {buyer && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 font-medium">
                          Buyer: {buyer.first_name} {buyer.last_name}
                        </p>
                      )}
                    </div>

                    {/* Criteria Chips */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div className="bg-neutral-50 dark:bg-neutral-800/60 p-2 rounded-lg border border-neutral-100 dark:border-neutral-800">
                        <span className="text-neutral-400 block text-[10px] uppercase font-bold tracking-wider">
                          Budget Range
                        </span>
                        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {req.budget_min
                            ? `${req.budget_min.toLocaleString()} - ${req.budget_max ? req.budget_max.toLocaleString() : 'Open'} ${req.currency}`
                            : req.budget_max
                            ? `Up to ${req.budget_max.toLocaleString()} ${req.currency}`
                            : 'Flexible'}
                        </span>
                      </div>
                      <div className="bg-neutral-50 dark:bg-neutral-800/60 p-2 rounded-lg border border-neutral-100 dark:border-neutral-800">
                        <span className="text-neutral-400 block text-[10px] uppercase font-bold tracking-wider">
                          Type & Beds
                        </span>
                        <span className="font-semibold text-neutral-900 dark:text-neutral-100 capitalize">
                          {req.property_type || 'Any type'}
                          {req.bedrooms ? ` • ${req.bedrooms}+ beds` : ''}
                        </span>
                      </div>
                    </div>

                    {/* Preferred Locations */}
                    {req.preferred_locations && req.preferred_locations.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {req.preferred_locations.map((loc: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rounded text-[11px]"
                          >
                            📍 {loc}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-primary">
                    <span>View Matching Inventory</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </PrivateLayout>
  )
}
