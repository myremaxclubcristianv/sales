import React from 'react'

interface Activity {
  id: string
  type: string
  title: string
  notes?: string | null
  date: string
}

interface ActivityTimelineProps {
  activities: Activity[]
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
        <p className="text-sm font-medium text-slate-600">No activities recorded yet.</p>
        <p className="text-xs text-slate-400 mt-0.5">Use the form to log calls, emails, meetings or notes.</p>
      </div>
    )
  }

  const getActivityIcon = (type: string) => {
    const icons: Record<string, string> = {
      CALL: '📞',
      WHATSAPP: '💬',
      EMAIL: '✉️',
      MEETING: '👥',
      NOTE: '📝',
      VIEWING: '🏠',
      FOLLOW_UP: '📅',
      TASK: '✅',
      DOCUMENT: '📄',
      OFFER: '💰',
      STATUS_CHANGE: '🔄',
    }
    return icons[type] || '📌'
  }

  return (
    <div className="space-y-3">
      {activities.map((activity, index) => (
        <div key={activity.id} className="relative">
          {index !== activities.length - 1 && (
            <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-slate-200" />
          )}
          <div className="flex gap-3.5">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-sm shadow-2xs">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-xs text-slate-900">{activity.title}</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(activity.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-600 rounded-md uppercase tracking-wider">
                  {activity.type.replace('_', ' ')}
                </span>
              </div>
              {activity.notes && (
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{activity.notes}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
