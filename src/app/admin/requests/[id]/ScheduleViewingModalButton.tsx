'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Calendar } from 'lucide-react'

interface PropertyOption {
  id: string
  title: string
  location: string
  price: number | null
  currency: string
}

interface Props {
  clientId: string
  clientName: string
  properties: PropertyOption[]
}

export function ScheduleViewingModalButton({ clientId, clientName, properties }: Props) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState(() => ({
    property_id: properties[0]?.id || '',
    date: new Date(Date.now() + 86400000).toISOString().slice(0, 16), // Tomorrow same time
    notes: '',
  }))

  const handleOpen = () => {
    if (properties.length > 0 && !formData.property_id) {
      setFormData((prev) => ({ ...prev, property_id: properties[0].id }))
    }
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!formData.property_id) {
      setError('Please select a property')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/viewings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          property_id: formData.property_id,
          date: new Date(formData.date).toISOString(),
          notes: formData.notes,
          status: 'SCHEDULED',
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to schedule viewing')
      }

      setIsOpen(false)
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error scheduling viewing'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button onClick={handleOpen} variant="secondary" className="gap-2 text-xs">
        <Calendar className="w-4 h-4" />
        Schedule Viewing
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Schedule Property Viewing">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
              Client
            </label>
            <Input value={clientName} disabled className="bg-neutral-100 dark:bg-neutral-800" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
              Select Property *
            </label>
            {properties.length === 0 ? (
              <p className="text-xs text-red-500">No properties available in inventory.</p>
            ) : (
              <Select
                value={formData.property_id}
                onChange={(e) => setFormData({ ...formData, property_id: e.target.value })}
                required
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} - {p.price ? `${p.price.toLocaleString()} ${p.currency}` : 'Price on request'} ({p.location})
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
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
              Special Instructions / Notes
            </label>
            <textarea
              rows={3}
              placeholder="Key pickup instructions, parking, client specific interests..."
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Scheduling...' : 'Confirm Viewing'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
