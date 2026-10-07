import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PrivateLayout } from '@/components/layout/private/PrivateLayout'
import { getChestertonsRequestById } from '@/lib/db/chestertons-requests'
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Building2,
  Home,
  CheckCircle2,
  XCircle,
  MapPin,
  DollarSign,
  Calendar,
  Layers,
  ShieldCheck,
  Tag,
  Code,
  MessageSquare,
} from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata(props: PageProps) {
  const { id } = await props.params
  const request = await getChestertonsRequestById(id)
  return {
    title: request
      ? `${request.cumparator} (${request.import_source_id}) | Cereri Chestertons`
      : 'Cerere Chestertons',
  }
}

export default async function ChestertonsRequestDetailPage(props: PageProps) {
  const { id } = await props.params
  const request = await getChestertonsRequestById(id)

  if (!request) {
    notFound()
  }

  const isActive = request.parsed_status === 'Activa'
  const isRetracted = request.parsed_status === 'Retrasa'
  const isApartment = request.tip_lead === 'Apartament'

  const formatCurrency = (val: string | null) => {
    if (!val) return '—'
    const num = Number(val.replace(/,/g, ''))
    if (isNaN(num)) return val
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(num)
  }

  const renderField = (label: string, value: string | null | undefined, hint?: string) => (
    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200/60 dark:border-slate-700/60">
      <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white break-words">
        {value && value.trim() ? value : <span className="text-slate-400 font-normal italic">—</span>}
      </div>
      {hint && <div className="text-[10px] text-slate-400 mt-0.5">{hint}</div>}
    </div>
  )

  return (
    <PrivateLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-16">
        {/* Back Navigation & Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Link
            href="/admin/requests/chestertons"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Înapoi la toate Cererile Chestertons</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              Cereri Chestertons
            </span>
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                isActive
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : isRetracted
                  ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
              }`}
            >
              {isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
              {request.status_cerere || 'Blank'}
            </span>
          </div>
        </div>

        {/* Hero Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">
                  ID: {request.import_source_id}
                </span>
                {request.id_intern && (
                  <span className="font-mono text-slate-400">
                    • Id Intern: {request.id_intern}
                  </span>
                )}
                <span>• Rând {request.source_row_index} din {request.source_file.includes('1138618') ? 'Fișier 1 (Apartamente)' : 'Fișier 2 (Case)'}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <User className="w-7 h-7 text-blue-600 flex-shrink-0" />
                <span>{request.cumparator}</span>
              </h1>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${
                    isApartment
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                  }`}
                >
                  {isApartment ? <Building2 className="w-3.5 h-3.5" /> : <Home className="w-3.5 h-3.5" />}
                  {request.tip_lead} ({request.tip_cerere || 'Cumparare'})
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  Sursa: {request.sursa || 'Nespecificat'}
                </span>

                {request.agent && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    Agent: {request.agent}
                  </span>
                )}
              </div>
            </div>

            {/* Quick Contact Actions */}
            <div className="flex flex-wrap md:flex-col items-stretch gap-2 min-w-[200px]">
              {request.telefon ? (
                <a
                  href={`tel:${request.telefon}`}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition"
                >
                  <Phone className="w-4 h-4" />
                  <span>Apelează ({request.telefon})</span>
                </a>
              ) : (
                <div className="px-4 py-2 bg-slate-100 text-slate-400 rounded-xl text-xs text-center">
                  Fără telefon
                </div>
              )}

              {request.email ? (
                <a
                  href={`mailto:${request.email}`}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-medium transition"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email: {request.email}</span>
                </a>
              ) : (
                <div className="px-4 py-1.5 bg-slate-50 text-slate-400 rounded-xl text-xs text-center">
                  Fără email
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Observations Card (Complete & Un-truncated) */}
        {request.observatii && (
          <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
              <MessageSquare className="w-4 h-4 text-amber-600" />
              <span>Observații Originale Complete (Col 16)</span>
            </div>
            <div className="text-sm text-slate-900 dark:text-slate-100 whitespace-pre-wrap font-sans leading-relaxed pl-6 border-l-2 border-amber-400">
              {request.observatii}
            </div>
          </div>
        )}

        {/* Structured 38 Columns Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section 1: Identity & Request Specifics */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <User className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                1. Identitate & Criterii Cerere
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {renderField('1. ID (Cheie Primară)', request.id)}
              {renderField('37. Idintern', request.id_intern)}
              {renderField('6. Cumpărător', request.cumparator)}
              {renderField('7. Email', request.email)}
              {renderField('8. Telefon', request.telefon)}
              {renderField('9. Tip Lead', request.tip_lead)}
              {renderField('10. TipCerere', request.tip_cerere)}
              {renderField('38. StatusCerere', request.status_cerere)}
              <div className="sm:col-span-2">
                {renderField('5. Titlu Cerere', request.titlu)}
              </div>
            </div>
          </div>

          {/* Section 2: Location & Zoning */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <MapPin className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                2. Locație & Zonare
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {renderField('11. Județ', request.judet)}
              {renderField('12. Oraș', request.oras)}
              {renderField('13. Cartier', request.cartier)}
              {renderField('14. Zonă', request.zona)}
              {renderField('17. Tipteren', request.tip_teren)}
              {renderField('18. Destinație', request.destinatie)}
            </div>
          </div>

          {/* Section 3: Financial Requirements */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <DollarSign className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                3. Date Financiare & Bugete
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {renderField('20. Buget1 (Min)', request.buget1, request.buget1 ? formatCurrency(request.buget1) : undefined)}
              {renderField('21. Buget2 (Max)', request.buget2, request.buget2 ? formatCurrency(request.buget2) : undefined)}
              {renderField('22. TVA', request.tva)}
              {renderField('34. Bugetcredit', request.buget_credit)}
              {renderField('35. Pierdut', request.pierdut)}
            </div>
          </div>

          {/* Section 4: Property Technical Requirements */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Layers className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                4. Specificații Tehnice & Suprafețe
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 sm:grid-cols-3 gap-3">
              {renderField('33. Nr Camere', request.nr_camere)}
              {renderField('24. Suprafață Utilă', request.suprafata_utila ? `${request.suprafata_utila} mp` : null)}
              {renderField('23. Suprafață Construită', request.suprafata_construita ? `${request.suprafata_construita} mp` : null)}
              {renderField('19. Suprafață Teren', request.suprafata_teren ? `${request.suprafata_teren} mp` : null)}
              {renderField('32. An Construcție', request.an_constructie)}
              {renderField('31. Locuri Parcare', request.locuri_de_parcare)}
              {renderField('25. Expunere', request.expunere)}
              {renderField('26. Vitrină', request.vitrina)}
              {renderField('27. Înălțime', request.inaltime)}
              {renderField('28. Suprafață Depozit', request.suprafata_depozit)}
              {renderField('29. Suprafață Birouri', request.suprafata_birouri)}
              {renderField('30. Suprafață Producție', request.suprafata_productie)}
            </div>
          </div>

          {/* Section 5: Metadata & Audit Trace */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-2">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Calendar className="w-5 h-5 text-slate-600" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                5. Metadate & Proveniență Import
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {renderField('15. Sursa Originală', request.sursa)}
              {renderField('4. Agent Asignat', request.agent)}
              {renderField('2. Data Adăugare', request.data_adaugare)}
              {renderField('3. Date Modificare', request.date_modificare)}
              {renderField('36. Datalimita', request.data_limita)}
              {renderField('Grup Import', request.source_group_label)}
              {renderField('Cod Proveniență', request.source_group)}
              {renderField('Fișier CSV Sursă', request.source_file)}
            </div>
          </div>
        </div>

        {/* Raw JSON Source Data Inspector */}
        <details className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm group">
          <summary className="cursor-pointer text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between select-none">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-slate-500" />
              <span>Vizualizare Payload Brut (Toate cele 38 de coloane originale)</span>
            </div>
            <span className="text-xs text-blue-600 group-open:rotate-180 transition transform">▼</span>
          </summary>
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <pre className="bg-slate-950 text-emerald-400 p-4 rounded-xl text-xs overflow-x-auto font-mono max-h-96">
              {JSON.stringify(request.source_data, null, 2)}
            </pre>
          </div>
        </details>
      </div>
    </PrivateLayout>
  )
}
