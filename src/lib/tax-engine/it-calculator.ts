// Income Tax Calculator for FY 2025-26 (AY 2026-27)
// Supports both Old and New tax regimes

export interface TaxBreakdown {
  regime: "old" | "new"
  grossIncome: number
  standardDeduction: number
  deductions: Record<string, number>
  taxableIncome: number
  slabwiseTax: { slab: string; taxableAmount: number; rate: number; tax: number }[]
  baseTax: number
  surcharge: number
  surchargeRate: number
  healthAndEducationCess: number
  totalTax: number
  effectiveRate: number
  rebateU87A: number
}

export interface RegimeComparison {
  old: TaxBreakdown
  new: TaxBreakdown
  recommendation: string
  savings: number
}

// Old Regime slabs FY 2025-26
const OLD_REGIME_SLABS = [
  { min: 0, max: 250000, rate: 0 },
  { min: 250000, max: 500000, rate: 5 },
  { min: 500000, max: 1000000, rate: 20 },
  { min: 1000000, max: Infinity, rate: 30 },
]

// New Regime slabs FY 2025-26 (default regime)
const NEW_REGIME_SLABS = [
  { min: 0, max: 400000, rate: 0 },
  { min: 400000, max: 800000, rate: 5 },
  { min: 800000, max: 1200000, rate: 10 },
  { min: 1200000, max: 1600000, rate: 15 },
  { min: 1600000, max: 2000000, rate: 20 },
  { min: 2000000, max: 2400000, rate: 25 },
  { min: 2400000, max: Infinity, rate: 30 },
]

// Surcharge rates for FY 2025-26
function getSurchargeRate(income: number, regime: "old" | "new"): number {
  if (regime === "new") {
    if (income > 20000000) return 25
    if (income > 10000000) return 15
    if (income > 5000000) return 10
    return 0
  }
  // Old regime
  if (income > 50000000) return 37
  if (income > 20000000) return 25
  if (income > 10000000) return 15
  if (income > 5000000) return 10
  return 0
}

function calculateSlabTax(
  taxableIncome: number,
  slabs: typeof OLD_REGIME_SLABS
): { slabwiseTax: TaxBreakdown["slabwiseTax"]; baseTax: number } {
  const slabwiseTax: TaxBreakdown["slabwiseTax"] = []
  let baseTax = 0

  for (const slab of slabs) {
    if (taxableIncome <= slab.min) break
    const taxableInSlab = Math.min(taxableIncome, slab.max) - slab.min
    const tax = Math.round(taxableInSlab * slab.rate / 100)
    slabwiseTax.push({
      slab: slab.max === Infinity
        ? `Above ₹${(slab.min / 100000).toFixed(1)}L`
        : `₹${(slab.min / 100000).toFixed(1)}L - ₹${(slab.max / 100000).toFixed(1)}L`,
      taxableAmount: taxableInSlab,
      rate: slab.rate,
      tax,
    })
    baseTax += tax
  }

  return { slabwiseTax, baseTax }
}

/**
 * Calculate Income Tax for FY 2025-26
 */
export function calculateIncomeTax(
  income: number,
  regime: "old" | "new",
  deductions?: Record<string, number>
): TaxBreakdown {
  if (income < 0) throw new Error("Income cannot be negative")

  const standardDeduction = regime === "new" ? 75000 : 50000
  const totalDeductions = deductions
    ? Object.values(deductions).reduce((a, b) => a + b, 0)
    : 0

  // New regime allows very limited deductions
  const applicableDeductions = regime === "new" ? 0 : totalDeductions
  const taxableIncome = Math.max(0, income - standardDeduction - applicableDeductions)

  const slabs = regime === "old" ? OLD_REGIME_SLABS : NEW_REGIME_SLABS
  const { slabwiseTax, baseTax } = calculateSlabTax(taxableIncome, slabs)

  // Rebate u/s 87A
  let rebateU87A = 0
  if (regime === "new" && taxableIncome <= 1200000) {
    rebateU87A = Math.min(baseTax, 60000)
  } else if (regime === "old" && taxableIncome <= 500000) {
    rebateU87A = Math.min(baseTax, 12500)
  }

  const taxAfterRebate = Math.max(0, baseTax - rebateU87A)
  const surchargeRate = getSurchargeRate(taxableIncome, regime)
  const surcharge = Math.round(taxAfterRebate * surchargeRate / 100)
  const healthAndEducationCess = Math.round((taxAfterRebate + surcharge) * 4 / 100)
  const totalTax = taxAfterRebate + surcharge + healthAndEducationCess

  return {
    regime,
    grossIncome: income,
    standardDeduction,
    deductions: regime === "new" ? {} : (deductions || {}),
    taxableIncome,
    slabwiseTax,
    baseTax,
    surcharge,
    surchargeRate,
    healthAndEducationCess,
    totalTax,
    effectiveRate: income > 0 ? Math.round(totalTax / income * 10000) / 100 : 0,
    rebateU87A,
  }
}

/**
 * Compare Old vs New regime and recommend
 */
export function compareRegimes(
  income: number,
  deductions?: Record<string, number>
): RegimeComparison {
  const oldRegime = calculateIncomeTax(income, "old", deductions)
  const newRegime = calculateIncomeTax(income, "new", deductions)
  const savings = oldRegime.totalTax - newRegime.totalTax

  let recommendation: string
  if (savings > 0) {
    recommendation = `New regime saves ₹${savings.toLocaleString("en-IN")}. Recommended unless you have significant Chapter VI-A deductions exceeding the benefit.`
  } else if (savings < 0) {
    recommendation = `Old regime saves ₹${Math.abs(savings).toLocaleString("en-IN")}. Your deductions make the old regime more beneficial.`
  } else {
    recommendation = "Both regimes result in the same tax. New regime is default unless you opt out."
  }

  return { old: oldRegime, new: newRegime, recommendation, savings }
}
