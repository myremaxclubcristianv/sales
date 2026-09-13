'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

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
  ]

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      {/* Public Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-950 text-white rounded-lg flex items-center justify-center font-serif text-xl font-bold tracking-tight">
                V
              </div>
              <div>
                <span className="font-serif text-lg tracking-wide text-slate-950 font-bold block">
                  VĂDUVA &amp; PARTNERS
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest block -mt-1 font-medium">
                  Private Real Estate &amp; Advisory
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
              <Link
                href="/contact"
                className="px-5 py-2.5 bg-slate-950 text-white text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
              >
                Inquire Directly
              </Link>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="md:hidden flex items-center">
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
            <div className="pt-4 border-t border-slate-100">
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white text-slate-950 rounded flex items-center justify-center font-serif font-bold text-lg">
                  V
                </div>
                <span className="font-serif text-lg tracking-wider text-white font-semibold">
                  VĂDUVA &amp; PARTNERS
                </span>
              </div>
              <p className="text-sm text-slate-400 max-w-md leading-relaxed">
                Bespoke private real estate acquisition, portfolio placement, and integrated financial advisory. Exclusively serving private clients and institutional investors.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold tracking-wider text-white uppercase mb-4">
                Directory
              </h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link href="/properties" className="hover:text-white transition-colors">
                    Featured Properties
                  </Link>
                </li>
                <li>
                  <Link href="/requests" className="hover:text-white transition-colors">
                    Verified Buyer Requests
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
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold tracking-wider text-white uppercase mb-4">
                Private Access
              </h4>
              <p className="text-xs text-slate-400 mb-3">
                Authorized partners and agents operating system.
              </p>
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center gap-2 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
              >
                <span>Staff Operating Portal</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>© {new Date().getFullYear()} Văduva &amp; Partners. All rights reserved.</p>
            <p className="font-mono text-[11px] text-slate-400">Bucharest · Monaco · Dubai</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
