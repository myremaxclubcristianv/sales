import { getClientActivities } from '@/lib/db/activities'
import { getFollowUpsByView } from '@/lib/db/follow-ups'
import type { Database } from '@/types'

type FollowUpRow = Database['public']['Tables']['follow_ups']['Row']

export type RelationshipHealth = 'ACTIVE' | 'NEEDS_ATTENTION' | 'AT_RISK'

export interface RelationshipHealthInfo {
  status: RelationshipHealth
  reason: string
  score: number
}

export async function calculateRelationshipHealth(clientId: string): Promise<RelationshipHealthInfo> {
  try {
    const [activities, overdueFollowUps] = await Promise.all([
      getClientActivities(clientId),
      getFollowUpsByView('overdue'),
    ])

    const clientOverdueFollowUps = (overdueFollowUps as FollowUpRow[]).filter((f) => f.client_id === clientId)
    
    if (clientOverdueFollowUps.length > 0) {
      return {
        status: 'AT_RISK',
        reason: `${clientOverdueFollowUps.length} overdue follow-up${clientOverdueFollowUps.length > 1 ? 's' : ''}`,
        score: 20,
      }
    }

    if (activities.length === 0) {
      return {
        status: 'NEEDS_ATTENTION',
        reason: 'No recorded activity',
        score: 50,
      }
    }

    const lastActivity = activities[0]
    const daysSinceLastContact = Math.floor(
      (Date.now() - new Date(lastActivity.date).getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysSinceLastContact > 30) {
      return {
        status: 'NEEDS_ATTENTION',
        reason: `No contact in ${daysSinceLastContact} days`,
        score: 40,
      }
    }

    if (daysSinceLastContact > 14) {
      return {
        status: 'NEEDS_ATTENTION',
        reason: `No contact in ${daysSinceLastContact} days`,
        score: 60,
      }
    }

    return {
      status: 'ACTIVE',
      reason: `Recent contact (${daysSinceLastContact} days ago)`,
      score: 90,
    }
  } catch {
    return {
      status: 'NEEDS_ATTENTION',
      reason: 'Unable to calculate health',
      score: 50,
    }
  }
}

export function getHealthColor(status: RelationshipHealth): string {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800'
    case 'NEEDS_ATTENTION':
      return 'bg-yellow-100 text-yellow-800'
    case 'AT_RISK':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function getHealthIcon(status: RelationshipHealth): string {
  switch (status) {
    case 'ACTIVE':
      return '✅'
    case 'NEEDS_ATTENTION':
      return '⚠️'
    case 'AT_RISK':
      return '🔴'
    default:
      return '❓'
  }
}
