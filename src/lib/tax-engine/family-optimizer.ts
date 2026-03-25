// Family Tax Optimizer - Husband + Wife dual-income optimization
// Legal strategies with risk assessment: GREEN (safe), YELLOW (scrutiny risk), RED (avoid)

import { calculateIncomeTax, type TaxBreakdown } from "./it-calculator"

// ─── Types ────────────────────────────────────────────────────

export type RiskLevel = "GREEN" | "YELLOW" | "RED"

export interface SpouseInput {
  name: string
  mode: "employee" | "business"
  grossIncome: number
  deductions: {
    section80C: number
    section80CCD1B: number
    section80D: number
    hra: number
    homeLoanInterest: number
    other: number
  }
  regime: "old" | "new"
}

export interface Strategy {
  id: string
  title: string
  description: string
  risk: RiskLevel
  annualSavings: number
  details: string
  applicableTo: "spouse1" | "spouse2" | "both"
}

export interface FamilyResult {
  spouse1Tax: TaxBreakdown
  spouse2Tax: TaxBreakdown
  combinedTaxBefore: number
  combinedTaxAfter: number
  totalSavings: number
  strategies: Strategy[]
  summary: string
}

// ─── Computation ─────────────────────────────────────────────

export function optimizeFamily(spouse1: SpouseInput, spouse2: SpouseInput): FamilyResult {
  const s1Deductions = buildDeductions(spouse1)
  const s2Deductions = buildDeductions(spouse2)

  const spouse1Tax = calculateIncomeTax(spouse1.grossIncome, spouse1.regime, s1Deductions)
  const spouse2Tax = calculateIncomeTax(spouse2.grossIncome, spouse2.regime, s2Deductions)

  const combinedTaxBefore = spouse1Tax.totalTax + spouse2Tax.totalTax

  const strategies = generateStrategies(spouse1, spouse2, spouse1Tax, spouse2Tax)
  const totalSavings = strategies
    .filter((s) => s.risk === "GREEN" || s.risk === "YELLOW")
    .reduce((sum, s) => sum + s.annualSavings, 0)

  const combinedTaxAfter = Math.max(0, combinedTaxBefore - totalSavings)

  const summary = totalSavings > 0
    ? `Your family can potentially save ₹${totalSavings.toLocaleString("en-IN")} per year through legal tax optimization strategies.`
    : "Your current tax structure is already well-optimized. Review the strategies below for any additional opportunities."

  return {
    spouse1Tax,
    spouse2Tax,
    combinedTaxBefore,
    combinedTaxAfter,
    totalSavings,
    strategies,
    summary,
  }
}

function buildDeductions(spouse: SpouseInput): Record<string, number> {
  const d = spouse.deductions
  const result: Record<string, number> = {}
  if (d.section80C > 0) result["80C"] = Math.min(d.section80C, 150000)
  if (d.section80CCD1B > 0) result["80CCD(1B)"] = Math.min(d.section80CCD1B, 50000)
  if (d.section80D > 0) result["80D"] = d.section80D
  if (d.hra > 0) result["HRA"] = d.hra
  if (d.homeLoanInterest > 0) result["Sec24"] = Math.min(d.homeLoanInterest, 200000)
  if (d.other > 0) result["Other"] = d.other
  return result
}

function generateStrategies(
  s1: SpouseInput,
  s2: SpouseInput,
  s1Tax: TaxBreakdown,
  s2Tax: TaxBreakdown
): Strategy[] {
  const strategies: Strategy[] = []
  const higherTaxSpouse = s1Tax.totalTax >= s2Tax.totalTax ? "spouse1" : "spouse2"
  const higherIncome = Math.max(s1.grossIncome, s2.grossIncome)
  const lowerIncome = Math.min(s1.grossIncome, s2.grossIncome)

  // 1. NPS for both spouses (GREEN)
  const s1NPS = Math.min(s1.deductions.section80CCD1B, 50000)
  const s2NPS = Math.min(s2.deductions.section80CCD1B, 50000)
  if (s1NPS < 50000 || s2NPS < 50000) {
    const gap = (50000 - s1NPS) + (50000 - s2NPS)
    strategies.push({
      id: "nps-both",
      title: "NPS for Both Spouses",
      description: "Both spouses contribute ₹50,000 each to NPS under 80CCD(1B)",
      risk: "GREEN",
      annualSavings: Math.round(gap * 0.3),
      details: "Each spouse gets independent ₹50,000 deduction under Section 80CCD(1B) over and above 80C limit. This is completely independent for each taxpayer. Total family benefit: up to ₹1,00,000 deduction.",
      applicableTo: "both",
    })
  }

  // 2. Joint Home Loan - 80C + Section 24 (GREEN)
  const s1Home = s1.deductions.homeLoanInterest
  const s2Home = s2.deductions.homeLoanInterest
  if (s1Home === 0 && s2Home === 0 && higherIncome > 1000000) {
    strategies.push({
      id: "joint-home-loan",
      title: "Joint Home Loan - Both Claim Deductions",
      description: "Co-borrow home loan; both claim ₹2L interest (Sec 24) + ₹1.5L principal (80C)",
      risk: "GREEN",
      annualSavings: Math.round(350000 * 0.3) * 2,
      details: "When both spouses are co-borrowers and co-owners of a property, EACH can independently claim: Section 24(b) interest deduction up to ₹2,00,000 AND Section 80C principal repayment up to ₹1,50,000. Ownership ratio must match loan repayment ratio. Total family deduction: up to ₹7,00,000.",
      applicableTo: "both",
    })
  } else if ((s1Home > 0 || s2Home > 0) && (s1Home === 0 || s2Home === 0)) {
    strategies.push({
      id: "joint-home-add",
      title: "Add Spouse as Co-borrower",
      description: "Make non-claiming spouse a co-owner and co-borrower for additional deductions",
      risk: "GREEN",
      annualSavings: Math.round(200000 * 0.3),
      details: "Adding your spouse as a co-borrower allows them to also claim Section 24(b) deduction up to ₹2,00,000 on their own return. Both must be co-owners.",
      applicableTo: s1Home === 0 ? "spouse1" : "spouse2",
    })
  }

  // 3. Section 80D Family Health Insurance (GREEN)
  const totalHealth = s1.deductions.section80D + s2.deductions.section80D
  if (totalHealth < 100000) {
    strategies.push({
      id: "health-80d",
      title: "Family Health Insurance (80D)",
      description: "Optimize health insurance premium payments across both spouses",
      risk: "GREEN",
      annualSavings: Math.round(Math.min(100000 - totalHealth, 50000) * 0.25),
      details: "Each spouse can claim: ₹25,000 for self/family + ₹25,000 for parents (₹50,000 if senior citizens). Ensure each spouse pays their own parents' premium for maximum deduction. Total family potential: ₹1,00,000 to ₹1,50,000 depending on parents' age.",
      applicableTo: "both",
    })
  }

  // 4. 80C Max-out for both (GREEN)
  const s180C = Math.min(s1.deductions.section80C, 150000)
  const s280C = Math.min(s2.deductions.section80C, 150000)
  if (s180C < 150000 || s280C < 150000) {
    const gap = (150000 - s180C) + (150000 - s280C)
    strategies.push({
      id: "80c-both",
      title: "Max Out 80C for Both Spouses",
      description: "Both spouses independently invest ₹1.5L in PPF/ELSS/NPS",
      risk: "GREEN",
      annualSavings: Math.round(gap * 0.3),
      details: "Each spouse has an independent Section 80C limit of ₹1,50,000. Investments like PPF, ELSS, Life Insurance, NSC, 5-year FD, and Sukanya Samriddhi qualify. Children's tuition fees can be split between spouses.",
      applicableTo: "both",
    })
  }

  // 5. HUF (Hindu Undivided Family) (YELLOW)
  if (higherIncome > 1500000) {
    strategies.push({
      id: "huf",
      title: "Create HUF (Hindu Undivided Family)",
      description: "HUF is a separate tax entity with its own ₹2.5L basic exemption and slab rates",
      risk: "YELLOW",
      annualSavings: Math.round(Math.min(higherIncome * 0.05, 150000)),
      details: "HUF is a legitimate separate tax entity under the IT Act. It gets its own PAN, basic exemption (₹2.5L), and can claim 80C/80D deductions independently. However: (1) Only ancestral property or gifts received on marriage can be HUF income, (2) Salary CANNOT be diverted to HUF, (3) Business income can be routed if HUF is a partner. Requires proper deed and documentation.",
      applicableTo: "both",
    })
  }

  // 6. Section 64 Clubbing Warning (RED)
  if (s1.mode !== s2.mode) {
    strategies.push({
      id: "clubbing-warning",
      title: "Section 64 Clubbing Rules - Important Warning",
      description: "Income transferred between spouses may get clubbed in transferor's return",
      risk: "RED",
      annualSavings: 0,
      details: "Under Section 64(1)(iv), if you transfer assets to your spouse without adequate consideration, any income from those assets is clubbed in YOUR income. AVOID: (1) Gifting money to spouse to invest - interest/returns clubbed, (2) Transferring business to spouse at below market value, (3) Adding spouse as partner with disproportionate profit share. EXCEPTIONS: (1) Income on income (second-generation income) is NOT clubbed, (2) Salary paid to spouse by a firm for genuine services is NOT clubbed if reasonable, (3) Gifts from relatives other than spouse are not clubbed.",
      applicableTo: "both",
    })
  }

  // 7. Income Splitting via Legitimate Means (YELLOW)
  if (lowerIncome === 0 && higherIncome > 1500000) {
    strategies.push({
      id: "spouse-employment",
      title: "Employ Spouse in Business",
      description: "If one spouse has a business, employ the other for genuine work at reasonable salary",
      risk: "YELLOW",
      annualSavings: Math.round(Math.min(higherIncome * 0.03, 100000)),
      details: "Paying reasonable salary to spouse for genuine services in your business is a legitimate deduction. Key requirements: (1) Services must be genuine, (2) Salary must be at market rate - not inflated, (3) Maintain proper records: appointment letter, attendance, bank transfers, (4) Deduct TDS if applicable. The salary becomes taxable in spouse's hands at their lower slab rate.",
      applicableTo: higherTaxSpouse,
    })
  }

  // 8. Rental Income Split (YELLOW)
  if (higherIncome > 2000000) {
    strategies.push({
      id: "rental-split",
      title: "Joint Property Ownership for Rental Income",
      description: "Buy investment property jointly - rental income split per ownership ratio",
      risk: "YELLOW",
      annualSavings: Math.round(Math.min(higherIncome * 0.02, 75000)),
      details: "When property is jointly owned, rental income is taxed in proportion to ownership. If spouse buys with their own funds, no clubbing applies. Key: (1) Source of funds must be spouse's own income, (2) Ownership ratio should be clearly documented, (3) Both get independent Sec 24(b) deduction of ₹2L each for home loan interest.",
      applicableTo: "both",
    })
  }

  return strategies
}
