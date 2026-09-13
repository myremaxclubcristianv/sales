'use client'

import React, { useState, useEffect, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { Shield, Settings, X, Check } from 'lucide-react'

export interface CookiePreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
}

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
}

const STORAGE_KEY = 'cv_cookie_consent_v1'

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback)
  return () => window.removeEventListener('storage', callback)
}

function getStoredConsentSnapshot(): string | null {
  if (typeof window === 'undefined') return 'INITIAL'
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function getServerSnapshot(): string | null {
  return 'INITIAL'
}

export function CookieConsentBanner() {
  const storedConsentRaw = useSyncExternalStore(
    subscribe,
    getStoredConsentSnapshot,
    getServerSnapshot
  )

  const isClient = storedConsentRaw !== 'INITIAL'
  const hasSavedConsent = isClient && storedConsentRaw !== null

  const [modalOpen, setModalOpen] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) return JSON.parse(stored)
      } catch {
        // fallback
      }
    }
    return DEFAULT_PREFERENCES
  })

  // State to track if user dismissed or saved during current session
  const [sessionDismissed, setSessionDismissed] = useState(false)

  useEffect(() => {
    // Listen for custom event to open cookie modal from footer
    const handleOpenSettings = () => {
      setModalOpen(true)
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setModalOpen(false)
      }
    }
    window.addEventListener('open-cookie-settings', handleOpenSettings)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('open-cookie-settings', handleOpenSettings)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const bannerVisible = isClient && !hasSavedConsent && !sessionDismissed


  const saveConsent = (prefs: CookiePreferences) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
      // Also set a lightweight document cookie for SSR/proxy if needed
      document.cookie = `cv_cookie_consent=${prefs.analytics ? 'all' : 'necessary'}; path=/; max-age=15552000; SameSite=Lax; secure`
    } catch {
      // Ignore storage errors
    }
    setPreferences(prefs)
    setSessionDismissed(true)
    setModalOpen(false)
  }

  const handleAcceptAll = () => {
    saveConsent({ necessary: true, analytics: true, marketing: true })
  }

  const handleRejectAll = () => {
    saveConsent({ necessary: true, analytics: false, marketing: false })
  }

  const handleSaveCustom = () => {
    saveConsent(preferences)
  }

  if (!isClient) return null

  return (
    <>
      {/* Banner */}
      {bannerVisible && (
        <div
          role="dialog"
          aria-labelledby="cookie-banner-title"
          aria-describedby="cookie-banner-desc"
          className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 text-white shadow-2xl animate-fade-in"
        >
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <h3 id="cookie-banner-title" className="font-serif text-base font-bold text-white">
                  Privacy &amp; Cookie Compliance Notice
                </h3>
              </div>
              <p id="cookie-banner-desc" className="text-xs text-slate-300 leading-relaxed font-light">
                We use strictly necessary technical cookies to enable secure authentication and session management. Optional analytics or marketing tools operate only with your explicit prior consent in full compliance with EU GDPR and ePrivacy regulations. Review our{' '}
                <Link href="/cookie-policy" className="text-blue-400 underline hover:text-blue-300">
                  Cookie Policy
                </Link>{' '}
                and{' '}
                <Link href="/privacy-policy" className="text-blue-400 underline hover:text-blue-300">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto shrink-0">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Customize</span>
              </button>
              <button
                type="button"
                onClick={handleRejectAll}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition cursor-pointer border border-slate-700"
              >
                Reject Non-Essential
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="px-5 py-2.5 bg-white text-slate-950 hover:bg-slate-100 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-md"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Modal */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
        >
          <div className="bg-white text-slate-900 rounded-3xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-900 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="cookie-modal-title" className="font-serif text-xl font-bold text-slate-950">
                    Cookie &amp; Privacy Preferences
                  </h3>
                  <p className="text-xs text-slate-500">
                    Manage your data processing and cookie categories
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-950 rounded-xl transition cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Configure your individual preferences below. Strictly necessary cookies cannot be disabled as they are required for core security, authentication, and platform operation.
              </p>

              {/* Category 1: Strictly Necessary */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-950">Strictly Necessary Cookies</span>
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-bold rounded uppercase">
                      Always Active
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={true}
                    disabled={true}
                    className="w-4 h-4 rounded text-slate-900 cursor-not-allowed opacity-75"
                  />
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Required for user authentication sessions (Supabase Auth SSR tokens), security headers, CSRF mitigation, and recording your cookie consent preferences.
                </p>
              </div>

              {/* Category 2: Performance & Analytics */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-950">Performance &amp; Analytics</span>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded uppercase">
                      Optional
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) =>
                        setPreferences({ ...preferences, analytics: e.target.value === 'true' || e.target.checked })
                      }
                      className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900"
                    />
                  </label>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Helps us understand platform performance and traffic volumes in aggregate to improve user experience. No personal identifying profiles are constructed without consent.
                </p>
              </div>

              {/* Category 3: Marketing & Attribution */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-950">Marketing &amp; Attribution</span>
                    <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-bold rounded uppercase">
                      Optional
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) =>
                        setPreferences({ ...preferences, marketing: e.target.value === 'true' || e.target.checked })
                      }
                      className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900"
                    />
                  </label>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Used exclusively for tracking inbound campaign attribution and measuring communication effectiveness for property inquiries.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50">
              <button
                type="button"
                onClick={handleRejectAll}
                className="w-full sm:w-auto px-4 py-2.5 text-slate-700 hover:text-slate-950 text-xs font-semibold uppercase tracking-wider transition cursor-pointer"
              >
                Reject All Non-Essential
              </button>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleSaveCustom}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Preferences</span>
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition cursor-pointer shadow-xs"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
