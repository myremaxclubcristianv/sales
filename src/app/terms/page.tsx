import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/config/site';
import { PublicLayout } from '@/components/layout/public/PublicLayout';

export const metadata: Metadata = {
  title: 'Termeni și Condiții de Utilizare | Cristian Văduva Real Estate',
  description: 'Termenii și condițiile oficiale de utilizare a platformei și serviciilor imobiliare furnizate de Cristian Văduva.',
  alternates: {
    canonical: 'https://sales.cristianvaduva.com/terms',
  },
  openGraph: {
    title: 'Termeni și Condiții | Cristian Văduva',
    description: 'Condițiile generale privind accesul și utilizarea platformei de consultanță imobiliară.',
    url: 'https://sales.cristianvaduva.com/terms',
  },
};

export default function TermsPage() {
  return (
    <PublicLayout>
      <div className="bg-white min-h-screen">
      {/* Header Banner */}
      <div className="bg-brand-neutral-900 text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-brand-neutral-800">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-gold-400 mb-3">
            <span>Consultanță Imobiliară Premium</span>
            <span>•</span>
            <span>Versiunea 1.0 (2026)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight mb-4">
            Termeni și Condiții de Utilizare
          </h1>
          <p className="text-base sm:text-lg text-brand-neutral-300 leading-relaxed font-sans max-w-3xl">
            Vă rugăm să citiți cu atenție acești termeni înainte de a utiliza website-ul{' '}
            <span className="text-white font-medium">sales.cristianvaduva.com</span> sau de a solicita servicii prin intermediul acestuia.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-brand max-w-none text-brand-neutral-700 space-y-10">

          {/* 1. Preambul & Identitate */}
          <section className="bg-brand-neutral-50 rounded-xl p-6 sm:p-8 border border-brand-neutral-200">
            <h2 className="text-xl font-serif font-bold text-brand-neutral-900 mb-3">
              1. Dispoziții Generale și Identitatea Operatorului
            </h2>
            <p className="text-sm sm:text-base leading-relaxed mb-4">
              Prezentul document stabilește termenii și condițiile în care puteți accesa și utiliza platforma web disponibilă la adresa{' '}
              <strong className="text-brand-neutral-900">sales.cristianvaduva.com</strong>.
            </p>
            <p className="text-sm sm:text-base leading-relaxed mb-4">
              Platforma este administrată și operată de <strong className="text-brand-neutral-900">{SITE_CONFIG.name}</strong>, consultant imobiliar independent în segmentul proprietăților premium și de lux din București și zonele rezidențiale adiacente.
            </p>
            <div className="text-sm bg-white p-4 rounded-lg border border-brand-neutral-200 space-y-1">
              <div><strong>Operator:</strong> Cristian Văduva</div>
              <div><strong>Locație:</strong> București, România</div>
              <div><strong>Email contact:</strong> <a href={`mailto:${SITE_CONFIG.contact.publicEmail.address}`} className="text-brand-gold-600 hover:underline">{SITE_CONFIG.contact.publicEmail.address}</a></div>
              <div><strong>Telefon:</strong> <a href={SITE_CONFIG.contact.primaryPhone.tel} className="text-brand-gold-600 hover:underline">{SITE_CONFIG.contact.primaryPhone.display}</a></div>
            </div>
            <p className="text-sm text-brand-neutral-600 mt-4">
              Navigarea pe site, completarea formularelor de contact/cerere și interacțiunea cu materialele prezentate implică acceptarea expresă a prezentelor clauze.
            </p>
          </section>

          {/* 2. Scopul Platformei */}
          <section>
            <h2 className="text-2xl font-serif font-bold text-brand-neutral-900 mb-4 border-b border-brand-neutral-200 pb-2">
              2. Scopul Platformei și Natura Serviciilor
            </h2>
            <p className="text-sm sm:text-base leading-relaxed mb-3">
              Platforma are rolul de prezentare a portofoliului imobiliar selectat, a analizelor de piață și de facilitare a comunicării directe între clienți (proprietari, cumpărători, investitori) și Cristian Văduva.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-brand-neutral-700">
              <li><strong>Prezentarea proprietăților:</strong> Informațiile, fotografiile, schițele și detaliile tehnice ale proprietăților sunt oferite cu scop informativ general și nu constituie o ofertă contractuală fermă sau un angajament juridic unilateral.</li>
              <li><strong>Relația contractuală:</strong> Tranzacțiile imobiliare, acordurile de intermediere/reprezentare exclusivă și contractele de prestări servicii se încheie exclusiv prin documente contractuale dedicate, semnate distinct între părți.</li>
            </ul>
          </section>

          {/* 3. Drepturi de Proprietate Intelectuală */}
          <section>
            <h2 className="text-2xl font-serif font-bold text-brand-neutral-900 mb-4 border-b border-brand-neutral-200 pb-2">
              3. Proprietate Intelectuală
            </h2>
            <p className="text-sm sm:text-base leading-relaxed mb-3">
              Întregul conținut al platformei (texte, analize, fotografii de portofoliu, elemente grafice, logo-uri, structura bazei de date, software, layout) este protejat de legislația națională și internațională privind drepturile de autor și proprietatea intelectuală.
            </p>
            <p className="text-sm sm:text-base leading-relaxed">
              Este strict interzisă copierea, reproducerea, distribuirea, republicarea, vânzarea sau utilizarea conținutului în scopuri comerciale fără acordul scris prealabil al titularului.
            </p>
          </section>

          {/* 4. Utilizarea Permisă și Conduita Utilizatorului */}
          <section>
            <h2 className="text-2xl font-serif font-bold text-brand-neutral-900 mb-4 border-b border-brand-neutral-200 pb-2">
              4. Utilizarea Permisă și Obligațiile Utilizatorului
            </h2>
            <p className="text-sm sm:text-base leading-relaxed mb-3">
              La utilizarea platformei și a formularelor de contact/cerere, vă obligați:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-brand-neutral-700">
              <li>Să furnizați informații reale, exacte și depline cu privire la identitatea dumneavoastră și solicitările imobiliare transmise;</li>
              <li>Să nu introduceți date sau informații ale unor terțe persoane fără acordul legitim al acestora;</li>
              <li>Să nu utilizați roboți, scripturi automatizate de tip web scraping, tehnici de injectare de cod, exploit-uri de securitate sau alte mecanisme care perturbă funcționarea serverului;</li>
              <li>Să nu transmiteți mesaje calomnioase, frauduloase, abuzive, obscene sau materiale spam prin formularele puse la dispoziție.</li>
            </ul>
          </section>

          {/* 5. Acuratețea Informațiilor & Limitarea Răspunderii */}
          <section>
            <h2 className="text-2xl font-serif font-bold text-brand-neutral-900 mb-4 border-b border-brand-neutral-200 pb-2">
              5. Acuratețea Informațiilor și Limitarea Răspunderii
            </h2>
            <p className="text-sm sm:text-base leading-relaxed mb-3">
              Depunem toate eforturile rezonabile pentru a asigura corectitudinea și actualitatea detaliilor privind proprietățile prezentate. Cu toate acestea:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-brand-neutral-700 mb-4">
              <li>Prețurile, disponibilitatea, suprafețele și caracteristicile tehnice ale proprietăților pot suferi modificări direct de la proprietarii vânzători/dezvoltatori fără o notificare prealabilă.</li>
              <li>Informațiile de pe acest site nu substituie verificările tehnice, juridice (due diligence) sau financiare obligatorii în cadrul unei achiziții imobiliare.</li>
              <li>Operatorul nu este răspunzător pentru întreruperi temporare ale serviciului cauzate de furnizorii de hosting, telecomunicații sau atacuri cibernetice dincolo de controlul rezonabil.</li>
            </ul>
          </section>

          {/* 6. Link-uri către Site-uri Terțe */}
          <section>
            <h2 className="text-2xl font-serif font-bold text-brand-neutral-900 mb-4 border-b border-brand-neutral-200 pb-2">
              6. Link-uri Externe și Servicii Conexe
            </h2>
            <p className="text-sm sm:text-base leading-relaxed">
              Platforma poate conține legături către alte website-uri (de exemplu: servicii de navigație / hărți, rețele sociale, platforme de calcul financiar/creditare). Operatorul nu controlează și nu își asumă răspunderea pentru conținutul, politicile de confidențialitate sau securitatea site-urilor terțe respective.
            </p>
          </section>

          {/* 7. Protecția Datelor Personale */}
          <section>
            <h2 className="text-2xl font-serif font-bold text-brand-neutral-900 mb-4 border-b border-brand-neutral-200 pb-2">
              7. Confidențialitate și Date Personale
            </h2>
            <p className="text-sm sm:text-base leading-relaxed mb-3">
              Prelucrarea datelor dumneavoastră cu caracter personal se realizează cu respectarea strictă a Regulamentului (UE) 2016/679 (GDPR) și a legislației naționale aplicabile.
            </p>
            <p className="text-sm sm:text-base leading-relaxed">
              Pentru detalii complete privind scopurile, temeiurile legale, perioadele de stocare și drepturile de care beneficiați, vă rugăm să consultați{' '}
              <Link href="/privacy-policy" className="text-brand-gold-600 font-semibold hover:underline">Politica de Confidențialitate</Link>{' '}
              și pagina dedicată <Link href="/gdpr" className="text-brand-gold-600 font-semibold hover:underline">Drepturilor GDPR</Link>.
            </p>
          </section>

          {/* 8. Legea Aplicabilă și Litigii */}
          <section>
            <h2 className="text-2xl font-serif font-bold text-brand-neutral-900 mb-4 border-b border-brand-neutral-200 pb-2">
              8. Legea Aplicabilă și Jurisdicția
            </h2>
            <p className="text-sm sm:text-base leading-relaxed mb-3">
              Prezenții Termeni și Condiții sunt guvernați și interpretați în conformitate cu legislația din România.
            </p>
            <p className="text-sm sm:text-base leading-relaxed">
              Orice eventual litigiu apărut în legătură cu utilizarea site-ului va fi soluționat pe cale amiabilă. În cazul în care rezolvarea pe cale amiabilă nu este posibilă, competența revine instanțelor judecătorești competente din municipiul București, România.
            </p>
          </section>

          {/* 9. Modificarea Termenilor */}
          <section>
            <h2 className="text-2xl font-serif font-bold text-brand-neutral-900 mb-4 border-b border-brand-neutral-200 pb-2">
              9. Modificări ale Termenilor și Condițiilor
            </h2>
            <p className="text-sm sm:text-base leading-relaxed">
              Ne rezervăm dreptul de a actualiza periodic prezentul document pentru a reflecta modificările legislative sau evoluția funcționalităților platformei. Data ultimei actualizări va fi indicată la începutul documentului. Continuarea navigării după publicarea modificărilor constituie acceptul dumneavoastră.
            </p>
          </section>

          {/* 10. Contact */}
          <section className="border-t border-brand-neutral-200 pt-8 mt-10">
            <h2 className="text-xl font-serif font-bold text-brand-neutral-900 mb-3">
              10. Întrebări și Asistență
            </h2>
            <p className="text-sm sm:text-base leading-relaxed mb-4">
              Pentru orice clarificări legate de utilizarea site-ului sau a termenilor comerciali, ne puteți contacta direct:
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center px-5 py-2.5 rounded-lg bg-brand-gold-600 text-white text-sm font-semibold hover:bg-brand-gold-700 transition-colors shadow-sm"
              >
                Formular de Contact
              </Link>
              <a
                href={`mailto:${SITE_CONFIG.contact.publicEmail.address}`}
                className="inline-flex items-center px-5 py-2.5 rounded-lg bg-brand-neutral-100 text-brand-neutral-900 text-sm font-semibold hover:bg-brand-neutral-200 transition-colors border border-brand-neutral-300"
              >
                Scrie-ne pe Email
              </a>
            </div>
          </section>

        </div>
      </div>
    </div>
  </PublicLayout>
);
}
