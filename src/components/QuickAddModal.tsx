'use client'

import React from 'react'
import Link from 'next/link'
import { Modal } from '@/components/ui/Modal'

interface QuickAddModalProps {
  isOpen: boolean
  onClose: () => void
}

export function QuickAddModal({ isOpen, onClose }: QuickAddModalProps) {
  const actions = [
    {
      title: 'New Client',
      description: 'Add buyer, seller, investor or partner',
      href: '/admin/clients/new',
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
      bg: 'bg-blue-50',
    },
    {
      title: 'New Property',
      description: 'Create listing, private or off-market asset',
      href: '/admin/properties/new',
      icon: (
        <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      bg: 'bg-emerald-50',
    },
    {
      title: 'New Buyer Request',
      description: 'Register client search criteria & budget',
      href: '/admin/requests/new',
      icon: (
        <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      bg: 'bg-indigo-50',
    },
    {
      title: 'New Follow-up',
      description: 'Schedule call, whatsapp, or email reminder',
      href: '/admin/follow-ups/new',
      icon: (
        <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bg: 'bg-amber-50',
    },
    {
      title: 'New Task',
      description: 'Create operational to-do with due date',
      href: '/admin/tasks/new',
      icon: (
        <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      bg: 'bg-violet-50',
    },
    {
      title: 'New Insurance Policy',
      description: 'Track RCA, CASCO, Life, Health, or Home',
      href: '/admin/insurance/new',
      icon: (
        <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      bg: 'bg-rose-50',
    },
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Quick Action" maxWidth="lg">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {actions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            onClick={onClose}
            className="flex items-start gap-3.5 p-3.5 rounded-xl border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/80 transition-all text-left group"
          >
            <div className={`p-2.5 rounded-xl ${action.bg} flex-shrink-0 group-hover:scale-105 transition-transform`}>
              {action.icon}
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                {action.title}
              </p>
              <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                {action.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </Modal>
  )
}
