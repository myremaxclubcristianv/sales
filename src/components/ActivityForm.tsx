'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface ActivityFormProps {
  clientId: string
  onActivityCreated?: () => void
}

export function ActivityForm({ clientId, onActivityCreated }: ActivityFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: 'NOTE',
    title: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          client_id: clientId,
          date: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        setFormData({ type: 'NOTE', title: '', notes: '' })
        onActivityCreated?.()
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to create activity')
      }
    } catch {
      alert('An error occurred while creating the activity')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Activity Type</label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
        >
          <option value="CALL">Call</option>
          <option value="WHATSAPP">WhatsApp</option>
          <option value="EMAIL">Email</option>
          <option value="MEETING">Meeting</option>
          <option value="NOTE">Note</option>
          <option value="VIEWING">Viewing</option>
          <option value="FOLLOW_UP">Follow-up</option>
          <option value="TASK">Task</option>
          <option value="DOCUMENT">Document</option>
          <option value="OFFER">Offer</option>
          <option value="STATUS_CHANGE">Status Change</option>
        </select>
      </div>

      <Input
        label="Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
        placeholder="e.g., Follow-up on penthouse offer"
      />

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
          placeholder="Enter notes from conversation or meeting..."
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Recording...' : 'Record Activity'}
      </Button>
    </form>
  )
}
