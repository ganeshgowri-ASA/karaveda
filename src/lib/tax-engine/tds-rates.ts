// TDS (Tax Deducted at Source) Rate Table - FY 2025-26
// Reference: Income Tax Act, Sections 192-206C

export interface TDSEntry {
  section: string
  nature: string
  threshold: number
  rateIndividual: number
  rateOther: number
  rateNoPAN: number
  remarks: string
}

export const TDS_RATES: Record<string, TDSEntry> = {
  "192": {
    section: "192",
    nature: "Salary",
    threshold: 0,
    rateIndividual: 0, // As per slab rates
    rateOther: 0,
    rateNoPAN: 0,
    remarks: "TDS at applicable slab rates. Employer deducts based on estimated annual salary.",
  },
  "193": {
    section: "193",
    nature: "Interest on Securities",
    threshold: 10000,
    rateIndividual: 10,
    rateOther: 10,
    rateNoPAN: 20,
    remarks: "Threshold of ₹10,000 for debentures. No threshold for Govt securities.",
  },
  "194A": {
    section: "194A",
    nature: "Interest (other than on securities)",
    threshold: 50000, // Bank: 50K, Others: 5K
    rateIndividual: 10,
    rateOther: 10,
    rateNoPAN: 20,
    remarks: "Banks/co-op/PO: ₹50,000 (senior citizens: ₹1,00,000). Others: ₹5,000.",
  },
  "194B": {
    section: "194B",
    nature: "Lottery/Crossword Puzzle winnings",
    threshold: 10000,
    rateIndividual: 30,
    rateOther: 30,
    rateNoPAN: 30,
    remarks: "Flat 30% on winnings exceeding ₹10,000.",
  },
  "194BA": {
    section: "194BA",
    nature: "Online Gaming winnings",
    threshold: 0,
    rateIndividual: 30,
    rateOther: 30,
    rateNoPAN: 30,
    remarks: "30% on net winnings at the time of withdrawal or end of FY.",
  },
  "194C": {
    section: "194C",
    nature: "Contractor/Sub-contractor payments",
    threshold: 30000, // Single: 30K, Aggregate: 1L
    rateIndividual: 1,
    rateOther: 2,
    rateNoPAN: 20,
    remarks: "Single payment ₹30,000 or aggregate ₹1,00,000 in FY. HUF/Individual: 1%, Others: 2%.",
  },
  "194D": {
    section: "194D",
    nature: "Insurance Commission",
    threshold: 15000,
    rateIndividual: 5,
    rateOther: 10,
    rateNoPAN: 20,
    remarks: "5% for individuals/HUF, 10% for others.",
  },
  "194DA": {
    section: "194DA",
    nature: "Life Insurance Policy maturity",
    threshold: 100000,
    rateIndividual: 5,
    rateOther: 5,
    rateNoPAN: 20,
    remarks: "5% on income component (maturity proceeds minus premium paid).",
  },
  "194E": {
    section: "194E",
    nature: "Non-resident sportsman/entertainer",
    threshold: 0,
    rateIndividual: 20,
    rateOther: 20,
    rateNoPAN: 20,
    remarks: "20% on payments to NR sportsmen/entertainers or their associations.",
  },
  "194H": {
    section: "194H",
    nature: "Commission or Brokerage",
    threshold: 15000,
    rateIndividual: 5,
    rateOther: 5,
    rateNoPAN: 20,
    remarks: "5% on commission/brokerage exceeding ₹15,000 in FY.",
  },
  "194I-Land": {
    section: "194I",
    nature: "Rent - Land/Building/Furniture",
    threshold: 240000,
    rateIndividual: 10,
    rateOther: 10,
    rateNoPAN: 20,
    remarks: "10% on rent of land/building/furniture exceeding ₹2,40,000 in FY.",
  },
  "194I-PME": {
    section: "194I",
    nature: "Rent - Plant/Machinery/Equipment",
    threshold: 240000,
    rateIndividual: 2,
    rateOther: 2,
    rateNoPAN: 20,
    remarks: "2% on rent of plant/machinery/equipment exceeding ₹2,40,000 in FY.",
  },
  "194IA": {
    section: "194IA",
    nature: "Transfer of Immovable Property",
    threshold: 5000000,
    rateIndividual: 1,
    rateOther: 1,
    rateNoPAN: 20,
    remarks: "1% on consideration exceeding ₹50 lakhs for immovable property (not agricultural).",
  },
  "194IB": {
    section: "194IB",
    nature: "Rent by Individual/HUF (non-audit)",
    threshold: 50000, // Per month
    rateIndividual: 5,
    rateOther: 5,
    rateNoPAN: 20,
    remarks: "5% if monthly rent exceeds ₹50,000. For individuals/HUF not liable to audit.",
  },
  "194J-Technical": {
    section: "194J",
    nature: "Professional/Technical fees - Technical Services",
    threshold: 30000,
    rateIndividual: 2,
    rateOther: 2,
    rateNoPAN: 20,
    remarks: "2% for technical services/call centre. Threshold ₹30,000 in FY.",
  },
  "194J-Professional": {
    section: "194J",
    nature: "Professional/Technical fees - Professional/Royalty",
    threshold: 30000,
    rateIndividual: 10,
    rateOther: 10,
    rateNoPAN: 20,
    remarks: "10% for professional services, royalty, non-compete fees. Threshold ₹30,000 in FY.",
  },
  "194K": {
    section: "194K",
    nature: "Mutual Fund income",
    threshold: 5000,
    rateIndividual: 10,
    rateOther: 10,
    rateNoPAN: 20,
    remarks: "10% on dividend from mutual funds exceeding ₹5,000 in FY.",
  },
  "194LA": {
    section: "194LA",
    nature: "Compensation on acquisition of immovable property",
    threshold: 250000,
    rateIndividual: 10,
    rateOther: 10,
    rateNoPAN: 20,
    remarks: "10% on compensation exceeding ₹2,50,000 (not agricultural).",
  },
  "194M": {
    section: "194M",
    nature: "Commission/Contract by Individual/HUF",
    threshold: 5000000,
    rateIndividual: 5,
    rateOther: 5,
    rateNoPAN: 20,
    remarks: "5% on payments exceeding ₹50 lakhs by individual/HUF for contract/commission/brokerage.",
  },
  "194N": {
    section: "194N",
    nature: "Cash withdrawal",
    threshold: 10000000,
    rateIndividual: 2,
    rateOther: 2,
    rateNoPAN: 20,
    remarks: "2% on cash withdrawal exceeding ₹1 Cr in FY. 5% if no ITR filed for 3 years (threshold ₹20L).",
  },
  "194O": {
    section: "194O",
    nature: "E-commerce participant",
    threshold: 500000,
    rateIndividual: 1,
    rateOther: 1,
    rateNoPAN: 5,
    remarks: "1% by e-commerce operator on gross amount. Threshold ₹5 lakhs for individuals/HUF.",
  },
  "194P": {
    section: "194P",
    nature: "Senior Citizen (75+) - Bank TDS",
    threshold: 0,
    rateIndividual: 0, // As per slab
    rateOther: 0,
    rateNoPAN: 0,
    remarks: "Bank deducts tax at slab rates for senior citizens (75+) with only pension/interest income.",
  },
  "194Q": {
    section: "194Q",
    nature: "Purchase of Goods",
    threshold: 5000000,
    rateIndividual: 0.1,
    rateOther: 0.1,
    rateNoPAN: 5,
    remarks: "0.1% on purchase exceeding ₹50 lakhs. Buyer's turnover must exceed ₹10 Cr in preceding FY.",
  },
  "194R": {
    section: "194R",
    nature: "Perquisite/Benefit in kind (business)",
    threshold: 20000,
    rateIndividual: 10,
    rateOther: 10,
    rateNoPAN: 20,
    remarks: "10% on value of benefit/perquisite exceeding ₹20,000 in FY.",
  },
  "194S": {
    section: "194S",
    nature: "Virtual Digital Assets (Crypto)",
    threshold: 50000, // Specified person: 50K, Others: 10K
    rateIndividual: 1,
    rateOther: 1,
    rateNoPAN: 20,
    remarks: "1% on transfer of VDA. Threshold: ₹50,000 (specified) / ₹10,000 (others).",
  },
  "195": {
    section: "195",
    nature: "Payment to Non-Resident",
    threshold: 0,
    rateIndividual: 0, // Varies by nature + DTAA
    rateOther: 0,
    rateNoPAN: 20,
    remarks: "Rates vary: Interest 20%, Royalty/FTS 10%, Other 30%. DTAA rates may apply if lower.",
  },
  "206C-Scrap": {
    section: "206C",
    nature: "TCS - Sale of Scrap",
    threshold: 0,
    rateIndividual: 1,
    rateOther: 1,
    rateNoPAN: 5,
    remarks: "TCS 1% on sale of scrap.",
  },
  "206C-Minerals": {
    section: "206C",
    nature: "TCS - Minerals (coal, lignite, iron ore)",
    threshold: 0,
    rateIndividual: 1,
    rateOther: 1,
    rateNoPAN: 5,
    remarks: "TCS 1% on sale of specified minerals.",
  },
  "206C-LRS": {
    section: "206C",
    nature: "TCS - Liberalised Remittance Scheme",
    threshold: 700000,
    rateIndividual: 5,
    rateOther: 5,
    rateNoPAN: 10,
    remarks: "5% above ₹7 lakhs (education/medical: 0.5% with loan). 20% for non-specified purposes above 7L.",
  },
  "206C-OverseasTour": {
    section: "206C",
    nature: "TCS - Overseas Tour Package",
    threshold: 700000,
    rateIndividual: 5,
    rateOther: 5,
    rateNoPAN: 10,
    remarks: "5% on overseas tour packages above ₹7 lakhs.",
  },
  "206C-Motor": {
    section: "206C",
    nature: "TCS - Motor Vehicle (above ₹10L)",
    threshold: 1000000,
    rateIndividual: 1,
    rateOther: 1,
    rateNoPAN: 5,
    remarks: "TCS 1% on motor vehicle exceeding ₹10 lakhs.",
  },
} as const

export type TDSSection = keyof typeof TDS_RATES

/**
 * Get TDS rate for a section based on PAN availability
 */
export function getTDSRate(
  section: string,
  hasPAN: boolean,
  isIndividual: boolean = true
): {
  rate: number
  section: string
  nature: string
  threshold: number
  remarks: string
} {
  const entry = TDS_RATES[section]
  if (!entry) {
    throw new Error(`Unknown TDS section: ${section}. Valid sections: ${Object.keys(TDS_RATES).join(", ")}`)
  }

  const rate = !hasPAN
    ? entry.rateNoPAN
    : isIndividual
      ? entry.rateIndividual
      : entry.rateOther

  return {
    rate,
    section: entry.section,
    nature: entry.nature,
    threshold: entry.threshold,
    remarks: entry.remarks,
  }
}

/**
 * Calculate TDS amount for a payment
 */
export function calculateTDS(
  section: string,
  amount: number,
  hasPAN: boolean,
  isIndividual: boolean = true
): {
  tdsAmount: number
  netPayable: number
  rate: number
  section: string
  nature: string
  thresholdExceeded: boolean
} {
  const info = getTDSRate(section, hasPAN, isIndividual)
  const thresholdExceeded = amount > info.threshold

  // TDS only applies if threshold is exceeded
  const tdsAmount = thresholdExceeded
    ? Math.round(amount * info.rate / 100)
    : 0

  return {
    tdsAmount,
    netPayable: amount - tdsAmount,
    rate: info.rate,
    section: info.section,
    nature: info.nature,
    thresholdExceeded,
  }
}

/**
 * Search TDS sections by keyword
 */
export function searchTDSSections(keyword: string): TDSEntry[] {
  const lower = keyword.toLowerCase()
  return Object.values(TDS_RATES).filter(
    (entry) =>
      entry.nature.toLowerCase().includes(lower) ||
      entry.section.toLowerCase().includes(lower) ||
      entry.remarks.toLowerCase().includes(lower)
  )
}
