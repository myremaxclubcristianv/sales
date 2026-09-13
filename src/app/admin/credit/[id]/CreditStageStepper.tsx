'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'

const STAGES = [
  { key: 'LEAD', label: '1. Lead' },
  { key: 'QUALIFICATION', label: '2. Qualification' },
  { key: 'ANALYSIS', label: '3. Analysis' },
  { key: 'DOCUMENTS', label: '4. Documents' },
  { key: 'OFFERS', label: '5. Offers' },
  { key: 'APPROVAL', label: '6. Approval' },
  { key: 'CONTRACT', label: '7. Contract' },
  { key: 'COMPLETED', label: '8. Completed' },
]

interface Props {
  caseId: string
  currentStatus: string
}

export function CreditStageStepper({ caseId, currentStatus }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [updating, setUpdating] = useState(false)

  const currentIndex = STAGES.findIndex((s) => s.key === status)

  const handleSelectStage = async (newStageKey: string) => {
    setStatus(newStageKey)
    setUpdating(true)

    try {
      const res = await fetch(`/api/credit/cases/${caseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStageKey }),
      })

      if (!res.ok) throw new Error('Stage transition failed')
      router.refresh()
    } catch (err) {
      console.error(err)
      setStatus(currentStatus)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
          Pipeline Progression
        </span>
        <span className="text-xs font-semibold text-emerald-600">
          Stage {currentIndex >= 0 ? currentIndex + 1 : 1} of {STAGES.length}
        </span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {STAGES.map((stage, idx) => {
          const isPassed = currentIndex > idx
          const isCurrent = stage.key === status

          return (
            <button
              key={stage.key}
              disabled={updating}
              onClick={() => handleSelectStage(stage.key)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                isCurrent
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-sm'
                  : isPassed
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 hover:bg-emerald-100'
                  : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400 hover:bg-neutral-200'
              }`}
            >
              {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
              <span>{stage.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
