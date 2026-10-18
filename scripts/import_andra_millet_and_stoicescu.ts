// Mock global WebSocket for supabase-js in Node
;(global as any).WebSocket = class { constructor() {} }

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

const envPath = path.join(__dirname, '../.env.local')
const env = fs.readFileSync(envPath, 'utf8')
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=([^\r\n]+)/)![1].trim()
const serviceKey = (env.match(/SUPABASE_SERVICE_ROLE_KEY=([^\r\n]+)/) || env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=([^\r\n]+)/))![1].trim()
const supabase = createClient(url, serviceKey, { auth: { persistSession: false } })

// Mask CNP utility for safe logging
function maskCnp(cnp: string | null | undefined): string {
  if (!cnp) return 'N/A'
  const clean = cnp.trim()
  if (clean.length < 7) return '******'
  return clean.slice(0, 7) + '******'
}

async function runImport() {
  console.log('=================================================================')
  console.log('=== SALES CRM — INSURANCE IMPORT: ANDRA MILLET & STOICESCU   ===')
  console.log('=================================================================')
  console.log(`Database URL: ${url}`)
  console.log(`Timestamp: ${new Date().toISOString()}`)

  // 1. RECONCILE ANDRA MILLET
  console.log('\n--- 1. RECONCILING ANDRA MILLET ---')
  const ANDRA_CLIENT_ID = '9c1753ff-fe7b-4935-8f12-7cb9913ead40'
  const { data: existingAndra, error: eAndra } = await supabase
    .from('clients')
    .select('*')
    .eq('id', ANDRA_CLIENT_ID)
    .single()

  if (eAndra || !existingAndra) {
    throw new Error(`Could not find existing Andra Millet profile with ID ${ANDRA_CLIENT_ID}: ${JSON.stringify(eAndra)}`)
  }

  console.log(`[PASS] Found existing profile: ${existingAndra.first_name} ${existingAndra.last_name}`)
  console.log(`       ID: ${existingAndra.id}`)
  console.log(`       Phone: ${existingAndra.phone} | WhatsApp: ${existingAndra.whatsapp}`)
  console.log(`       Email: ${existingAndra.email}`)
  console.log(`       CNP (masked): ${maskCnp(existingAndra.cnp)}`)
  console.log(`       Category: ${existingAndra.category} | Status: ${existingAndra.status}`)

  // Properties to associate for Andra Millet
  const andraAddresses = [
    { address: 'Dumbrava Roșie 18', city: 'Bucuresti' },
    { address: 'Icoanei 82', city: 'Bucuresti' },
    { address: 'Căderea Bastiliei 26', city: 'Bucuresti' }
  ]

  const propertyMap = new Map<string, string>()

  for (const addr of andraAddresses) {
    // Check if property exists for client
    const { data: existingProp } = await supabase
      .from('client_properties')
      .select('id, address')
      .eq('client_id', ANDRA_CLIENT_ID)
      .eq('address', addr.address)
      .maybeSingle()

    if (existingProp) {
      console.log(`[INFO] Property '${addr.address}' already exists: ${existingProp.id}`)
      propertyMap.set(addr.address, existingProp.id)
    } else {
      const { data: newProp, error: errProp } = await supabase
        .from('client_properties')
        .insert({
          client_id: ANDRA_CLIENT_ID,
          property_type: 'apartment',
          address: addr.address,
          city: addr.city,
          notes: 'Proprietate asigurată Generali (PAD + EUROCASA)'
        })
        .select('id, address')
        .single()

      if (errProp || !newProp) {
        throw new Error(`Failed to insert property '${addr.address}': ${JSON.stringify(errProp)}`)
      }
      console.log(`[CREATED] Property '${addr.address}' -> ID: ${newProp.id}`)
      propertyMap.set(addr.address, newProp.id)
    }
  }

  // 6 Policies for Andra Millet (3 EUROCASA + 3 PAD)
  const andraPolicies = [
    // EUROCASA
    {
      address: 'Dumbrava Roșie 18',
      policy_number: '3000019539605',
      product: 'HOME',
      product_label: 'EUROCASA',
      insurer: 'Generali',
      start_date: '2026-10-14',
      issue_date: '2026-10-14',
      expiry_date: '2027-10-13',
      premium: 143.51,
      currency: 'EUR',
      commission: 35.00,
      status: 'ACTIVE',
      details: 'EUROCASA - Dumbrava Roșie 18',
      notes: 'Poliță EUROCASA Generali. Dumbrava Roșie 18. Primă: 143.51 EUR, Comision: 35 EUR. Durată: 360 zile. Sursă: lead generali.'
    },
    {
      address: 'Icoanei 82',
      policy_number: '3000019539613',
      product: 'HOME',
      product_label: 'EUROCASA',
      insurer: 'Generali',
      start_date: '2026-10-14',
      issue_date: '2026-10-14',
      expiry_date: '2027-10-13',
      premium: 143.51,
      currency: 'EUR',
      commission: 35.00,
      status: 'ACTIVE',
      details: 'EUROCASA - Icoanei 82',
      notes: 'Poliță EUROCASA Generali. Icoanei 82. Primă: 143.51 EUR, Comision: 35 EUR. Durată: 360 zile. Sursă: lead generali.'
    },
    {
      address: 'Căderea Bastiliei 26',
      policy_number: '3000019539621',
      product: 'HOME',
      product_label: 'EUROCASA',
      insurer: 'Generali',
      start_date: '2026-10-14',
      issue_date: '2026-10-14',
      expiry_date: '2027-10-13',
      premium: 76.89,
      currency: 'EUR',
      commission: 19.00,
      status: 'ACTIVE',
      details: 'EUROCASA - Căderea Bastiliei 26',
      notes: 'Poliță EUROCASA Generali. Căderea Bastiliei 26. Primă: 76.89 EUR, Comision: 19 EUR. Durată: 360 zile. Sursă: lead generali.'
    },
    // PAD
    {
      address: 'Dumbrava Roșie 18',
      policy_number: 'RA-06500269837323',
      product: 'HOME',
      product_label: 'PAD',
      insurer: 'Generali',
      start_date: '2026-10-14',
      issue_date: '2026-10-14',
      expiry_date: '2027-10-13',
      premium: 130.00,
      currency: 'RON',
      commission: 6.00,
      status: 'ACTIVE',
      details: 'PAD - Dumbrava Roșie 18',
      notes: 'Poliță PAD Generali. Dumbrava Roșie 18. Primă: 130 RON, Comision: 6 RON. Durată: 360 zile. Sursă: lead generali.'
    },
    {
      address: 'Icoanei 82',
      policy_number: 'RA-06500269834372',
      product: 'HOME',
      product_label: 'PAD',
      insurer: 'Generali',
      start_date: '2026-10-14',
      issue_date: '2026-10-14',
      expiry_date: '2027-10-13',
      premium: 130.00,
      currency: 'RON',
      commission: 6.00,
      status: 'ACTIVE',
      details: 'PAD - Icoanei 82',
      notes: 'Poliță PAD Generali. Icoanei 82. Primă: 130 RON, Comision: 6 RON. Durată: 360 zile. Sursă: lead generali.'
    },
    {
      address: 'Căderea Bastiliei 26',
      policy_number: 'RA-06500269837628',
      product: 'HOME',
      product_label: 'PAD',
      insurer: 'Generali',
      start_date: '2026-10-14',
      issue_date: '2026-10-14',
      expiry_date: '2027-10-13',
      premium: 130.00,
      currency: 'RON',
      commission: 6.00,
      status: 'ACTIVE',
      details: 'PAD - Căderea Bastiliei 26',
      notes: 'Poliță PAD Generali. Căderea Bastiliei 26. Primă: 130 RON, Comision: 6 RON. Durată: 360 zile. Sursă: lead generali.'
    }
  ]

  let andraInsertedPolicies = 0
  for (const pol of andraPolicies) {
    const propId = propertyMap.get(pol.address)
    // Check if policy already exists
    const { data: existingPol } = await supabase
      .from('insurance_policies')
      .select('id, policy_number')
      .eq('policy_number', pol.policy_number)
      .maybeSingle()

    if (existingPol) {
      console.log(`[INFO] Policy ${pol.policy_number} (${pol.product_label}) already exists: ${existingPol.id}`)
    } else {
      const { data: newPol, error: errPol } = await supabase
        .from('insurance_policies')
        .insert({
          client_id: ANDRA_CLIENT_ID,
          client_property_id: propId,
          policy_number: pol.policy_number,
          product: pol.product,
          insurer: pol.insurer,
          premium: pol.premium,
          currency: pol.currency,
          commission: pol.commission,
          start_date: pol.start_date,
          issue_date: pol.issue_date,
          expiry_date: pol.expiry_date,
          status: pol.status,
          details: pol.details,
          notes: pol.notes
        })
        .select('id, policy_number')
        .single()

      if (errPol || !newPol) {
        throw new Error(`Failed to insert policy ${pol.policy_number}: ${JSON.stringify(errPol)}`)
      }
      console.log(`[CREATED] Policy ${pol.product_label} ${newPol.policy_number} -> ID: ${newPol.id}`)
      andraInsertedPolicies++
    }
  }

  // 2. RECONCILE & IMPORT STOICESCU ANDREI
  console.log('\n--- 2. RECONCILING & IMPORTING STOICESCU ANDREI ---')
  const STOICESCU_PHONE = '0754993595'
  const STOICESCU_EMAIL = 'Astoiecscu@gmail.com'
  const STOICESCU_CNP = '1931006284559'
  const STOICESCU_VIN = 'WVWZZZCDZLW009403'
  const STOICESCU_REG = 'B939SIA'
  const STOICESCU_POL = 'RO/05/M3/NP008861559'

  // Pre-check for duplicate profile
  const { data: checkName } = await supabase
    .from('clients')
    .select('id, first_name, last_name, phone, email, cnp')
    .or(`email.ilike.${STOICESCU_EMAIL},phone.ilike.%754993595%,cnp.eq.${STOICESCU_CNP}`)

  let stoicescuClientId: string
  if (checkName && checkName.length > 0) {
    stoicescuClientId = checkName[0].id
    console.log(`[INFO] Stoicescu Andrei profile already found: ${stoicescuClientId}`)
  } else {
    // Create new profile
    const { data: newClient, error: errClient } = await supabase
      .from('clients')
      .insert({
        first_name: 'Stoicescu',
        last_name: 'Andrei',
        phone: STOICESCU_PHONE,
        whatsapp: STOICESCU_PHONE,
        email: STOICESCU_EMAIL,
        secondary_contact: JSON.stringify({
          phone_1: STOICESCU_PHONE,
          email_1: STOICESCU_EMAIL,
          raw_col_2: '754993595'
        }),
        cnp: STOICESCU_CNP,
        date_of_birth: '1993-10-06',
        client_type: 'INDIVIDUAL',
        category: 'INSURANCE',
        lead_source: 'REFERRAL',
        status: 'ACTIVE',
        preferred_communication: 'whatsapp',
        personal_notes: 'RECOMANDARE DE LA IONUT PIRGHIE | Sursă Excel: lead generali | Durată raportată: 388 zile'
      })
      .select('id, first_name, last_name')
      .single()

    if (errClient || !newClient) {
      throw new Error(`Failed to create Stoicescu Andrei profile: ${JSON.stringify(errClient)}`)
    }
    stoicescuClientId = newClient.id
    console.log(`[CREATED] Client profile Stoicescu Andrei -> ID: ${stoicescuClientId}`)
  }

  // Vehicle for Stoicescu Andrei
  let vehicleId: string
  const { data: existingVeh } = await supabase
    .from('client_vehicles')
    .select('id, vin, plate_number')
    .or(`vin.eq.${STOICESCU_VIN},plate_number.eq.${STOICESCU_REG}`)
    .maybeSingle()

  if (existingVeh) {
    vehicleId = existingVeh.id
    console.log(`[INFO] Vehicle ${existingVeh.plate_number} (${existingVeh.vin}) already exists: ${vehicleId}`)
  } else {
    const { data: newVeh, error: errVeh } = await supabase
      .from('client_vehicles')
      .insert({
        client_id: stoicescuClientId,
        vin: STOICESCU_VIN,
        plate_number: STOICESCU_REG,
        make: 'Volkswagen',
        model: 'Golf / Passat (WVW)',
        details: 'Vehicul asigurat RCA Generali'
      })
      .select('id, vin, plate_number')
      .single()

    if (errVeh || !newVeh) {
      throw new Error(`Failed to create vehicle: ${JSON.stringify(errVeh)}`)
    }
    vehicleId = newVeh.id
    console.log(`[CREATED] Vehicle ${newVeh.plate_number} (${newVeh.vin}) -> ID: ${vehicleId}`)
  }

  // Policy for Stoicescu Andrei
  const { data: existingStoicescuPol } = await supabase
    .from('insurance_policies')
    .select('id, policy_number')
    .eq('policy_number', STOICESCU_POL)
    .maybeSingle()

  let stoicescuInsertedPolicy = 0
  if (existingStoicescuPol) {
    console.log(`[INFO] Policy ${STOICESCU_POL} already exists: ${existingStoicescuPol.id}`)
  } else {
    const { data: newPol, error: errPol } = await supabase
      .from('insurance_policies')
      .insert({
        client_id: stoicescuClientId,
        vehicle_id: vehicleId,
        policy_number: STOICESCU_POL,
        product: 'RCA',
        insurer: 'Generali',
        premium: 2556.00,
        currency: 'RON',
        commission: 127.80, // 5% of 2556 RON
        start_date: '2026-11-11',
        issue_date: '2026-10-18',
        expiry_date: '2027-11-10',
        status: 'ACTIVE',
        details: 'RCA Generali - B939SIA | VIN: WVWZZZCDZLW009403 | Comision: 5% (127.80 RON) | Durată: 388 zile',
        notes: 'Poliță RCA Generali. Recomandare de la Ionut Pirghie. Primă: 2556 RON, Comision: 5% (127.80 RON)'
      })
      .select('id, policy_number')
      .single()

    if (errPol || !newPol) {
      throw new Error(`Failed to insert Stoicescu policy: ${JSON.stringify(errPol)}`)
    }
    console.log(`[CREATED] Policy RCA ${newPol.policy_number} -> ID: ${newPol.id}`)
    stoicescuInsertedPolicy++
  }

  // 3. FINAL INTEGRITY AUDIT
  console.log('\n--- 3. POST-IMPORT INTEGRITY AUDIT ---')
  const { data: polListAndra } = await supabase
    .from('insurance_policies')
    .select('id, policy_number, product, insurer, premium, currency, commission, start_date, expiry_date, client_property_id')
    .eq('client_id', ANDRA_CLIENT_ID)

  console.log(`Andra Millet total policies in DB: ${polListAndra?.length} (Expected: 6)`)
  polListAndra?.forEach(p => {
    console.log(`  - [${p.product}] #${p.policy_number}: ${p.premium} ${p.currency} (com: ${p.commission}) exp: ${p.expiry_date} prop: ${p.client_property_id}`)
  })

  const { data: polListStoicescu } = await supabase
    .from('insurance_policies')
    .select('id, policy_number, product, insurer, premium, currency, commission, start_date, expiry_date, vehicle_id')
    .eq('client_id', stoicescuClientId)

  console.log(`Stoicescu Andrei total policies in DB: ${polListStoicescu?.length} (Expected: 1)`)
  polListStoicescu?.forEach(p => {
    console.log(`  - [${p.product}] #${p.policy_number}: ${p.premium} ${p.currency} (com: ${p.commission}) exp: ${p.expiry_date} veh: ${p.vehicle_id}`)
  })

  console.log('\n=================================================================')
  console.log(`SUMMARY:`)
  console.log(`Andra Millet: Existing ID ${ANDRA_CLIENT_ID} maintained. ${andraInsertedPolicies} policies newly inserted.`)
  console.log(`Stoicescu Andrei: Client ID ${stoicescuClientId}. ${stoicescuInsertedPolicy} policy newly inserted.`)
  console.log('=================================================================')

  return {
    andraClientId: ANDRA_CLIENT_ID,
    andraInsertedPolicies,
    stoicescuClientId,
    stoicescuInsertedPolicy
  }
}

runImport().catch(err => {
  console.error('Fatal import error:', err)
  process.exit(1)
})
