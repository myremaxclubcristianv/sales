import { notFound } from 'next/navigation'
import { getCreditCaseById } from '@/lib/db/credit'
import { getClientFollowUps } from '@/lib/db/follow-ups'
import { PrivateLayout } from '@/components/layout/private/PrivateLayout'
import Link from 'next/link'
import { ArrowLeft, Phone, Mail, FileText } from 'lucide-react'
import { CreditStageStepper } from './CreditStageStepper'

interface PageProps {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export default async function CreditCaseDetailPage(props: PageProps) {
  const { id } = await props.params

  let creditCase
  try {
    creditCase = await getCreditCaseById(id)
  } catch {
    notFound()
  }

  if (!creditCase) {
    notFound()
  }

  const client = creditCase.client as unknown as {
    id: string
    first_name: string
    last_name: string
    phone: string | null
    email: string | null
    preferred_communication: string
  } | null

  // Fetch linked follow-ups
  const followUps = client ? await getClientFollowUps(client.id) : []
  const caseFollowUps = followUps.filter((f) => f.credit_id === creditCase.id)

  const docChecklist = [
    { title: 'Identity Card / Passport (Borrower & Co-debtor)', required: true },
    { title: 'Tax Authority Income Verification (ANAF Consent)', required: true },
    { title: '3-Month Bank Account Salary Statements', required: true },
    { title: 'Employer Certificate & Permanent Contract Proof', required: true },
    { title: 'Pre-agreement / Reservation Contract of Property', required: false },
    { title: 'Property Cadastral & Land Registry Extract (CF)', required: false },
    { title: 'Authorized Bank Real Estate Appraisal Report', required: false },
    { title: 'Energy Performance Certificate (Class A/B)', required: false },
  ]

  return (
    <PrivateLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/credit"
              className="p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                  {creditCase.purpose}
                </h1>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Ref #{creditCase.id.slice(0, 8)} • Bank Partner: {creditCase.institution || 'Selecting Partner'}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
              Loan Principal Amount
            </span>
            <span className="text-2xl font-bold text-emerald-600">
              {Number(creditCase.amount).toLocaleString()} {creditCase.currency}
            </span>
          </div>
        </div>

        {/* Interactive Pipeline Stage Stepper */}
        <CreditStageStepper caseId={creditCase.id} currentStatus={creditCase.status} />

        {/* 2-Column Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Financial Parameters & Document Checklist */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview Card */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-6 shadow-sm space-y-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                Financing Specifications
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-neutral-400 block font-medium">Requested Amount</span>
                  <span className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                    {Number(creditCase.amount).toLocaleString()} {creditCase.currency}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block font-medium">Financing Institution</span>
                  <span className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                    {creditCase.institution || 'Pending Choice'}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block font-medium">Current Stage</span>
                  <span className="font-bold text-primary text-sm uppercase">
                    {creditCase.status}
                  </span>
                </div>
              </div>

              {creditCase.notes && (
                <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                    Broker Analysis Notes
                  </span>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-xl">
                    {creditCase.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Document Checklist for Bank Dossier */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    Bank Credit Dossier Checklist
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Standard compliance &amp; creditworthiness documents
                  </p>
                </div>
                <span className="text-xs font-semibold text-neutral-400">
                  {docChecklist.filter((d) => d.required).length} Required Items
                </span>
              </div>

              <div className="space-y-2.5">
                {docChecklist.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-neutral-400 shrink-0" />
                      <span className="font-medium text-neutral-800 dark:text-neutral-200">
                        {item.title}
                      </span>
                    </div>
                    <div>
                      {item.required ? (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 px-2 py-0.5 rounded">
                          Mandatory
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-neutral-500 bg-neutral-200 dark:bg-neutral-700 px-2 py-0.5 rounded">
                          Property Specific
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Col: Borrower Profile & Follow-ups */}
          <div className="space-y-6">
            {/* Borrower Profile */}
            {client ? (
              <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Borrower Client
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
                No borrower client linked.
              </div>
            )}

            {/* Linked Case Follow-ups */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Case Tasks ({caseFollowUps.length})
                </h3>
                <Link href="/admin/follow-ups" className="text-xs text-primary hover:underline">
                  All Follow-ups →
                </Link>
              </div>

              {caseFollowUps.length === 0 ? (
                <p className="text-xs text-neutral-400 py-2 text-center">
                  No pending follow-ups linked to this case.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {caseFollowUps.map((f) => (
                    <div
                      key={f.id}
                      className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200/60 dark:border-neutral-800 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between font-semibold text-neutral-900 dark:text-neutral-100">
                        <span className="line-clamp-1">{f.reason}</span>
                        <span className="text-[10px] font-bold text-amber-600 uppercase">
                          {f.priority}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500">
                        Due: {new Date(f.due_date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PrivateLayout>
  )
}
