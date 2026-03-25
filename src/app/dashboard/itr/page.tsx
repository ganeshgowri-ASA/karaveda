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
  ArrowRight,
  CheckCircle,
  FileText,
  User,
  Briefcase,
  IndianRupee,
  Receipt,
  ClipboardList,
} from "lucide-react"
import {
  computeITR,
  type ITRInput,
  type ITRResult,
  type EmployeeIncome,
  type BusinessIncome,
  type Deductions,
  type PersonalInfo,
  type OtherSources,
} from "@/lib/tax-engine/itr-forms"

function formatINR(n: number): string {
  return "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 })
}

const STEPS = [
  { id: "personal", label: "Personal Info", icon: User },
  { id: "income", label: "Income Sources", icon: Briefcase },
  { id: "deductions", label: "Deductions", icon: Receipt },
  { id: "computation", label: "Tax Computation", icon: IndianRupee },
  { id: "summary", label: "Summary", icon: ClipboardList },
] as const

type Step = (typeof STEPS)[number]["id"]

const emptyPersonal: PersonalInfo = {
  name: "", pan: "", aadhaar: "", dob: "", residencyStatus: "resident", filingDate: "",
}
const emptyEmployee: EmployeeIncome = {
  basic: 0, da: 0, hra: 0, specialAllowance: 0, lta: 0, otherAllowances: 0, form16TDS: 0,
}
const emptyBusiness: BusinessIncome = { turnover: 0, expenses: 0, scheme: "regular" }
const emptyOther: OtherSources = { interestIncome: 0, rentalIncome: 0, otherIncome: 0 }
const emptyDeductions: Deductions = {
  section80C: 0, section80CCD1B: 0, section80D: 0, section80E: 0,
  section80G: 0, section80TTA: 0, section80U: 0, hra: 0, lta: 0, homeLoanInterest: 0,
}

export default function ITRWizardPage() {
  const [step, setStep] = useState<Step>("personal")
  const [mode, setMode] = useState<"employee" | "business">("employee")
  const [regime, setRegime] = useState<"old" | "new">("new")
  const [personal, setPersonal] = useState(emptyPersonal)
  const [employee, setEmployee] = useState(emptyEmployee)
  const [business, setBusiness] = useState(emptyBusiness)
  const [other, setOther] = useState(emptyOther)
  const [deductions, setDeductions] = useState(emptyDeductions)
  const [result, setResult] = useState<ITRResult | null>(null)

  const stepIdx = STEPS.findIndex((s) => s.id === step)

  function buildInput(): ITRInput {
    return {
      personalInfo: personal,
      mode,
      employeeIncome: mode === "employee" ? employee : undefined,
      businessIncome: mode === "business" ? business : undefined,
      otherSources: other,
      deductions,
      regime,
    }
  }

  function goNext() {
    if (stepIdx === 3) {
      // Compute on entering summary
      setResult(computeITR(buildInput()))
    }
    if (stepIdx < STEPS.length - 1) setStep(STEPS[stepIdx + 1].id)
  }
  function goBack() {
    if (stepIdx > 0) setStep(STEPS[stepIdx - 1].id)
  }

  // Live computation for tax computation step
  const liveResult = step === "computation" || step === "summary" ? computeITR(buildInput()) : null

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
            <h1 className="text-lg font-bold">ITR Filing Wizard</h1>
            <Badge variant="outline" className="ml-2">FY 2025-26</Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        {/* Step Indicator */}
        <div className="mb-6 flex items-center justify-between">
          {STEPS.map((s, i) => {
            const Icon = s.icon
            const isActive = s.id === step
            const isDone = i < stepIdx
            return (
              <button
                key={s.id}
                onClick={() => setStep(s.id)}
                className={`flex flex-1 flex-col items-center gap-1 text-xs transition-colors ${
                  isActive
                    ? "text-amber-600 font-semibold"
                    : isDone
                      ? "text-emerald-600"
                      : "text-muted-foreground"
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                    isActive
                      ? "border-amber-600 bg-amber-50 dark:bg-amber-950"
                      : isDone
                        ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950"
                        : "border-border"
                  }`}
                >
                  {isDone ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span className="hidden sm:block">{s.label}</span>
              </button>
            )
          })}
        </div>

        {/* Mode & Regime Toggle */}
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="flex gap-1 rounded-lg border border-border p-1">
            <Button
              size="sm"
              variant={mode === "employee" ? "default" : "ghost"}
              onClick={() => setMode("employee")}
            >
              Employee
            </Button>
            <Button
              size="sm"
              variant={mode === "business" ? "default" : "ghost"}
              onClick={() => setMode("business")}
            >
              Business
            </Button>
          </div>
          <div className="flex gap-1 rounded-lg border border-border p-1">
            <Button
              size="sm"
              variant={regime === "new" ? "default" : "ghost"}
              onClick={() => setRegime("new")}
            >
              New Regime
            </Button>
            <Button
              size="sm"
              variant={regime === "old" ? "default" : "ghost"}
              onClick={() => setRegime("old")}
            >
              Old Regime
            </Button>
          </div>
        </div>

        {/* Step Content */}
        {step === "personal" && (
          <PersonalInfoStep personal={personal} setPersonal={setPersonal} />
        )}
        {step === "income" && (
          <IncomeStep
            mode={mode}
            employee={employee}
            setEmployee={setEmployee}
            business={business}
            setBusiness={setBusiness}
            other={other}
            setOther={setOther}
          />
        )}
        {step === "deductions" && (
          <DeductionsStep regime={regime} deductions={deductions} setDeductions={setDeductions} />
        )}
        {step === "computation" && liveResult && (
          <ComputationStep result={liveResult} />
        )}
        {step === "summary" && liveResult && (
          <SummaryStep result={liveResult} personal={personal} />
        )}

        {/* Navigation */}
        <div className="mt-6 flex justify-between">
          <Button variant="outline" onClick={goBack} disabled={stepIdx === 0}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Previous
          </Button>
          {stepIdx < STEPS.length - 1 ? (
            <Button onClick={goNext}>
              Next <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <FileText className="mr-1 h-4 w-4" /> Generate ITR
            </Button>
          )}
        </div>
      </main>
    </div>
  )
}

// ─── Step Components ─────────────────────────────────────────

function NumField({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  placeholder?: string
  hint?: string
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <Input
        type="number"
        placeholder={placeholder || "0"}
        value={value || ""}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      />
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

function PersonalInfoStep({
  personal,
  setPersonal,
}: {
  personal: PersonalInfo
  setPersonal: (p: PersonalInfo) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>Basic details as per PAN card</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Full Name</label>
          <Input
            placeholder="As per PAN"
            value={personal.name}
            onChange={(e) => setPersonal({ ...personal, name: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">PAN Number</label>
          <Input
            placeholder="ABCDE1234F"
            value={personal.pan}
            onChange={(e) => setPersonal({ ...personal, pan: e.target.value.toUpperCase() })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Aadhaar Number</label>
          <Input
            placeholder="1234 5678 9012"
            value={personal.aadhaar}
            onChange={(e) => setPersonal({ ...personal, aadhaar: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Date of Birth</label>
          <Input
            type="date"
            value={personal.dob}
            onChange={(e) => setPersonal({ ...personal, dob: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Residency Status</label>
          <div className="flex gap-2">
            {(["resident", "nri", "rnor"] as const).map((s) => (
              <Button
                key={s}
                size="sm"
                variant={personal.residencyStatus === s ? "default" : "outline"}
                onClick={() => setPersonal({ ...personal, residencyStatus: s })}
              >
                {s.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function IncomeStep({
  mode,
  employee,
  setEmployee,
  business,
  setBusiness,
  other,
  setOther,
}: {
  mode: "employee" | "business"
  employee: EmployeeIncome
  setEmployee: (e: EmployeeIncome) => void
  business: BusinessIncome
  setBusiness: (b: BusinessIncome) => void
  other: OtherSources
  setOther: (o: OtherSources) => void
}) {
  return (
    <div className="space-y-4">
      {mode === "employee" ? (
        <Card>
          <CardHeader>
            <CardTitle>Salary Income</CardTitle>
            <CardDescription>As per Form 16 / salary slips</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <NumField label="Basic Salary (Annual)" value={employee.basic} onChange={(v) => setEmployee({ ...employee, basic: v })} />
            <NumField label="Dearness Allowance" value={employee.da} onChange={(v) => setEmployee({ ...employee, da: v })} />
            <NumField label="HRA Received" value={employee.hra} onChange={(v) => setEmployee({ ...employee, hra: v })} />
            <NumField label="Special Allowance" value={employee.specialAllowance} onChange={(v) => setEmployee({ ...employee, specialAllowance: v })} />
            <NumField label="LTA" value={employee.lta} onChange={(v) => setEmployee({ ...employee, lta: v })} />
            <NumField label="Other Allowances" value={employee.otherAllowances} onChange={(v) => setEmployee({ ...employee, otherAllowances: v })} />
            <NumField label="TDS (Form 16)" value={employee.form16TDS} onChange={(v) => setEmployee({ ...employee, form16TDS: v })} hint="Total TDS deducted by employer" />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Business / Profession Income</CardTitle>
            <CardDescription>Select taxation scheme</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Taxation Scheme</label>
              <div className="flex flex-wrap gap-2">
                {([
                  { value: "regular" as const, label: "Regular Books" },
                  { value: "44AD" as const, label: "44AD (8%/6% Presumptive)" },
                  { value: "44ADA" as const, label: "44ADA (50% Professionals)" },
                ]).map((s) => (
                  <Button
                    key={s.value}
                    size="sm"
                    variant={business.scheme === s.value ? "default" : "outline"}
                    onClick={() => setBusiness({ ...business, scheme: s.value })}
                  >
                    {s.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <NumField
                label={business.scheme === "regular" ? "Gross Turnover / Receipts" : "Gross Turnover"}
                value={business.turnover}
                onChange={(v) => setBusiness({ ...business, turnover: v })}
              />
              {business.scheme === "regular" && (
                <NumField
                  label="Total Expenses"
                  value={business.expenses}
                  onChange={(v) => setBusiness({ ...business, expenses: v })}
                />
              )}
            </div>
            {business.scheme !== "regular" && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  {business.scheme === "44AD"
                    ? "Presumptive income: 8% of turnover (6% for digital receipts). No need to maintain books."
                    : "Presumptive income: 50% of gross receipts for specified professionals."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Other Income Sources</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <NumField label="Interest Income" value={other.interestIncome} onChange={(v) => setOther({ ...other, interestIncome: v })} />
          <NumField label="Rental Income" value={other.rentalIncome} onChange={(v) => setOther({ ...other, rentalIncome: v })} />
          <NumField label="Other Income" value={other.otherIncome} onChange={(v) => setOther({ ...other, otherIncome: v })} />
        </CardContent>
      </Card>
    </div>
  )
}

function DeductionsStep({
  regime,
  deductions,
  setDeductions,
}: {
  regime: "old" | "new"
  deductions: Deductions
  setDeductions: (d: Deductions) => void
}) {
  if (regime === "new") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Deductions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
              New Regime: Most deductions under Chapter VI-A are not available.
            </p>
            <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
              Only Standard Deduction of ₹75,000 and Employer NPS (80CCD(2)) are allowed.
              Switch to Old Regime to claim 80C, 80D, HRA, and other deductions.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deductions (Old Regime)</CardTitle>
        <CardDescription>Chapter VI-A deductions and exemptions</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <NumField label="80C (PPF/ELSS/LIC)" value={deductions.section80C} onChange={(v) => setDeductions({ ...deductions, section80C: v })} hint="Max ₹1,50,000" />
        <NumField label="80CCD(1B) NPS" value={deductions.section80CCD1B} onChange={(v) => setDeductions({ ...deductions, section80CCD1B: v })} hint="Max ₹50,000" />
        <NumField label="80D Health Insurance" value={deductions.section80D} onChange={(v) => setDeductions({ ...deductions, section80D: v })} hint="Self: 25K, Parents: 25K/50K" />
        <NumField label="80E Education Loan" value={deductions.section80E} onChange={(v) => setDeductions({ ...deductions, section80E: v })} hint="Interest only, no limit" />
        <NumField label="80G Donations" value={deductions.section80G} onChange={(v) => setDeductions({ ...deductions, section80G: v })} />
        <NumField label="80TTA Savings Interest" value={deductions.section80TTA} onChange={(v) => setDeductions({ ...deductions, section80TTA: v })} hint="Max ₹10,000" />
        <NumField label="80U Disability" value={deductions.section80U} onChange={(v) => setDeductions({ ...deductions, section80U: v })} />
        <NumField label="HRA Exemption" value={deductions.hra} onChange={(v) => setDeductions({ ...deductions, hra: v })} />
        <NumField label="LTA Exemption" value={deductions.lta} onChange={(v) => setDeductions({ ...deductions, lta: v })} />
        <NumField label="Home Loan Interest (Sec 24)" value={deductions.homeLoanInterest} onChange={(v) => setDeductions({ ...deductions, homeLoanInterest: v })} hint="Max ₹2,00,000 self-occupied" />
      </CardContent>
    </Card>
  )
}

function ComputationStep({ result }: { result: ITRResult }) {
  return (
    <div className="space-y-4">
      <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
        <CardContent className="flex items-center gap-3 p-4">
          <FileText className="h-5 w-5 text-amber-600" />
          <div>
            <p className="font-medium text-amber-900 dark:text-amber-100">
              Recommended Form: {result.itrForm}
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300">{result.formReason}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tax Computation - {result.regime === "new" ? "New" : "Old"} Regime</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row label="Gross Salary Income" value={formatINR(result.grossSalaryIncome)} />
          {result.grossBusinessIncome > 0 && <Row label="Business Income" value={formatINR(result.grossBusinessIncome)} />}
          {result.grossOtherIncome > 0 && <Row label="Other Income" value={formatINR(result.grossOtherIncome)} />}
          <Row label="Gross Total Income" value={formatINR(result.grossTotalIncome)} bold />

          <div className="border-t border-border pt-2">
            <Row label="Standard Deduction" value={`- ${formatINR(result.standardDeduction)}`} />
            {Object.entries(result.deductionBreakdown).map(([key, val]) => (
              <Row key={key} label={key} value={`- ${formatINR(val)}`} />
            ))}
          </div>

          <Row label="Taxable Income" value={formatINR(result.taxableIncome)} bold />

          <div className="border-t border-border pt-2">
            {result.slabwiseTax.map((s, i) => (
              <Row key={i} label={`${s.slab} @ ${s.rate}%`} value={formatINR(s.tax)} />
            ))}
          </div>

          <Row label="Tax Before Rebate" value={formatINR(result.baseTax)} />
          {result.rebateU87A > 0 && <Row label="Rebate u/s 87A" value={`- ${formatINR(result.rebateU87A)}`} highlight />}
          {result.surcharge > 0 && <Row label={`Surcharge (${result.surchargeRate}%)`} value={formatINR(result.surcharge)} />}
          <Row label="Cess (4%)" value={formatINR(result.cess)} />

          <div className="border-t border-border pt-2">
            <Row label="Total Tax Liability" value={formatINR(result.totalTax)} bold />
            {result.tdsAlreadyPaid > 0 && <Row label="TDS Already Paid" value={`- ${formatINR(result.tdsAlreadyPaid)}`} highlight />}
            <Row label="Tax Payable / (Refund)" value={formatINR(result.taxPayable)} bold />
            <Row label="Effective Tax Rate" value={`${result.effectiveRate}%`} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SummaryStep({ result, personal }: { result: ITRResult; personal: PersonalInfo }) {
  return (
    <div className="space-y-4">
      <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-emerald-600" />
            <div>
              <p className="font-bold text-emerald-900 dark:text-emerald-100">ITR Ready for Filing</p>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                {result.itrForm} | {result.regime === "new" ? "New" : "Old"} Regime | FY 2025-26
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Gross Income" value={formatINR(result.grossTotalIncome)} color="blue" />
        <SummaryCard label="Taxable Income" value={formatINR(result.taxableIncome)} color="purple" />
        <SummaryCard label="Total Tax" value={formatINR(result.totalTax)} color="amber" />
        <SummaryCard label="Tax Payable" value={formatINR(result.taxPayable)} color="emerald" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filing Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Row label="Assessee Name" value={personal.name || "—"} />
          <Row label="PAN" value={personal.pan || "—"} />
          <Row label="ITR Form" value={result.itrForm} bold />
          <Row label="Assessment Year" value="2026-27" />
          <Row label="Tax Regime" value={result.regime === "new" ? "New (Default)" : "Old"} />
          <Row label="Effective Rate" value={`${result.effectiveRate}%`} />
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Shared Components ───────────────────────────────────────

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  const bg: Record<string, string> = {
    blue: "bg-blue-50 dark:bg-blue-950",
    purple: "bg-purple-50 dark:bg-purple-950",
    amber: "bg-amber-50 dark:bg-amber-950",
    emerald: "bg-emerald-50 dark:bg-emerald-950",
  }
  const text: Record<string, string> = {
    blue: "text-blue-700 dark:text-blue-300",
    purple: "text-purple-700 dark:text-purple-300",
    amber: "text-amber-700 dark:text-amber-300",
    emerald: "text-emerald-700 dark:text-emerald-300",
  }
  return (
    <Card className={bg[color]}>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-xl font-bold ${text[color]}`}>{value}</p>
      </CardContent>
    </Card>
  )
}

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
      <span className={`text-muted-foreground ${bold ? "font-semibold text-foreground" : ""}`}>{label}</span>
      <span className={`${bold ? "font-bold text-foreground" : "font-medium"} ${highlight ? "text-emerald-600 dark:text-emerald-400" : ""}`}>
        {value}
      </span>
    </div>
  )
}
