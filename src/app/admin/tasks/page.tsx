import { getTasks } from '@/lib/db/tasks'
import { PrivateLayout } from '@/components/layout/private/PrivateLayout'
import Link from 'next/link'
import { Plus, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'
import { TasksTable } from './TasksTable'

export const dynamic = 'force-dynamic'

export default async function TasksPage() {
  let tasks: Awaited<ReturnType<typeof getTasks>> = []
  try {
    tasks = await getTasks()
  } catch (err) {
    console.error('Error loading tasks:', err)
  }

  const todayStr = new Date().toISOString().split('T')[0]
  const pendingTasks = tasks.filter((t) => t.status === 'TODO' || t.status === 'IN_PROGRESS')
  const completedTasks = tasks.filter((t) => t.status === 'DONE')
  const overdueTasks = tasks.filter(
    (t) => (t.status === 'TODO' || t.status === 'IN_PROGRESS') && t.due_date && t.due_date < todayStr
  )
  const urgentTasks = tasks.filter(
    (t) => (t.status === 'TODO' || t.status === 'IN_PROGRESS') && (t.priority === 'HIGH' || t.priority === 'URGENT')
  )

  return (
    <PrivateLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Tasks &amp; Operational Directives
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Active operational tasks, client deliverables, due date management, and execution queue.
            </p>
          </div>
          <Link
            href="/admin/tasks/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-slate-800 transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Task</span>
          </Link>
        </div>

        {/* Task Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Tasks</span>
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">{pendingTasks.length}</div>
            <div className="text-xs text-slate-500 mt-1">To-do or in progression</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overdue</span>
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <div className={`mt-2 text-2xl font-bold ${overdueTasks.length > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {overdueTasks.length}
            </div>
            <div className="text-xs text-slate-500 mt-1">Require immediate execution</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">High / Urgent</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">{urgentTasks.length}</div>
            <div className="text-xs text-slate-500 mt-1">High priority directive files</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-emerald-600">{completedTasks.length}</div>
            <div className="text-xs text-slate-500 mt-1">Resolved directives</div>
          </div>
        </div>

        {/* Interactive Tasks Table */}
        <TasksTable tasks={tasks} />
      </div>
    </PrivateLayout>
  )
}
