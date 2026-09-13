'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Calendar, Plus, CheckCircle, XCircle, Clock, MapPin, User, MessageSquare } from 'lucide-react'
import Link from 'next/link'

export interface ViewingItem {
  id: string
  client_id: string
  property_id: string
  date: string
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  attendees: string[] | null
  notes: string | null
  feedback: string | null
  interest: 'high' | 'medium' | 'low' | 'none' | null
  next_action: string | null
  client: {
    id: string
    first_name: string
    last_name: string
    phone: string | null
    email: string | null
    preferred_communication: string
  } | null
  property: {
    id: string
    title: string
    slug: string
    location: string
    area: string
    price: number | null
    currency: string
    property_status: string
  } | null
}

interface ClientOption {
  id: string
  first_name: string
  last_name: string
}

interface PropertyOption {
  id: string
  title: string
  location: string
  price: number | null
  currency: string
}

interface Props {
  initialViewings: ViewingItem[]
  clients: ClientOption[]
  properties: PropertyOption[]
}

export function ViewingsManager({ initialViewings, clients, properties }: Props) {
  const router = useRouter()
  const viewings = initialViewings
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false)
  const [selectedViewing, setSelectedViewing] = useState<ViewingItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // New Viewing Form State
  const [newForm, setNewForm] = useState(() => ({
    client_id: clients[0]?.id || '',
    property_id: properties[0]?.id || '',
    date: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    notes: '',
  }))

  // Feedback Form State
  const [feedbackForm, setFeedbackForm] = useState<{
    status: 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
    interest: 'high' | 'medium' | 'low' | 'none'
    feedback: string
    next_action: string
  }>({
    status: 'COMPLETED',
    interest: 'high',
    feedback: '',
    next_action: '',
  })

  const filteredViewings = viewings.filter((v) => {
    if (statusFilter === 'ALL') return true
    return v.status === statusFilter
  })

  const handleCreateViewing = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/viewings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: newForm.client_id,
          property_id: newForm.property_id,
          date: new Date(newForm.date).toISOString(),
          notes: newForm.notes,
          status: 'SCHEDULED',
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to schedule viewing')
      }

      setIsNewModalOpen(false)
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error creating viewing'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenFeedback = (v: ViewingItem) => {
    setSelectedViewing(v)
    setFeedbackForm({
      status: 'COMPLETED',
      interest: (v.interest as 'high' | 'medium' | 'low' | 'none') || 'high',
      feedback: v.feedback || '',
      next_action: v.next_action || '',
    })
    setIsFeedbackModalOpen(true)
  }

  const handleSaveFeedback = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedViewing) return
    setLoading(true)

    try {
      const res = await fetch(`/api/viewings/${selectedViewing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackForm),
      })

      if (!res.ok) {
        throw new Error('Failed to update viewing feedback')
      }

      setIsFeedbackModalOpen(false)
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating feedback'
      alert(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/viewings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Status update failed')
      router.refresh()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header & New Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Property Viewings
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Track scheduled walkthroughs, client feedback ratings, and post-viewing next steps
          </p>
        </div>
        <Button onClick={() => setIsNewModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Schedule Viewing
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-neutral-900 p-3 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            statusFilter === 'ALL'
              ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          All ({viewings.length})
        </button>
        <button
          onClick={() => setStatusFilter('SCHEDULED')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            statusFilter === 'SCHEDULED'
              ? 'bg-blue-600 text-white'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          Scheduled ({viewings.filter((v) => v.status === 'SCHEDULED').length})
        </button>
        <button
          onClick={() => setStatusFilter('COMPLETED')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            statusFilter === 'COMPLETED'
              ? 'bg-emerald-600 text-white'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          Completed ({viewings.filter((v) => v.status === 'COMPLETED').length})
        </button>
        <button
          onClick={() => setStatusFilter('CANCELLED')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            statusFilter === 'CANCELLED'
              ? 'bg-amber-600 text-white'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          Cancelled ({viewings.filter((v) => v.status === 'CANCELLED').length})
        </button>
        <button
          onClick={() => setStatusFilter('NO_SHOW')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            statusFilter === 'NO_SHOW'
              ? 'bg-red-600 text-white'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          No Show ({viewings.filter((v) => v.status === 'NO_SHOW').length})
        </button>
      </div>

      {/* Viewings List */}
      {filteredViewings.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-12 text-center">
          <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-400">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            No viewings found
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Schedule a viewing with a buyer and property to log client feedback and offers.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredViewings.map((v) => {
            const vDate = new Date(v.date)
            const isUpcoming = vDate > new Date() && v.status === 'SCHEDULED'

            return (
              <div
                key={v.id}
                className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 shadow-sm space-y-4 hover:border-neutral-400 dark:hover:border-neutral-700 transition"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                        v.status === 'SCHEDULED'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                          : v.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : v.status === 'CANCELLED'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                          : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                      }`}
                    >
                      {v.status}
                    </span>
                    {isUpcoming && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" /> Upcoming
                      </span>
                    )}
                    {v.interest && (
                      <span
                        className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                          v.interest === 'high'
                            ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400'
                            : v.interest === 'medium'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                            : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                        }`}
                      >
                        Interest: {v.interest}
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-medium text-neutral-500">
                    {vDate.toLocaleDateString()} {vDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Property & Client Links */}
                <div className="space-y-2">
                  {v.property && (
                    <div>
                      <Link
                        href={`/admin/properties/${v.property.id}`}
                        className="text-base font-bold text-neutral-900 dark:text-neutral-100 hover:text-primary transition line-clamp-1"
                      >
                        {v.property.title}
                      </Link>
                      <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {v.property.area ? `${v.property.area}, ` : ''}
                        {v.property.location} •{' '}
                        {v.property.price
                          ? `${v.property.price.toLocaleString()} ${v.property.currency}`
                          : 'Price on request'}
                      </p>
                    </div>
                  )}

                  {v.client && (
                    <div className="p-2.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-neutral-400" />
                        <Link
                          href={`/admin/clients/${v.client.id}`}
                          className="font-semibold text-neutral-900 dark:text-neutral-100 hover:underline"
                        >
                          {v.client.first_name} {v.client.last_name}
                        </Link>
                      </div>
                      {v.client.phone && (
                        <a href={`tel:${v.client.phone}`} className="text-neutral-500 font-mono hover:underline">
                          {v.client.phone}
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Notes / Feedback */}
                {(v.notes || v.feedback || v.next_action) && (
                  <div className="text-xs space-y-1 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                    {v.notes && (
                      <p className="text-neutral-500 dark:text-neutral-400">
                        <span className="font-semibold text-neutral-700 dark:text-neutral-300">Notes:</span>{' '}
                        {v.notes}
                      </p>
                    )}
                    {v.feedback && (
                      <p className="text-neutral-600 dark:text-neutral-300 font-medium">
                        <span className="font-bold text-neutral-900 dark:text-neutral-100">Feedback:</span>{' '}
                        {v.feedback}
                      </p>
                    )}
                    {v.next_action && (
                      <p className="text-primary font-semibold">
                        <span>Next Step:</span> {v.next_action}
                      </p>
                    )}
                  </div>
                )}

                {/* Actions Footer */}
                <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenFeedback(v)}
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Log Feedback / Result
                  </button>

                  <div className="flex items-center gap-1.5">
                    {v.status === 'SCHEDULED' && (
                      <>
                        <button
                          onClick={() => handleQuickStatusChange(v.id, 'COMPLETED')}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition"
                          title="Mark Completed"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleQuickStatusChange(v.id, 'CANCELLED')}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition"
                          title="Mark Cancelled"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Schedule New Viewing Modal */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Schedule Property Viewing"
      >
        <form onSubmit={handleCreateViewing} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
              Select Client *
            </label>
            {clients.length === 0 ? (
              <p className="text-xs text-red-500">No clients found.</p>
            ) : (
              <Select
                value={newForm.client_id}
                onChange={(e) => setNewForm({ ...newForm, client_id: e.target.value })}
                required
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.first_name} {c.last_name}
                  </option>
                ))}
              </Select>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
              Select Property *
            </label>
            {properties.length === 0 ? (
              <p className="text-xs text-red-500">No properties available.</p>
            ) : (
              <Select
                value={newForm.property_id}
                onChange={(e) => setNewForm({ ...newForm, property_id: e.target.value })}
                required
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.location})
                  </option>
                ))}
              </Select>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
              Date & Time *
            </label>
            <Input
              type="datetime-local"
              required
              value={newForm.date}
              onChange={(e) => setNewForm({ ...newForm, date: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
              Viewing Notes
            </label>
            <textarea
              rows={3}
              placeholder="Key handover instructions, client requirements..."
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
              value={newForm.notes}
              onChange={(e) => setNewForm({ ...newForm, notes: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <Button type="button" variant="ghost" onClick={() => setIsNewModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Scheduling...' : 'Save Viewing'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Log Feedback Modal */}
      <Modal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        title="Record Viewing Feedback & Result"
      >
        <form onSubmit={handleSaveFeedback} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                Outcome Status
              </label>
              <Select
                value={feedbackForm.status}
                onChange={(e) =>
                  setFeedbackForm({
                    ...feedbackForm,
                    status: e.target.value as 'COMPLETED' | 'CANCELLED' | 'NO_SHOW',
                  })
                }
              >
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
                <option value="NO_SHOW">NO_SHOW</option>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                Client Interest Level
              </label>
              <Select
                value={feedbackForm.interest}
                onChange={(e) =>
                  setFeedbackForm({
                    ...feedbackForm,
                    interest: e.target.value as 'high' | 'medium' | 'low' | 'none',
                  })
                }
              >
                <option value="high">High (Ready for Offer)</option>
                <option value="medium">Medium (Liked features, comparing)</option>
                <option value="low">Low (Minor interest, reservations)</option>
                <option value="none">None (Rejected property)</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
              Client Feedback / Comments
            </label>
            <textarea
              rows={3}
              placeholder="What did the client like/dislike? Price feedback? Desired repairs or terms..."
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
              value={feedbackForm.feedback}
              onChange={(e) => setFeedbackForm({ ...feedbackForm, feedback: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
              Next Action Step
            </label>
            <Input
              placeholder="e.g. Prepare formal purchase offer draft by Friday"
              value={feedbackForm.next_action}
              onChange={(e) => setFeedbackForm({ ...feedbackForm, next_action: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <Button type="button" variant="ghost" onClick={() => setIsFeedbackModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Feedback'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
