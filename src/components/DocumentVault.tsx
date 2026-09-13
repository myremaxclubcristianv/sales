'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface DocumentItem {
  id: string
  file_name: string
  file_type: string
  category: string | null
  folder_name: string | null
  created_at: string
}

interface DocumentFolder {
  id: string
  name: string
}

interface DocumentVaultProps {
  clientId: string
  documents: DocumentItem[]
  folders: DocumentFolder[]
  onDocumentUploaded?: () => void
  onFolderCreated?: () => void
}

export function DocumentVault({ clientId, documents, folders, onDocumentUploaded, onFolderCreated }: DocumentVaultProps) {
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [showFolderForm, setShowFolderForm] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [folderName, setFolderName] = useState('')

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('client_id', clientId)
      if (selectedFolder) {
        formData.append('folder_name', selectedFolder)
      }

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        setShowUploadForm(false)
        setSelectedFolder(null)
        onDocumentUploaded?.()
      } else {
        alert('Failed to upload document')
      }
    } catch {
      alert('An error occurred during upload')
    } finally {
      setUploading(false)
    }
  }

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!folderName.trim()) return

    try {
      const response = await fetch('/api/documents/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: folderName,
          client_id: clientId,
        }),
      })

      if (response.ok) {
        setFolderName('')
        setShowFolderForm(false)
        onFolderCreated?.()
      } else {
        alert('Failed to create folder')
      }
    } catch {
      alert('An error occurred during folder creation')
    }
  }

  const getCategoryColor = (category: string | null) => {
    const colors: Record<string, string> = {
      general: 'bg-gray-100 text-gray-800',
      real_estate: 'bg-blue-100 text-blue-800',
      insurance: 'bg-green-100 text-green-800',
      credit: 'bg-purple-100 text-purple-800',
      other: 'bg-orange-100 text-orange-800',
    }
    return (category && colors[category]) || 'bg-gray-100 text-gray-800'
  }

  const filteredDocuments = selectedFolder
    ? documents.filter((doc) => doc.folder_name === selectedFolder)
    : documents.filter((doc) => !doc.folder_name)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Client Private Documents</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFolderForm(true)}>
            + New Folder
          </Button>
          <Button size="sm" onClick={() => setShowUploadForm(true)}>
            + Upload Document
          </Button>
        </div>
      </div>

      {showFolderForm && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <form onSubmit={handleCreateFolder} className="flex gap-2">
            <Input
              placeholder="Folder name (e.g., Contracts, KYC, Deeds)"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="sm">Create</Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowFolderForm(false)}
            >
              Cancel
            </Button>
          </form>
        </div>
      )}

      {showUploadForm && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Select Folder (optional)</label>
              <select
                value={selectedFolder || ''}
                onChange={(e) => setSelectedFolder(e.target.value || null)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Root / General</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.name}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Upload File</label>
              <input
                type="file"
                onChange={handleFileUpload}
                disabled={uploading}
                className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowUploadForm(false)
                  setSelectedFolder(null)
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {folders.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedFolder(null)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              selectedFolder === null
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Documents
          </button>
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => setSelectedFolder(folder.name)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedFolder === folder.name
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              📁 {folder.name}
            </button>
          ))}
        </div>
      )}

      {filteredDocuments.length === 0 ? (
        <div className="text-center py-8 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          <p className="text-sm font-medium text-slate-600">No documents in this category.</p>
          <p className="text-xs text-slate-400 mt-0.5">Upload deeds, KYC files, or financial records.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredDocuments.map((document) => (
            <div
              key={document.id}
              className="flex items-center justify-between bg-white border border-slate-200/80 rounded-xl p-3 hover:bg-slate-50/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 text-sm">
                  📄
                </div>
                <div>
                  <p className="font-semibold text-xs text-slate-900">{document.file_name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${getCategoryColor(document.category)}`}>
                      {document.category || 'General'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(document.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Preview</Button>
                <Button variant="outline" size="sm">Download</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
