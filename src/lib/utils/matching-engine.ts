import type { Database } from '@/types'

type PropertyRow = Database['public']['Tables']['properties']['Row']
type RequestRow = Database['public']['Tables']['requests']['Row']

export interface MatchCriterion {
  label: string
  matched: boolean
  detail: string
}

export interface MatchResult {
  score: number // Percentage 0 - 100
  criteria: MatchCriterion[]
  isStrongMatch: boolean
}

export function calculatePropertyRequestMatch(
  property: PropertyRow,
  request: RequestRow
): MatchResult {
  const criteria: MatchCriterion[] = []
  let totalScore = 0
  let maxScore = 0

  // 1. Property Type (25 pts)
  maxScore += 25
  if (!request.property_type) {
    totalScore += 20
    criteria.push({
      label: 'Property Type',
      matched: true,
      detail: `Any property type accepted (${property.type})`,
    })
  } else if (request.property_type.toLowerCase() === property.type.toLowerCase()) {
    totalScore += 25
    criteria.push({
      label: 'Property Type',
      matched: true,
      detail: `Exact match: ${property.type}`,
    })
  } else {
    criteria.push({
      label: 'Property Type',
      matched: false,
      detail: `Requested ${request.property_type}, property is ${property.type}`,
    })
  }

  // 2. Budget vs Asking Price (30 pts)
  maxScore += 30
  const propPrice = property.price || 0
  const minBudget = request.budget_min || 0
  const maxBudget = request.budget_max || Infinity

  if (!property.price || (!request.budget_min && !request.budget_max)) {
    totalScore += 15
    criteria.push({
      label: 'Budget Alignment',
      matched: true,
      detail: 'Budget or asking price flexible / upon request',
    })
  } else if (propPrice >= minBudget && propPrice <= maxBudget) {
    totalScore += 30
    criteria.push({
      label: 'Budget Alignment',
      matched: true,
      detail: `Within target: ${propPrice.toLocaleString()} ${property.currency} (Budget: ${minBudget.toLocaleString()} - ${maxBudget === Infinity ? 'Open' : maxBudget.toLocaleString()} ${request.currency})`,
    })
  } else if (maxBudget !== Infinity && propPrice <= maxBudget * 1.15) {
    totalScore += 18
    criteria.push({
      label: 'Budget Alignment',
      matched: true,
      detail: `Within 15% negotiation margin of ${maxBudget.toLocaleString()} ${request.currency}`,
    })
  } else {
    criteria.push({
      label: 'Budget Alignment',
      matched: false,
      detail: `Out of budget range: ${propPrice.toLocaleString()} ${property.currency}`,
    })
  }

  // 3. Location / Zone (25 pts)
  maxScore += 25
  const preferredLocs = request.preferred_locations || []
  if (preferredLocs.length === 0) {
    totalScore += 20
    criteria.push({
      label: 'Location / Area',
      matched: true,
      detail: `Open location preference (${property.area || property.location})`,
    })
  } else {
    const propLocLower = (property.location + ' ' + (property.area || '')).toLowerCase()
    const isLocMatch = preferredLocs.some((loc) =>
      propLocLower.includes(loc.toLowerCase()) || loc.toLowerCase().includes(property.area?.toLowerCase() || '')
    )

    if (isLocMatch) {
      totalScore += 25
      criteria.push({
        label: 'Location / Area',
        matched: true,
        detail: `Matches preferred zone (${property.area || property.location})`,
      })
    } else {
      criteria.push({
        label: 'Location / Area',
        matched: false,
        detail: `Located in ${property.area || property.location}, outside ${preferredLocs.join(', ')}`,
      })
    }
  }

  // 4. Bedrooms Requirement (10 pts)
  maxScore += 10
  const reqBeds = request.bedrooms || 0
  const propBeds = property.bedrooms || 0
  if (reqBeds === 0) {
    totalScore += 10
    criteria.push({
      label: 'Bedrooms',
      matched: true,
      detail: `No strict bedroom minimum (${propBeds} beds)`,
    })
  } else if (propBeds >= reqBeds) {
    totalScore += 10
    criteria.push({
      label: 'Bedrooms',
      matched: true,
      detail: `${propBeds} bedrooms meets minimum of ${reqBeds}`,
    })
  } else {
    criteria.push({
      label: 'Bedrooms',
      matched: false,
      detail: `${propBeds} bedrooms is below requested ${reqBeds}`,
    })
  }

  // 5. Minimum Surface Area (10 pts)
  maxScore += 10
  const reqArea = request.minimum_area || 0
  const propArea = property.built_area || 0
  if (reqArea === 0) {
    totalScore += 10
    criteria.push({
      label: 'Surface Area',
      matched: true,
      detail: `No minimum surface requirement (${propArea} m²)`,
    })
  } else if (propArea >= reqArea) {
    totalScore += 10
    criteria.push({
      label: 'Surface Area',
      matched: true,
      detail: `${propArea} m² meets minimum ${reqArea} m²`,
    })
  } else {
    criteria.push({
      label: 'Surface Area',
      matched: false,
      detail: `${propArea} m² is below requested ${reqArea} m²`,
    })
  }

  const finalPercentage = Math.round((totalScore / maxScore) * 100)

  return {
    score: finalPercentage,
    criteria,
    isStrongMatch: finalPercentage >= 75,
  }
}
