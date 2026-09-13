import { notFound } from 'next/navigation'
import { getInsurancePolicyById } from '@/lib/db/insurance'
import { PrivateLayout } from '@/components/layout/private/PrivateLayout'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle, Phone, Mail } from 'lucide-react'
import { PolicyStatusUpdater } from './PolicyStatusUpdater'

interface PageProps {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export default async function InsurancePolicyDetailPage(props: PageProps) {
  const { id } = await props.params

  let policy
  try {
    policy = await getInsurancePolicyById(id)
  } catch {
    notFound()
  }

  if (!policy) {
    notFound()
  }

  const client = policy.client as unknown as {
    id: string
    first_name: string
    last_name: string
    phone: string | null
    email: string | null
    preferred_communication: string
  } | null

  const now = new Date()
  const expDate = new Date(policy.expiry_date)
  const isExpired = expDate < now || policy.status === 'EXPIRED'
  const daysRemaining = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const isExpiringSoon = daysRemaining >= 0 && daysRemaining <= 30 && policy.status === 'ACTIVE'

  return (
    <PrivateLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/insurance"
              className="p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                  {policy.product} Coverage Policy
                </h1>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                    isExpiringSoon
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                      : isExpired
                      ? 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                      : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                  }`}
                >
                  {isExpiringSoon ? 'RENEWAL DUE' : policy.status}
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Insurer: {policy.insurer} • Policy #{policy.policy_number || 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <PolicyStatusUpdater policyId={policy.id} currentStatus={policy.status} />
          </div>
        </div>

        {/* Warning Banner if expiring soon */}
        {isExpiringSoon && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
                  Policy Expires in {daysRemaining} Days ({policy.expiry_date})
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Follow-up task has been queued to request renewal quote from {policy.insurer}.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Policy Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-6 shadow-sm space-y-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                Policy Parameters &amp; Coverage
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-neutral-400 block font-medium">Product Category</span>
                  <span className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                    {policy.product}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block font-medium">Underwriting Company</span>
                  <span className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                    {policy.insurer}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block font-medium">Policy Number</span>
                  <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
                    {policy.policy_number || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block font-medium">Period Premium</span>
                  <span className="font-bold text-emerald-600 text-sm">
                    {policy.premium ? `${Number(policy.premium).toLocaleString()} ${policy.currency}` : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block font-medium">Start Date</span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {policy.start_date}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block font-medium">Expiration Date</span>
                  <span className={`font-semibold ${isExpiringSoon ? 'text-amber-600' : 'text-neutral-900 dark:text-neutral-100'}`}>
                    {policy.expiry_date}
                  </span>
                </div>
              </div>

              {policy.notes && (
                <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                    Coverage Terms &amp; Insured Asset Details
                  </span>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-xl">
                    {policy.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Client Card */}
          <div className="space-y-6">
            {client ? (
              <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Insured Client
                  </h3>
                  <Link
                    href={`/admin/clients/${client.id}`}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Client 360 →
                  </Link>
                </div>

                <div>
                  <h4 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                    {client.first_name} {client.last_name}
                  </h4>
                  <p className="text-xs text-neutral-500">
                    Preferred Contact: <span className="capitalize">{client.preferred_communication}</span>
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                  {client.phone && (
                    <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                      <Phone className="w-3.5 h-3.5 text-neutral-400" />
                      <a href={`tel:${client.phone}`} className="hover:underline font-mono">
                        {client.phone}
                      </a>
                    </div>
                  )}
                  {client.email && (
                    <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                      <Mail className="w-3.5 h-3.5 text-neutral-400" />
                      <a href={`mailto:${client.email}`} className="hover:underline font-mono">
                        {client.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 text-xs text-neutral-500">
                No client linked.
              </div>
            )}
          </div>
        </div>
      </div>
    </PrivateLayout>
  )
}
