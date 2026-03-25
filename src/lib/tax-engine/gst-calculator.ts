// GST Calculator for Indian Goods & Services Tax
// Supports CGST, SGST, IGST calculations across all slabs

export const GST_RATES = [0, 5, 12, 18, 28] as const
export type GSTRate = (typeof GST_RATES)[number]

export interface GSTResult {
  baseAmount: number
  gstRate: number
  isInterState: boolean
  cgst: number
  sgst: number
  igst: number
  totalGST: number
  totalAmount: number
  cess: number
}

export interface ReverseChargeResult extends GSTResult {
  isReverseCharge: true
  rcmLiability: number
  itcAvailable: number
}

export interface ITCEligibilityResult {
  eligible: boolean
  reason: string
  section: string
  blockedUnder17_5: boolean
}

/**
 * Calculate GST on a given amount
 * For intra-state: splits into CGST + SGST (equal halves)
 * For inter-state: full amount as IGST
 */
export function calculateGST(
  amount: number,
  rate: number,
  isInterState: boolean,
  cessRate: number = 0
): GSTResult {
  if (amount < 0) throw new Error("Amount cannot be negative")
  if (rate < 0 || rate > 28) throw new Error("Invalid GST rate")

  const totalGST = Math.round((amount * rate) / 100 * 100) / 100
  const cess = Math.round((amount * cessRate) / 100 * 100) / 100

  if (isInterState) {
    return {
      baseAmount: amount,
      gstRate: rate,
      isInterState: true,
      cgst: 0,
      sgst: 0,
      igst: totalGST,
      totalGST,
      totalAmount: Math.round((amount + totalGST + cess) * 100) / 100,
      cess,
    }
  }

  const half = Math.round((totalGST / 2) * 100) / 100
  return {
    baseAmount: amount,
    gstRate: rate,
    isInterState: false,
    cgst: half,
    sgst: half,
    igst: 0,
    totalGST,
    totalAmount: Math.round((amount + totalGST + cess) * 100) / 100,
    cess,
  }
}

/**
 * Reverse calculate: extract GST from an inclusive amount
 */
export function calculateGSTFromInclusive(
  inclusiveAmount: number,
  rate: number,
  isInterState: boolean,
  cessRate: number = 0
): GSTResult {
  if (inclusiveAmount < 0) throw new Error("Amount cannot be negative")
  const effectiveRate = rate + cessRate
  const baseAmount = Math.round((inclusiveAmount * 100) / (100 + effectiveRate) * 100) / 100
  return calculateGST(baseAmount, rate, isInterState, cessRate)
}

/**
 * Calculate Reverse Charge Mechanism (RCM) liability
 * Under RCM, recipient pays GST instead of supplier
 */
export function calculateReverseCharge(
  amount: number,
  rate: number,
  isInterState: boolean
): ReverseChargeResult {
  const base = calculateGST(amount, rate, isInterState)
  return {
    ...base,
    isReverseCharge: true,
    rcmLiability: base.totalGST,
    itcAvailable: base.totalGST, // RCM paid GST is eligible for ITC
  }
}

/**
 * Check ITC eligibility under Section 17(5) - Blocked Credits
 */
export function checkITCEligibility(
  category: string
): ITCEligibilityResult {
  const blockedCategories: Record<string, { reason: string; section: string }> = {
    "motor-vehicle": {
      reason: "Motor vehicles blocked u/s 17(5)(a) except for specified purposes (transport, training, etc.)",
      section: "17(5)(a)",
    },
    "food-beverage": {
      reason: "Food & beverages, outdoor catering, beauty treatment, health services blocked u/s 17(5)(b)",
      section: "17(5)(b)",
    },
    "membership-club": {
      reason: "Membership of club, health, fitness centre blocked u/s 17(5)(b)",
      section: "17(5)(b)",
    },
    "rent-a-cab": {
      reason: "Rent-a-cab, life/health insurance blocked u/s 17(5)(b) unless obligatory for employer",
      section: "17(5)(b)",
    },
    "travel-benefits": {
      reason: "Travel benefits for employees on vacation blocked u/s 17(5)(b)",
      section: "17(5)(b)",
    },
    "works-contract": {
      reason: "Works contract for immovable property (except plant/machinery) blocked u/s 17(5)(c)",
      section: "17(5)(c)",
    },
    "construction-immovable": {
      reason: "Construction of immovable property for own account blocked u/s 17(5)(d)",
      section: "17(5)(d)",
    },
    "personal-consumption": {
      reason: "Goods/services for personal consumption blocked u/s 17(5)(g)",
      section: "17(5)(g)",
    },
    "free-samples": {
      reason: "Goods lost, stolen, destroyed, written off, or given as free samples blocked u/s 17(5)(h)",
      section: "17(5)(h)",
    },
    "tax-paid-composition": {
      reason: "Tax paid under composition scheme blocked u/s 17(5)(e)",
      section: "17(5)(e)",
    },
  }

  const blocked = blockedCategories[category]
  if (blocked) {
    return {
      eligible: false,
      reason: blocked.reason,
      section: blocked.section,
      blockedUnder17_5: true,
    }
  }

  return {
    eligible: true,
    reason: "ITC appears eligible subject to conditions under Sections 16(2) and Rule 36(4)",
    section: "16(2)",
    blockedUnder17_5: false,
  }
}
