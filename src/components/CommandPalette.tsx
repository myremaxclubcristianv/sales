'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

const navigationItems = [
  { title: 'Dashboard & Command Center', category: 'Navigation', href: '/admin/dashboard' },
  { title: 'Clients Directory (360°)', category: 'Navigation', href: '/admin/clients' },
  { title: 'Add New Client Record', category: 'Action', href: '/admin/clients/new' },
  { title: 'Properties & Listings Portfolio', category: 'Navigation', href: '/admin/properties' },
  { title: 'Add New Property Listing', category: 'Action', href: '/admin/properties/new' },
  { title: 'Deals & Opportunities Pipeline', category: 'Navigation', href: '/admin/opportunities' },
  { title: 'Create New Deal Opportunity', category: 'Action', href: '/admin/opportunities/new' },
  { title: 'Offers & Negotiations Hub', category: 'Navigation', href: '/admin/offers' },
  { title: 'Submit New Property Offer', category: 'Action', href: '/admin/offers/new' },
  { title: 'Buyer Requests & Matching', category: 'Navigation', href: '/admin/requests' },
  { title: 'Add New Buyer Search Request', category: 'Action', href: '/admin/requests/new' },
  { title: 'Viewings & Walkthroughs Hub', category: 'Navigation', href: '/admin/viewings' },
  { title: 'Insurance Portfolio & 30-Day Renewals', category: 'Navigation', href: '/admin/insurance' },
  { title: 'Register New Insurance Policy', category: 'Action', href: '/admin/insurance/new' },
  { title: 'Credit & Mortgage 8-Stage Pipeline', category: 'Navigation', href: '/admin/credit' },
  { title: 'Open New Financing Case', category: 'Action', href: '/admin/credit/new' },
  { title: 'Follow-ups Queue (Today & Overdue)', category: 'Navigation', href: '/admin/follow-ups' },
  { title: 'Schedule New Follow-up', category: 'Action', href: '/admin/follow-ups/new' },
  { title: 'Tasks Management Board', category: 'Navigation', href: '/admin/tasks' },
  { title: 'Inbound Leads & Attribution Inbox', category: 'Navigation', href: '/admin/leads' },
  { title: 'Marketing Campaigns Management', category: 'Navigation', href: '/admin/campaigns' },
  { title: 'Launch Marketing Campaign', category: 'Action', href: '/admin/campaigns/new' },
  { title: 'Executive Operating Analytics', category: 'Navigation', href: '/admin/analytics' },
  { title: 'Internal Notifications Hub', category: 'Navigation', href: '/admin/notifications' },
]

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()

  const handleSelect = useCallback((href: string) => {
    onClose()
    router.push(href)
  }, [onClose, router])

  const filtered = query.trim()
    ? navigationItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      )
    : navigationItems

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) {
          onClose()
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
      if (isOpen && filtered.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setSelectedIndex((prev) => (prev + 1) % filtered.length)
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length)
        } else if (e.key === 'Enter') {
          e.preventDefault()
          if (filtered[selectedIndex]) {
            handleSelect(filtered[selectedIndex].href)
          }
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, filtered, selectedIndex, handleSelect])

  if (!isOpen) return null

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
            placeholder="Search commands, clients, properties, tasks... (↑↓ to navigate, ↵ to select, ESC to exit)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            autoFocus
          />
        </div>

        <div className="max-h-80 scroll-py-2 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="p-4 text-sm text-slate-500 text-center">No results found for &quot;{query}&quot;</p>
          ) : (
            <ul className="text-sm text-slate-700 divide-y divide-slate-50">
              {filtered.map((item, idx) => {
                const isSelected = idx === selectedIndex
                return (
                  <li
                    key={idx}
                    onClick={() => handleSelect(item.href)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex cursor-pointer select-none items-center justify-between rounded-lg px-3 py-2.5 transition-colors ${
                      isSelected ? 'bg-blue-600 text-white' : 'hover:bg-slate-100/80 text-slate-900'
                    }`}
                  >
                    <span className="font-medium text-xs sm:text-sm truncate">{item.title}</span>
                    <span
                      className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-md font-mono shrink-0 ml-2 ${
                        isSelected ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {item.category}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between bg-slate-50 px-4 py-2.5 text-xs text-slate-500 border-t border-slate-200/60">
          <span>Navigate with ↑↓ arrows or mouse • ↵ to open</span>
          <span className="font-mono">ESC to close</span>
        </div>
      </div>
    </div>
  )
}
