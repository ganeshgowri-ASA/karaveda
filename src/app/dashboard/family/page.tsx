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
import {
  Scale,
  ArrowLeft,
  Users,
  ShieldCheck,
  AlertTriangle,
  ShieldX,
  IndianRupee,
  Briefcase,
  User,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import {
  optimizeFamily,
  type SpouseInput,
  type FamilyResult,
  type RiskLevel,
} from "@/lib/tax-engine/family-optimizer"

function formatINR(n: number): string {
  return "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 })
}

function formatLakhs(n: number): string {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`
  return `₹${n}`
}

const defaultSpouse = (): SpouseInput => ({
  name: "",
  mode: "employee",
  grossIncome: 0,
  deductions: {
    section80C: 0,
    section80CCD1B: 0,
    section80D: 0,
    hra: 0,
    homeLoanInterest: 0,
    other: 0,
  },
  regime: "new",
})

function RiskBadge({ risk }: { risk: RiskLevel }) {
  if (risk === "GREEN") {
    return (
      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
        <ShieldCheck className="mr-1 h-3 w-3" /> SAFE
      </Badge>
    )
  }
  if (risk === "YELLOW") {
    return (
      <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
        <AlertTriangle className="mr-1 h-3 w-3" /> SCRUTINY RISK
      </Badge>
    )
  }
  return (
    <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
      <ShieldX className="mr-1 h-3 w-3" /> AVOID
    </Badge>
  )
}

export default function FamilyPage() {
  const [spouse1, setSpouse1] = useState<SpouseInput>({ ...defaultSpouse(), name: "Spouse 1", mode: "employee" })
  const [spouse2, setSpouse2] = useState<SpouseInput>({ ...defaultSpouse(), name: "Spouse 2", mode: "business" })
  const [result, setResult] = useState<FamilyResult | null>(null)

  function calculate() {
    if (spouse1.grossIncome <= 0 && spouse2.grossIncome <= 0) return
    setResult(optimizeFamily(spouse1, spouse2))
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
            <h1 className="text-lg font-bold">Family Tax Optimizer</h1>
            <Badge variant="outline" className="ml-2">FY 2025-26</Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 space-y-6">
        {/* Two-column spouse input */}
        <div className="grid gap-4 lg:grid-cols-2">
          <SpouseCard
            spouse={spouse1}
            setSpouse={setSpouse1}
            label="Spouse 1"
            icon={<User className="h-5 w-5 text-blue-600" />}
          />
          <SpouseCard
            spouse={spouse2}
            setSpouse={setSpouse2}
            label="Spouse 2"
            icon={<Briefcase className="h-5 w-5 text-purple-600" />}
          />
        </div>

        <Button onClick={calculate} className="w-full sm:w-auto" size="lg">
          <Users className="mr-2 h-4 w-4" /> Optimize Family Tax
        </Button>

        {result && (
          <>
            {/* Summary */}
            <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950">
              <CardContent className="p-4">
                <p className="font-bold text-emerald-900 dark:text-emerald-100">{result.summary}</p>
              </CardContent>
            </Card>

            {/* Tax Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryCard label={`${spouse1.name} Tax`} value={formatINR(result.spouse1Tax.totalTax)} />
              <SummaryCard label={`${spouse2.name} Tax`} value={formatINR(result.spouse2Tax.totalTax)} />
              <SummaryCard label="Combined Tax (Before)" value={formatINR(result.combinedTaxBefore)} />
              <SummaryCard label="After Optimization" value={formatINR(result.combinedTaxAfter)} highlight />
            </div>

            {/* Before/After Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tax Before & After Optimization</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    {
                      name: spouse1.name,
                      "Current Tax": result.spouse1Tax.totalTax,
                      "Potential Savings": result.strategies
                        .filter((s) => s.risk !== "RED" && (s.applicableTo === "spouse1" || s.applicableTo === "both"))
                        .reduce((sum, s) => sum + s.annualSavings / (s.applicableTo === "both" ? 2 : 1), 0),
                    },
                    {
                      name: spouse2.name,
                      "Current Tax": result.spouse2Tax.totalTax,
                      "Potential Savings": result.strategies
                        .filter((s) => s.risk !== "RED" && (s.applicableTo === "spouse2" || s.applicableTo === "both"))
                        .reduce((sum, s) => sum + s.annualSavings / (s.applicableTo === "both" ? 2 : 1), 0),
                    },
                    {
                      name: "Combined",
                      "Current Tax": result.combinedTaxBefore,
                      "Potential Savings": result.totalSavings,
                    },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis tickFormatter={formatLakhs} fontSize={12} />
                    <Tooltip formatter={(val: number) => formatINR(val)} />
                    <Legend />
                    <Bar dataKey="Current Tax" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Potential Savings" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Strategies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-amber-600" />
                  Optimization Strategies
                </CardTitle>
                <CardDescription>Legal tax-saving strategies for your family - review risk levels carefully</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(["GREEN", "YELLOW", "RED"] as RiskLevel[]).map((risk) => {
                  const filtered = result.strategies.filter((s) => s.risk === risk)
                  if (filtered.length === 0) return null
                  return (
                    <div key={risk} className="space-y-3">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <RiskBadge risk={risk} />
                        <span>
                          {risk === "GREEN" && "Safe Strategies"}
                          {risk === "YELLOW" && "Use with Caution"}
                          {risk === "RED" && "Avoid / Awareness"}
                        </span>
                      </h3>
                      {filtered.map((strategy) => (
                        <div
                          key={strategy.id}
                          className={`rounded-lg border p-4 ${
                            risk === "GREEN"
                              ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/50"
                              : risk === "YELLOW"
                                ? "border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/50"
                                : "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-sm">{strategy.title}</p>
                              <p className="mt-1 text-sm text-muted-foreground">{strategy.description}</p>
                            </div>
                            {strategy.annualSavings > 0 && (
                              <Badge variant="outline" className="shrink-0">
                                <IndianRupee className="mr-0.5 h-3 w-3" />
                                {formatINR(strategy.annualSavings)}/yr
                              </Badge>
                            )}
                          </div>
                          <div className="mt-3 rounded bg-background/80 p-3 text-xs text-muted-foreground leading-relaxed">
                            {strategy.details}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Disclaimer */}
            <div className="rounded-lg border border-border p-3 text-xs text-muted-foreground">
              <strong>Disclaimer:</strong> These are general suggestions based on the Income Tax Act, 1961.
              Consult a qualified CA before implementing any strategy. Tax laws are subject to change.
              KaraVeda does not provide legal or financial advice.
            </div>
          </>
        )}
      </main>
    </div>
  )
}

// ─── Spouse Input Card ───────────────────────────────────────

function SpouseCard({
  spouse,
  setSpouse,
  label,
  icon,
}: {
  spouse: SpouseInput
  setSpouse: (s: SpouseInput) => void
  label: string
  icon: React.ReactNode
}) {
  const d = spouse.deductions

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {icon} {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Name</label>
          <Input value={spouse.name} onChange={(e) => setSpouse({ ...spouse, name: e.target.value })} />
        </div>
        <div className="flex flex-wrap gap-1">
          <div className="flex gap-1 rounded-lg border border-border p-0.5">
            <Button size="sm" variant={spouse.mode === "employee" ? "default" : "ghost"} onClick={() => setSpouse({ ...spouse, mode: "employee" })}>Employee</Button>
            <Button size="sm" variant={spouse.mode === "business" ? "default" : "ghost"} onClick={() => setSpouse({ ...spouse, mode: "business" })}>Business</Button>
          </div>
          <div className="flex gap-1 rounded-lg border border-border p-0.5">
            <Button size="sm" variant={spouse.regime === "new" ? "default" : "ghost"} onClick={() => setSpouse({ ...spouse, regime: "new" })}>New</Button>
            <Button size="sm" variant={spouse.regime === "old" ? "default" : "ghost"} onClick={() => setSpouse({ ...spouse, regime: "old" })}>Old</Button>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Gross Annual Income (₹)</label>
          <Input type="number" value={spouse.grossIncome || ""} onChange={(e) => setSpouse({ ...spouse, grossIncome: parseFloat(e.target.value) || 0 })} />
        </div>
        <div className="grid gap-2 grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium">80C</label>
            <Input type="number" className="h-8 text-sm" value={d.section80C || ""} onChange={(e) => setSpouse({ ...spouse, deductions: { ...d, section80C: parseFloat(e.target.value) || 0 } })} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">80CCD(1B) NPS</label>
            <Input type="number" className="h-8 text-sm" value={d.section80CCD1B || ""} onChange={(e) => setSpouse({ ...spouse, deductions: { ...d, section80CCD1B: parseFloat(e.target.value) || 0 } })} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">80D Health</label>
            <Input type="number" className="h-8 text-sm" value={d.section80D || ""} onChange={(e) => setSpouse({ ...spouse, deductions: { ...d, section80D: parseFloat(e.target.value) || 0 } })} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">HRA</label>
            <Input type="number" className="h-8 text-sm" value={d.hra || ""} onChange={(e) => setSpouse({ ...spouse, deductions: { ...d, hra: parseFloat(e.target.value) || 0 } })} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Home Loan (Sec 24)</label>
            <Input type="number" className="h-8 text-sm" value={d.homeLoanInterest || ""} onChange={(e) => setSpouse({ ...spouse, deductions: { ...d, homeLoanInterest: parseFloat(e.target.value) || 0 } })} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Other</label>
            <Input type="number" className="h-8 text-sm" value={d.other || ""} onChange={(e) => setSpouse({ ...spouse, deductions: { ...d, other: parseFloat(e.target.value) || 0 } })} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SummaryCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <Card className={highlight ? "border-emerald-300 dark:border-emerald-700" : ""}>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-lg font-bold ${highlight ? "text-emerald-600 dark:text-emerald-400" : ""}`}>{value}</p>
      </CardContent>
    </Card>
  )
}
