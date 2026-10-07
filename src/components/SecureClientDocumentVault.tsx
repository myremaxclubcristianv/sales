'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  ShieldCheck,
  Lock,
  Unlock,
  Key,
  Copy,
  Check,
  Upload,
  FileText,
  Eye,
  Download,
  Trash2,
  AlertTriangle,
  Loader2,
  Plus,
  RefreshCw,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import {
  VAULT_DOCUMENT_CATEGORIES,
  type VaultDocumentCategory,
} from '@/lib/security/vault'
import type { ClientDocumentItem } from '@/lib/db/client-documents'

interface SecureClientDocumentVaultProps {
  clientId: string
  clientName: string
}

export function SecureClientDocumentVault({
  clientId,
  clientName,
}: SecureClientDocumentVaultProps) {
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [isConfigured, setIsConfigured] = useState(false)
  const [isLocked, setIsLocked] = useState(true)
  const [, setLockedUntil] = useState<string | null>(null)
  const [, setFailedAttempts] = useState(0)

  // Password & Unlock state
  const [passwordInput, setPasswordInput] = useState('')
  const [unlockLoading, setUnlockLoading] = useState(false)
  const [unlockError, setUnlockError] = useState<string | null>(null)
  const [sessionToken, setSessionToken] = useState<string | null>(null)

  // Setup / Reset Generated Password Modal
  const [generatedPasswordModalOpen, setGeneratedPasswordModalOpen] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState('')
  const [copiedPassword, setCopiedPassword] = useState(false)
  const [setupLoading, setSetupLoading] = useState(false)

  // Documents state
  const [documents, setDocuments] = useState<ClientDocumentItem[]>([])
  const [docsLoading, setDocsLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadCategory, setUploadCategory] = useState<VaultDocumentCategory>('BULETIN')
  const [uploadDescription, setUploadDescription] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Delete confirmation modal
  const [deleteDoc, setDeleteDoc] = useState<ClientDocumentItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // 1. Fetch Vault Status
  useEffect(() => {
    let ignore = false
    async function loadStatus() {
      try {
        const res = await fetch(`/api/clients/${clientId}/vault/status`)
        if (res.ok && !ignore) {
          const data = await res.json()
          setIsConfigured(data.isConfigured)
          setIsLocked(data.isLocked)
          setLockedUntil(data.lockedUntil)
          setFailedAttempts(data.failedAttempts || 0)
        }
      } catch (err) {
        console.error('Failed to load vault status:', err)
      } finally {
        if (!ignore) setLoadingStatus(false)
      }
    }
    loadStatus()
    return () => {
      ignore = true
    }
  }, [clientId])

  // 2. Fetch Documents when unlocked
  const loadVaultDocuments = async () => {
    try {
      setDocsLoading(true)
      const res = await fetch(`/api/clients/${clientId}/documents`, {
        headers: sessionToken ? { 'x-vault-session': sessionToken } : {},
      })
      if (res.ok) {
        const data = await res.json()
        setDocuments(data || [])
      }
    } catch (err) {
      console.error('Failed to load documents:', err)
    } finally {
      setDocsLoading(false)
    }
  }

  useEffect(() => {
    if (!isLocked && isConfigured) {
      loadVaultDocuments()
    }
  }, [clientId, isLocked, isConfigured, sessionToken])

  // Handle Setup or Reset Vault Password
  const handleSetupOrResetVault = async () => {
    setSetupLoading(true)
    try {
      const res = await fetch(`/api/clients/${clientId}/vault/setup`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error('Eroare la configurarea vault-ului.')

      const data = await res.json()
      setGeneratedPassword(data.plaintextPassword)
      setCopiedPassword(false)
      setGeneratedPasswordModalOpen(true)
      setIsConfigured(true)
      setIsLocked(true)
      setPasswordInput('')
      setUnlockError(null)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Eroare la configurare.'
      alert(msg)
    } finally {
      setSetupLoading(false)
    }
  }

  // Handle Unlock
  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordInput.trim() || unlockLoading) return

    setUnlockLoading(true)
    setUnlockError(null)

    try {
      const res = await fetch(`/api/clients/${clientId}/vault/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput.trim() }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setSessionToken(data.sessionToken)
        setIsLocked(false)
        setPasswordInput('')
      } else {
        setUnlockError(data.error || 'Parolă incorectă.')
        if (data.lockedUntil) {
          setLockedUntil(data.lockedUntil)
        }
      }
    } catch {
      setUnlockError('Eroare de conexiune la deblocarea vault-ului.')
    } finally {
      setUnlockLoading(false)
    }
  }

  // Handle Lock
  const handleLockVault = async () => {
    try {
      await fetch(`/api/clients/${clientId}/vault/lock`, { method: 'POST' })
    } catch {
      // Ignore
    }
    setSessionToken(null)
    setIsLocked(true)
    setPasswordInput('')
    setUnlockError(null)
  }

  // Handle Copy Password
  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(generatedPassword)
      setCopiedPassword(true)
      setTimeout(() => setCopiedPassword(false), 2000)
    } catch {
      // Fallback
      prompt('Copiază parola Vault:', generatedPassword)
    }
  }

  // Handle Upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadFile || isUploading) return

    setIsUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('file', uploadFile)
      formData.append('category', uploadCategory)
      if (uploadDescription.trim()) {
        formData.append('description', uploadDescription.trim())
      }

      const res = await fetch(`/api/clients/${clientId}/documents`, {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Eroare la încărcarea documentului.')
      }

      setUploadFile(null)
      setUploadDescription('')
      setUploadModalOpen(false)
      loadVaultDocuments()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Eroare la încărcare.'
      setUploadError(msg)
    } finally {
      setIsUploading(false)
    }
  }

  // Handle Preview & Download
  const handlePreviewOrDownload = async (doc: ClientDocumentItem, isDownload: boolean = false) => {
    try {
      const res = await fetch(`/api/clients/${clientId}/documents/${doc.id}/signed-url`)
      const data = await res.json()

      if (!res.ok || !data.signedUrl) {
        alert(data.error || 'Nu s-a putut deschide documentul.')
        return
      }

      if (isDownload) {
        const link = document.createElement('a')
        link.href = data.signedUrl
        link.download = doc.original_filename
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        link.remove()
      } else {
        window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
      }
    } catch {
      alert('Eroare la accesarea documentului.')
    }
  }

  // Handle Delete
  const handleDeleteConfirm = async () => {
    if (!deleteDoc || isDeleting) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/clients/${clientId}/documents/${deleteDoc.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Eroare la ștergerea documentului.')
      }

      setDeleteDoc(null)
      loadVaultDocuments()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Eroare la ștergere.'
      alert(msg)
    } finally {
      setIsDeleting(false)
    }
  }

  const getCategoryBadge = (cat: VaultDocumentCategory) => {
    const badges: Record<VaultDocumentCategory, { bg: string; text: string; border: string }> = {
      BULETIN: { bg: 'bg-blue-50 dark:bg-blue-950/60', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
      CONTRACT: { bg: 'bg-emerald-50 dark:bg-emerald-950/60', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' },
      RAPORT: { bg: 'bg-purple-50 dark:bg-purple-950/60', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
      FINANCIAR: { bg: 'bg-amber-50 dark:bg-amber-950/60', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
      ASIGURARE: { bg: 'bg-indigo-50 dark:bg-indigo-950/60', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800' },
      IMOBIL: { bg: 'bg-cyan-50 dark:bg-cyan-950/60', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-800' },
      IDENTITATE: { bg: 'bg-rose-50 dark:bg-rose-950/60', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800' },
      ALTELE: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-700' },
    }
    const b = badges[cat] || badges.ALTELE
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${b.bg} ${b.text} ${b.border}`}>
        {cat}
      </span>
    )
  }

  const filteredDocs = documents.filter((doc) => {
    if (selectedCategory !== 'ALL' && doc.category !== selectedCategory) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      const match =
        doc.original_filename.toLowerCase().includes(q) ||
        (doc.description && doc.description.toLowerCase().includes(q)) ||
        doc.category.toLowerCase().includes(q)
      if (!match) return false
    }
    return true
  })

  if (loadingStatus) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
        <p className="text-xs text-slate-500 mt-2">Se verifică securitatea Vault-ului privat...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-slate-950 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Lock className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                🔐 Documente Private & Vault Securizat
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
                Layer 2 Encryption
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Zonă dedicată documentelor confidențiale pentru {clientName}. Stocare privată izolată.
            </p>
          </div>
        </div>

        {isConfigured && !isLocked && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleSetupOrResetVault}
              disabled={setupLoading}
              className="gap-1.5 text-xs h-9"
              title="Schimbă parola Vault-ului cu una nouă criptografică"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Regenerare Parolă</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleLockVault}
              className="gap-1.5 text-xs h-9 text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/40"
            >
              <Lock className="w-3.5 h-3.5 text-red-500" />
              <span>Blochează Vault</span>
            </Button>
          </div>
        )}
      </div>

      {/* STATE 1: Vault NOT Setup */}
      {!isConfigured && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center max-w-lg mx-auto shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mx-auto">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Activează Vault-ul Securizat pentru {clientName}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Vault-ul oferă o cheie de protecție Layer 2 criptografică per-client pentru izolarea documentelor confidențiale (buletin, contracte, extrase bancare).
            </p>
          </div>
          <Button
            onClick={handleSetupOrResetVault}
            disabled={setupLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 px-5 py-2.5 shadow-xs cursor-pointer"
          >
            {setupLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generare cheie...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Configurează Parolă Vault</span>
              </>
            )}
          </Button>
        </div>
      )}

      {/* STATE 2: Vault Configured but LOCKED */}
      {isConfigured && isLocked && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 max-w-md mx-auto shadow-sm space-y-5">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              🔒 Vault Blocat
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Introduceți parola Vault (ex: <span className="font-mono">CV-VLT-XXXX-XXXX-XXXX</span>) pentru a accesa documentele.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <Input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Introduceți parola Vault..."
                disabled={unlockLoading}
                className="text-center font-mono tracking-wider text-sm"
                autoFocus
              />
            </div>

            {unlockError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl text-xs font-semibold text-red-700 dark:text-red-300">
                {unlockError}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                disabled={!passwordInput.trim() || unlockLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 shadow-xs cursor-pointer h-10"
              >
                {unlockLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verificare...</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4" />
                    <span>Deschide Vault</span>
                  </>
                )}
              </Button>

              <button
                type="button"
                onClick={handleSetupOrResetVault}
                disabled={setupLoading}
                className="text-xs text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 py-1.5 transition font-medium cursor-pointer text-center"
              >
                Ați uitat parola? Regenerare parolă Vault
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STATE 3: Vault UNLOCKED (Active Document Workspace) */}
      {isConfigured && !isLocked && (
        <div className="space-y-4">
          {/* Controls bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* Category tabs */}
              <button
                type="button"
                onClick={() => setSelectedCategory('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  selectedCategory === 'ALL'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Toate ({documents.length})
              </button>
              {VAULT_DOCUMENT_CATEGORIES.map((cat) => {
                const count = documents.filter((d) => d.category === cat).length
                if (count === 0 && selectedCategory !== cat) return null
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {cat} ({count})
                  </button>
                )
              })}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-60">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Caută document..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white"
                />
              </div>

              <Button
                size="sm"
                onClick={() => setUploadModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-1.5 h-8 text-xs shrink-0 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Încarcă document</span>
              </Button>
            </div>
          </div>

          {/* Document list */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            {docsLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600 mx-auto" />
                <p className="text-xs text-slate-400 mt-2">Se încarcă documentele...</p>
              </div>
            ) : filteredDocs.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Niciun document în această secțiune
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Nu există documente private încărcate pentru această categorie. Folosiți butonul &quot;+ Încarcă document&quot; pentru a adăuga buletine, contracte sau rapoarte.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm truncate">
                            {doc.original_filename}
                          </span>
                          {getCategoryBadge(doc.category)}
                        </div>

                        {doc.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                            {doc.description}
                          </p>
                        )}

                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                          <span>{new Date(doc.created_at).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          <span>•</span>
                          <span>{(doc.file_size / 1024).toFixed(1)} KB</span>
                          {doc.uploaded_by && (
                            <>
                              <span>•</span>
                              <span>Încărcat de {doc.uploaded_by}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePreviewOrDownload(doc, false)}
                        className="h-8 text-xs font-semibold gap-1"
                        title="Previzualizare document (link securizat temporar)"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        <span>Preview</span>
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePreviewOrDownload(doc, true)}
                        className="h-8 text-xs font-semibold gap-1"
                        title="Descărcare document"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-600" />
                        <span>Descarcă</span>
                      </Button>

                      <button
                        type="button"
                        onClick={() => setDeleteDoc(doc)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition cursor-pointer"
                        title="Șterge document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Generated Password (Shown ONCE) */}
      <Modal
        isOpen={generatedPasswordModalOpen}
        onClose={() => setGeneratedPasswordModalOpen(false)}
        title="🔐 CHEIE DE ACCES VAULT GENERATĂ"
        maxWidth="md"
      >
        <div className="text-xs text-neutral-500 mb-3">
          Salvați această parolă într-un loc sigur. Din motive de securitate, nu va mai fi afișată niciodată!
        </div>
        <div className="space-y-4 pt-1">
          <div className="p-4 bg-slate-950 text-white rounded-2xl border border-slate-800 text-center space-y-2">
            <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              Parolă Criptografică Unică
            </div>
            <div className="font-mono text-lg sm:text-xl font-extrabold tracking-widest text-emerald-400 select-all">
              {generatedPassword}
            </div>
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <strong>Important:</strong> În baza de date se păstrează exclusiv un hash criptografic scrypt. Serverul nu poate recupera parola în clar dacă este pierdută.
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              onClick={handleCopyPassword}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 shadow-xs cursor-pointer"
            >
              {copiedPassword ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copiată!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiază Parola</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => setGeneratedPasswordModalOpen(false)}
            >
              Am salvat parola
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL: Upload Document */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="+ ÎNCARCĂ DOCUMENT ÎN VAULT"
        maxWidth="lg"
      >
        <div className="text-xs text-neutral-500 mb-3">
          Adaugă un document confidențial pentru <span className="font-semibold text-neutral-900">{clientName}</span>
        </div>
        <form onSubmit={handleUploadSubmit} className="space-y-4 pt-1">
          {uploadError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl text-xs font-semibold text-red-700 dark:text-red-300">
              {uploadError}
            </div>
          )}

          {/* File Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Selectează Fișierul <span className="text-red-500">*</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx"
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Formate acceptate: PDF, JPG, PNG, WEBP, DOC, DOCX, XLS, XLSX (max. 50MB)
            </p>
          </div>

          {/* Category Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Categorie Document
            </label>
            <Select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value as VaultDocumentCategory)}
              options={VAULT_DOCUMENT_CATEGORIES.map((c) => ({
                value: c,
                label: c,
              }))}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Descriere / Observații (Opțional)
            </label>
            <Input
              value={uploadDescription}
              onChange={(e) => setUploadDescription(e.target.value)}
              placeholder="Ex: Buletin seria RT nr 123456 valabil 2030..."
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setUploadModalOpen(false)}
              disabled={isUploading}
            >
              Renunță
            </Button>
            <Button
              type="submit"
              disabled={!uploadFile || isUploading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Încărcare...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Încarcă în Vault</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Delete Confirmation */}
      <Modal
        isOpen={Boolean(deleteDoc)}
        onClose={() => setDeleteDoc(null)}
        title="Confirmă Ștergerea Documentului"
        maxWidth="sm"
      >
        <div className="text-xs text-neutral-500 mb-3">
          Această acțiune este ireversibilă și va șterge documentul din stocarea privată securizată.
        </div>
        <div className="space-y-4 pt-2">
          <p className="text-xs text-slate-700 dark:text-slate-300">
            Sigur doriți să ștergeți documentul{' '}
            <strong className="font-semibold">{deleteDoc?.original_filename}</strong>?
          </p>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDoc(null)}
              disabled={isDeleting}
            >
              Renunță
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white font-bold gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Ștergere...</span>
                </>
              ) : (
                <span>Șterge Document</span>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
