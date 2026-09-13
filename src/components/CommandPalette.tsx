'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const router = useRouter()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) {
          onClose()
        } else {
          // Trigger open via parent or event
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const navigationItems = [
    { title: 'Dashboard', category: 'Navigation', href: '/admin/dashboard' },
    { title: 'Clients Directory', category: 'Navigation', href: '/admin/clients' },
    { title: 'Add New Client', category: 'Action', href: '/admin/clients/new' },
    { title: 'Properties & Listings', category: 'Navigation', href: '/admin/properties' },
    { title: 'Add New Property', category: 'Action', href: '/admin/properties/new' },
    { title: 'Buyer Requests', category: 'Navigation', href: '/admin/requests' },
    { title: 'Add New Buyer Request', category: 'Action', href: '/admin/requests/new' },
    { title: 'Viewings & Walkthroughs Hub', category: 'Navigation', href: '/admin/viewings' },
    { title: 'Follow-ups (Today & Overdue)', category: 'Navigation', href: '/admin/follow-ups' },
    { title: 'Tasks Management', category: 'Navigation', href: '/admin/tasks' },
  ]

  const filtered = query.trim()
    ? navigationItems.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      )
    : navigationItems

  const handleSelect = (href: string) => {
    onClose()
    router.push(href)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div className="relative mx-auto max-w-xl transform rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden transition-all">
        <div className="relative flex items-center border-b border-slate-200 px-4">
          <svg className="w-5 h-5 text-slate-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            className="h-13 w-full border-0 bg-transparent pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-hidden text-sm"
            placeholder="Search commands, clients, properties, tasks... (Press ESC to exit)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        <div className="max-h-80 scroll-py-2 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="p-4 text-sm text-slate-500 text-center">No results found for &quot;{query}&quot;</p>
          ) : (
            <ul className="text-sm text-slate-700 divide-y divide-slate-50">
              {filtered.map((item, idx) => (
                <li
                  key={idx}
                  onClick={() => handleSelect(item.href)}
                  className="flex cursor-pointer select-none items-center justify-between rounded-lg px-3 py-2.5 hover:bg-slate-100/80 transition-colors"
                >
                  <span className="font-medium text-slate-900">{item.title}</span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-mono">
                    {item.category}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between bg-slate-50 px-4 py-2.5 text-xs text-slate-500 border-t border-slate-200/60">
          <span>Navigate with mouse or enter</span>
          <span className="font-mono">ESC to close</span>
        </div>
      </div>
    </div>
  )
}
