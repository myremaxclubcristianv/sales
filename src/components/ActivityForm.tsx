'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Clock, ChevronDown, ChevronUp } from 'lucide-react'

interface ActivityFormProps {
  clientId: string
  onActivityCreated?: () => void
}

export function ActivityForm({ clientId, onActivityCreated }: ActivityFormProps) {
  const [loading, setLoading] = useState(false)
  const [showNextFollowUp, setShowNextFollowUp] = useState(false)
  const [formData, setFormData] = useState({
    type: 'CALL',
    title: '',
    notes: '',
  })

  // Optional Next Follow-up fields
  const [followUpData, setFollowUpData] = useState(() => ({
    reason: '',
    due_date: '',
    due_time: '11:00',
    priority: 'NORMAL',
    notes: '',
  }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. Create the activity
      const activityRes = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          client_id: clientId,
          date: new Date().toISOString(),
        }),
      })

      if (!activityRes.ok) {
        const err = await activityRes.json()
        throw new Error(err.error || 'Eroare la înregistrarea activității')
      }

      // 2. If Next Follow-up is enabled and has reason, create the follow-up
      if (showNextFollowUp && followUpData.reason.trim()) {
        const dueDateTime = `${followUpData.due_date}T${followUpData.due_time}:00`
        const followUpRes = await fetch('/api/follow-ups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: clientId,
            reason: followUpData.reason.trim(),
            due_date: dueDateTime,
            priority: followUpData.priority,
            notes: followUpData.notes || formData.notes,
            status: 'PENDING',
          }),
        })

        if (!followUpRes.ok) {
          console.error('Follow-up auto creation failed')
        }
      }

      // Reset form
      setFormData({ type: 'CALL', title: '', notes: '' })
      setShowNextFollowUp(false)
      setFollowUpData({
        reason: '',
        due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        due_time: '11:00',
        priority: 'NORMAL',
        notes: '',
      })

      onActivityCreated?.()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'A apărut o eroare.'
      alert(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
          Tip Activitate *
        </label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-900 font-medium"
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
        label="Titlu Activitate *"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
        placeholder="ex: Discuție telefon feedback / cerere credit..."
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
          Detalii / Concluzii Notă
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-900 placeholder:text-slate-400 font-medium"
          placeholder="Notează concluziile discuției..."
        />
      </div>

      {/* Next Follow-Up Expandable Toggle */}
      <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-3">
        <button
          type="button"
          onClick={() => setShowNextFollowUp(!showNextFollowUp)}
          className="w-full flex items-center justify-between text-xs font-bold text-amber-900 hover:text-amber-950 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>+ Setează Următorul Follow-up (Next Follow-up)</span>
          </span>
          {showNextFollowUp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showNextFollowUp && (
          <div className="space-y-3 pt-2 border-t border-amber-200/60 animate-in fade-in duration-150">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-amber-800">Motiv Follow-up *</label>
              <input
                type="text"
                placeholder="ex: Revenire ofertă apartament / verificare decizie"
                value={followUpData.reason}
                onChange={(e) => setFollowUpData({ ...followUpData, reason: e.target.value })}
                required={showNextFollowUp}
                className="w-full px-3 py-1.5 text-xs bg-white border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-amber-800">Dată Follow-up</label>
                <input
                  type="date"
                  value={followUpData.due_date}
                  onChange={(e) => setFollowUpData({ ...followUpData, due_date: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-amber-300 rounded-lg text-slate-900"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-amber-800">Ora</label>
                <input
                  type="time"
                  value={followUpData.due_time}
                  onChange={(e) => setFollowUpData({ ...followUpData, due_time: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-amber-300 rounded-lg text-slate-900"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-amber-800">Prioritate</label>
              <select
                value={followUpData.priority}
                onChange={(e) => setFollowUpData({ ...followUpData, priority: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-amber-300 rounded-lg text-slate-900"
              >
                <option value="LOW">Low</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div className="text-[11px] text-amber-800 flex items-center gap-1.5 pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <span>Reminders automate: 7 zile înainte / 2 zile înainte / în ziua respectivă.</span>
            </div>
          </div>
        )}
      </div>

      <Button type="submit" disabled={loading} className="w-full min-h-[40px] text-xs font-bold">
        {loading ? 'Se înregistrează...' : showNextFollowUp ? 'Înregistrează Activitate + Follow-up' : 'Înregistrează Activitatea'}
      </Button>
    </form>
  )
}
