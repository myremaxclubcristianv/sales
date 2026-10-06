import { createClient as createServerClient } from '@/lib/supabase/server'
import { parseAndValidateCnp } from './cnp'
import { VERIFIED_INSURANCE_CLIENTS } from '@/lib/data/verified-insurance-dataset'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface BackfillStats {
  insurancePeopleScanned: number
  realEstatePeopleScanned: number
  creditPeopleScanned: number
  contactsScanned: number
  otherPeopleScanned: number
  totalPeopleScanned: number
  uniquePeopleDiscovered: number
  alreadyHadDob: number
  dobDerivedFromCnp: number
  missingDob: number
  cnpDobConflicts: number
  ambiguousIdentities: number
  birthdayEventsExposed: number
  duplicateBirthdaysPrevented: number
  categories: {
    insurance: number
    realEstate: number
    credite: number
    contacts: number
  }
  discrepancies: Array<{
    source: string
    id: string
    name: string
    existingDob: string
    derivedDob: string
  }>
}

/**
 * Normalizes phone numbers for deterministic identity matching
 */
function cleanPhone(p: string | null | undefined): string {
  if (!p) return ''
  const digits = p.replace(/\D/g, '')
  if (digits.startsWith('40') && digits.length === 11) return '0' + digits.slice(2)
  if (digits.startsWith('0040') && digits.length === 13) return '0' + digits.slice(4)
  return digits
}

/**
 * Normalizes person names for safe deduplication
 */
function cleanName(n: string | null | undefined): string {
  if (!n) return ''
  return n
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Executes a comprehensive, production-grade, non-destructive birthday backfill
 * across ALL CRM sources (clients, verified insurance dataset, contacts, leads).
 */
export async function runBirthdayBackfill(customSupabase?: SupabaseClient): Promise<BackfillStats> {
  const supabase = customSupabase || (await createServerClient())

  const stats: BackfillStats = {
    insurancePeopleScanned: 0,
    realEstatePeopleScanned: 0,
    creditPeopleScanned: 0,
    contactsScanned: 0,
    otherPeopleScanned: 0,
    totalPeopleScanned: 0,
    uniquePeopleDiscovered: 0,
    alreadyHadDob: 0,
    dobDerivedFromCnp: 0,
    missingDob: 0,
    cnpDobConflicts: 0,
    ambiguousIdentities: 0,
    birthdayEventsExposed: 0,
    duplicateBirthdaysPrevented: 0,
    categories: {
      insurance: 0,
      realEstate: 0,
      credite: 0,
      contacts: 0,
    },
    discrepancies: [],
  }

  // 1. Fetch all clients from database
  const { data: clientsData, error: clientsErr } = await supabase
    .from('clients')
    .select(`
      id,
      first_name,
      last_name,
      phone,
      email,
      cnp,
      date_of_birth,
      category,
      client_relationships (relationship_type)
    `)

  if (clientsErr) {
    console.error('Error fetching clients for birthday backfill:', clientsErr)
    throw clientsErr
  }

  const clientList = clientsData || []

  // 2. Fetch all contacts with pagination (to scan all rows)
  let allContacts: Array<{ id: string; first_name: string; last_name: string; phone: string | null; email: string | null; client_id: string | null; date_of_birth?: string | null }> = []
  let fromOffset = 0
  const pageSize = 1000
  while (true) {
    const { data: chunk } = await supabase
      .from('contacts')
      .select('id, first_name, last_name, phone, email, client_id')
      .range(fromOffset, fromOffset + pageSize - 1)

    if (!chunk || chunk.length === 0) break
    allContacts = allContacts.concat(chunk)
    if (chunk.length < pageSize) break
    fromOffset += pageSize
  }

  const contactList = allContacts

  // 3. Fetch leads
  const { data: leadsData } = await supabase
    .from('leads')
    .select('id, name, phone, email')

  const leadList = leadsData || []

  // Track discovered unique identities
  // Key: normalized phone, email, cnp, or name
  const identityMap = new Map<string, { id: string; name: string; hasDob: boolean }>()

  // A. Process Clients table
  for (const client of clientList) {
    const rawCnp = client.cnp
    const existingDob = client.date_of_birth
    const cat = (client.category || '').toUpperCase()
    const rels = (client.client_relationships || []).map((r: { relationship_type: string }) => r.relationship_type.toLowerCase())

    const isIns = cat === 'INSURANCE' || rels.includes('insurance')
    const isRe = cat === 'REAL_ESTATE' || cat === 'REAL ESTATE' || rels.some((r: string) => ['buyer', 'seller', 'landlord', 'investor'].includes(r))
    const isCredit = cat === 'CREDIT' || cat === 'CREDITE' || rels.includes('credit')
    const isContact = !isIns && !isRe && !isCredit

    if (isIns) stats.insurancePeopleScanned++
    else if (isRe) stats.realEstatePeopleScanned++
    else if (isCredit) stats.creditPeopleScanned++
    else stats.otherPeopleScanned++

    if (isIns) stats.categories.insurance++
    if (isRe) stats.categories.realEstate++
    if (isCredit) stats.categories.credite++
    if (isContact) stats.categories.contacts++

    const clientFullName = `${client.first_name} ${client.last_name}`.trim()
    const normPhone = cleanPhone(client.phone)
    const normName = cleanName(clientFullName)
    const normEmail = (client.email || '').toLowerCase().trim()

    // Deduplication tracking
    const dedupeKey = normPhone || normEmail || normName || client.id
    if (identityMap.has(dedupeKey)) {
      stats.duplicateBirthdaysPrevented++
    } else {
      identityMap.set(dedupeKey, { id: client.id, name: clientFullName, hasDob: Boolean(existingDob) })
    }

    let effectiveDob = existingDob

    // Handle CNP
    if (rawCnp) {
      const cnpValidation = parseAndValidateCnp(rawCnp)
      if (cnpValidation.isValid && cnpValidation.dateOfBirth) {
        const derivedDob = cnpValidation.dateOfBirth
        if (existingDob) {
          if (existingDob === derivedDob) {
            stats.alreadyHadDob++
          } else {
            stats.cnpDobConflicts++
            stats.discrepancies.push({
              source: 'clients',
              id: client.id,
              name: clientFullName,
              existingDob,
              derivedDob,
            })
          }
        } else {
          // Missing DOB + Valid CNP -> Backfill
          const { error: updateErr } = await supabase
            .from('clients')
            .update({ date_of_birth: derivedDob })
            .eq('id', client.id)

          if (!updateErr) {
            stats.dobDerivedFromCnp++
            effectiveDob = derivedDob

            // Audit log (sanitized, zero CNP)
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
          }
        }
      } else {
        if (!existingDob) stats.missingDob++
      }
    } else {
      if (existingDob) {
        stats.alreadyHadDob++
      } else {
        stats.missingDob++
      }
    }

    // Upsert personal_events for birthday
    if (effectiveDob) {
      const { data: existingEv } = await supabase
        .from('personal_events')
        .select('id')
        .eq('client_id', client.id)
        .eq('event_type', 'birthday')
        .maybeSingle()

      if (!existingEv) {
        await supabase.from('personal_events').insert({
          client_id: client.id,
          event_type: 'birthday',
          event_date: effectiveDob,
          title: `Zi de naștere: ${clientFullName || 'Client'}`,
          reminder_days: 7,
        })
        stats.birthdayEventsExposed++
      } else {
        await supabase
          .from('personal_events')
          .update({
            event_date: effectiveDob,
            title: `Zi de naștere: ${clientFullName || 'Client'}`,
          })
          .eq('id', existingEv.id)
        stats.birthdayEventsExposed++
      }
    }
  }

  // B. Process Verified Insurance Dataset
  for (const ic of VERIFIED_INSURANCE_CLIENTS) {
    stats.insurancePeopleScanned++
    const icPhone = cleanPhone(ic.canonical_phone || ic.phone)
    const icName = cleanName(ic.full_name)
    const icEmail = (ic.email || '').toLowerCase().trim()

    // Check if matches an existing client
    const existingClient = clientList.find((c) => {
      const cPhone = cleanPhone(c.phone)
      const cName = cleanName(`${c.first_name} ${c.last_name}`)
      const cEmail = (c.email || '').toLowerCase().trim()
      return (
        (cPhone && icPhone && cPhone === icPhone) ||
        (cEmail && icEmail && cEmail === icEmail) ||
        (cName && icName && cName === icName) ||
        (Boolean(c.cnp) && Boolean(ic.cnp) && c.cnp === ic.cnp)
      )
    })

    const cnpValidation = ic.cnp ? parseAndValidateCnp(ic.cnp) : { isValid: false, dateOfBirth: null }

    if (existingClient) {
      stats.duplicateBirthdaysPrevented++
      // If client exists but missing DOB and insurance has valid CNP
      if (!existingClient.date_of_birth && cnpValidation.isValid && cnpValidation.dateOfBirth) {
        await supabase
          .from('clients')
          .update({ date_of_birth: cnpValidation.dateOfBirth, cnp: ic.cnp })
          .eq('id', existingClient.id)

        stats.dobDerivedFromCnp++

        await supabase.from('personal_events').insert({
          client_id: existingClient.id,
          event_type: 'birthday',
          event_date: cnpValidation.dateOfBirth,
          title: `Zi de naștere: ${existingClient.first_name} ${existingClient.last_name}`,
          reminder_days: 7,
        })
        stats.birthdayEventsExposed++
      }
    } else {
      // New standalone insurance client
      const dedupeKey = icPhone || icEmail || icName || ic.import_source_id
      if (identityMap.has(dedupeKey)) {
        stats.duplicateBirthdaysPrevented++
      } else {
        identityMap.set(dedupeKey, {
          id: ic.import_source_id,
          name: ic.full_name,
          hasDob: Boolean(cnpValidation.dateOfBirth),
        })

        const nameParts = ic.full_name.trim().split(/\s+/)
        const firstName = nameParts[0] || 'Client'
        const lastName = nameParts.slice(1).join(' ') || firstName

        const effectiveDob = cnpValidation.isValid ? cnpValidation.dateOfBirth : null

        if (effectiveDob) {
          stats.dobDerivedFromCnp++
        } else {
          stats.missingDob++
        }

        // Insert into clients
        const { data: newClient, error: insErr } = await supabase
          .from('clients')
          .insert({
            first_name: firstName,
            last_name: lastName,
            phone: ic.phone || ic.canonical_phone || null,
            whatsapp: ic.phone || ic.canonical_phone || null,
            email: ic.email || null,
            category: 'INSURANCE',
            lead_source: 'GENERALI_CRM',
            address: ic.address || null,
            cnp: ic.cnp || null,
            date_of_birth: effectiveDob,
            status: ic.status === 'ACTIVE' ? 'ACTIVE' : 'NOT_CONTACTED',
          })
          .select('id')
          .single()

        if (!insErr && newClient && effectiveDob) {
          await supabase.from('personal_events').insert({
            client_id: newClient.id,
            event_type: 'birthday',
            event_date: effectiveDob,
            title: `Zi de naștere: ${ic.full_name}`,
            reminder_days: 7,
          })
          stats.birthdayEventsExposed++
        }
      }
    }
  }

  // C. Process Contacts
  for (const contact of contactList) {
    stats.contactsScanned++
    const cPhone = cleanPhone(contact.phone)
    const cName = cleanName(`${contact.first_name} ${contact.last_name}`)
    const cEmail = (contact.email || '').toLowerCase().trim()

    const dedupeKey = cPhone || cEmail || cName || contact.id
    if (identityMap.has(dedupeKey)) {
      stats.duplicateBirthdaysPrevented++
    } else {
      identityMap.set(dedupeKey, {
        id: contact.id,
        name: `${contact.first_name} ${contact.last_name}`.trim(),
        hasDob: Boolean(contact.date_of_birth),
      })
      if (!contact.date_of_birth) {
        stats.missingDob++
      } else {
        stats.alreadyHadDob++
      }
    }
  }

  // D. Process Leads
  for (const lead of leadList) {
    stats.otherPeopleScanned++
    const lPhone = cleanPhone(lead.phone)
    const lName = cleanName(lead.name)
    const lEmail = (lead.email || '').toLowerCase().trim()

    const dedupeKey = lPhone || lEmail || lName || lead.id
    if (identityMap.has(dedupeKey)) {
      stats.duplicateBirthdaysPrevented++
    } else {
      identityMap.set(dedupeKey, { id: lead.id, name: lead.name, hasDob: false })
      stats.missingDob++
    }
  }

  stats.totalPeopleScanned =
    stats.insurancePeopleScanned +
    stats.realEstatePeopleScanned +
    stats.creditPeopleScanned +
    stats.contactsScanned +
    stats.otherPeopleScanned

  stats.uniquePeopleDiscovered = identityMap.size

  // Final count of birthday events in personal_events
  const { count: finalBirthdayCount } = await supabase
    .from('personal_events')
    .select('id', { count: 'exact', head: true })
    .eq('event_type', 'birthday')

  stats.birthdayEventsExposed = finalBirthdayCount || stats.birthdayEventsExposed

  return stats
}
