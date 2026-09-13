'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SITE_CONFIG } from '@/lib/config/site'
import { Phone, Mail, MessageSquare, ArrowUpRight, Shield, Settings } from 'lucide-react'
import { CookieConsentBanner } from '@/components/legal/CookieConsentBanner'

interface PublicLayoutProps {
  children: React.ReactNode
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { name: 'Properties', href: '/properties' },
    { name: 'Buyer Requests', href: '/requests' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Legal', href: '/legal' },
  ]

  const openCookiePreferences = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-cookie-settings'))
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      {/* Cookie Consent Manager Banner & Modal */}
      <CookieConsentBanner />

      {/* Public Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-slate-950 text-white rounded-xl flex items-center justify-center font-serif text-xl font-bold tracking-tight group-hover:bg-slate-800 transition">
                CV
              </div>
              <div>
                <span className="font-serif text-lg tracking-wide text-slate-950 font-bold block">
                  {SITE_CONFIG.name.toUpperCase()}
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest block -mt-1 font-medium">
                  {SITE_CONFIG.positioning.role}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(`${link.href}/`))
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`text-sm font-medium transition-colors ${
                      isActive ? 'text-slate-950 font-semibold border-b-2 border-slate-950 pb-1' : 'text-slate-600 hover:text-slate-950'
                    }`}
                  >
                    {link.name}
                  </Link>
                )
              })}
            </nav>

            {/* Desktop Action CTA */}
            <div className="hidden md:flex items-center gap-4">
              <a
                href={SITE_CONFIG.contact.whatsapp.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp</span>
              </a>
              <Link
                href="/contact"
                className="px-5 py-2.5 bg-slate-950 text-white text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
              >
                Inquire Directly
              </Link>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="md:hidden flex items-center gap-2">
              <a
                href={SITE_CONFIG.contact.whatsapp.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-emerald-700 bg-emerald-50 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                aria-label="Contact on WhatsApp"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-700 hover:text-slate-950 rounded-lg"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-medium text-slate-800 hover:text-slate-950"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              <a
                href={SITE_CONFIG.contact.primaryPhone.tel}
                className="block text-center w-full py-2.5 bg-slate-100 text-slate-900 text-xs font-semibold rounded-lg"
              >
                Call: {SITE_CONFIG.contact.primaryPhone.display}
              </a>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-3 bg-slate-950 text-white text-sm font-semibold rounded-lg"
              >
                Inquire Directly
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Premium Footer */}
      <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-10">
            {/* Column 1: Brand & Profile (4 cols) */}
            <div className="md:col-span-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white text-slate-950 rounded flex items-center justify-center font-serif font-bold text-lg">
                  CV
                </div>
                <span className="font-serif text-lg tracking-wider text-white font-semibold">
                  {SITE_CONFIG.name.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                {SITE_CONFIG.positioning.role} · {SITE_CONFIG.positioning.pillars.join(' · ')}
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Bespoke real estate acquisitions, confidential seller representation, asset risk structuring, and private investments.
              </p>
              <div className="pt-2 text-xs space-y-1.5 text-slate-400">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <a href={SITE_CONFIG.contact.primaryPhone.tel} className="hover:text-white transition font-mono">
                    {SITE_CONFIG.contact.primaryPhone.display}
                  </a>
                  <span className="text-[10px] text-slate-400">(RO)</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <a href={SITE_CONFIG.contact.whatsapp.url} target="_blank" rel="noopener noreferrer" className="hover:text-white transition font-mono">
                    {SITE_CONFIG.contact.realEstatePhone.display}
                  </a>
                  <span className="text-[10px] text-emerald-400">(WhatsApp / AT)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <a href={SITE_CONFIG.contact.publicEmail.mailto} className="hover:text-white transition">
                    {SITE_CONFIG.contact.publicEmail.address}
                  </a>
                </div>
              </div>
            </div>

            {/* Column 2: Directory Links (2 cols) */}
            <div className="md:col-span-2">
              <h4 className="text-xs font-semibold tracking-wider text-white uppercase mb-4">
                Directory
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <Link href="/properties" className="hover:text-white transition-colors">
                    Featured Properties
                  </Link>
                </li>
                <li>
                  <Link href="/requests" className="hover:text-white transition-colors">
                    Buyer Requests Board
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    Advisory Practice
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Direct Contact
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-colors text-slate-400">
                    Staff Portal Login
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Legal & Compliance (3 cols) */}
            <div className="md:col-span-3">
              <h4 className="text-xs font-semibold tracking-wider text-white uppercase mb-4 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-brand-gold-400" />
                <span>Legal &amp; Conformitate</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <Link href="/legal" className="text-slate-200 hover:text-white transition-colors font-medium">
                    → Centru Legal &amp; Documente
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className="hover:text-white transition-colors">
                    Politica de Confidențialitate
                  </Link>
                </li>
                <li>
                  <Link href="/cookie-policy" className="hover:text-white transition-colors">
                    Politica Cookie
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Termeni și Condiții
                  </Link>
                </li>
                <li>
                  <Link href="/gdpr" className="hover:text-white transition-colors">
                    Drepturi Persoane Vizate (GDPR)
                  </Link>
                </li>
                <li>
                  <Link href="/data-protection" className="hover:text-white transition-colors">
                    Notă Prelucrare Date CRM
                  </Link>
                </li>
                <li>
                  <Link href="/marketing-consent" className="hover:text-white transition-colors">
                    Consimțământ Marketing
                  </Link>
                </li>
                <li>
                  <Link href="/imprint" className="hover:text-white transition-colors">
                    Date Identificare (Imprint)
                  </Link>
                </li>
                <li>
                  <Link href="/accessibility" className="hover:text-white transition-colors">
                    Declarație Accesibilitate
                  </Link>
                </li>
                <li>
                  <Link href="/complaints" className="hover:text-white transition-colors">
                    Reclamații &amp; ANSPDCP
                  </Link>
                </li>
                <li className="pt-1">
                  <button
                    type="button"
                    onClick={openCookiePreferences}
                    className="inline-flex items-center gap-1.5 text-xs text-brand-gold-400 hover:text-brand-gold-300 font-medium transition cursor-pointer"
                  >
                    <Settings className="w-3 h-3" />
                    <span>Preferințe Cookie-uri</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Ecosystem & Channels (3 cols) */}
            <div className="md:col-span-3 space-y-5">
              <div>
                <h4 className="text-xs font-semibold tracking-wider text-white uppercase mb-3">
                  Social Channels
                </h4>
                <div className="flex flex-wrap gap-2">
                  {SITE_CONFIG.socials.map((social) => (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Visit Cristian Văduva on ${social.name}`}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-md text-[11px] font-medium border border-slate-800 transition inline-flex items-center gap-1"
                    >
                      <span>{social.name}</span>
                      <ArrowUpRight className="w-2.5 h-2.5 text-slate-400" />
                    </a>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold tracking-wider text-white uppercase mb-2">
                  Ecosystem &amp; Portals
                </h4>
                <div className="space-y-1.5 text-xs text-slate-400">
                  {SITE_CONFIG.websites.slice(0, 4).map((site) => (
                    <a
                      key={site.name}
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block hover:text-white transition truncate"
                    >
                      ↗ {site.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>© {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved.</p>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <Link href="/privacy-policy" className="hover:text-white transition">Confidențialitate</Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-white transition">Termeni</Link>
              <span>•</span>
              <Link href="/cookie-policy" className="hover:text-white transition">Cookie-uri</Link>
            </div>
            <p className="font-mono text-[11px] text-slate-400">
              {SITE_CONFIG.positioning.markets.join(' · ')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

