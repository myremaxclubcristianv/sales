import { createClient as createServerClient } from '@/lib/supabase/server'
import { parseAndValidateCnp } from './cnp'

export interface BackfillStats {
  peopleScanned: number
  dobDerived: number
  dobAlreadyPresent: number
  dobConflicts: number
  invalidCnp: number
  birthdayEvents: number
  categories: {
    insurance: number
    realEstate: number
    credite: number
    contacts: number
  }
  discrepancies: Array<{
    clientId: string
    name: string
    existingDob: string
    derivedDob: string
  }>
}

/**
 * Executes a non-destructive, audited backfill of Date of Birth (DOB) derived from valid Romanian CNPs.
 * 
 * Rules:
 * - Case 1: Existing DOB + Valid CNP + Same date -> Keep existing DOB (unchanged).
 * - Case 2: Existing DOB + Valid CNP + Different date -> DO NOT modify automatically; flag discrepancy.
 * - Case 3: Missing DOB + Valid CNP -> Populate DOB derived from CNP + audit log.
 * - Case 4: Missing DOB + Invalid/missing CNP -> Keep NULL (zero guessing).
 */
export async function runBirthdayBackfill(): Promise<BackfillStats> {
  const supabase = await createServerClient()

  const stats: BackfillStats = {
    peopleScanned: 0,
    dobDerived: 0,
    dobAlreadyPresent: 0,
    dobConflicts: 0,
    invalidCnp: 0,
    birthdayEvents: 0,
    categories: {
      insurance: 0,
      realEstate: 0,
      credite: 0,
      contacts: 0,
    },
    discrepancies: [],
  }

  // 1. Fetch all clients
  const { data: clients, error } = await supabase
    .from('clients')
    .select(`
      id,
      first_name,
      last_name,
      cnp,
      date_of_birth,
      category,
      client_relationships (relationship_type)
    `)

  if (error) {
    console.error('Error fetching clients for birthday backfill:', error)
    throw error
  }

  const clientList = clients || []
  stats.peopleScanned = clientList.length

  for (const client of clientList) {
    const rawCnp = client.cnp
    const existingDob = client.date_of_birth

    // Classify client categories
    const cat = (client.category || '').toUpperCase()
    const rels = (client.client_relationships || []).map((r) => r.relationship_type.toLowerCase())

    const isIns = cat === 'INSURANCE' || rels.includes('insurance')
    const isRe = cat === 'REAL_ESTATE' || cat === 'REAL ESTATE' || rels.some((r) => ['buyer', 'seller', 'landlord', 'investor'].includes(r))
    const isCredit = cat === 'CREDIT' || cat === 'CREDITE' || rels.includes('credit')
    const isContact = !isIns && !isRe && !isCredit

    if (isIns) stats.categories.insurance++
    if (isRe) stats.categories.realEstate++
    if (isCredit) stats.categories.credite++
    if (isContact) stats.categories.contacts++

    // Process CNP & DOB
    if (rawCnp) {
      const cnpValidation = parseAndValidateCnp(rawCnp)

      if (!cnpValidation.isValid || !cnpValidation.dateOfBirth) {
        stats.invalidCnp++
      } else {
        const derivedDob = cnpValidation.dateOfBirth

        if (existingDob) {
          if (existingDob === derivedDob) {
            // Case 1: Already has same DOB
            stats.dobAlreadyPresent++
          } else {
            // Case 2: Discrepancy -> DO NOT OVERWRITE
            stats.dobConflicts++
            stats.discrepancies.push({
              clientId: client.id,
              name: `${client.first_name} ${client.last_name}`.trim(),
              existingDob,
              derivedDob,
            })
          }
        } else {
          // Case 3: Missing DOB + Valid CNP -> Populate
          const { error: updateError } = await supabase
            .from('clients')
            .update({
              date_of_birth: derivedDob,
            })
            .eq('id', client.id)

          if (!updateError) {
            stats.dobDerived++

            // Create audit log entry without exposing plain CNP
            await supabase.from('audit_logs').insert({
              action: 'DOB_DERIVED',
              entity_type: 'clients',
              entity_id: client.id,
              old_values: { date_of_birth: null },
              new_values: {
                date_of_birth: derivedDob,
                source: 'CNP',
                timestamp: new Date().toISOString(),
              },
            })

            // Sync personal_events table for birthday
            const { data: existingEvent } = await supabase
              .from('personal_events')
              .select('id')
              .eq('client_id', client.id)
              .eq('event_type', 'birthday')
              .maybeSingle()

            if (!existingEvent) {
              await supabase.from('personal_events').insert({
                client_id: client.id,
                event_type: 'birthday',
                event_date: derivedDob,
                title: `Zi de naștere: ${client.first_name} ${client.last_name}`,
                reminder_days: 7,
              })
              stats.birthdayEvents++
            }
          }
        }
      }
    } else if (existingDob) {
      stats.dobAlreadyPresent++
      // Ensure personal_events is in sync
      const { data: existingEvent } = await supabase
        .from('personal_events')
        .select('id')
        .eq('client_id', client.id)
        .eq('event_type', 'birthday')
        .maybeSingle()

      if (!existingEvent) {
        await supabase.from('personal_events').insert({
          client_id: client.id,
          event_type: 'birthday',
          event_date: existingDob,
          title: `Zi de naștere: ${client.first_name} ${client.last_name}`,
          reminder_days: 7,
        })
        stats.birthdayEvents++
      }
    }
  }

  // Count total personal events for birthdays
  const { count: totalBirthdays } = await supabase
    .from('personal_events')
    .select('id', { count: 'exact', head: true })
    .eq('event_type', 'birthday')

  stats.birthdayEvents = totalBirthdays || stats.birthdayEvents

  return stats
}
