// P&L (Profit & Loss) Engine for FY 2025-26
// Employee: Monthly income/tax/take-home
// Business: Revenue/COGS/Gross Profit/OpEx/Net Profit

import { calculateIncomeTax } from "./it-calculator"

// ─── Types ────────────────────────────────────────────────────

export interface EmployeePnLInput {
  annualSalary: number
  annualBonus: number
  otherIncome: number
  deductions80C: number
  deductions80D: number
  otherDeductions: number
  regime: "old" | "new"
  employerPF: number // employer contribution to PF (12% of basic)
}

export interface EmployeeMonthlyBreakdown {
  month: string
  grossIncome: number
  pf: number
  professionalTax: number
  tds: number
  takeHome: number
}

export interface EmployeePnLResult {
  annualGross: number
  annualTDS: number
  annualPF: number
  annualProfessionalTax: number
  annualTakeHome: number
  monthlyBreakdown: EmployeeMonthlyBreakdown[]
  effectiveRate: number
}

export interface BusinessPnLInput {
  monthlyData: {
    month: string
    revenue: number
    cogs: number
    operatingExpenses: number
  }[]
  regime: "old" | "new"
  deductions: number
}

export interface BusinessMonthlyBreakdown {
  month: string
  revenue: number
  cogs: number
  grossProfit: number
  grossMargin: number
  operatingExpenses: number
  netProfit: number
  netMargin: number
}

export interface BusinessQuarterlyBreakdown {
  quarter: string
  revenue: number
  cogs: number
  grossProfit: number
  operatingExpenses: number
  netProfit: number
}

export interface BusinessPnLResult {
  monthlyBreakdown: BusinessMonthlyBreakdown[]
  quarterlyBreakdown: BusinessQuarterlyBreakdown[]
  annualRevenue: number
  annualCOGS: number
  annualGrossProfit: number
  annualGrossMargin: number
  annualOperatingExpenses: number
  annualNetProfit: number
  annualNetMargin: number
  estimatedTax: number
  expenseDistribution: { label: string; value: number }[]
}

// ─── Employee P&L ────────────────────────────────────────────

const MONTHS = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"]

export function computeEmployeePnL(input: EmployeePnLInput): EmployeePnLResult {
  const annualGross = input.annualSalary + input.annualBonus + input.otherIncome

  const deductions: Record<string, number> = {}
  if (input.deductions80C > 0) deductions["80C"] = Math.min(input.deductions80C, 150000)
  if (input.deductions80D > 0) deductions["80D"] = input.deductions80D
  if (input.otherDeductions > 0) deductions["Other"] = input.otherDeductions

  const taxResult = calculateIncomeTax(annualGross, input.regime, deductions)
  const annualTDS = taxResult.totalTax
  const annualPF = input.employerPF * 12
  const annualProfessionalTax = 2500 // Standard professional tax (varies by state)
  const annualTakeHome = annualGross - annualTDS - annualPF - annualProfessionalTax

  const monthlyGross = Math.round(input.annualSalary / 12)
  const monthlyTDS = Math.round(annualTDS / 12)
  const monthlyPF = input.employerPF
  const monthlyPT = Math.round(annualProfessionalTax / 12)

  const monthlyBreakdown: EmployeeMonthlyBreakdown[] = MONTHS.map((month, i) => {
    // Add bonus in March (last month)
    const bonus = i === 11 ? input.annualBonus : 0
    const otherMonthly = Math.round(input.otherIncome / 12)
    const gross = monthlyGross + bonus + otherMonthly
    return {
      month,
      grossIncome: gross,
      pf: monthlyPF,
      professionalTax: monthlyPT,
      tds: monthlyTDS,
      takeHome: gross - monthlyTDS - monthlyPF - monthlyPT,
    }
  })

  return {
    annualGross,
    annualTDS,
    annualPF,
    annualProfessionalTax,
    annualTakeHome,
    monthlyBreakdown,
    effectiveRate: taxResult.effectiveRate,
  }
}

// ─── Business P&L ────────────────────────────────────────────

const DEFAULT_MONTHS = MONTHS.map((month) => ({
  month,
  revenue: 0,
  cogs: 0,
  operatingExpenses: 0,
}))

export function computeBusinessPnL(input: BusinessPnLInput): BusinessPnLResult {
  const data = input.monthlyData.length > 0 ? input.monthlyData : DEFAULT_MONTHS

  const monthlyBreakdown: BusinessMonthlyBreakdown[] = data.map((m) => {
    const grossProfit = m.revenue - m.cogs
    const netProfit = grossProfit - m.operatingExpenses
    return {
      month: m.month,
      revenue: m.revenue,
      cogs: m.cogs,
      grossProfit,
      grossMargin: m.revenue > 0 ? Math.round(grossProfit / m.revenue * 100) : 0,
      operatingExpenses: m.operatingExpenses,
      netProfit,
      netMargin: m.revenue > 0 ? Math.round(netProfit / m.revenue * 100) : 0,
    }
  })

  // Quarterly aggregation
  const quarters = ["Q1 (Apr-Jun)", "Q2 (Jul-Sep)", "Q3 (Oct-Dec)", "Q4 (Jan-Mar)"]
  const quarterlyBreakdown: BusinessQuarterlyBreakdown[] = quarters.map((quarter, qi) => {
    const start = qi * 3
    const qMonths = monthlyBreakdown.slice(start, start + 3)
    return {
      quarter,
      revenue: qMonths.reduce((s, m) => s + m.revenue, 0),
      cogs: qMonths.reduce((s, m) => s + m.cogs, 0),
      grossProfit: qMonths.reduce((s, m) => s + m.grossProfit, 0),
      operatingExpenses: qMonths.reduce((s, m) => s + m.operatingExpenses, 0),
      netProfit: qMonths.reduce((s, m) => s + m.netProfit, 0),
    }
  })

  const annualRevenue = monthlyBreakdown.reduce((s, m) => s + m.revenue, 0)
  const annualCOGS = monthlyBreakdown.reduce((s, m) => s + m.cogs, 0)
  const annualGrossProfit = annualRevenue - annualCOGS
  const annualOperatingExpenses = monthlyBreakdown.reduce((s, m) => s + m.operatingExpenses, 0)
  const annualNetProfit = annualGrossProfit - annualOperatingExpenses

  // Estimated tax on net profit
  const deductions: Record<string, number> = input.deductions > 0 ? { deductions: input.deductions } : {}
  const taxResult = calculateIncomeTax(Math.max(0, annualNetProfit), input.regime, deductions)

  const expenseDistribution: { label: string; value: number }[] = [
    { label: "COGS", value: annualCOGS },
    { label: "Operating Expenses", value: annualOperatingExpenses },
    { label: "Tax", value: taxResult.totalTax },
    { label: "Net Profit (After Tax)", value: Math.max(0, annualNetProfit - taxResult.totalTax) },
  ]

  return {
    monthlyBreakdown,
    quarterlyBreakdown,
    annualRevenue,
    annualCOGS,
    annualGrossProfit,
    annualGrossMargin: annualRevenue > 0 ? Math.round(annualGrossProfit / annualRevenue * 100) : 0,
    annualOperatingExpenses,
    annualNetProfit,
    annualNetMargin: annualRevenue > 0 ? Math.round(annualNetProfit / annualRevenue * 100) : 0,
    estimatedTax: taxResult.totalTax,
    expenseDistribution,
  }
}
