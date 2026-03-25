// ITR Form Engine for FY 2025-26 (AY 2026-27)
// Supports ITR-1 (Sahaj), ITR-2, ITR-3, ITR-4 (Sugam)

// ─── Types ────────────────────────────────────────────────────

export type ITRForm = "ITR-1" | "ITR-2" | "ITR-3" | "ITR-4"

export interface EmployeeIncome {
  basic: number
  da: number
  hra: number
  specialAllowance: number
  lta: number
  otherAllowances: number
  form16TDS: number
}

export interface BusinessIncome {
  turnover: number
  expenses: number
  scheme: "regular" | "44AD" | "44ADA"
}

export interface CapitalGains {
  shortTerm: number
  longTerm: number
}

export interface OtherSources {
  interestIncome: number
  rentalIncome: number
  otherIncome: number
}

export interface Deductions {
  section80C: number    // max 1.5L - PPF, ELSS, LIC, NSC, etc.
  section80CCD1B: number // max 50K - NPS additional
  section80D: number    // health insurance - self 25K, parents 25K/50K
  section80E: number    // education loan interest (no limit)
  section80G: number    // donations
  section80TTA: number  // max 10K savings interest
  section80U: number    // disability
  hra: number           // HRA exemption calculated
  lta: number           // LTA exemption
  homeLoanInterest: number // Sec 24 - max 2L self-occupied
}

export interface PersonalInfo {
  name: string
  pan: string
  aadhaar: string
  dob: string
  residencyStatus: "resident" | "nri" | "rnor"
  filingDate: string
}

export interface ITRInput {
  personalInfo: PersonalInfo
  mode: "employee" | "business"
  employeeIncome?: EmployeeIncome
  businessIncome?: BusinessIncome
  capitalGains?: CapitalGains
  otherSources?: OtherSources
  deductions: Deductions
  regime: "old" | "new"
}

export interface ITRResult {
  itrForm: ITRForm
  formReason: string
  grossSalaryIncome: number
  grossBusinessIncome: number
  grossCapitalGains: number
  grossOtherIncome: number
  grossTotalIncome: number
  totalDeductions: number
  deductionBreakdown: Record<string, number>
  standardDeduction: number
  taxableIncome: number
  slabwiseTax: { slab: string; amount: number; rate: number; tax: number }[]
  baseTax: number
  rebateU87A: number
  taxAfterRebate: number
  surcharge: number
  surchargeRate: number
  cess: number
  totalTax: number
  tdsAlreadyPaid: number
  taxPayable: number
  effectiveRate: number
  regime: "old" | "new"
}

// ─── Slab Definitions FY 2025-26 ─────────────────────────────

const NEW_REGIME_SLABS = [
  { min: 0, max: 400000, rate: 0 },
  { min: 400000, max: 800000, rate: 5 },
  { min: 800000, max: 1200000, rate: 10 },
  { min: 1200000, max: 1600000, rate: 15 },
  { min: 1600000, max: 2000000, rate: 20 },
  { min: 2000000, max: 2400000, rate: 25 },
  { min: 2400000, max: Infinity, rate: 30 },
]

const OLD_REGIME_SLABS = [
  { min: 0, max: 250000, rate: 0 },
  { min: 250000, max: 500000, rate: 5 },
  { min: 500000, max: 1000000, rate: 20 },
  { min: 1000000, max: Infinity, rate: 30 },
]

// ─── ITR Form Auto-Detection ─────────────────────────────────

export function detectITRForm(input: ITRInput): { form: ITRForm; reason: string } {
  const hasCapitalGains = (input.capitalGains?.shortTerm || 0) + (input.capitalGains?.longTerm || 0) > 0
  const isNRI = input.personalInfo.residencyStatus !== "resident"

  if (input.mode === "business") {
    if (input.businessIncome?.scheme === "44AD" || input.businessIncome?.scheme === "44ADA") {
      return {
        form: "ITR-4",
        reason: "Business income under presumptive taxation (Sec 44AD/44ADA)",
      }
    }
    return {
      form: "ITR-3",
      reason: "Business/profession income with regular books of accounts",
    }
  }

  // Employee mode
  if (isNRI || hasCapitalGains) {
    return {
      form: "ITR-2",
      reason: isNRI
        ? "NRI/RNOR status requires ITR-2"
        : "Capital gains income present - ITR-2 required",
    }
  }

  const totalSalary = computeGrossSalary(input.employeeIncome)
  const totalOther = (input.otherSources?.interestIncome || 0) +
    (input.otherSources?.rentalIncome || 0) +
    (input.otherSources?.otherIncome || 0)
  const grossTotal = totalSalary + totalOther

  if (grossTotal <= 5000000 && !hasCapitalGains) {
    return {
      form: "ITR-1",
      reason: "Salaried individual with total income up to ₹50L, no capital gains",
    }
  }

  return {
    form: "ITR-2",
    reason: "Total income exceeds ₹50L - ITR-2 required",
  }
}

// ─── Computation Helpers ─────────────────────────────────────

function computeGrossSalary(emp?: EmployeeIncome): number {
  if (!emp) return 0
  return emp.basic + emp.da + emp.hra + emp.specialAllowance + emp.lta + emp.otherAllowances
}

function computeBusinessIncome(biz?: BusinessIncome): number {
  if (!biz) return 0
  if (biz.scheme === "44AD") {
    // 8% of turnover (6% for digital receipts - we use 8% as default)
    const presumptiveRate = 0.08
    const digitalRate = 0.06
    // Use lower rate if turnover <= 3Cr and >95% digital (simplified: use 8%)
    return Math.max(biz.turnover * presumptiveRate, biz.turnover * digitalRate)
  }
  if (biz.scheme === "44ADA") {
    // 50% of gross receipts for professionals
    return biz.turnover * 0.5
  }
  // Regular - turnover minus expenses
  return Math.max(0, biz.turnover - biz.expenses)
}

function computeDeductions(input: ITRInput): { total: number; breakdown: Record<string, number> } {
  if (input.regime === "new") {
    // New regime: only standard deduction + NPS employer (80CCD(2))
    return { total: 0, breakdown: {} }
  }

  const d = input.deductions
  const breakdown: Record<string, number> = {}

  if (d.section80C > 0) breakdown["80C (PPF/ELSS/LIC)"] = Math.min(d.section80C, 150000)
  if (d.section80CCD1B > 0) breakdown["80CCD(1B) NPS"] = Math.min(d.section80CCD1B, 50000)
  if (d.section80D > 0) breakdown["80D Health Insurance"] = d.section80D
  if (d.section80E > 0) breakdown["80E Education Loan"] = d.section80E
  if (d.section80G > 0) breakdown["80G Donations"] = d.section80G
  if (d.section80TTA > 0) breakdown["80TTA Savings Interest"] = Math.min(d.section80TTA, 10000)
  if (d.section80U > 0) breakdown["80U Disability"] = d.section80U
  if (d.hra > 0) breakdown["HRA Exemption"] = d.hra
  if (d.lta > 0) breakdown["LTA Exemption"] = d.lta
  if (d.homeLoanInterest > 0) breakdown["Sec 24 Home Loan Interest"] = Math.min(d.homeLoanInterest, 200000)

  const total = Object.values(breakdown).reduce((a, b) => a + b, 0)
  return { total, breakdown }
}

function calculateSlabTax(taxableIncome: number, slabs: typeof OLD_REGIME_SLABS) {
  const slabwiseTax: ITRResult["slabwiseTax"] = []
  let baseTax = 0

  for (const slab of slabs) {
    if (taxableIncome <= slab.min) break
    const amount = Math.min(taxableIncome, slab.max) - slab.min
    const tax = Math.round(amount * slab.rate / 100)
    slabwiseTax.push({
      slab: slab.max === Infinity
        ? `Above ₹${(slab.min / 100000).toFixed(1)}L`
        : `₹${(slab.min / 100000).toFixed(1)}L - ₹${(slab.max / 100000).toFixed(1)}L`,
      amount,
      rate: slab.rate,
      tax,
    })
    baseTax += tax
  }

  return { slabwiseTax, baseTax }
}

function getSurchargeRate(income: number, regime: "old" | "new"): number {
  if (regime === "new") {
    if (income > 20000000) return 25
    if (income > 10000000) return 15
    if (income > 5000000) return 10
    return 0
  }
  if (income > 50000000) return 37
  if (income > 20000000) return 25
  if (income > 10000000) return 15
  if (income > 5000000) return 10
  return 0
}

// ─── Main Computation ────────────────────────────────────────

export function computeITR(input: ITRInput): ITRResult {
  const { form, reason } = detectITRForm(input)

  const grossSalaryIncome = computeGrossSalary(input.employeeIncome)
  const grossBusinessIncome = computeBusinessIncome(input.businessIncome)
  const grossCapitalGains = (input.capitalGains?.shortTerm || 0) + (input.capitalGains?.longTerm || 0)
  const grossOtherIncome = (input.otherSources?.interestIncome || 0) +
    (input.otherSources?.rentalIncome || 0) +
    (input.otherSources?.otherIncome || 0)
  const grossTotalIncome = grossSalaryIncome + grossBusinessIncome + grossCapitalGains + grossOtherIncome

  const standardDeduction = input.regime === "new" ? 75000 : 50000
  const { total: totalDeductions, breakdown: deductionBreakdown } = computeDeductions(input)

  const taxableIncome = Math.max(0, grossTotalIncome - standardDeduction - totalDeductions)

  const slabs = input.regime === "old" ? OLD_REGIME_SLABS : NEW_REGIME_SLABS
  const { slabwiseTax, baseTax } = calculateSlabTax(taxableIncome, slabs)

  // Rebate u/s 87A
  let rebateU87A = 0
  if (input.regime === "new" && taxableIncome <= 1200000) {
    rebateU87A = Math.min(baseTax, 60000)
  } else if (input.regime === "old" && taxableIncome <= 500000) {
    rebateU87A = Math.min(baseTax, 12500)
  }

  const taxAfterRebate = Math.max(0, baseTax - rebateU87A)
  const surchargeRate = getSurchargeRate(taxableIncome, input.regime)
  const surcharge = Math.round(taxAfterRebate * surchargeRate / 100)
  const cess = Math.round((taxAfterRebate + surcharge) * 4 / 100)
  const totalTax = taxAfterRebate + surcharge + cess

  const tdsAlreadyPaid = input.employeeIncome?.form16TDS || 0
  const taxPayable = Math.max(0, totalTax - tdsAlreadyPaid)

  return {
    itrForm: form,
    formReason: reason,
    grossSalaryIncome,
    grossBusinessIncome,
    grossCapitalGains,
    grossOtherIncome,
    grossTotalIncome,
    totalDeductions,
    deductionBreakdown,
    standardDeduction,
    taxableIncome,
    slabwiseTax,
    baseTax,
    rebateU87A,
    taxAfterRebate,
    surcharge,
    surchargeRate,
    cess,
    totalTax,
    tdsAlreadyPaid,
    taxPayable,
    effectiveRate: grossTotalIncome > 0 ? Math.round(totalTax / grossTotalIncome * 10000) / 100 : 0,
    regime: input.regime,
  }
}
