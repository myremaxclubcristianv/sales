'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Plus, Check, Loader2, MessageSquarePlus, X } from 'lucide-react'

interface ChestertonsQuickNotePopoverProps {
  requestId: string
  currentNote?: string | null
  onNoteSaved?: (note: string) => void
  disabled?: boolean
  className?: string
}

export function ChestertonsQuickNotePopover({
  requestId,
  currentNote,
  onNoteSaved,
  disabled = false,
  className = '',
}: ChestertonsQuickNotePopoverProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [justSaved, setJustSaved] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Handle click outside to close
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

  // Focus textarea when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        textareaRef.current?.focus()
      }, 50)
    }
  }, [isOpen])

  const handleSave = async () => {
    const trimmed = noteText.trim()
    if (!trimmed || isSaving || disabled) return

    setIsSaving(true)
    setErrorMessage(null)

    try {
      const res = await fetch(`/api/requests/chestertons/${requestId}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity_type: 'NOTE',
          note: trimmed,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Eroare la salvarea notiței')
      }

      setNoteText('')
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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      e.stopPropagation()
      handleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      if (!isSaving) {
        setIsOpen(false)
        setErrorMessage(null)
      }
    }
  }

  return (
    <div
      className={`relative inline-block text-left ${className}`}
      ref={containerRef}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled || isSaving}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (!disabled) {
            setIsOpen((prev) => !prev)
            setErrorMessage(null)
          }
        }}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all duration-150 cursor-pointer ${
          justSaved
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
            : isOpen
            ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-700 shadow-xs'
            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700/80 dark:hover:text-white'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-98'}`}
        title="Adaugă o notiță rapidă direct din tabel"
      >
        {justSaved ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-in zoom-in-75 duration-100" />
            <span>Notată ✓</span>
          </>
        ) : (
          <>
            <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
            <span>Notiță</span>
          </>
        )}
      </button>

      {/* Inline Popover Editor */}
      {isOpen && (
        <div
          className="absolute left-0 mt-2 w-72 sm:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-3.5 z-50 animate-in fade-in-50 zoom-in-95 duration-100"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
              <MessageSquarePlus className="w-3.5 h-3.5 text-blue-500" />
              <span>Notiță rapidă CRM</span>
            </span>
            <button
              type="button"
              disabled={isSaving}
              onClick={() => {
                setIsOpen(false)
                setErrorMessage(null)
              }}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              title="Închide"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {currentNote && (
            <div className="mb-2 p-2 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-600 dark:text-slate-300">
              <span className="font-bold text-slate-400 block text-[9px] uppercase tracking-wider mb-0.5">Notă anterioară:</span>
              <p className="line-clamp-2 italic">{currentNote}</p>
            </div>
          )}

          <textarea
            ref={textareaRef}
            rows={3}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSaving}
            placeholder="Scrie o notiță... (ex: A sunat, interesat de 3 camere...)"
            className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400 resize-none transition"
          />

          {errorMessage && (
            <div className="mt-1.5 text-[11px] font-medium text-rose-600 dark:text-rose-400">
              {errorMessage}
            </div>
          )}

          <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline-block">
              Enter ↵ Salvează · Esc ✕
            </span>

            <div className="flex items-center gap-1.5 ml-auto">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => {
                  setIsOpen(false)
                  setErrorMessage(null)
                }}
                className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition font-medium"
              >
                Renunță
              </button>
              <button
                type="button"
                disabled={!noteText.trim() || isSaving}
                onClick={handleSave}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition"
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
