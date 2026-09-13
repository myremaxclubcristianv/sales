'use client'

import React from 'react'
import { Settings } from 'lucide-react'

interface CookiePreferencesTriggerProps {
  className?: string
  children?: React.ReactNode
}

export function CookiePreferencesTrigger({ className, children }: CookiePreferencesTriggerProps) {
  const handleOpen = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-cookie-settings'))
    }
  }

  return (
    <button
      type="button"
      onClick={handleOpen}
      className={className || 'inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition cursor-pointer shadow-xs'}
    >
      <Settings className="w-4 h-4 text-brand-gold-400" />
      <span>{children || 'Open Cookie Preferences Modal'}</span>
    </button>
  )
}
