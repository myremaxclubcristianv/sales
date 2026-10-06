import { createClient as createServerClient } from '@/lib/supabase/server'
import { deriveClientCategories } from '@/lib/db/calendar'
import { getBucharestDateParts, calculateAge } from '@/lib/utils/cnp'
import { notifyBirthdayTelegram, notifyFollowUpTelegram } from '@/lib/telegram/telegram'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface ReminderCheckResult {
  birthdayRemindersCreated: number
  followUpRemindersCreated: number
  telegramDispatched: number
  skippedAlreadyNotified: number
  details: string[]
}

function unwrap<T>(item: T | T[] | null | undefined): T | null {
  if (!item) return null
  return Array.isArray(item) ? item[0] || null : item
}

/**
 * Evaluates upcoming birthdays and active follow-ups for T-7 days, T-2 days, and T-0 day reminders.
 * Idempotently inserts persistent CRM notifications and dispatches Telegram alerts.
 * Uses Europe/Bucharest timezone for exact Romanian calendar calculations.
 */
export async function checkAndGenerateReminders(
  supabaseClient?: SupabaseClient
): Promise<ReminderCheckResult> {
  const supabase = supabaseClient || (await createServerClient())
  const todayParts = getBucharestDateParts(new Date())
  const todayUtc = Date.UTC(todayParts.year, todayParts.month - 1, todayParts.day)

  const result: ReminderCheckResult = {
    birthdayRemindersCreated: 0,
    followUpRemindersCreated: 0,
    telegramDispatched: 0,
    skippedAlreadyNotified: 0,
    details: [],
  }

  // 1. Check Birthdays
  const { data: clients } = await supabase
    .from('clients')
    .select(`
      id,
      first_name,
      last_name,
      date_of_birth,
      category,
      phone,
      client_relationships (relationship_type),
      insurance_policies (id),
      credit_cases (id)
    `)

  for (const client of clients || []) {
    if (!client.date_of_birth) continue
    const [, bMonthStr, bDayStr] = client.date_of_birth.split('-')
    const bMonth = Number(bMonthStr)
    const bDay = Number(bDayStr)
    if (!bMonth || !bDay) continue

    // Calculate next birthday date taking into account current year vs next year
    let targetYear = todayParts.year
    let targetUtc = Date.UTC(targetYear, bMonth - 1, bDay)
    let diffDays = Math.round((targetUtc - todayUtc) / (1000 * 60 * 60 * 24))

    // If this year's birthday has already passed, check next year's birthday
    if (diffDays < 0) {
      targetYear = todayParts.year + 1
      targetUtc = Date.UTC(targetYear, bMonth - 1, bDay)
      diffDays = Math.round((targetUtc - todayUtc) / (1000 * 60 * 60 * 24))
    }

    let reminderStage: '0d' | '2d' | '7d' | null = null
    if (diffDays === 0) reminderStage = '0d'
    else if (diffDays === 2) reminderStage = '2d'
    else if (diffDays === 7) reminderStage = '7d'

    if (reminderStage) {
      const { label } = deriveClientCategories(client)
      const fullName = `${client.first_name || ''} ${client.last_name || ''}`.trim() || 'Client'
      const clientAge = calculateAge(client.date_of_birth)
      const notifType = `BIRTHDAY_${reminderStage.toUpperCase()}`

      let title = ''
      let message = ''

      if (reminderStage === '0d') {
        title = `🎊 Today is ${fullName}'s birthday`
        message = `Aniversare astăzi: ${fullName} [${label}]. Nu uita să trimiți urările!`
      } else if (reminderStage === '2d') {
        title = `Birthday in 2 days — ${fullName}`
        message = `Aniversare în 2 zile (${client.date_of_birth.slice(5)}): ${fullName} [${label}].`
      } else if (reminderStage === '7d') {
        title = `Birthday in 7 days — ${fullName}`
        message = `Aniversare în 7 zile (${client.date_of_birth.slice(5)}): ${fullName} [${label}].`
      }

      // Check for duplicate notification created in this calendar cycle for this client and stage
      const { data: existingNotif } = await supabase
        .from('notifications')
        .select('id')
        .eq('related_entity_id', client.id)
        .eq('type', notifType)
        .gte('created_at', `${targetYear}-01-01T00:00:00`)
        .maybeSingle()

      if (!existingNotif) {
        // Insert persistent CRM notification
        const { error: insertErr } = await supabase.from('notifications').insert({
          type: notifType,
          title,
          message,
          related_entity_type: 'client',
          related_entity_id: client.id,
          is_read: false,
        })

        if (!insertErr) {
          result.birthdayRemindersCreated++
          result.details.push(`Birthday reminder (${reminderStage}) created for ${fullName}`)

          // Dispatch Telegram Alert (Non-blocking)
          try {
            const tgRes = await notifyBirthdayTelegram({
              fullName,
              dateOfBirth: client.date_of_birth,
              categoryLabel: label,
              stage: reminderStage,
              age: clientAge,
              clientId: client.id,
            })
            if (tgRes.success) {
              result.telegramDispatched++
            }
          } catch (tgErr) {
            console.warn('[Reminders] Non-critical Telegram dispatch error:', tgErr)
          }
        }
      } else {
        result.skippedAlreadyNotified++
      }
    }
  }

  // 2. Check Active Follow-ups
  const { data: followUps } = await supabase
    .from('follow_ups')
    .select(`
      id,
      client_id,
      reason,
      notes,
      priority,
      status,
      due_date,
      clients (
        id,
        first_name,
        last_name,
        phone,
        category
      )
    `)
    .eq('status', 'PENDING')

  for (const f of followUps || []) {
    if (!f.due_date) continue
    const dueDate = new Date(f.due_date)
    if (isNaN(dueDate.getTime())) continue

    const dueParts = getBucharestDateParts(dueDate)
    const dueUtc = Date.UTC(dueParts.year, dueParts.month - 1, dueParts.day)
    const diffDays = Math.round((dueUtc - todayUtc) / (1000 * 60 * 60 * 24))

    let reminderStage: '0d' | '2d' | '7d' | null = null
    if (diffDays === 0) reminderStage = '0d'
    else if (diffDays === 2) reminderStage = '2d'
    else if (diffDays === 7) reminderStage = '7d'

    if (reminderStage) {
      const client = unwrap(f.clients)
      const clientName = client ? `${client.first_name || ''} ${client.last_name || ''}`.trim() : 'Client'
      const timeStr = dueDate.toLocaleTimeString('ro-RO', {
        timeZone: 'Europe/Bucharest',
        hour: '2-digit',
        minute: '2-digit',
      })
      const notifType = `FOLLOWUP_${reminderStage.toUpperCase()}`

      let title = ''
      let message = ''

      if (reminderStage === '0d') {
        title = `FOLLOW-UP TODAY: ${clientName}`
        message = `Follow-up astăzi la ${timeStr}: ${f.reason}${f.notes ? ` — ${f.notes}` : ''}`
      } else if (reminderStage === '2d') {
        title = `FOLLOW-UP IN 2 DAYS: ${clientName}`
        message = `Follow-up în 2 zile (${dueParts.dateStr} ${timeStr}): ${f.reason}${f.notes ? ` — ${f.notes}` : ''}`
      } else if (reminderStage === '7d') {
        title = `FOLLOW-UP IN 7 DAYS: ${clientName}`
        message = `Follow-up în 7 zile (${dueParts.dateStr} ${timeStr}): ${f.reason}${f.notes ? ` — ${f.notes}` : ''}`
      }

      // Check for duplicate notification created for this follow-up and stage
      const { data: existingNotif } = await supabase
        .from('notifications')
        .select('id')
        .eq('related_entity_id', f.id)
        .eq('type', notifType)
        .maybeSingle()

      if (!existingNotif) {
        const { error: insertErr } = await supabase.from('notifications').insert({
          type: notifType,
          title,
          message,
          related_entity_type: 'follow_up',
          related_entity_id: f.id,
          is_read: false,
        })

        if (!insertErr) {
          result.followUpRemindersCreated++
          result.details.push(`Follow-up reminder (${reminderStage}) created for ${clientName}: ${f.reason}`)

          // Dispatch Telegram Alert (Non-blocking)
          try {
            const tgRes = await notifyFollowUpTelegram({
              clientName,
              reason: f.reason,
              notes: f.notes,
              dueDateStr: dueParts.dateStr,
              timeStr,
              priority: f.priority || 'NORMAL',
              stage: reminderStage,
              clientId: f.client_id,
            })
            if (tgRes.success) {
              result.telegramDispatched++
            }
          } catch (tgErr) {
            console.warn('[Reminders] Non-critical Telegram dispatch error:', tgErr)
          }
        }
      } else {
        result.skippedAlreadyNotified++
      }
    }
  }

  return result
}

