import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Scale,
  Calculator,
  MessageSquare,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock,
  CalendarDays,
  IndianRupee,
  FileText,
  ArrowRight,
  TrendingUp,
  Shield,
} from "lucide-react"

const gstDueDates = [
  { form: "GSTR-1", due: "11th of next month", status: "upcoming" as const },
  { form: "GSTR-3B", due: "20th of next month", status: "upcoming" as const },
  { form: "GSTR-9", due: "31st Dec 2026", status: "future" as const },
  { form: "GSTR-9C", due: "31st Dec 2026", status: "future" as const },
  { form: "GSTR-1 (QRMP)", due: "13th of next quarter month", status: "upcoming" as const },
  { form: "ITC-04", due: "25th of next quarter month", status: "upcoming" as const },
]

const itDueDates = [
  { item: "Advance Tax - Q4", due: "15th Mar 2026", status: "completed" as const },
  { item: "ITR Filing (non-audit)", due: "31st Jul 2026", status: "upcoming" as const },
  { item: "ITR Filing (audit)", due: "31st Oct 2026", status: "future" as const },
  { item: "Tax Audit Report", due: "30th Sep 2026", status: "future" as const },
  { item: "Transfer Pricing Report", due: "31st Oct 2026", status: "future" as const },
  { item: "Belated/Revised ITR", due: "31st Dec 2026", status: "future" as const },
]

const recentUpdates = [
  {
    source: "GST",
    title: "GSTR-3B Hard-lock for FY 2025-26 effective from April 2026",
    date: "Mar 2026",
  },
  {
    source: "IT",
    title: "New Income Tax Act 2025 to take effect from 1st April 2026",
    date: "Mar 2026",
  },
  {
    source: "RBI",
    title: "Digital Payment Authentication Directions 2025 updated",
    date: "Feb 2026",
  },
  {
    source: "GST",
    title: "E-invoice mandatory for turnover exceeding Rs. 5 Cr",
    date: "Feb 2026",
  },
  {
    source: "IT",
    title: "Budget 2026-27 highlights: New regime slab changes proposed",
    date: "Feb 2026",
  },
]

function StatusBadge({ status }: { status: "completed" | "upcoming" | "future" }) {
  if (status === "completed") {
    return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">Completed</Badge>
  }
  if (status === "upcoming") {
    return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">Upcoming</Badge>
  }
  return <Badge variant="secondary">Future</Badge>
}

function SourceBadge({ source }: { source: string }) {
  const colors: Record<string, string> = {
    GST: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    IT: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    RBI: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
  }
  return <Badge className={colors[source] || ""}>{source}</Badge>
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Scale className="h-7 w-7 text-amber-600" />
              <div>
                <h1 className="text-xl font-bold text-foreground">KaraVeda Dashboard</h1>
                <p className="text-sm text-muted-foreground">FY 2025-26 | Assessment Year 2026-27</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/chat">
                <Button variant="outline" size="sm">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Chat
                </Button>
              </Link>
              <Link href="/">
                <Button variant="ghost" size="sm">Home</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Quick Actions */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Link href="/chat">
            <Card className="cursor-pointer transition-colors hover:bg-accent">
              <CardContent className="flex items-center gap-3 p-4">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">New Chat</span>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/calculator">
            <Card className="cursor-pointer transition-colors hover:bg-accent">
              <CardContent className="flex items-center gap-3 p-4">
                <Calculator className="h-5 w-5 text-emerald-600" />
                <span className="text-sm font-medium">Tax Calculator</span>
              </CardContent>
            </Card>
          </Link>
          <Card className="cursor-pointer transition-colors hover:bg-accent">
            <CardContent className="flex items-center gap-3 p-4">
              <RefreshCw className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium">Run Scraper</span>
            </CardContent>
          </Card>
          <Card className="cursor-pointer transition-colors hover:bg-accent">
            <CardContent className="flex items-center gap-3 p-4">
              <Shield className="h-5 w-5 text-amber-600" />
              <span className="text-sm font-medium">Check Compliance</span>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="gst" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="gst">GST Module</TabsTrigger>
            <TabsTrigger value="it">Income Tax Module</TabsTrigger>
            <TabsTrigger value="updates">Recent Updates</TabsTrigger>
          </TabsList>

          {/* GST Module */}
          <TabsContent value="gst" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* GSTR Filing Due Dates */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-blue-600" />
                    GSTR Filing Due Dates
                  </CardTitle>
                  <CardDescription>Upcoming GST return filing deadlines for FY 2025-26</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {gstDueDates.map((item) => (
                      <div key={item.form} className="flex items-center justify-between rounded-lg border border-border p-3">
                        <div>
                          <p className="font-medium text-foreground">{item.form}</p>
                          <p className="text-sm text-muted-foreground">{item.due}</p>
                        </div>
                        <StatusBadge status={item.status} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* ITC Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IndianRupee className="h-5 w-5 text-emerald-600" />
                    ITC Summary
                  </CardTitle>
                  <CardDescription>Input Tax Credit overview</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg bg-emerald-50 p-4 dark:bg-emerald-950">
                    <p className="text-sm text-muted-foreground">Eligible ITC</p>
                    <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">Available via GSTR-2B</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">CGST Credit</span>
                      <span className="font-medium">As per books</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">SGST Credit</span>
                      <span className="font-medium">As per books</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">IGST Credit</span>
                      <span className="font-medium">As per books</span>
                    </div>
                  </div>
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950">
                    <p className="flex items-center gap-1 text-xs font-medium text-amber-800 dark:text-amber-200">
                      <AlertTriangle className="h-3 w-3" />
                      Rule 42/43 reversal check pending
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Compliance Status */}
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    GST Compliance Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                      <div>
                        <p className="text-sm font-medium">E-Invoice</p>
                        <p className="text-xs text-muted-foreground">Enabled if turnover &gt; 5 Cr</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                      <div>
                        <p className="text-sm font-medium">E-Way Bill</p>
                        <p className="text-xs text-muted-foreground">Required for goods &gt; 50K</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                      <div>
                        <p className="text-sm font-medium">GSTR-2B Reconciliation</p>
                        <p className="text-xs text-muted-foreground">Monthly check needed</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                      <Clock className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium">Annual Return</p>
                        <p className="text-xs text-muted-foreground">GSTR-9 due Dec 2026</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Income Tax Module */}
          <TabsContent value="it" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* ITR Type Selector */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    ITR Type Selector
                  </CardTitle>
                  <CardDescription>Which ITR form applies to you?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { form: "ITR-1 (Sahaj)", desc: "Salary, 1 house, other sources (up to 50L)" },
                    { form: "ITR-2", desc: "No business/profession income" },
                    { form: "ITR-3", desc: "Business/profession income" },
                    { form: "ITR-4 (Sugam)", desc: "Presumptive income (44AD/44ADA/44AE)" },
                    { form: "ITR-5", desc: "Firms, LLPs, AOPs, BOIs" },
                    { form: "ITR-6", desc: "Companies (not claiming Sec 11)" },
                    { form: "ITR-7", desc: "Trusts, institutions (Sec 139(4A-4F))" },
                  ].map((itr) => (
                    <div key={itr.form} className="rounded-lg border border-border p-2.5">
                      <p className="text-sm font-medium text-foreground">{itr.form}</p>
                      <p className="text-xs text-muted-foreground">{itr.desc}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Regime Comparator */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-amber-600" />
                    Regime Comparator
                  </CardTitle>
                  <CardDescription>Old vs New regime (FY 2025-26)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
                        <p className="text-xs font-medium text-blue-800 dark:text-blue-200">Old Regime</p>
                        <p className="mt-1 text-xs text-muted-foreground">80C, 80D, HRA, LTA deductions available</p>
                        <p className="mt-2 text-xs text-muted-foreground">Max rate: 30% (above 10L)</p>
                      </div>
                      <div className="rounded-lg bg-purple-50 p-3 dark:bg-purple-950">
                        <p className="text-xs font-medium text-purple-800 dark:text-purple-200">New Regime</p>
                        <p className="mt-1 text-xs text-muted-foreground">Lower rates, limited deductions (Sec 80CCD(2), std deduction)</p>
                        <p className="mt-2 text-xs text-muted-foreground">Max rate: 30% (above 15L)</p>
                      </div>
                    </div>
                    <Link href="/dashboard/calculator">
                      <Button variant="outline" className="w-full" size="sm">
                        <Calculator className="mr-2 h-4 w-4" />
                        Compare with Calculator
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      Note: New IT Act 2025 effective from 1st April 2026 may change regime structure
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Advance Tax & Key Dates */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-red-600" />
                    IT Key Dates
                  </CardTitle>
                  <CardDescription>Income Tax filing and payment deadlines</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {itDueDates.map((item) => (
                      <div key={item.item} className="flex items-center justify-between rounded-lg border border-border p-2.5">
                        <div>
                          <p className="text-sm font-medium text-foreground">{item.item}</p>
                          <p className="text-xs text-muted-foreground">{item.due}</p>
                        </div>
                        <StatusBadge status={item.status} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Recent Updates */}
          <TabsContent value="updates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-blue-600" />
                  Latest Notifications
                </CardTitle>
                <CardDescription>Recent updates from GST, Income Tax, and RBI portals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentUpdates.map((update, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-lg border border-border p-3">
                      <SourceBadge source={update.source} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{update.title}</p>
                        <p className="text-xs text-muted-foreground">{update.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
