"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Scale, ArrowLeft, IndianRupee } from "lucide-react"
import { calculateGST, calculateGSTFromInclusive, type GSTResult } from "@/lib/tax-engine/gst-calculator"
import { calculateIncomeTax, compareRegimes, type TaxBreakdown, type RegimeComparison } from "@/lib/tax-engine/it-calculator"
import { TDS_RATES, getTDSRate, type TDSEntry } from "@/lib/tax-engine/tds-rates"

function formatINR(n: number): string {
  return "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 2 })
}

// ─── GST Calculator Tab ────────────────────────────────────────
function GSTCalculatorTab() {
  const [amount, setAmount] = useState("")
  const [rate, setRate] = useState("18")
  const [isInterState, setIsInterState] = useState(false)
  const [isInclusive, setIsInclusive] = useState(false)
  const [result, setResult] = useState<GSTResult | null>(null)

  function calculate() {
    const amt = parseFloat(amount)
    if (isNaN(amt) || amt <= 0) return
    const r = parseFloat(rate)
    const res = isInclusive
      ? calculateGSTFromInclusive(amt, r, isInterState)
      : calculateGST(amt, r, isInterState)
    setResult(res)
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>GST Calculator</CardTitle>
          <CardDescription>Calculate CGST/SGST or IGST on any amount</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Amount (₹)</label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">GST Rate</label>
            <div className="flex flex-wrap gap-2">
              {["0", "5", "12", "18", "28"].map((r) => (
                <Button
                  key={r}
                  variant={rate === r ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRate(r)}
                >
                  {r}%
                </Button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isInterState}
                onChange={(e) => setIsInterState(e.target.checked)}
                className="rounded"
              />
              Inter-State (IGST)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isInclusive}
                onChange={(e) => setIsInclusive(e.target.checked)}
                className="rounded"
              />
              GST Inclusive Amount
            </label>
          </div>
          <Button onClick={calculate} className="w-full">
            Calculate GST
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-emerald-600" />
              GST Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Row label="Base Amount" value={formatINR(result.baseAmount)} />
              <Row label="GST Rate" value={`${result.gstRate}%`} />
              {result.isInterState ? (
                <Row label="IGST" value={formatINR(result.igst)} highlight />
              ) : (
                <>
                  <Row label="CGST" value={formatINR(result.cgst)} highlight />
                  <Row label="SGST" value={formatINR(result.sgst)} highlight />
                </>
              )}
              <Row label="Total GST" value={formatINR(result.totalGST)} />
              <div className="border-t border-border pt-3">
                <Row label="Total Amount" value={formatINR(result.totalAmount)} bold />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ─── Income Tax Calculator Tab ─────────────────────────────────
function ITCalculatorTab() {
  const [income, setIncome] = useState("")
  const [deductions80C, setDeductions80C] = useState("")
  const [deductions80D, setDeductions80D] = useState("")
  const [hra, setHra] = useState("")
  const [otherDeductions, setOtherDeductions] = useState("")
  const [comparison, setComparison] = useState<RegimeComparison | null>(null)

  function calculate() {
    const inc = parseFloat(income)
    if (isNaN(inc) || inc <= 0) return

    const deductions: Record<string, number> = {}
    if (deductions80C) deductions["80C"] = Math.min(parseFloat(deductions80C) || 0, 150000)
    if (deductions80D) deductions["80D"] = parseFloat(deductions80D) || 0
    if (hra) deductions["HRA"] = parseFloat(hra) || 0
    if (otherDeductions) deductions["Other"] = parseFloat(otherDeductions) || 0

    setComparison(compareRegimes(inc, deductions))
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Income Tax Calculator - FY 2025-26</CardTitle>
          <CardDescription>Compare Old vs New regime side by side</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Gross Annual Income (₹)</label>
              <Input
                type="number"
                placeholder="e.g. 1200000"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Section 80C (₹) <span className="text-muted-foreground">(max 1.5L)</span></label>
              <Input
                type="number"
                placeholder="PPF, ELSS, LIC, etc."
                value={deductions80C}
                onChange={(e) => setDeductions80C(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Section 80D (₹)</label>
              <Input
                type="number"
                placeholder="Health Insurance"
                value={deductions80D}
                onChange={(e) => setDeductions80D(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">HRA Exemption (₹)</label>
              <Input
                type="number"
                placeholder="HRA claimed"
                value={hra}
                onChange={(e) => setHra(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Other Deductions (₹)</label>
              <Input
                type="number"
                placeholder="80E, 80G, etc."
                value={otherDeductions}
                onChange={(e) => setOtherDeductions(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={calculate} className="w-full sm:w-auto">
            Compare Regimes
          </Button>
        </CardContent>
      </Card>

      {comparison && (
        <>
          {/* Recommendation */}
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
            <CardContent className="p-4">
              <p className="font-medium text-amber-900 dark:text-amber-100">{comparison.recommendation}</p>
            </CardContent>
          </Card>

          {/* Side by side comparison */}
          <div className="grid gap-4 lg:grid-cols-2">
            <RegimeCard breakdown={comparison.old} label="Old Regime" />
            <RegimeCard breakdown={comparison.new} label="New Regime (Default)" />
          </div>
        </>
      )}
    </div>
  )
}

function RegimeCard({ breakdown, label }: { breakdown: TaxBreakdown; label: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <Row label="Gross Income" value={formatINR(breakdown.grossIncome)} />
        <Row label="Standard Deduction" value={`- ${formatINR(breakdown.standardDeduction)}`} />
        {Object.entries(breakdown.deductions).map(([key, val]) => (
          <Row key={key} label={`Deduction ${key}`} value={`- ${formatINR(val)}`} />
        ))}
        <Row label="Taxable Income" value={formatINR(breakdown.taxableIncome)} bold />
        <div className="border-t border-border pt-2">
          {breakdown.slabwiseTax.map((s, i) => (
            <Row key={i} label={`${s.slab} @ ${s.rate}%`} value={formatINR(s.tax)} />
          ))}
        </div>
        <Row label="Base Tax" value={formatINR(breakdown.baseTax)} />
        {breakdown.rebateU87A > 0 && (
          <Row label="Rebate u/s 87A" value={`- ${formatINR(breakdown.rebateU87A)}`} highlight />
        )}
        {breakdown.surcharge > 0 && (
          <Row label={`Surcharge (${breakdown.surchargeRate}%)`} value={formatINR(breakdown.surcharge)} />
        )}
        <Row label="Health & Education Cess (4%)" value={formatINR(breakdown.healthAndEducationCess)} />
        <div className="border-t border-border pt-2">
          <Row label="Total Tax" value={formatINR(breakdown.totalTax)} bold />
          <Row label="Effective Rate" value={`${breakdown.effectiveRate}%`} />
        </div>
      </CardContent>
    </Card>
  )
}

// ─── TDS Lookup Tab ────────────────────────────────────────────
function TDSLookupTab() {
  const [search, setSearch] = useState("")
  const entries = Object.values(TDS_RATES)
  const filtered = search
    ? entries.filter(
        (e) =>
          e.nature.toLowerCase().includes(search.toLowerCase()) ||
          e.section.includes(search) ||
          e.remarks.toLowerCase().includes(search.toLowerCase())
      )
    : entries

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>TDS / TCS Rate Lookup</CardTitle>
          <CardDescription>Search by section number, payment type, or keyword</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search: e.g. 194C, rent, contractor, salary..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </CardContent>
      </Card>

      <div className="space-y-2">
        {filtered.map((entry) => (
          <Card key={entry.section + entry.nature}>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-start gap-2">
                <Badge variant="outline" className="font-mono">Sec {entry.section}</Badge>
                <span className="font-medium text-foreground">{entry.nature}</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                <div>
                  <p className="text-xs text-muted-foreground">Individual/HUF</p>
                  <p className="font-medium">{entry.rateIndividual === 0 ? "Slab/Nil" : `${entry.rateIndividual}%`}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Others</p>
                  <p className="font-medium">{entry.rateOther === 0 ? "Slab/Nil" : `${entry.rateOther}%`}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">No PAN</p>
                  <p className="font-medium text-red-600">{entry.rateNoPAN}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Threshold</p>
                  <p className="font-medium">{entry.threshold > 0 ? formatINR(entry.threshold) : "Nil"}</p>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{entry.remarks}</p>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">No matching TDS sections found.</p>
        )}
      </div>
    </div>
  )
}

// ─── Shared Components ─────────────────────────────────────────
function Row({
  label,
  value,
  bold,
  highlight,
}: {
  label: string
  value: string
  bold?: boolean
  highlight?: boolean
}) {
  return (
    <div className="flex justify-between">
      <span className={`text-muted-foreground ${bold ? "font-semibold text-foreground" : ""}`}>
        {label}
      </span>
      <span
        className={`${bold ? "font-bold text-foreground" : "font-medium"} ${highlight ? "text-emerald-600 dark:text-emerald-400" : ""}`}
      >
        {value}
      </span>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────
export default function CalculatorPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Scale className="h-6 w-6 text-amber-600" />
            <h1 className="text-lg font-bold">Tax Calculators</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <Tabs defaultValue="gst" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="gst">GST Calculator</TabsTrigger>
            <TabsTrigger value="it">Income Tax</TabsTrigger>
            <TabsTrigger value="tds">TDS Lookup</TabsTrigger>
          </TabsList>

          <TabsContent value="gst">
            <GSTCalculatorTab />
          </TabsContent>
          <TabsContent value="it">
            <ITCalculatorTab />
          </TabsContent>
          <TabsContent value="tds">
            <TDSLookupTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
