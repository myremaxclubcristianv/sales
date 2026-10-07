'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  CHESTERTONS_CRM_STATUSES,
  getChestertonsStatusMeta,
  type ChestertonsCrmStatus,
} from '@/lib/types/chestertons-workflow'
import { ChevronDown, Check, Loader2 } from 'lucide-react'

interface ChestertonsStatusSelectProps {
  requestId: string
  currentStatus?: string | null
  size?: 'sm' | 'md' | 'lg'
  onStatusChange?: (newStatus: ChestertonsCrmStatus) => void
  disabled?: boolean
  className?: string
}

export function ChestertonsStatusSelect({
  requestId,
  currentStatus = 'NESUNAT',
  size = 'md',
  onStatusChange,
  disabled = false,
  className = '',
}: ChestertonsStatusSelectProps) {
  const [status, setStatus] = useState<ChestertonsCrmStatus>(
    (currentStatus as ChestertonsCrmStatus) || 'NESUNAT'
  )
  const [prevStatus, setPrevStatus] = useState(currentStatus)
  const [isOpen, setIsOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  if (currentStatus !== prevStatus) {
    setPrevStatus(currentStatus)
    setStatus((currentStatus as ChestertonsCrmStatus) || 'NESUNAT')
  }

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

  const handleSelect = async (newStatus: ChestertonsCrmStatus) => {
    if (newStatus === status || saving || disabled) {
      setIsOpen(false)
      return
    }

    const previousStatus = status
    setStatus(newStatus)
    setIsOpen(false)
    setSaving(true)

    try {
      const res = await fetch(`/api/requests/chestertons/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crm_status: newStatus }),
      })

      if (!res.ok) {
        throw new Error('Failed to update status')
      }

      if (onStatusChange) {
        onStatusChange(newStatus)
      }
    } catch (err) {
      console.error('Failed to update Chestertons CRM status:', err)
      setStatus(previousStatus)
    } finally {
      setSaving(false)
    }
  }

  const currentMeta = getChestertonsStatusMeta(status)

  const sizeClasses = {
    sm: 'text-[11px] px-2.5 py-1 gap-1.5',
    md: 'text-xs px-3 py-1.5 gap-2',
    lg: 'text-sm px-4 py-2 gap-2.5',
  }

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled || saving}
        className={`inline-flex items-center justify-between rounded-xl font-semibold border transition-all duration-150 shadow-2xs ${
          sizeClasses[size]
        } ${currentMeta.bgLight} ${currentMeta.textLight} ${currentMeta.borderLight} ${currentMeta.bgDark} ${currentMeta.textDark} ${currentMeta.borderDark} ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 cursor-pointer active:scale-98'
        }`}
      >
        <span className="flex items-center gap-1.5 truncate">
          <span className={`w-2 h-2 rounded-full shrink-0 ${currentMeta.dotColor}`} />
          <span className="truncate">{currentMeta.label}</span>
        </span>
        {saving ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0 opacity-70" />
        ) : (
          <ChevronDown
            className={`w-3.5 h-3.5 shrink-0 opacity-70 transition-transform duration-150 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-64 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in-50 zoom-in-95 duration-100 max-h-80 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 mb-1">
            Modifică CRM Status
          </div>
          <div className="space-y-0.5 px-1">
            {CHESTERTONS_CRM_STATUSES.map((meta) => {
              const isSelected = meta.value === status
              return (
                <button
                  key={meta.value}
                  type="button"
                  onClick={() => handleSelect(meta.value)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors text-left cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${meta.dotColor}`} />
                    <span className="truncate">{meta.label}</span>
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 ml-2" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
