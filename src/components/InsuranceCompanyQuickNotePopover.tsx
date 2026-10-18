'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Plus, Check, Loader2, MessageSquare, Pencil, X } from 'lucide-react'

interface InsuranceCompanyQuickNotePopoverProps {
  companyId: string
  companyName: string
  currentNote: string | null | undefined
  onNoteSaved?: (newNote: string) => void
  disabled?: boolean
  className?: string
}

export function InsuranceCompanyQuickNotePopover({
  companyId,
  companyName,
  currentNote,
  onNoteSaved,
  disabled = false,
  className = '',
}: InsuranceCompanyQuickNotePopoverProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [noteText, setNoteText] = useState(currentNote || '')
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [justSaved, setJustSaved] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled && !isSaving) {
      setNoteText(currentNote || '')
      setIsOpen((prev) => !prev)
      setErrorMessage(null)
    }
  }

  const handleClose = () => {
    if (!isSaving) {
      setIsOpen(false)
      setErrorMessage(null)
    }
  }

  // Handle click outside to close popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (!isSaving) {
          setIsOpen(false)
          setErrorMessage(null)
        }
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, isSaving])

  // Auto-focus textarea when popover opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
          textareaRef.current.select()
        }
      }, 50)
    }
  }, [isOpen])

  const handleSave = async () => {
    const trimmed = noteText.trim()
    if (isSaving || disabled) return

    setIsSaving(true)
    setErrorMessage(null)

    try {
      const res = await fetch(`/api/insurance/companies/${companyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crm_notes: trimmed,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Eroare la salvarea notiței')
      }

      setIsOpen(false)
      setJustSaved(true)

      if (onNoteSaved) {
        onNoteSaved(trimmed)
      }

      setTimeout(() => {
        setJustSaved(false)
      }, 3000)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Eroare la salvarea notiței'
      setErrorMessage(message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      e.stopPropagation()
      handleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      if (!isSaving) {
        setIsOpen(false)
        setErrorMessage(null)
        setNoteText(currentNote || '')
      }
    }
  }

  const hasNote = Boolean(currentNote && currentNote.trim().length > 0)

  return (
    <div
      className={`relative inline-block text-left ${className}`}
      ref={containerRef}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Table Cell Trigger Button */}
      {justSaved ? (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800 animate-in zoom-in-95 duration-150">
          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Salvat ✓</span>
        </span>
      ) : hasNote ? (
        <button
          type="button"
          disabled={disabled || isSaving}
          onClick={handleOpen}
          className={`group flex items-start gap-1.5 max-w-[210px] p-1.5 rounded-xl text-left border transition cursor-pointer ${
            isOpen
              ? 'bg-blue-50/80 text-blue-900 border-blue-300 dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-700 shadow-xs'
              : 'bg-neutral-50/80 hover:bg-neutral-100 text-neutral-800 border-neutral-200/90 dark:bg-neutral-800/60 dark:hover:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
          }`}
          title={currentNote || undefined}
        >
          <MessageSquare className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <span className="text-[11px] leading-tight line-clamp-2 break-words">
            {currentNote}
          </span>
          <Pencil className="w-2.5 h-2.5 text-neutral-400 group-hover:text-indigo-600 shrink-0 ml-auto mt-0.5 opacity-40 group-hover:opacity-100 transition-opacity" />
        </button>
      ) : (
        <button
          type="button"
          disabled={disabled || isSaving}
          onClick={handleOpen}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold border border-dashed transition cursor-pointer ${
            isOpen
              ? 'bg-blue-50 text-blue-700 border-blue-400 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-700'
              : 'bg-neutral-50/60 hover:bg-neutral-100 text-neutral-600 border-neutral-300 hover:border-neutral-400 hover:text-neutral-900 dark:bg-neutral-800/40 dark:hover:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700 dark:hover:text-neutral-200'
          }`}
          title="Adaugă o notiță rapidă despre conversația cu firma"
        >
          <Plus className="w-3 h-3 text-neutral-400" />
          <span>+ Notiță</span>
        </button>
      )}

      {/* Compact Popover */}
      {isOpen && (
        <div
          className="absolute left-0 mt-2 w-72 sm:w-84 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl p-3.5 z-50 animate-in fade-in-50 zoom-in-95 duration-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Popover Header */}
          <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-1.5 min-w-0">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
                Notiță: {companyName}
              </span>
            </div>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleClose}
              className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              title="Închide fără salvare"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            rows={3}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSaving}
            placeholder="Scrie notiță (ex: persoana contactată, interes RCA/CASCO flotă, oferta cerută, data revenirii)..."
            className="w-full p-2.5 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 resize-none transition"
          />

          {errorMessage && (
            <div className="mt-1.5 text-[11px] font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-1.5 rounded-lg border border-rose-200 dark:border-rose-900">
              {errorMessage}
            </div>
          )}

          {/* Popover Footer */}
          <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <span className="text-[10px] text-neutral-400 font-mono hidden sm:inline-block">
              Ctrl+Enter ↵ Salvează
            </span>

            <div className="flex items-center gap-1.5 ml-auto">
              <button
                type="button"
                disabled={isSaving}
                onClick={handleClose}
                className="px-2.5 py-1 text-xs text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg cursor-pointer transition font-medium"
              >
                Anulează
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSave}
                className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Salvare...</span>
                  </>
                ) : (
                  <span>Salvează</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
