import React from 'react'
import Link from 'next/link'
import { PublicLayout } from '@/components/layout/public/PublicLayout'
import { SITE_CONFIG } from '@/lib/config/site'
import { Cookie, ArrowLeft } from 'lucide-react'
import { CookiePreferencesTrigger } from '@/components/legal/CookiePreferencesTrigger'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy | Politică privind Modulele Cookie',
  description: 'Technical disclosure of cookies and local storage mechanisms used on sales.cristianvaduva.com, legal basis under ePrivacy Directive, and consent management controls.',
  alternates: {
    canonical: '/cookie-policy',
  },
}

export default function CookiePolicyPage() {
  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        {/* Breadcrumb */}
        <div>
          <Link
            href="/legal"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-950 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Legal Hub</span>
          </Link>
        </div>

        {/* Title Header */}
        <div className="space-y-4 border-b border-slate-200 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-800 uppercase tracking-wider">
            <Cookie className="w-3.5 h-3.5 text-amber-600" />
            <span>Directive 2002/58/EC (ePrivacy) &amp; GDPR Compliance</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-slate-950">
            Cookie Policy
          </h1>
          <p className="text-sm font-serif italic text-slate-500">
            Politică privind Utilizarea Modulelor Cookie și Tehnologiilor Similare
          </p>
          <p className="text-xs text-slate-400 font-mono">
            Canonical Domain: https://sales.cristianvaduva.com · Updated: September 13, 2026
          </p>
        </div>

        {/* Introduction */}
        <div className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed text-slate-700 space-y-6">
          <p>
            This Cookie Policy explains how <strong className="text-slate-950">{SITE_CONFIG.name}</strong> (&quot;we&quot;, &quot;us&quot;, or &quot;the Controller&quot;) uses cookies and similar storage technologies on{' '}
            <strong className="text-slate-950">https://sales.cristianvaduva.com</strong> in strict compliance with Article 5(3) of Directive 2002/58/EC (as amended by Directive 2009/136/EC), Romanian Law No. 506/2004, and Regulation (EU) 2016/679 (GDPR).
          </p>

          {/* Section 1: What are Cookies */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-950 border-b border-slate-100 pb-2">
              1. What are Cookies &amp; Local Storage?
            </h2>
            <p>
              A cookie is a small text file placed on your device (computer, tablet, or smartphone) by a website server when you visit a webpage. Local storage (such as HTML5 LocalStorage) operates similarly by storing key-value pairs in your browser. These technologies allow websites to maintain secure user sessions, remember user preferences, and prevent malicious automated request tampering.
            </p>
          </section>

          {/* Section 2: Complete Cookie Inventory */}
          <section className="space-y-4">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-950 border-b border-slate-100 pb-2">
              2. Complete Inventory of Active Cookies &amp; Storage Keys
            </h2>
            <p>
              We operate under strict data minimization. Below is the comprehensive, transparent inventory of all cookies and storage mechanisms used on this platform:
            </p>

            {/* Cookie Table */}
            <div className="overflow-x-auto not-prose">
              <table className="w-full text-left border-collapse bg-white rounded-2xl border border-slate-200 text-xs overflow-hidden">
                <thead className="bg-slate-900 text-white">
                  <tr>
                    <th className="p-3.5 font-semibold">Cookie / Storage Key</th>
                    <th className="p-3.5 font-semibold">Provider</th>
                    <th className="p-3.5 font-semibold">Purpose</th>
                    <th className="p-3.5 font-semibold">Duration</th>
                    <th className="p-3.5 font-semibold">Category / Legal Basis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  <tr className="hover:bg-slate-50">
                    <td className="p-3.5 font-mono text-[11px] font-bold text-slate-900">
                      sb-*-auth-token
                    </td>
                    <td className="p-3.5 text-slate-600">
                      First-Party / Supabase Auth
                    </td>
                    <td className="p-3.5 text-slate-600 leading-relaxed">
                      Secures authenticated session state for authorized staff and administrators accessing the private CRM OS.
                    </td>
                    <td className="p-3.5 text-slate-600">
                      Session / 1 Year
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-bold text-[10px] uppercase">
                        Strictly Necessary
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50">
                    <td className="p-3.5 font-mono text-[11px] font-bold text-slate-900">
                      cv_cookie_consent
                    </td>
                    <td className="p-3.5 text-slate-600">
                      First-Party (sales.cristianvaduva.com)
                    </td>
                    <td className="p-3.5 text-slate-600 leading-relaxed">
                      Records whether the user selected necessary, custom, or all cookie preferences to prevent repetitive banner display.
                    </td>
                    <td className="p-3.5 text-slate-600">
                      180 Days
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-bold text-[10px] uppercase">
                        Strictly Necessary
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50">
                    <td className="p-3.5 font-mono text-[11px] font-bold text-slate-900">
                      cv_cookie_consent_v1 (LocalStorage)
                    </td>
                    <td className="p-3.5 text-slate-600">
                      First-Party (Browser Storage)
                    </td>
                    <td className="p-3.5 text-slate-600 leading-relaxed">
                      Maintains detailed category toggle state ({`{ necessary, analytics, marketing }`}) for granular preference settings.
                    </td>
                    <td className="p-3.5 text-slate-600">
                      Persistent (Until Cleared)
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-bold text-[10px] uppercase">
                        Strictly Necessary
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-1">
              <strong className="block font-bold">Zero Non-Essential Trackers Without Explicit Consent:</strong>
              <p className="leading-relaxed">
                We do not deploy third-party advertising cookies, cross-site trackers, or invasive social media tracking pixels without your prior, explicit consent.
              </p>
            </div>
          </section>

          {/* Section 3: Categories & Legal Basis */}
          <section className="space-y-4">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-950 border-b border-slate-100 pb-2">
              3. Cookie Categories &amp; Legal Framework
            </h2>
            <div className="space-y-3 not-prose font-sans text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">Category 1: Strictly Necessary Cookies (Exempt from Prior Consent)</span>
                <p className="text-slate-600 leading-relaxed">
                  These cookies are essential for the operation of the website and cannot be switched off in our systems. Under Article 5(3) of the ePrivacy Directive and Romanian Law 506/2004, prior consent is not required for cookies that are strictly necessary for the delivery of a service explicitly requested by the user (such as authentication sessions or security tokens).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">Category 2: Performance &amp; Analytics (Requires Explicit Consent)</span>
                <p className="text-slate-600 leading-relaxed">
                  These cookies allow aggregate measurement of visitor numbers and traffic sources to optimize portal responsiveness. They operate strictly upon your affirmative consent (Article 6(1)(a) GDPR).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">Category 3: Marketing &amp; Campaign Attribution (Requires Explicit Consent)</span>
                <p className="text-slate-600 leading-relaxed">
                  These cookies help evaluate inbound property marketing campaign performance. They are never activated without your prior consent.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: How to Manage Consent */}
          <section className="space-y-4">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-950 border-b border-slate-100 pb-2">
              4. How to Manage or Revoke Cookie Consent
            </h2>
            <p>
              You maintain complete control over your cookie preferences at all times:
            </p>

            <div className="p-6 bg-slate-950 text-white rounded-3xl space-y-3 not-prose font-sans text-xs">
              <h3 className="font-serif text-base font-bold">Interactive Cookie Preference Center:</h3>
              <p className="text-slate-300 leading-relaxed font-light">
                You can reopen your cookie settings modal at any point by clicking the &quot;Cookie Settings&quot; button located in the website footer or by using the trigger below:
              </p>
              <div className="pt-2">
                <CookiePreferencesTrigger className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold uppercase tracking-wider text-xs inline-flex items-center gap-2 cursor-pointer shadow-md transition">
                  Open Cookie Preference Center
                </CookiePreferencesTrigger>
              </div>
            </div>

            <p>
              Alternatively, you can manage or block cookies directly through your web browser configuration settings (Chrome, Safari, Firefox, Edge). Please note that blocking strictly necessary cookies in your browser will disrupt authentication sessions for the private CRM operating portal.
            </p>
          </section>
        </div>
      </div>
    </PublicLayout>
  )
}
