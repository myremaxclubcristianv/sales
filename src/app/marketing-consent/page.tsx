import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/config/site';
import { PublicLayout } from '@/components/layout/public/PublicLayout';

export const metadata: Metadata = {
  title: 'Consimțământ Marketing și Comunicare | Cristian Văduva Real Estate',
  description: 'Informații detaliate despre politica de comunicare comercială, buletine informative, alerte de proprietăți și dreptul de dezabonare oricând.',
  alternates: {
    canonical: 'https://sales.cristianvaduva.com/marketing-consent',
  },
  openGraph: {
    title: 'Consimțământ Marketing | Cristian Văduva',
    description: 'Informații privind consimțământul pentru comunicări comerciale și alerte imobiliare.',
    url: 'https://sales.cristianvaduva.com/marketing-consent',
  },
};

export default function MarketingConsentPage() {
  return (
    <PublicLayout>
      <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-brand-neutral-900 text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-brand-neutral-800">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-gold-400 mb-3">
            <span>Transparență & Control</span>
            <span>•</span>
            <span>GDPR Art. 7 & Legea 506/2004</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight mb-4">
            Consimțământ pentru Marketing și Comunicări
          </h1>
          <p className="text-base sm:text-lg text-brand-neutral-300 leading-relaxed font-sans max-w-3xl">
            Aflați cum funcționează alertele noastre imobiliare, rapoartele de piață și newsletterele, precum și cum puteți prelua controlul complet asupra preferințelor de comunicare în orice moment.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-brand max-w-none text-brand-neutral-700 space-y-10">

          {/* Intro callout */}
          <div className="p-6 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
            <h2 className="text-lg font-serif font-bold text-amber-950 mb-2">
              Principiul Zero Presiune și Necondiționare
            </h2>
            <p className="text-sm leading-relaxed mb-0">
              La Cristian Văduva Real Estate, <strong>consimțământul pentru marketing este întotdeauna 100% opțional</strong>. Solicitarea unei vizionări, transmiterea unei cereri de căutare imobiliară sau contactarea noastră prin formularul de contact <em>nu sunt niciodată condiționate</em> de acceptarea comunicărilor comerciale sau a newsletterelor.
            </p>
          </div>

          {/* 1. Diferențierea tipurilor de comunicări */}
          <section>
            <h2 className="text-2xl font-serif font-bold text-brand-neutral-900 mb-4 border-b border-brand-neutral-200 pb-2">
              1. Comunicări Tranzacționale vs. Comunicări de Marketing
            </h2>
            <p className="text-sm sm:text-base leading-relaxed mb-4">
              Pentru claritate maximă, delimităm strict două tipuri fundamentale de comunicări electronice:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
              <div className="bg-brand-neutral-50 p-6 rounded-xl border border-brand-neutral-200">
                <div className="flex items-center gap-2 text-brand-blue-700 font-semibold mb-2 text-sm uppercase">
                  <span>🔵 Tranzacționale / Operaționale</span>
                </div>
                <h3 className="text-base font-serif font-bold text-brand-neutral-900 mb-2">
                  Răspunsuri la Solicitări Directe
                </h3>
                <p className="text-xs sm:text-sm text-brand-neutral-600 leading-relaxed mb-3">
                  Mesaje STRICT legate de o cerere inițiată direct de dumneavoastră:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-brand-neutral-600">
                  <li>Confirmarea programării unei vizionări imobiliare;</li>
                  <li>Răspunsul la o întrebare despre o proprietate specifică;</li>
                  <li>Transmiterea documentației tehnice/cadastrale solicitate;</li>
                  <li>Comunicări legate de negocierea sau încheierea unei oferte.</li>
                </ul>
                <div className="mt-4 pt-3 border-t border-brand-neutral-200 text-xs font-mono text-brand-neutral-500">
                  Temei juridic: Art. 6(1)(b) GDPR (demersuri precontractuale).
                </div>
              </div>

              <div className="bg-brand-neutral-50 p-6 rounded-xl border border-brand-neutral-200">
                <div className="flex items-center gap-2 text-brand-gold-600 font-semibold mb-2 text-sm uppercase">
                  <span>🟡 Marketing Direct / Promoțional</span>
                </div>
                <h3 className="text-base font-serif font-bold text-brand-neutral-900 mb-2">
                  Alerte & Oportunități Periodice
                </h3>
                <p className="text-xs sm:text-sm text-brand-neutral-600 leading-relaxed mb-3">
                  Comunicări informative și promoționale recurente:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-brand-neutral-600">
                  <li>Newsletter lunar cu analize de piață și tendințe de preț;</li>
                  <li>Alerte automate pentru proprietăți nou adăugate în portofoliu;</li>
                  <li>Invitații la evenimente private de tip Open House;</li>
                  <li>Oportunități de investiții imobiliare Off-Market.</li>
                </ul>
                <div className="mt-4 pt-3 border-t border-brand-neutral-200 text-xs font-mono text-brand-neutral-500">
                  Temei juridic: Art. 6(1)(a) GDPR + Legea 506/2004 Art. 12 (Consimțământ expres).
                </div>
              </div>
            </div>
          </section>

          {/* 2. Standardele noastre de Consimțământ */}
          <section>
            <h2 className="text-2xl font-serif font-bold text-brand-neutral-900 mb-4 border-b border-brand-neutral-200 pb-2">
              2. Standardele Noastre de Conformitate
            </h2>
            <ul className="list-disc pl-6 space-y-3 text-sm sm:text-base text-brand-neutral-700">
              <li>
                <strong>Fără căsuțe prebifate (No Pre-ticked Boxes):</strong> În toate formularele platformei noastre, căsuța de consimțământ pentru marketing este nebifată în mod implicit.
              </li>
              <li>
                <strong>Fără consimțământ forțat sau legat (Unbundled Consent):</strong> Acceptarea Termenilor și a Politicii de Confidențialitate pentru prelucrarea cererii imobiliare nu implică abonarea automată la marketing.
              </li>
              <li>
                <strong>Mesaje relevante și cu frecvență redusă:</strong> Nu trimitem spam. Volumul comunicărilor de marketing este limitat (maxim 2-4 comunicări lunar).
              </li>
              <li>
                <strong>Fără vânzare de date:</strong> Datele dumneavoastră de contact nu sunt niciodată vândute sau închiriate către companii terțe de marketing sau brokeri de date.
              </li>
            </ul>
          </section>

          {/* 3. Canale de comunicare utilizate */}
          <section>
            <h2 className="text-2xl font-serif font-bold text-brand-neutral-900 mb-4 border-b border-brand-neutral-200 pb-2">
              3. Canale de Comunicare Utilizate
            </h2>
            <p className="text-sm sm:text-base leading-relaxed mb-3">
              În funcție de preferințele exprimate în mod explicit, comunicările promoționale pot fi transmise prin:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-brand-neutral-700">
              <li><strong>Poștă electronică (Email):</strong> newslettere, sinteze de piață, selecții de proprietăți;</li>
              <li><strong>WhatsApp / SMS:</strong> alerte instantanee privind proprietăți exclusive, doar dacă ați solicitat expres acest canal;</li>
              <li><strong>Apel telefonic direct:</strong> oportunități urgente de investiție, exclusiv dacă ați agreat în prealabil contactul direct.</li>
            </ul>
          </section>

          {/* 4. Cum vă puteți retrage consimțământul (Dezabonare) */}
          <section className="bg-brand-neutral-900 text-white p-6 sm:p-8 rounded-xl">
            <h2 className="text-xl font-serif font-bold text-white mb-3">
              4. Dreptul de Retragere a Consimțământului (Dezabonare Oricând)
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-brand-neutral-300 mb-4">
              Vă puteți răzgândi în orice moment, fără a fi necesar să justificați decizia și fără niciun cost suplimentar. Retragerea consimțământului nu afectează legalitatea prelucrării efectuate anterior retragerii.
            </p>
            <div className="space-y-3 text-sm text-brand-neutral-300">
              <div className="flex items-start gap-3">
                <span className="font-bold text-brand-gold-400">1.</span>
                <span><strong>Link direct de dezabonare:</strong> Fiecare email de marketing trimis conține în subsol un link de dezabonare cu 1 singur click (Unsubscribe).</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-bold text-brand-gold-400">2.</span>
                <span><strong>Email simplu:</strong> Trimiteți un mesaj cu subiectul „Dezabonare Marketing” la adresa <a href={`mailto:${SITE_CONFIG.contact.publicEmail.address}?subject=Dezabonare%20Marketing`} className="text-brand-gold-400 underline">{SITE_CONFIG.contact.publicEmail.address}</a>.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-bold text-brand-gold-400">3.</span>
                <span><strong>Mesaj WhatsApp:</strong> Răspundeți cu mesajul „STOP MARKETING” pe canalul oficial de WhatsApp <a href={SITE_CONFIG.contact.whatsapp.url} target="_blank" rel="noopener noreferrer" className="text-brand-gold-400 underline">{SITE_CONFIG.contact.whatsapp.display}</a>.</span>
              </div>
            </div>
            <p className="text-xs text-brand-neutral-400 mt-4 mb-0">
              Solicitările de dezabonare sunt procesate fără întârzieri nejustificate (maxim 48 de ore lucrătoare de la primire).
            </p>
          </section>

          {/* 5. Contact */}
          <section className="border-t border-brand-neutral-200 pt-8 mt-10">
            <h2 className="text-xl font-serif font-bold text-brand-neutral-900 mb-3">
              5. Asistență și Întrebări
            </h2>
            <p className="text-sm sm:text-base leading-relaxed mb-4">
              Doriți să vă actualizați criteriile de căutare imobiliară sau adresa de email pentru notificări? Contactați-ne:
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center px-5 py-2.5 rounded-lg bg-brand-gold-600 text-white text-sm font-semibold hover:bg-brand-gold-700 transition-colors shadow-sm"
              >
                Formular Contact
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
