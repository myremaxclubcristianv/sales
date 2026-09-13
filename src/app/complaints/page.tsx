import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/config/site';
import { PublicLayout } from '@/components/layout/public/PublicLayout';

export const metadata: Metadata = {
  title: 'Procedură Reclamații & Sesizări GDPR | Cristian Văduva Real Estate',
  description: 'Ghidul oficial privind soluționarea sesizărilor, reclamațiilor de date cu caracter personal și escaladarea către autoritatea de supraveghere ANSPDCP.',
  alternates: {
    canonical: 'https://sales.cristianvaduva.com/complaints',
  },
  openGraph: {
    title: 'Procedură Reclamații GDPR | Cristian Văduva',
    description: 'Soluționarea petițiilor privind protecția datelor și drepturile persoanelor vizate.',
    url: 'https://sales.cristianvaduva.com/complaints',
  },
};

export default function ComplaintsPage() {
  return (
    <PublicLayout>
      <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-brand-neutral-900 text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-brand-neutral-800">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-gold-400 mb-3">
            <span>Rezolvare Sesizări</span>
            <span>•</span>
            <span>GDPR Art. 77 & Protecția Consumatorului</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight mb-4">
            Procedură de Reclamații și Sesizări
          </h1>
          <p className="text-base sm:text-lg text-brand-neutral-300 leading-relaxed font-sans max-w-3xl">
            Aflați cum puteți adresa o sesizare privind prelucrarea datelor dumneavoastră personale sau calitatea serviciilor imobiliare și care sunt pașii de escaladare către autoritățile competente.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-brand max-w-none text-brand-neutral-700 space-y-10">

          {/* Intro Box */}
          <div className="p-6 bg-brand-neutral-50 rounded-xl border border-brand-neutral-200">
            <h2 className="text-lg font-serif font-bold text-brand-neutral-900 mb-2">
              Angajamentul Nostru pentru Rezolvare Rapidă și Amiabilă
            </h2>
            <p className="text-sm leading-relaxed text-brand-neutral-700 mb-0">
              Tratăm cu maximă seriozitate și prioritate orice nemulțumire, întrebare sau sesizare legată de confidențialitatea datelor dumneavoastră. Încurajăm dialogul direct și deschis pentru a identifica soluții prompte și satisfăcătoare în cel mai scurt timp.
            </p>
          </div>

          {/* Pasul 1: Sesizare Directă către Operator */}
          <section>
            <h2 className="text-2xl font-serif font-bold text-brand-neutral-900 mb-4 border-b border-brand-neutral-200 pb-2">
              Etapa 1: Sesizarea Directă a Operatorului
            </h2>
            <p className="text-sm sm:text-base leading-relaxed mb-4">
              Înainte de a iniția demersuri administrative sau judiciare, vă recomandăm să ne transmiteți direct detaliile situației întâmpinate. Multe neconcordanțe pot fi remediate imediat:
            </p>

            <div className="bg-white p-6 rounded-xl border border-brand-neutral-300 shadow-sm space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs font-semibold uppercase text-brand-neutral-500 block mb-1">Email Sesizări Confidențialitate</span>
                  <a href={`mailto:${SITE_CONFIG.contact.publicEmail.address}?subject=Sesizare%20GDPR`} className="font-semibold text-brand-gold-600 hover:underline">
                    {SITE_CONFIG.contact.publicEmail.address}
                  </a>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase text-brand-neutral-500 block mb-1">Email Direct</span>
                  <a href={`mailto:${SITE_CONFIG.contact.primaryEmail.address}?subject=Sesizare%20GDPR`} className="font-semibold text-brand-gold-600 hover:underline">
                    {SITE_CONFIG.contact.primaryEmail.address}
                  </a>
                </div>
              </div>

              <div className="text-xs sm:text-sm text-brand-neutral-600 border-t border-brand-neutral-200 pt-3">
                <p className="mb-2 font-medium text-brand-neutral-900">Pentru o soluționare promptă, vă rugăm să includeți:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Numele și prenumele dumneavoastră;</li>
                  <li>Adresa de email și numărul de telefon utilizate în interacțiunea cu platforma;</li>
                  <li>Descrierea clară a aspectului reclamat (ex: eroare de date, solicitare nesoluționată de ștergere, primire de comunicări nedorite);</li>
                  <li>Măsura specifică pe care o solicitați.</li>
                </ul>
              </div>
            </div>

            <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-900 text-xs sm:text-sm">
              <strong>Termen de răspuns intern:</strong> Confirmăm primirea sesizării în maxim <strong>24-48 de ore</strong> și oferim un răspuns complet sau măsuri de remediere în cel mult <strong>30 de zile calendaristice</strong> (termen conform art. 12 alin. (3) GDPR).
            </div>
          </section>

          {/* Pasul 2: Dreptul de a depune plângere la ANSPDCP */}
          <section>
            <h2 className="text-2xl font-serif font-bold text-brand-neutral-900 mb-4 border-b border-brand-neutral-200 pb-2">
              Etapa 2: Plângere la Autoritatea Națională de Supraveghere (ANSPDCP)
            </h2>
            <p className="text-sm sm:text-base leading-relaxed mb-4">
              În temeiul <strong>Articolului 77 din Regulamentul (UE) 2016/679 (GDPR)</strong>, aveți dreptul de a depune o plângere la autoritatea națională de supraveghere dacă apreciați că prelucrarea datelor dumneavoastră cu caracter personal încalcă dispozițiile legale în vigoare.
            </p>

            <div className="bg-brand-neutral-50 p-6 rounded-xl border border-brand-neutral-200 text-sm space-y-3">
              <h3 className="text-base font-serif font-bold text-brand-neutral-900">
                Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-brand-neutral-700">
                <div><strong>Adresă fizică:</strong> B-dul G-ral. Gheorghe Magheru nr. 28-30, Sector 1, cod poștal 010336, București, România</div>
                <div><strong>Website oficial:</strong> <a href="https://www.dataprotection.ro" target="_blank" rel="noopener noreferrer" className="text-brand-gold-600 hover:underline">www.dataprotection.ro</a></div>
                <div><strong>Email oficial:</strong> <a href="mailto:anspdcp@dataprotection.ro" className="text-brand-gold-600 hover:underline">anspdcp@dataprotection.ro</a></div>
                <div><strong>Telefon centrală:</strong> +40 318 059 211 / +40 318 059 212</div>
              </div>
              <p className="text-xs text-brand-neutral-500 pt-2 border-t border-brand-neutral-200 mb-0">
                Formularul electronic de plângere poate fi completat direct pe portalul oficial al autorității la secțiunea dedicată petițiilor online.
              </p>
            </div>
          </section>

          {/* Pasul 3: Căi de Atac Judiciare */}
          <section>
            <h2 className="text-2xl font-serif font-bold text-brand-neutral-900 mb-4 border-b border-brand-neutral-200 pb-2">
              Etapa 3: Dreptul la o Cale de Atac Judiciară Eficientă
            </h2>
            <p className="text-sm sm:text-base leading-relaxed mb-3">
              Fără a aduce atingere vreunei căi de atac administrative sau nejudiciare disponibile (inclusiv dreptul de a depune plângere la ANSPDCP), beneficiați de dreptul de a exercita o cale de atac judiciară eficientă în fața instanțelor judecătorești competente (conform <strong>Art. 79 GDPR</strong>) în situația în care considerați că drepturile v-au fost încălcate ca urmare a prelucrării neconforme a datelor.
            </p>
          </section>

          {/* Sesizări privind protecția consumatorilor (ANPC) */}
          <section>
            <h2 className="text-2xl font-serif font-bold text-brand-neutral-900 mb-4 border-b border-brand-neutral-200 pb-2">
              Sesizări privind Protecția Consumatorilor (ANPC)
            </h2>
            <p className="text-sm sm:text-base leading-relaxed mb-3">
              Pentru aspecte de natură comercială sau privind drepturile consumatorilor în relația cu serviciile prestate, vă puteți adresa:
            </p>
            <div className="bg-brand-neutral-50 p-4 rounded-lg border border-brand-neutral-200 text-sm space-y-1">
              <div><strong>Autoritatea Națională pentru Protecția Consumatorilor (ANPC):</strong></div>
              <div>Website: <a href="https://anpc.ro" target="_blank" rel="noopener noreferrer" className="text-brand-gold-600 hover:underline">https://anpc.ro</a></div>
              <div>Telefonul Consumatorului: 021 9551</div>
            </div>
          </section>

          {/* Link-uri Utile */}
          <section className="border-t border-brand-neutral-200 pt-8 mt-10">
            <h2 className="text-xl font-serif font-bold text-brand-neutral-900 mb-4">
              Documente și Ghiduri Conexe
            </h2>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/gdpr"
                className="inline-flex items-center px-5 py-2.5 rounded-lg bg-brand-gold-600 text-white text-sm font-semibold hover:bg-brand-gold-700 transition-colors shadow-sm"
              >
                Ghidul Drepturilor GDPR
              </Link>
              <Link
                href="/privacy-policy"
                className="inline-flex items-center px-5 py-2.5 rounded-lg bg-brand-neutral-100 text-brand-neutral-900 text-sm font-semibold hover:bg-brand-neutral-200 transition-colors border border-brand-neutral-300"
              >
                Politica de Confidențialitate
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center px-5 py-2.5 rounded-lg bg-brand-neutral-900 text-white text-sm font-semibold hover:bg-black transition-colors"
              >
                Formular de Contact
              </Link>
            </div>
          </section>

        </div>
      </div>
    </div>
  </PublicLayout>
);
}
