import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/config/site';
import { PublicLayout } from '@/components/layout/public/PublicLayout';

export const metadata: Metadata = {
  title: 'Declarație de Accesibilitate Web | Cristian Văduva Real Estate',
  description: 'Angajamentul nostru pentru accesibilitate digitală, standarde web incluzive și asistență dedicată pentru utilizatori cu dizabilități.',
  alternates: {
    canonical: 'https://sales.cristianvaduva.com/accessibility',
  },
  openGraph: {
    title: 'Declarație de Accesibilitate | Cristian Văduva',
    description: 'Standardele noastre privind accesibilitatea digitală și incluziunea online.',
    url: 'https://sales.cristianvaduva.com/accessibility',
  },
};

export default function AccessibilityPage() {
  return (
    <PublicLayout>
      <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-brand-neutral-900 text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-brand-neutral-800">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-gold-400 mb-3">
            <span>Incluziune Digitală</span>
            <span>•</span>
            <span>Standarde Web</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight mb-4">
            Declarație de Accesibilitate Web
          </h1>
          <p className="text-base sm:text-lg text-brand-neutral-300 leading-relaxed font-sans max-w-3xl">
            Suntem dedicați asigurării unei experiențe digitale accesibile, intuitive și fără bariere pentru toți utilizatorii, indiferent de abilități sau tehnologii de asistare utilizate.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-brand max-w-none text-brand-neutral-700 space-y-10">

          {/* 1. Angajamentul nostru */}
          <section>
            <h2 className="text-2xl font-serif font-bold text-brand-neutral-900 mb-4 border-b border-brand-neutral-200 pb-2">
              1. Angajamentul Nostru pentru Accesibilitate
            </h2>
            <p className="text-sm sm:text-base leading-relaxed mb-3">
              Platforma <strong className="text-brand-neutral-900">sales.cristianvaduva.com</strong> este proiectată și dezvoltată având la bază principiile accesibilității web și bunele practici internaționale ghidate de standardele <em>Web Content Accessibility Guidelines (WCAG 2.1)</em>.
            </p>
            <p className="text-sm sm:text-base leading-relaxed">
              Ne străduim continuu să îmbunătățim experiența de utilizare și să aplicăm cele mai relevante standarde tehnice pentru a permite navigarea facilă cu cititoare de ecran (screen readers), tastatură sau alte dispozitive asistive.
            </p>
          </section>

          {/* 2. Măsuri Tehnice Implementate */}
          <section>
            <h2 className="text-2xl font-serif font-bold text-brand-neutral-900 mb-4 border-b border-brand-neutral-200 pb-2">
              2. Măsuri și Facilități Tehnice Implementate
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-brand-neutral-50 rounded-xl border border-brand-neutral-200">
                <h3 className="text-base font-serif font-bold text-brand-neutral-900 mb-2">
                  Structură Semantică HTML5
                </h3>
                <p className="text-xs sm:text-sm text-brand-neutral-600 leading-relaxed">
                  Utilizarea corectă a elementelor semantice (<code>&lt;header&gt;</code>, <code>&lt;nav&gt;</code>, <code>&lt;main&gt;</code>, <code>&lt;section&gt;</code>, <code>&lt;footer&gt;</code>) și a ierarhiei clare a titlurilor (H1 - H6) pentru interpretare precisă de către screen readers.
                </p>
              </div>

              <div className="p-5 bg-brand-neutral-50 rounded-xl border border-brand-neutral-200">
                <h3 className="text-base font-serif font-bold text-brand-neutral-900 mb-2">
                  Navigare din Tastatură
                </h3>
                <p className="text-xs sm:text-sm text-brand-neutral-600 leading-relaxed">
                  Toate elementele interactive (butoane, link-uri, câmpuri de formular, controale de cookie) pot fi accesate și activate utilizând exclusiv tasta <code>Tab</code>, <code>Enter</code> și <code>Space</code>, având indicatori vizuali de focalizare (focus rings).
                </p>
              </div>

              <div className="p-5 bg-brand-neutral-50 rounded-xl border border-brand-neutral-200">
                <h3 className="text-base font-serif font-bold text-brand-neutral-900 mb-2">
                  Contrast Vizual și Tipografie
                </h3>
                <p className="text-xs sm:text-sm text-brand-neutral-600 leading-relaxed">
                  Textele și elementele critice de interfață respectă rapoarte optime de contrast culori (fond închis / text deschis sau fond alb / text închis), menținând lizibilitatea chiar și în condiții de lumină puternică.
                </p>
              </div>

              <div className="p-5 bg-brand-neutral-50 rounded-xl border border-brand-neutral-200">
                <h3 className="text-base font-serif font-bold text-brand-neutral-900 mb-2">
                  Texte Alternative (Alt Text)
                </h3>
                <p className="text-xs sm:text-sm text-brand-neutral-600 leading-relaxed">
                  Imaginile relevante ale proprietăților și elementele grafice conțin descrieri alternative pentru a facilita înțelegerea contextului vizual de către persoanele nevăzătoare sau cu deficiențe de vedere.
                </p>
              </div>
            </div>
          </section>

          {/* 3. Stadiul Conformității */}
          <section>
            <h2 className="text-2xl font-serif font-bold text-brand-neutral-900 mb-4 border-b border-brand-neutral-200 pb-2">
              3. Stadiul Conformității
            </h2>
            <p className="text-sm sm:text-base leading-relaxed mb-3">
              Platforma este parțial conformă cu recomandările <em>WCAG 2.1 nivel AA</em>. Recunoaștem că unele componente (de exemplu: tururi video complexe, hărți interactive terțe sau documentații tehnice PDF mai vechi atașate proprietăților) pot prezenta limitări punctuale de accesibilitate.
            </p>
            <p className="text-sm sm:text-base leading-relaxed">
              Lucrăm constant pentru a audita și remedia orice barieră identificată în cadrul ciclurilor continue de dezvoltare.
            </p>
          </section>

          {/* 4. Feedback și Asistență Directă */}
          <section className="bg-brand-neutral-50 p-6 sm:p-8 rounded-xl border border-brand-neutral-200">
            <h2 className="text-xl font-serif font-bold text-brand-neutral-900 mb-3">
              4. Feedback și Raportarea Barierelor de Accesibilitate
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-brand-neutral-700 mb-4">
              Dacă întâmpinați dificultăți în accesarea oricărui conținut sau aveți sugestii de îmbunătățire, vă rugăm să ne semnalați problema. Vă putem oferi informațiile solicitate în formate alternative adaptate nevoilor dumneavoastră (descriere telefonică directă, transcrieri, asistență WhatsApp).
            </p>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Email:</strong>{' '}
                <a href={`mailto:${SITE_CONFIG.contact.publicEmail.address}?subject=Accesibilitate%20Site%20Web`} className="text-brand-gold-600 font-semibold hover:underline">
                  {SITE_CONFIG.contact.publicEmail.address}
                </a>
              </p>
              <p>
                <strong>Telefon:</strong>{' '}
                <a href={SITE_CONFIG.contact.primaryPhone.tel} className="text-brand-neutral-900 font-semibold hover:underline">
                  {SITE_CONFIG.contact.primaryPhone.display}
                </a>
              </p>
              <p>
                <strong>WhatsApp:</strong>{' '}
                <a href={SITE_CONFIG.contact.whatsapp.url} target="_blank" rel="noopener noreferrer" className="text-brand-neutral-900 font-semibold hover:underline">
                  {SITE_CONFIG.contact.whatsapp.display}
                </a>
              </p>
            </div>
            <p className="text-xs text-brand-neutral-500 mt-4 mb-0">
              Ne angajăm să răspundem sesizărilor privind accesibilitatea în termen de maxim 5 zile lucrătoare.
            </p>
          </section>

          {/* Navigation */}
          <section className="border-t border-brand-neutral-200 pt-8 mt-10">
            <div className="flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center px-5 py-2.5 rounded-lg bg-brand-gold-600 text-white text-sm font-semibold hover:bg-brand-gold-700 transition-colors shadow-sm"
              >
                Formular Asistență
              </Link>
              <Link
                href="/legal"
                className="inline-flex items-center px-5 py-2.5 rounded-lg bg-brand-neutral-100 text-brand-neutral-900 text-sm font-semibold hover:bg-brand-neutral-200 transition-colors border border-brand-neutral-300"
              >
                Centru Legal &amp; Documente
              </Link>
            </div>
          </section>

        </div>
      </div>
    </div>
  </PublicLayout>
);
}

