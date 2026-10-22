'use client'

import React, { useState, useRef, useEffect } from 'react'
import { CLIENT_STATUSES, getClientStatusMeta, type ClientStatus } from '@/lib/types/crm'
import { createBrowserClient } from '@/lib/supabase/client'
import { ChevronDown, Check, Loader2, AlertCircle } from 'lucide-react'

interface ClientStatusSelectProps {
  clientId: string
  currentStatus?: string | null
  size?: 'sm' | 'md' | 'lg'
  onStatusChange?: (newStatus: ClientStatus) => void
  disabled?: boolean
  className?: string
  align?: 'left' | 'right' | 'auto'
}

export function ClientStatusSelect({
  clientId,
  currentStatus = 'NOT_CONTACTED',
  size = 'md',
  onStatusChange,
  disabled = false,
  className = '',
  align = 'auto',
}: ClientStatusSelectProps) {
  const [status, setStatus] = useState<ClientStatus>((currentStatus as ClientStatus) || 'NOT_CONTACTED')
  const [prevStatus, setPrevStatus] = useState(currentStatus)
  const [isOpen, setIsOpen] = useState(false)
  const [autoAlign, setAutoAlign] = useState<'left' | 'right'>('left')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const effectiveAlign = align !== 'auto' ? align : autoAlign

  // Sync with prop if it changes externally
  if (currentStatus !== prevStatus) {
    setPrevStatus(currentStatus)
    setStatus((currentStatus as ClientStatus) || 'NOT_CONTACTED')
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const toggleDropdown = () => {
    setIsOpen((prev) => {
      const next = !prev
      if (next && align === 'auto' && dropdownRef.current && typeof window !== 'undefined') {
        const rect = dropdownRef.current.getBoundingClientRect()
        const spaceRight = window.innerWidth - rect.left
        if (spaceRight < 270 || rect.left > window.innerWidth * 0.5) {
          setAutoAlign('right')
        } else {
          setAutoAlign('left')
        }
      }
      return next
    })
  }

  const handleSelect = async (newStatus: ClientStatus) => {
    if (newStatus === status || saving || disabled) {
      setIsOpen(false)
      return
    }

    const previousStatus = status
    // Optimistic UI update
    setStatus(newStatus)
    setIsOpen(false)
    setSaving(true)
    setError(null)

    try {
      const supabase = createBrowserClient()
      const { error: updateError } = await supabase
        .from('clients')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', clientId)

      if (updateError) {
        throw updateError
      }

      if (onStatusChange) {
        onStatusChange(newStatus)
      }
    } catch (err: unknown) {
      console.error('Failed to update client status:', err)
      // Rollback optimistic update
      setStatus(previousStatus)
      const msg = err instanceof Error ? err.message : 'Eroare la salvare status'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  const currentMeta = getClientStatusMeta(status)

  const sizeClasses = {
    sm: 'text-[11px] py-1 px-2.5 min-h-[30px]',
    md: 'text-xs py-1.5 px-3 min-h-[36px]',
    lg: 'text-sm py-2 px-4 min-h-[44px]',
  }

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled || saving}
        onClick={toggleDropdown}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={`Schimbă status client: curent ${currentMeta.label}`}
        className={`inline-flex items-center justify-between gap-1.5 font-bold rounded-xl border transition-all cursor-pointer select-none focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed ${
          sizeClasses[size]
        } ${currentMeta.badgeBg} ${currentMeta.badgeText} ${currentMeta.badgeBorder} shadow-2xs`}
      >
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full shrink-0 ${currentMeta.dotColor}`} />
          <span>{currentMeta.label}</span>
        </div>

        <div className="flex items-center ml-0.5">
          {saving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          )}
        </div>
      </button>

      {/* Error state tooltip */}
      {error && (
        <div className={`absolute top-full mt-1 ${effectiveAlign === 'right' ? 'right-0' : 'left-0'} z-50 p-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg shadow-md flex items-center gap-1 min-w-[200px] max-w-[calc(100vw-2rem)]`}>
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`absolute z-50 mt-1.5 w-64 max-w-[calc(100vw-2rem)] max-h-80 overflow-y-auto bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 focus:outline-hidden animate-in fade-in zoom-in-95 duration-100 divide-y divide-slate-100 ${
          effectiveAlign === 'right' ? 'right-0' : 'left-0'
        }`}>
          <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Schimbă Status Client
            </span>
          </div>

          <div className="py-1">
            {CLIENT_STATUSES.map((item) => {
              const isSelected = item.id === status
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-xs text-left transition-colors min-h-[44px] cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/80 text-blue-900 font-bold'
                      : 'text-slate-800 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.dotColor}`} />
                    <div>
                      <span className="block">{item.label}</span>
                      {item.description && (
                        <span className="block text-[10px] text-slate-500 font-normal">
                          {item.description}
                        </span>
                      )}
                    </div>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0 ml-2" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
