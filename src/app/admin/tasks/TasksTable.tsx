'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Circle, Calendar, User, Building, Trash2 } from 'lucide-react'
import type { getTasks } from '@/lib/db/tasks'

type TaskItem = Awaited<ReturnType<typeof getTasks>>[0]

interface Props {
  tasks: TaskItem[]
}

export function TasksTable({ tasks }: Props) {
  const router = useRouter()
  const [filter, setFilter] = useState<'ALL' | 'TODO' | 'IN_PROGRESS' | 'DONE' | 'OVERDUE'>('ALL')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const todayStr = new Date().toISOString().split('T')[0]

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'TODO') return t.status === 'TODO'
    if (filter === 'IN_PROGRESS') return t.status === 'IN_PROGRESS'
    if (filter === 'DONE') return t.status === 'DONE'
    if (filter === 'OVERDUE') {
      return (t.status === 'TODO' || t.status === 'IN_PROGRESS') && t.due_date && t.due_date < todayStr
    }
    return true
  })

  const toggleTaskStatus = async (task: TaskItem) => {
    setUpdatingId(task.id)
    const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE'

    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        router.refresh()
      }
    } catch (err) {
      console.error('Failed to toggle task status:', err)
    } finally {
      setUpdatingId(null)
    }
  }

  const deleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return
    setUpdatingId(id)

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        router.refresh()
      }
    } catch (err) {
      console.error('Failed to delete task:', err)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-4 sm:p-6">
      {/* Filters Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100">
        {(['ALL', 'TODO', 'IN_PROGRESS', 'OVERDUE', 'DONE'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
              filter === tab
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Task Rows */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12 text-xs text-slate-400">
          No tasks found matching this filter.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {filteredTasks.map((task) => {
            const isOverdue =
              (task.status === 'TODO' || task.status === 'IN_PROGRESS') &&
              task.due_date &&
              task.due_date < todayStr

            return (
              <div
                key={task.id}
                className="py-3.5 flex items-start justify-between gap-4 hover:bg-slate-50/60 p-2.5 rounded-xl transition"
              >
                {/* Checkbox / Status toggle */}
                <div className="flex items-start gap-3">
                  <button
                    disabled={updatingId === task.id}
                    onClick={() => toggleTaskStatus(task)}
                    className="mt-0.5 text-slate-400 hover:text-slate-900 transition disabled:opacity-50"
                  >
                    {task.status === 'DONE' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4
                        className={`text-sm font-semibold ${
                          task.status === 'DONE'
                            ? 'line-through text-slate-400'
                            : 'text-slate-900'
                        }`}
                      >
                        {task.title}
                      </h4>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          task.priority === 'URGENT'
                            ? 'bg-rose-100 text-rose-800'
                            : task.priority === 'HIGH'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {task.priority}
                      </span>
                      {isOverdue && (
                        <span className="px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold uppercase tracking-wider">
                          Overdue
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-500 line-clamp-1">{task.description}</p>
                    )}

                    {/* Metadata chips */}
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1 flex-wrap">
                      {task.due_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                        </div>
                      )}

                      {task.client && (
                        <Link
                          href={`/admin/clients/${task.client_id}`}
                          className="flex items-center gap-1 text-slate-700 hover:underline"
                        >
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {task.client.first_name} {task.client.last_name}
                          </span>
                        </Link>
                      )}

                      {task.property && (
                        <div className="flex items-center gap-1 text-slate-600">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span className="line-clamp-1">{task.property.title}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    disabled={updatingId === task.id}
                    onClick={() => deleteTask(task.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
