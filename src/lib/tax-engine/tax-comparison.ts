// Tax Comparison Engine - Old vs New Regime for FY 2025-26
// Breakeven analysis and savings suggestions

import { calculateIncomeTax, type TaxBreakdown } from "./it-calculator"

export interface ComparisonInput {
  mode: "employee" | "business"
  grossIncome: number
  deductions: {
    section80C: number
    section80CCD1B: number
    section80D: number
    section80E: number
    section80G: number
    section80TTA: number
    hra: number
    homeLoanInterest: number
    other: number
  }
}

export interface SavingsSuggestion {
  section: string
  description: string
  maxBenefit: number
  taxSavings: number
  recommended: boolean
}

export interface BreakevenResult {
  breakevenDeduction: number
  description: string
}

export interface ComparisonResult {
  oldRegime: TaxBreakdown
  newRegime: TaxBreakdown
  savings: number
  savingsPercent: number
  betterRegime: "old" | "new"
  recommendation: string
  breakeven: BreakevenResult
  suggestions: SavingsSuggestion[]
  incomeBreakdown: { label: string; value: number }[]
}

export function compareRegimesFull(input: ComparisonInput): ComparisonResult {
  const d = input.deductions
  const deductionMap: Record<string, number> = {}
  if (d.section80C > 0) deductionMap["80C"] = Math.min(d.section80C, 150000)
  if (d.section80CCD1B > 0) deductionMap["80CCD(1B)"] = Math.min(d.section80CCD1B, 50000)
  if (d.section80D > 0) deductionMap["80D"] = d.section80D
  if (d.section80E > 0) deductionMap["80E"] = d.section80E
  if (d.section80G > 0) deductionMap["80G"] = d.section80G
  if (d.section80TTA > 0) deductionMap["80TTA"] = Math.min(d.section80TTA, 10000)
  if (d.hra > 0) deductionMap["HRA"] = d.hra
  if (d.homeLoanInterest > 0) deductionMap["Sec24"] = Math.min(d.homeLoanInterest, 200000)
  if (d.other > 0) deductionMap["Other"] = d.other

  const oldRegime = calculateIncomeTax(input.grossIncome, "old", deductionMap)
  const newRegime = calculateIncomeTax(input.grossIncome, "new")

  const savings = Math.abs(oldRegime.totalTax - newRegime.totalTax)
  const betterRegime: "old" | "new" = oldRegime.totalTax <= newRegime.totalTax ? "old" : "new"
  const savingsPercent = newRegime.totalTax > 0
    ? Math.round(savings / Math.max(oldRegime.totalTax, newRegime.totalTax) * 100)
    : 0

  // Breakeven analysis: find deduction amount where both regimes equal
  const breakeven = calculateBreakeven(input.grossIncome)

  // Recommendation text
  let recommendation: string
  if (betterRegime === "new") {
    recommendation = `New regime saves you ${formatINR(savings)}. Your current deductions (${formatINR(totalDeductions(d))}) are not enough to make the old regime beneficial. You need at least ${formatINR(breakeven.breakevenDeduction)} in deductions.`
  } else {
    recommendation = `Old regime saves you ${formatINR(savings)}. Your deductions of ${formatINR(totalDeductions(d))} make the old regime more tax-efficient. Keep maximizing your deductions.`
  }

  // Savings suggestions
  const suggestions = generateSuggestions(input)

  // Income breakdown for charts
  const incomeBreakdown = [{ label: "Gross Income", value: input.grossIncome }]

  return {
    oldRegime,
    newRegime,
    savings,
    savingsPercent,
    betterRegime,
    recommendation,
    breakeven,
    suggestions,
    incomeBreakdown,
  }
}

function totalDeductions(d: ComparisonInput["deductions"]): number {
  return (
    Math.min(d.section80C, 150000) +
    Math.min(d.section80CCD1B, 50000) +
    d.section80D +
    d.section80E +
    d.section80G +
    Math.min(d.section80TTA, 10000) +
    d.hra +
    Math.min(d.homeLoanInterest, 200000) +
    d.other
  )
}

function calculateBreakeven(grossIncome: number): BreakevenResult {
  // Binary search for breakeven deduction
  let low = 0
  let high = grossIncome
  const newTax = calculateIncomeTax(grossIncome, "new").totalTax

  for (let i = 0; i < 50; i++) {
    const mid = Math.round((low + high) / 2)
    const oldTax = calculateIncomeTax(grossIncome, "old", { deductions: mid }).totalTax
    if (oldTax > newTax) {
      low = mid
    } else {
      high = mid
    }
    if (high - low <= 100) break
  }

  const breakevenDeduction = Math.round(high / 1000) * 1000

  return {
    breakevenDeduction,
    description: breakevenDeduction > 0
      ? `You need total deductions of approximately ${formatINR(breakevenDeduction)} for the old regime to match the new regime.`
      : "New regime is always better for your income level regardless of deductions.",
  }
}

function generateSuggestions(input: ComparisonInput): SavingsSuggestion[] {
  const d = input.deductions
  const suggestions: SavingsSuggestion[] = []

  // 80C
  const used80C = Math.min(d.section80C, 150000)
  if (used80C < 150000) {
    const gap = 150000 - used80C
    suggestions.push({
      section: "Section 80C",
      description: `Invest ₹${(gap / 1000).toFixed(0)}K more in PPF/ELSS/NPS Tier-1 to max out 80C`,
      maxBenefit: gap,
      taxSavings: Math.round(gap * 0.3),
      recommended: true,
    })
  }

  // NPS 80CCD(1B)
  if (d.section80CCD1B < 50000) {
    const gap = 50000 - d.section80CCD1B
    suggestions.push({
      section: "80CCD(1B) NPS",
      description: `Additional NPS contribution of ₹${(gap / 1000).toFixed(0)}K for extra deduction over 80C`,
      maxBenefit: gap,
      taxSavings: Math.round(gap * 0.3),
      recommended: true,
    })
  }

  // 80D
  if (d.section80D < 75000) {
    suggestions.push({
      section: "Section 80D",
      description: "Health insurance: Self/family ₹25K + Parents ₹25K (₹50K if senior citizen)",
      maxBenefit: 75000 - d.section80D,
      taxSavings: Math.round((75000 - d.section80D) * 0.3),
      recommended: d.section80D === 0,
    })
  }

  // Home Loan
  if (d.homeLoanInterest < 200000 && d.homeLoanInterest > 0) {
    suggestions.push({
      section: "Section 24(b)",
      description: "Home loan interest deduction up to ₹2L for self-occupied property",
      maxBenefit: 200000 - d.homeLoanInterest,
      taxSavings: Math.round((200000 - d.homeLoanInterest) * 0.3),
      recommended: false,
    })
  }

  return suggestions
}

function formatINR(n: number): string {
  return "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 })
}
