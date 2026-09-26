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
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tip Activitate *</label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-900 font-medium min-h-[44px]"
        >
          <option value="CALL">Apel telefonic (Call)</option>
          <option value="WHATSAPP">WhatsApp</option>
          <option value="EMAIL">Email</option>
          <option value="MEETING">Întâlnire (Meeting)</option>
          <option value="NOTE">Notă internă (Note)</option>
          <option value="VIEWING">Vizionare (Viewing)</option>
          <option value="FOLLOW_UP">Follow-up</option>
          <option value="TASK">Task</option>
          <option value="DOCUMENT">Document</option>
          <option value="OFFER">Ofertă (Offer)</option>
          <option value="STATUS_CHANGE">Schimbare Status</option>
        </select>
      </div>

      <Input
        label="Titlu *"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
        placeholder="ex: Discuție ofertă RCA / cerere credit"
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Detalii / Notițe</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-900 placeholder:text-slate-400 font-medium"
          placeholder="Notează concluziile discuției..."
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full min-h-[44px]">
        {loading ? 'Se înregistrează...' : 'Înregistrează Activitatea'}
      </Button>
    </form>
  )
}
