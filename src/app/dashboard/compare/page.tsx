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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Scale, ArrowLeft, TrendingUp, Lightbulb, IndianRupee } from "lucide-react"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { compareRegimesFull, type ComparisonInput, type ComparisonResult } from "@/lib/tax-engine/tax-comparison"

function formatINR(n: number): string {
  return "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 })
}

function formatLakhs(n: number): string {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`
  return `₹${n}`
}

const COLORS = ["#f59e0b", "#8b5cf6", "#10b981", "#3b82f6", "#ef4444", "#ec4899"]

export default function ComparePage() {
  const [mode, setMode] = useState<"employee" | "business">("employee")
  const [income, setIncome] = useState("")
  const [d80C, setD80C] = useState("")
  const [d80CCD, setD80CCD] = useState("")
  const [d80D, setD80D] = useState("")
  const [d80E, setD80E] = useState("")
  const [d80G, setD80G] = useState("")
  const [d80TTA, setD80TTA] = useState("")
  const [dHRA, setDHRA] = useState("")
  const [dHome, setDHome] = useState("")
  const [dOther, setDOther] = useState("")
  const [result, setResult] = useState<ComparisonResult | null>(null)

  function calculate() {
    const gross = parseFloat(income)
    if (isNaN(gross) || gross <= 0) return

    const input: ComparisonInput = {
      mode,
      grossIncome: gross,
      deductions: {
        section80C: parseFloat(d80C) || 0,
        section80CCD1B: parseFloat(d80CCD) || 0,
        section80D: parseFloat(d80D) || 0,
        section80E: parseFloat(d80E) || 0,
        section80G: parseFloat(d80G) || 0,
        section80TTA: parseFloat(d80TTA) || 0,
        hra: parseFloat(dHRA) || 0,
        homeLoanInterest: parseFloat(dHome) || 0,
        other: parseFloat(dOther) || 0,
      },
    }
    setResult(compareRegimesFull(input))
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-1 h-4 w-4" /> Dashboard
              </Button>
            </Link>
            <Scale className="h-6 w-6 text-amber-600" />
            <h1 className="text-lg font-bold">Tax Regime Comparison</h1>
            <Badge variant="outline" className="ml-2">FY 2025-26</Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 space-y-6">
        {/* Input */}
        <Card>
          <CardHeader>
            <CardTitle>Enter Your Details</CardTitle>
            <CardDescription>Compare Old vs New regime with your actual deductions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-1 rounded-lg border border-border p-1 w-fit">
              <Button size="sm" variant={mode === "employee" ? "default" : "ghost"} onClick={() => setMode("employee")}>Employee</Button>
              <Button size="sm" variant={mode === "business" ? "default" : "ghost"} onClick={() => setMode("business")}>Business</Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Gross Annual Income (₹)</label>
                <Input type="number" placeholder="e.g. 1500000" value={income} onChange={(e) => setIncome(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">80C (max 1.5L)</label>
                <Input type="number" placeholder="PPF/ELSS/LIC" value={d80C} onChange={(e) => setD80C(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">80CCD(1B) NPS</label>
                <Input type="number" placeholder="max 50K" value={d80CCD} onChange={(e) => setD80CCD(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">80D Health Insurance</label>
                <Input type="number" value={d80D} onChange={(e) => setD80D(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">80E Education Loan</label>
                <Input type="number" value={d80E} onChange={(e) => setD80E(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">80G Donations</label>
                <Input type="number" value={d80G} onChange={(e) => setD80G(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">80TTA Savings Interest</label>
                <Input type="number" placeholder="max 10K" value={d80TTA} onChange={(e) => setD80TTA(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">HRA Exemption</label>
                <Input type="number" value={dHRA} onChange={(e) => setDHRA(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Home Loan Interest (Sec 24)</label>
                <Input type="number" placeholder="max 2L" value={dHome} onChange={(e) => setDHome(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Other Deductions</label>
                <Input type="number" value={dOther} onChange={(e) => setDOther(e.target.value)} />
              </div>
            </div>
            <Button onClick={calculate} className="w-full sm:w-auto">Compare Regimes</Button>
          </CardContent>
        </Card>

        {result && (
          <>
            {/* Recommendation */}
            <Card className={result.betterRegime === "new"
              ? "border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950"
              : "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950"
            }>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <TrendingUp className="mt-0.5 h-5 w-5 text-amber-600" />
                  <div>
                    <p className="font-bold">{result.betterRegime === "new" ? "New Regime" : "Old Regime"} is better for you</p>
                    <p className="text-sm text-muted-foreground">{result.recommendation}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Side-by-side Cards */}
            <div className="grid gap-4 lg:grid-cols-2">
              <RegimeCard
                label="Old Regime"
                tax={result.oldRegime.totalTax}
                effective={result.oldRegime.effectiveRate}
                taxable={result.oldRegime.taxableIncome}
                deductions={Object.values(result.oldRegime.deductions).reduce((a, b) => a + b, 0)}
                isBetter={result.betterRegime === "old"}
              />
              <RegimeCard
                label="New Regime (Default)"
                tax={result.newRegime.totalTax}
                effective={result.newRegime.effectiveRate}
                taxable={result.newRegime.taxableIncome}
                deductions={0}
                isBetter={result.betterRegime === "new"}
              />
            </div>

            {/* Charts */}
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Bar Chart - Tax Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tax Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { name: "Taxable Income", Old: result.oldRegime.taxableIncome, New: result.newRegime.taxableIncome },
                      { name: "Total Tax", Old: result.oldRegime.totalTax, New: result.newRegime.totalTax },
                      { name: "Take Home", Old: result.oldRegime.grossIncome - result.oldRegime.totalTax, New: result.newRegime.grossIncome - result.newRegime.totalTax },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis tickFormatter={formatLakhs} fontSize={12} />
                      <Tooltip formatter={(val) => formatINR(Number(val))} />
                      <Legend />
                      <Bar dataKey="Old" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="New" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Pie Chart - Income Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Income Allocation ({result.betterRegime === "old" ? "Old" : "New"} Regime)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={(() => {
                          const chosen = result.betterRegime === "old" ? result.oldRegime : result.newRegime
                          return [
                            { name: "Take Home", value: chosen.grossIncome - chosen.totalTax },
                            { name: "Tax", value: chosen.totalTax },
                            { name: "Deductions", value: chosen.standardDeduction + Object.values(chosen.deductions).reduce((a, b) => a + b, 0) },
                          ].filter(d => d.value > 0)
                        })()}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, value }) => `${name}: ${formatLakhs(value)}`}
                        dataKey="value"
                      >
                        {[0, 1, 2].map((i) => (
                          <Cell key={i} fill={COLORS[i]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val) => formatINR(Number(val))} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Breakeven */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <IndianRupee className="h-5 w-5 text-amber-600" />
                  Breakeven Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{result.breakeven.description}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Breakeven deduction: {formatINR(result.breakeven.breakevenDeduction)}
                </p>
              </CardContent>
            </Card>

            {/* Suggestions */}
            {result.suggestions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Lightbulb className="h-5 w-5 text-amber-600" />
                    Savings Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.suggestions.map((s) => (
                    <div key={s.section} className="rounded-lg border border-border p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{s.section}</span>
                        {s.recommended && <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">Recommended</Badge>}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
                      <div className="mt-2 flex gap-4 text-xs">
                        <span>Max Benefit: {formatINR(s.maxBenefit)}</span>
                        <span className="text-emerald-600">Tax Savings: ~{formatINR(s.taxSavings)}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  )
}

function RegimeCard({
  label,
  tax,
  effective,
  taxable,
  deductions,
  isBetter,
}: {
  label: string
  tax: number
  effective: number
  taxable: number
  deductions: number
  isBetter: boolean
}) {
  return (
    <Card className={isBetter ? "border-emerald-300 dark:border-emerald-700" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {label}
          {isBetter && <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">Better</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Taxable Income</span>
          <span className="font-medium">{formatINR(taxable)}</span>
        </div>
        {deductions > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Deductions</span>
            <span className="font-medium text-emerald-600">{formatINR(deductions)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-border pt-2">
          <span className="font-semibold">Total Tax</span>
          <span className="font-bold">{formatINR(tax)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Effective Rate</span>
          <span className="font-medium">{effective}%</span>
        </div>
      </CardContent>
    </Card>
  )
}
