'use client'

import { useState } from 'react'
import { PrivateLayout } from '@/components/layout/private/PrivateLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useRouter } from 'next/navigation'

export default function NewFollowUpPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    client_id: '',
    reason: '',
    due_date: '',
    due_time: '',
    priority: 'NORMAL',
    notes: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const dueDateTime = formData.due_date && formData.due_time
        ? `${formData.due_date}T${formData.due_time}`
        : new Date().toISOString()

      const response = await fetch('/api/follow-ups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          due_date: dueDateTime,
        }),
      })

      if (response.ok) {
        router.push('/admin/follow-ups')
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to create follow-up')
      }
    } catch {
      alert('An error occurred while creating follow-up')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PrivateLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">New Follow-up</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg border border-gray-200 p-6">
          <Input
            label="Client ID"
            name="client_id"
            value={formData.client_id}
            onChange={handleInputChange}
            required
            placeholder="Enter client ID"
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Reason</label>
            <input
              type="text"
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              required
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Follow-up reason"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Due Date"
              name="due_date"
              type="date"
              value={formData.due_date}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Due Time"
              name="due_time"
              type="time"
              value={formData.due_time}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="LOW">Low</option>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Follow-up'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </PrivateLayout>
  )
}
