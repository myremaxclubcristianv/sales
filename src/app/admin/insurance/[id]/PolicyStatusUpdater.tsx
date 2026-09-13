'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Select } from '@/components/ui/Select'

interface Props {
  policyId: string
  currentStatus: string
}

export function PolicyStatusUpdater({ policyId, currentStatus }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [updating, setUpdating] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus)
    setUpdating(true)

    try {
      const res = await fetch(`/api/insurance/policies/${policyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        throw new Error('Failed to update status')
      }

      router.refresh()
    } catch (err) {
      console.error(err)
      setStatus(currentStatus)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={status}
        disabled={updating}
        onChange={(e) => handleStatusChange(e.target.value)}
        className="text-xs h-9 py-1 px-3 w-40 font-semibold"
      >
        <option value="ACTIVE">ACTIVE</option>
        <option value="PENDING_RENEWAL">PENDING_RENEWAL</option>
        <option value="EXPIRED">EXPIRED</option>
        <option value="CANCELLED">CANCELLED</option>
      </Select>
    </div>
  )
}
