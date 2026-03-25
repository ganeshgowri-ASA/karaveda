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
import { Scale, ArrowLeft, TrendingUp, TrendingDown, IndianRupee, Wallet } from "lucide-react"
import {
  LineChart,
  Line,
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
import {
  computeEmployeePnL,
  computeBusinessPnL,
  type EmployeePnLInput,
  type EmployeePnLResult,
  type BusinessPnLResult,
} from "@/lib/tax-engine/pnl-engine"

function formatINR(n: number): string {
  return "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 })
}

function formatLakhs(n: number): string {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`
  return `₹${n}`
}

const COLORS = ["#f59e0b", "#8b5cf6", "#10b981", "#3b82f6", "#ef4444", "#ec4899"]
const MONTHS = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"]

export default function PnLPage() {
  const [mode, setMode] = useState<"employee" | "business">("employee")

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
            <h1 className="text-lg font-bold">Profit & Loss Dashboard</h1>
            <Badge variant="outline" className="ml-2">FY 2025-26</Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 space-y-6">
        <div className="flex gap-1 rounded-lg border border-border p-1 w-fit">
          <Button size="sm" variant={mode === "employee" ? "default" : "ghost"} onClick={() => setMode("employee")}>Employee</Button>
          <Button size="sm" variant={mode === "business" ? "default" : "ghost"} onClick={() => setMode("business")}>Business</Button>
        </div>

        {mode === "employee" ? <EmployeePnLSection /> : <BusinessPnLSection />}
      </main>
    </div>
  )
}

// ─── Employee Section ────────────────────────────────────────

function EmployeePnLSection() {
  const [salary, setSalary] = useState("")
  const [bonus, setBonus] = useState("")
  const [otherIncome, setOtherIncome] = useState("")
  const [d80C, setD80C] = useState("")
  const [d80D, setD80D] = useState("")
  const [pf, setPf] = useState("")
  const [regime, setRegime] = useState<"old" | "new">("new")
  const [result, setResult] = useState<EmployeePnLResult | null>(null)

  function calculate() {
    const sal = parseFloat(salary)
    if (isNaN(sal) || sal <= 0) return
    const input: EmployeePnLInput = {
      annualSalary: sal,
      annualBonus: parseFloat(bonus) || 0,
      otherIncome: parseFloat(otherIncome) || 0,
      deductions80C: parseFloat(d80C) || 0,
      deductions80D: parseFloat(d80D) || 0,
      otherDeductions: 0,
      regime,
      employerPF: parseFloat(pf) || Math.round(sal * 0.12 / 12),
    }
    setResult(computeEmployeePnL(input))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Employee Income Details</CardTitle>
          <CardDescription>Monthly P&L breakdown for salaried individuals</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-1 rounded-lg border border-border p-1 w-fit">
            <Button size="sm" variant={regime === "new" ? "default" : "ghost"} onClick={() => setRegime("new")}>New Regime</Button>
            <Button size="sm" variant={regime === "old" ? "default" : "ghost"} onClick={() => setRegime("old")}>Old Regime</Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Annual Salary (₹)</label>
              <Input type="number" placeholder="e.g. 1200000" value={salary} onChange={(e) => setSalary(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Annual Bonus (₹)</label>
              <Input type="number" placeholder="0" value={bonus} onChange={(e) => setBonus(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Other Annual Income (₹)</label>
              <Input type="number" placeholder="0" value={otherIncome} onChange={(e) => setOtherIncome(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">80C Deductions (₹)</label>
              <Input type="number" placeholder="PPF/ELSS" value={d80C} onChange={(e) => setD80C(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">80D Health Insurance (₹)</label>
              <Input type="number" value={d80D} onChange={(e) => setD80D(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Monthly PF (₹)</label>
              <Input type="number" placeholder="Auto: 12% of salary/12" value={pf} onChange={(e) => setPf(e.target.value)} />
            </div>
          </div>
          <Button onClick={calculate}>Generate P&L</Button>
        </CardContent>
      </Card>

      {result && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard label="Annual Gross" value={formatINR(result.annualGross)} icon={<IndianRupee className="h-5 w-5 text-blue-600" />} />
            <SummaryCard label="Annual Tax (TDS)" value={formatINR(result.annualTDS)} icon={<TrendingDown className="h-5 w-5 text-red-500" />} />
            <SummaryCard label="Annual PF" value={formatINR(result.annualPF)} icon={<Wallet className="h-5 w-5 text-purple-600" />} />
            <SummaryCard label="Annual Take Home" value={formatINR(result.annualTakeHome)} icon={<TrendingUp className="h-5 w-5 text-emerald-600" />} />
          </div>

          {/* Monthly Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Monthly Income vs Take Home</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={result.monthlyBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis tickFormatter={formatLakhs} fontSize={12} />
                  <Tooltip formatter={(val) => formatINR(Number(val))} />
                  <Legend />
                  <Line type="monotone" dataKey="grossIncome" name="Gross Income" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="takeHome" name="Take Home" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="tds" name="TDS" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pie - Salary Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Annual Salary Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Take Home", value: result.annualTakeHome },
                      { name: "Income Tax", value: result.annualTDS },
                      { name: "PF Contribution", value: result.annualPF },
                      { name: "Professional Tax", value: result.annualProfessionalTax },
                    ].filter((d) => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, value }) => `${name}: ${formatLakhs(value)}`}
                    dataKey="value"
                  >
                    {[0, 1, 2, 3].map((i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => formatINR(Number(val))} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

// ─── Business Section ────────────────────────────────────────

function BusinessPnLSection() {
  const [regime, setRegime] = useState<"old" | "new">("new")
  const [deductions, setDeductions] = useState("")
  const [monthlyData, setMonthlyData] = useState(
    MONTHS.map((month) => ({ month, revenue: "", cogs: "", opex: "" }))
  )
  const [result, setResult] = useState<BusinessPnLResult | null>(null)

  function updateMonth(idx: number, field: "revenue" | "cogs" | "opex", value: string) {
    setMonthlyData((prev) => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: value }
      return next
    })
  }

  function calculate() {
    const data = monthlyData.map((m) => ({
      month: m.month,
      revenue: parseFloat(m.revenue) || 0,
      cogs: parseFloat(m.cogs) || 0,
      operatingExpenses: parseFloat(m.opex) || 0,
    }))
    if (data.every((d) => d.revenue === 0)) return
    setResult(computeBusinessPnL({ monthlyData: data, regime, deductions: parseFloat(deductions) || 0 }))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Business Monthly Data</CardTitle>
          <CardDescription>Enter Revenue, COGS, and Operating Expenses for each month</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex gap-1 rounded-lg border border-border p-1 w-fit">
              <Button size="sm" variant={regime === "new" ? "default" : "ghost"} onClick={() => setRegime("new")}>New Regime</Button>
              <Button size="sm" variant={regime === "old" ? "default" : "ghost"} onClick={() => setRegime("old")}>Old Regime</Button>
            </div>
            <div className="w-48">
              <Input type="number" placeholder="Deductions (80C etc)" value={deductions} onChange={(e) => setDeductions(e.target.value)} />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 text-left font-medium">Month</th>
                  <th className="py-2 text-left font-medium">Revenue (₹)</th>
                  <th className="py-2 text-left font-medium">COGS (₹)</th>
                  <th className="py-2 text-left font-medium">OpEx (₹)</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((m, i) => (
                  <tr key={m.month} className="border-b border-border">
                    <td className="py-1 font-medium">{m.month}</td>
                    <td className="py-1 pr-2"><Input type="number" className="h-8" value={m.revenue} onChange={(e) => updateMonth(i, "revenue", e.target.value)} /></td>
                    <td className="py-1 pr-2"><Input type="number" className="h-8" value={m.cogs} onChange={(e) => updateMonth(i, "cogs", e.target.value)} /></td>
                    <td className="py-1"><Input type="number" className="h-8" value={m.opex} onChange={(e) => updateMonth(i, "opex", e.target.value)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button onClick={calculate}>Generate P&L</Button>
        </CardContent>
      </Card>

      {result && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard label="Annual Revenue" value={formatINR(result.annualRevenue)} icon={<IndianRupee className="h-5 w-5 text-blue-600" />} />
            <SummaryCard label="Gross Profit" value={`${formatINR(result.annualGrossProfit)} (${result.annualGrossMargin}%)`} icon={<TrendingUp className="h-5 w-5 text-emerald-600" />} />
            <SummaryCard label="Net Profit" value={`${formatINR(result.annualNetProfit)} (${result.annualNetMargin}%)`} icon={<TrendingUp className="h-5 w-5 text-purple-600" />} />
            <SummaryCard label="Estimated Tax" value={formatINR(result.estimatedTax)} icon={<TrendingDown className="h-5 w-5 text-red-500" />} />
          </div>

          {/* Monthly Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Monthly Revenue & Profit Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={result.monthlyBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis tickFormatter={formatLakhs} fontSize={12} />
                  <Tooltip formatter={(val) => formatINR(Number(val))} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="grossProfit" name="Gross Profit" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="netProfit" name="Net Profit" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Quarterly Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quarterly P&L</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={result.quarterlyBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quarter" fontSize={11} />
                  <YAxis tickFormatter={formatLakhs} fontSize={12} />
                  <Tooltip formatter={(val) => formatINR(Number(val))} />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="grossProfit" name="Gross Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="netProfit" name="Net Profit" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Expense Distribution Pie */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Expense Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={result.expenseDistribution.filter((d) => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, value }) => `${name}: ${formatLakhs(value)}`}
                    dataKey="value"
                  >
                    {result.expenseDistribution.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => formatINR(Number(val))} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

// ─── Shared ──────────────────────────────────────────────────

function SummaryCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        {icon}
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}
