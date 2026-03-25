// TODO: TDS (Tax Deducted at Source) rate tables
// Reference: Income Tax Act, Section 192-206

export const TDS_RATES = {
  // TODO: Populate with current TDS rates
  // Section 192 - Salary
  // Section 194A - Interest (non-bank)
  // Section 194C - Contractor payments
  // Section 194H - Commission/Brokerage
  // Section 194I - Rent
  // Section 194J - Professional fees
  // Section 194Q - Purchase of goods
} as const

export function getTDSRate(section: string, hasPAN: boolean) {
  // TODO: Return applicable TDS rate based on section and PAN availability
  throw new Error("Not implemented")
}
