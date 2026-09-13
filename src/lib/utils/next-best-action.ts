import { getClientActivities } from '@/lib/db/activities'
import { getFollowUpsByView } from '@/lib/db/follow-ups'
import { getUpcomingBirthdays } from '@/lib/db/personal-events'
import type { Database } from '@/types'

type FollowUpRow = Database['public']['Tables']['follow_ups']['Row']
type PersonalEventRow = Database['public']['Tables']['personal_events']['Row']

export interface Recommendation {
  id: string
  type: 'CALL' | 'WHATSAPP' | 'EMAIL' | 'VIEW_PROPERTY' | 'REQUEST_DOCUMENTS' | 'SEND_RENEWAL' | 'REQUEST_FEEDBACK' | 'PERSONAL_MESSAGE'
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  title: string
  reason: string
  clientId: string
  clientName: string
  actions: string[]
}

export async function getNextBestActions(clientId: string, clientName: string): Promise<Recommendation[]> {
  const recommendations: Recommendation[] = []
  
  try {
    const [activities, overdueFollowUps, upcomingBirthdays] = await Promise.all([
      getClientActivities(clientId),
      getFollowUpsByView('overdue'),
      getUpcomingBirthdays(30),
    ])

    const clientOverdueFollowUps = (overdueFollowUps as FollowUpRow[]).filter((f) => f.client_id === clientId)
    const clientUpcomingBirthdays = (upcomingBirthdays as PersonalEventRow[]).filter((b) => b.client_id === clientId)

    if (clientOverdueFollowUps.length > 0) {
      recommendations.push({
        id: `overdue-${Date.now()}`,
        type: 'CALL',
        priority: 'URGENT',
        title: 'Complete overdue follow-up',
        reason: `${clientOverdueFollowUps.length} overdue follow-up${clientOverdueFollowUps.length > 1 ? 's' : ''} pending`,
        clientId,
        clientName,
        actions: ['Call', 'WhatsApp', 'Complete follow-up'],
      })
    }

    if (activities.length > 0) {
      const lastActivity = activities[0]
      const daysSinceLastContact = Math.floor(
        (Date.now() - new Date(lastActivity.date).getTime()) / (1000 * 60 * 60 * 24)
      )

      if (daysSinceLastContact > 30) {
        recommendations.push({
          id: `no-contact-${Date.now()}`,
          type: 'CALL',
          priority: 'HIGH',
          title: 'Reconnect with client',
          reason: `No contact in ${daysSinceLastContact} days`,
          clientId,
          clientName,
          actions: ['Call', 'WhatsApp', 'Email'],
        })
      } else if (daysSinceLastContact > 14) {
        recommendations.push({
          id: `check-in-${Date.now()}`,
          type: 'WHATSAPP',
          priority: 'NORMAL',
          title: 'Check in with client',
          reason: `No contact in ${daysSinceLastContact} days`,
          clientId,
          clientName,
          actions: ['WhatsApp', 'Email'],
        })
      }
    } else {
      recommendations.push({
        id: `first-contact-${Date.now()}`,
        type: 'CALL',
        priority: 'HIGH',
        title: 'Make first contact',
        reason: 'No recorded activity with this client',
        clientId,
        clientName,
        actions: ['Call', 'WhatsApp', 'Email'],
      })
    }

    if (clientUpcomingBirthdays.length > 0) {
      const birthday = clientUpcomingBirthdays[0]
      const eventDate = new Date(birthday.event_date)
      const currentYear = new Date().getFullYear()
      const thisYearBirthday = new Date(currentYear, eventDate.getMonth(), eventDate.getDate())
      const daysUntil = Math.ceil((thisYearBirthday.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

      if (daysUntil <= 7) {
        recommendations.push({
          id: `birthday-${Date.now()}`,
          type: 'WHATSAPP',
          priority: daysUntil <= 1 ? 'HIGH' : 'NORMAL',
          title: `Birthday ${daysUntil === 0 ? 'today!' : daysUntil === 1 ? 'tomorrow' : `in ${daysUntil} days`}`,
          reason: `Client's birthday is ${daysUntil === 0 ? 'today' : daysUntil === 1 ? 'tomorrow' : `in ${daysUntil} days`}`,
          clientId,
          clientName,
          actions: ['WhatsApp', 'Call', 'Send message'],
        })
      }
    }

    const viewingActivities = activities.filter((a) => a.type === 'VIEWING')
    if (viewingActivities.length > 0) {
      const lastViewing = viewingActivities[0]
      const daysSinceViewing = Math.floor(
        (Date.now() - new Date(lastViewing.date).getTime()) / (1000 * 60 * 60 * 24)
      )

      if (daysSinceViewing <= 3 && !lastViewing.notes) {
        recommendations.push({
          id: `feedback-${Date.now()}`,
          type: 'WHATSAPP',
          priority: 'NORMAL',
          title: 'Request viewing feedback',
          reason: `Viewing completed ${daysSinceViewing} day${daysSinceViewing > 1 ? 's' : ''} ago without feedback`,
          clientId,
          clientName,
          actions: ['WhatsApp', 'Call', 'Request feedback'],
        })
      }
    }

    recommendations.sort((a, b) => {
      const priorityOrder = { URGENT: 0, HIGH: 1, NORMAL: 2, LOW: 3 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })

  } catch (error) {
    console.error('Error generating recommendations:', error)
  }

  return recommendations.slice(0, 3)
}
