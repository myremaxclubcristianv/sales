'use client'

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, Loader2, MessageSquarePlus, StickyNote, X } from 'lucide-react'

export interface QuickNote {
  id: string
  notes: string | null
  title: string
  date: string
  created_at: string
}

interface ClientQuickNotePopoverProps {
  /** Real clients.id (UUID) — never the display name. */
  clientId: string
  clientName: string
  phone?: string | null
  className?: string
}

const POPOVER_WIDTH = 320
const MARGIN = 8

function formatDate(value: string) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('ro-RO', { dateStyle: 'short', timeStyle: 'short' })
}

export function ClientQuickNotePopover({
  clientId,
  clientName,
  phone,
  className = '',
}: ClientQuickNotePopoverProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notes, setNotes] = useState<QuickNote[]>([])
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [justSaved, setJustSaved] = useState(false)
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)

  const buttonRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const savingRef = useRef(false)
  const mountedRef = useRef(true)
  const loadSeqRef = useRef(0)
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
    }
  }, [])

  const reposition = useCallback(() => {
    const btn = buttonRef.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    const popHeight = popoverRef.current?.offsetHeight ?? 340
    const left = Math.max(
      MARGIN,
      Math.min(rect.right - POPOVER_WIDTH, window.innerWidth - POPOVER_WIDTH - MARGIN)
    )
    let top = rect.bottom + 6
    if (top + popHeight > window.innerHeight - MARGIN && rect.top - popHeight - 6 > MARGIN) {
      top = rect.top - popHeight - 6
    }
    setPosition({ top, left })
  }, [])

  useLayoutEffect(() => {
    if (!isOpen) return
    reposition()
    window.addEventListener('resize', reposition)
    window.addEventListener('scroll', reposition, true)
    return () => {
      window.removeEventListener('resize', reposition)
      window.removeEventListener('scroll', reposition, true)
    }
  }, [isOpen, reposition, notes.length, loadState, saveError])

  // Load persisted notes from the server every time the popup opens (never trust stale client state).
  useEffect(() => {
    if (!isOpen) return
    const seq = ++loadSeqRef.current
    const controller = new AbortController()

    fetch(`/api/clients/${encodeURIComponent(clientId)}/notes`, { signal: controller.signal })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.error || 'Notițele nu au putut fi încărcate.')
        return data.notes as QuickNote[]
      })
      .then((list) => {
        // Ignore responses of superseded requests or after unmount.
        if (!mountedRef.current || seq !== loadSeqRef.current) return
        setNotes((prev) => {
          const serverIds = new Set(list.map((n) => n.id))
          const pending = prev
            .filter((n) => n.id.startsWith('saved:') && !serverIds.has(n.id.slice(6)))
            .map((n) => ({ ...n, id: n.id.slice(6) }))
          return [...pending, ...list]
        })
        setLoadState('loaded')
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted || !mountedRef.current || seq !== loadSeqRef.current) return
        setLoadState('error')
        setLoadError(err instanceof Error ? err.message : 'Notițele nu au putut fi încărcate.')
      })

    return () => controller.abort()
  }, [isOpen, clientId])

  useEffect(() => {
    if (!isOpen) return
    const t = setTimeout(() => textareaRef.current?.focus(), 50)
    return () => clearTimeout(t)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node
      if (popoverRef.current?.contains(target) || buttonRef.current?.contains(target)) return
      setIsOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [isOpen])

  const handleSave = async () => {
    const text = draft.trim()
    if (!text || savingRef.current) return

    savingRef.current = true
    setIsSaving(true)
    setSaveError(null)
    setJustSaved(false)

    try {
      const res = await fetch(`/api/clients/${encodeURIComponent(clientId)}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: text }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.note?.id) {
        throw new Error(data?.error || 'Notița nu a putut fi salvată.')
      }
      if (!mountedRef.current) return

      const saved = data.note as QuickNote
      // Show only what the server confirmed; flag it so a concurrent list load cannot drop it.
      setNotes((prev) => [{ ...saved, id: `saved:${saved.id}` }, ...prev.filter((n) => n.id !== saved.id && n.id !== `saved:${saved.id}`)])
      setDraft('')
      setJustSaved(true)
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
      savedTimerRef.current = setTimeout(() => {
        if (mountedRef.current) setJustSaved(false)
      }, 3000)
    } catch (err: unknown) {
      // The typed text stays in the textarea.
      if (mountedRef.current) {
        setSaveError(err instanceof Error ? err.message : 'Notița nu a putut fi salvată.')
      }
    } finally {
      savingRef.current = false
      if (mountedRef.current) setIsSaving(false)
    }
  }

  const popover =
    isOpen && typeof document !== 'undefined'
      ? createPortal(
          <div
            ref={popoverRef}
            role="dialog"
            aria-label={`Notiță rapidă pentru ${clientName}`}
            data-testid="quick-note-popover"
            style={{
              position: 'fixed',
              top: position?.top ?? -9999,
              left: position?.left ?? -9999,
              width: POPOVER_WIDTH,
              zIndex: 70,
            }}
            className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xl animate-in fade-in-50 zoom-in-95 duration-100"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <MessageSquarePlus className="h-3.5 w-3.5 text-blue-500" />
                  Notiță rapidă
                </span>
                <p className="mt-0.5 truncate text-sm font-bold text-slate-900" title={clientName}>
                  {clientName}
                </p>
                {phone && <p className="font-mono text-[11px] text-slate-500">{phone}</p>}
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="cursor-pointer rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Închide"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mb-2 max-h-40 space-y-1.5 overflow-y-auto pr-0.5" data-testid="quick-note-history">
              {loadState === 'loading' && notes.length === 0 && (
                <p className="text-[11px] text-slate-400">Se încarcă notițele…</p>
              )}
              {loadState === 'error' && (
                <p role="alert" className="text-[11px] font-medium text-rose-600">
                  {loadError}
                </p>
              )}
              {loadState === 'loaded' && notes.length === 0 && (
                <p className="text-[11px] italic text-slate-400">Nicio notiță salvată încă.</p>
              )}
              {notes.map((n) => (
                <div key={n.id} className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5">
                  <p className="whitespace-pre-wrap text-xs text-slate-800">{n.notes || n.title}</p>
                  <p className="mt-0.5 text-[10px] text-slate-400">{formatDate(n.date || n.created_at)}</p>
                </div>
              ))}
            </div>

            <textarea
              ref={textareaRef}
              rows={3}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              disabled={isSaving}
              aria-label="Notiță nouă"
              placeholder="Ce ați discutat, ce documente lipsesc, următorul pas…"
              maxLength={5000}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {saveError && (
              <p role="alert" className="mt-1.5 text-[11px] font-medium text-rose-600">
                {saveError}
              </p>
            )}
            {justSaved && !isSaving && (
              <p role="status" className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                <Check className="h-3 w-3" /> Notița a fost salvată.
              </p>
            )}

            <div className="mt-2.5 flex items-center justify-end gap-1.5 border-t border-slate-100 pt-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              >
                Închide
              </button>
              <button
                type="button"
                disabled={!draft.trim() || isSaving}
                onClick={handleSave}
                className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Se salvează…</span>
                  </>
                ) : (
                  <span>Salvează</span>
                )}
              </button>
            </div>
          </div>,
          document.body
        )
      : null

  const handleToggle = () => {
    setIsOpen((prev) => {
      const next = !prev
      if (next) {
        setLoadState('loading')
        setLoadError(null)
      }
      return next
    })
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={`Notiță rapidă pentru ${clientName}`}
        title="Notiță rapidă"
        data-testid="quick-note-button"
        className={`flex min-h-[36px] min-w-[36px] cursor-pointer items-center justify-center rounded-lg p-2 transition-colors ${
          isOpen
            ? 'bg-blue-50 text-blue-600'
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
        } ${className}`}
      >
        <StickyNote className="h-4 w-4" />
      </button>
      {popover}
    </>
  )
}
