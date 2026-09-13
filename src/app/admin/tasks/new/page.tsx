'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PrivateLayout } from '@/components/layout/private/PrivateLayout'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'

interface ClientOption {
  id: string
  first_name: string
  last_name: string
}

interface PropertyOption {
  id: string
  title: string
}

export default function NewTaskPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [clients, setClients] = useState<ClientOption[]>([])
  const [properties, setProperties] = useState<PropertyOption[]>([])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'NORMAL',
    status: 'TODO',
    client_id: '',
    property_id: '',
  })

  useEffect(() => {
    async function loadOptions() {
      try {
        const [clientsRes, propsRes] = await Promise.all([
          fetch('/api/clients'),
          fetch('/api/properties'),
        ])
        if (clientsRes.ok) {
          const cData = await clientsRes.json()
          setClients(cData.clients || [])
        }
        if (propsRes.ok) {
          const pData = await propsRes.json()
          setProperties(pData.properties || [])
        }
      } catch {
        // Best effort
      }
    }
    loadOptions()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create task')
      }

      router.push('/admin/tasks')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PrivateLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/tasks"
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Create Operational Task
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Schedule client deliverables, property preparations, or contract milestones.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-800">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6"
        >
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Prepare Cadastral Dossier & Notary Draft"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Priority Level
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              >
                <option value="LOW">Low</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Associated Client */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Related Client (Optional)
              </label>
              <select
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              >
                <option value="">No Client Linked</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.first_name} {c.last_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Associated Property */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Related Property (Optional)
              </label>
              <select
                value={formData.property_id}
                onChange={(e) => setFormData({ ...formData, property_id: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              >
                <option value="">No Property Linked</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Detailed Description / Deliverable Requirements
            </label>
            <textarea
              rows={3}
              placeholder="Instructions, document requirements, or follow-up notes..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link
              href="/admin/tasks"
              className="px-5 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-slate-50 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-slate-800 transition disabled:opacity-50 shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Creating...' : 'Save Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </PrivateLayout>
  )
}
