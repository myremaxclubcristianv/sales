import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/config/site';
import { PublicLayout } from '@/components/layout/public/PublicLayout';

export const metadata: Metadata = {
  title: 'Date de Identificare Legală / Imprint | Cristian Văduva Real Estate',
  description: 'Informații de identificare a operatorului, date de contact oficiale, hosting și responsabilitate legală pentru platforma sales.cristianvaduva.com.',
  alternates: {
    canonical: 'https://sales.cristianvaduva.com/imprint',
  },
  openGraph: {
    title: 'Imprint / Date de Identificare | Cristian Văduva',
    description: 'Informații legale și de identificare oficială a platformei.',
    url: 'https://sales.cristianvaduva.com/imprint',
  },
};

export default function ImprintPage() {
  return (
    <PublicLayout>
      <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-brand-neutral-900 text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-brand-neutral-800">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-gold-400 mb-3">
            <span>Transparență Legală</span>
            <span>•</span>
            <span>Identificare Operator</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight mb-4">
            Date de Identificare Legală / Imprint
          </h1>
          <p className="text-base sm:text-lg text-brand-neutral-300 leading-relaxed font-sans max-w-3xl">
            Informații oficiale privind proprietarul platformei, datele de contact directe și infrastructura tehnică a serviciilor.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-brand max-w-none text-brand-neutral-700 space-y-10">

          {/* 1. Operator Info */}
          <section className="bg-brand-neutral-50 p-6 sm:p-8 rounded-xl border border-brand-neutral-200">
            <h2 className="text-xl font-serif font-bold text-brand-neutral-900 mb-4">
              1. Informații despre Operatorul Platformei
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-white p-4 rounded-lg border border-brand-neutral-200">
                <span className="text-xs text-brand-neutral-500 uppercase block font-semibold mb-1">Nume & Prenume</span>
                <span className="font-semibold text-brand-neutral-900 text-base">{SITE_CONFIG.name}</span>
                <p className="text-xs text-brand-neutral-600 mt-1">Consultanță Imobiliară Premium & Reprezentare Exclusivă</p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-brand-neutral-200">
                <span className="text-xs text-brand-neutral-500 uppercase block font-semibold mb-1">Locație & Jurisdicție</span>
                <span className="font-semibold text-brand-neutral-900">București, România</span>
                <p className="text-xs text-brand-neutral-600 mt-1">Uniunea Europeană</p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-brand-neutral-200">
                <span className="text-xs text-brand-neutral-500 uppercase block font-semibold mb-1">Website Principal</span>
                <a href={SITE_CONFIG.websites[0]?.url || 'https://cristianvaduva.com'} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-gold-600 hover:underline">
                  {SITE_CONFIG.websites[0]?.url.replace(/^https?:\/\//, '') || 'cristianvaduva.com'}
                </a>
              </div>

              <div className="bg-white p-4 rounded-lg border border-brand-neutral-200">
                <span className="text-xs text-brand-neutral-500 uppercase block font-semibold mb-1">Platformă Vânzări / CRM</span>
                <span className="font-semibold text-brand-neutral-900">sales.cristianvaduva.com</span>
              </div>
            </div>
          </section>

          {/* 2. Canale Oficiale de Contact */}
          <section>
            <h2 className="text-2xl font-serif font-bold text-brand-neutral-900 mb-4 border-b border-brand-neutral-200 pb-2">
              2. Canale Oficiale de Contact
            </h2>
            <div className="space-y-3 text-sm sm:text-base">
              <p>
                <strong>Email Contact General:</strong>{' '}
                <a href={`mailto:${SITE_CONFIG.contact.publicEmail.address}`} className="text-brand-gold-600 font-semibold hover:underline">
                  {SITE_CONFIG.contact.publicEmail.address}
                </a>
              </p>
              <p>
                <strong>Email Direct / Confidențial:</strong>{' '}
                <a href={`mailto:${SITE_CONFIG.contact.primaryEmail.address}`} className="text-brand-gold-600 font-semibold hover:underline">
                  {SITE_CONFIG.contact.primaryEmail.address}
                </a>
              </p>
              <p>
                <strong>Telefon România:</strong>{' '}
                <a href={SITE_CONFIG.contact.primaryPhone.tel} className="text-brand-neutral-900 font-semibold hover:underline">
                  {SITE_CONFIG.contact.primaryPhone.display}
                </a>
              </p>
              <p>
                <strong>WhatsApp / Telefon Internațional:</strong>{' '}
                <a href={SITE_CONFIG.contact.whatsapp.url} target="_blank" rel="noopener noreferrer" className="text-brand-neutral-900 font-semibold hover:underline">
                  {SITE_CONFIG.contact.whatsapp.display}
                </a>
              </p>
            </div>
          </section>

          {/* 3. Furnizori Tehnici și Infrastructură */}
          <section>
            <h2 className="text-2xl font-serif font-bold text-brand-neutral-900 mb-4 border-b border-brand-neutral-200 pb-2">
              3. Infrastructură Tehnică & Găzduire Web
            </h2>
            <div className="space-y-4 text-sm sm:text-base text-brand-neutral-700">
              <div className="p-4 bg-brand-neutral-50 rounded-lg border border-brand-neutral-200">
                <strong className="text-brand-neutral-900 block mb-1">Găzduire Frontend & Livrare Conținut (CDN / Edge):</strong>
                <span>Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, SUA (Certificare EU-US Data Privacy Framework & DPA conform GDPR).</span>
              </div>
              <div className="p-4 bg-brand-neutral-50 rounded-lg border border-brand-neutral-200">
                <strong className="text-brand-neutral-900 block mb-1">Bază de Date & Autentificare Securizată:</strong>
                <span>Supabase Inc., găzduit în centre de date securizate din Uniunea Europeană (Frankfurt, Germania), cu criptare AES-256 în repaus și TLS 1.3 în tranzit.</span>
              </div>
            </div>
          </section>

          {/* 4. Notă privind Dreptul de Autor și Răspunderea Conținutului */}
          <section>
            <h2 className="text-2xl font-serif font-bold text-brand-neutral-900 mb-4 border-b border-brand-neutral-200 pb-2">
              4. Responsabilitate Conținut & Drepturi de Autor
            </h2>
            <p className="text-sm sm:text-base leading-relaxed mb-3">
              Conținutul original (texte descriptive, structură analitică, selecție portofoliu) publicat pe acest site aparține lui Cristian Văduva. Orice preluare neautorizată fără citarea sursei și acordul scris este strict interzisă conform Legii nr. 8/1996 privind dreptul de autor.
            </p>
            <p className="text-sm sm:text-base leading-relaxed">
              În cazul semnalării unor erori materiale sau neconcordanțe de informații în cadrul proprietăților listate, vă rugăm să ne notificați prin email pentru remediere imediată.
            </p>
          </section>

          {/* 5. Soluționarea Litigiilor */}
          <section>
            <h2 className="text-2xl font-serif font-bold text-brand-neutral-900 mb-4 border-b border-brand-neutral-200 pb-2">
              5. Soluționarea Alternativă a Disputelor (SOL / SAL)
            </h2>
            <p className="text-sm sm:text-base leading-relaxed mb-3">
              Comisia Europeană pune la dispoziție o platformă online pentru soluționarea online a litigiilor (SOL), disponibilă la adresa:{' '}
              <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-brand-gold-600 font-semibold hover:underline">
                https://ec.europa.eu/consumers/odr
              </a>.
            </p>
            <p className="text-sm sm:text-base leading-relaxed">
              În România, autoritatea de supraveghere a pieței și protecție a consumatorilor este ANPC (Autoritatea Națională pentru Protecția Consumatorilor) –{' '}
              <a href="https://anpc.ro" target="_blank" rel="noopener noreferrer" className="text-brand-gold-600 font-semibold hover:underline">
                https://anpc.ro
              </a>.
            </p>
          </section>

          {/* Navigare */}
          <section className="border-t border-brand-neutral-200 pt-8 mt-10">
            <div className="flex flex-wrap gap-4">
              <Link
                href="/terms"
                className="inline-flex items-center px-5 py-2.5 rounded-lg bg-brand-neutral-900 text-white text-sm font-semibold hover:bg-black transition-colors"
              >
                Termeni și Condiții
              </Link>
              <Link
                href="/privacy-policy"
                className="inline-flex items-center px-5 py-2.5 rounded-lg bg-brand-neutral-100 text-brand-neutral-900 text-sm font-semibold hover:bg-brand-neutral-200 transition-colors border border-brand-neutral-300"
              >
                Politica de Confidențialitate
              </Link>
            </div>
          </section>

        </div>
      </div>
    </div>
  </PublicLayout>
);
}
