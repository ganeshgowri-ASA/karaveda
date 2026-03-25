import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Scale,
  MessageSquare,
  Calculator,
  Shield,
  RefreshCw,
  ArrowRight,
  FileText,
  AlertTriangle,
  Sparkles,
} from "lucide-react"

const features = [
  {
    icon: Scale,
    title: "GST Expert",
    description:
      "ITC eligibility, reverse charge, GSTR filing, e-invoicing, place of supply — with Act and Rule citations.",
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950",
  },
  {
    icon: Calculator,
    title: "Income Tax Advisory",
    description:
      "Old vs new regime comparison, ITR selection, advance tax, capital gains, TDS rates — all for FY 2025-26.",
    color: "text-purple-600",
    bg: "bg-purple-50 dark:bg-purple-950",
  },
  {
    icon: RefreshCw,
    title: "Real-time Updates",
    description:
      "Automated scraping of GST, Income Tax, and RBI portals. Latest circulars and notifications indexed instantly.",
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-950",
  },
  {
    icon: AlertTriangle,
    title: "Grey Area Analysis",
    description:
      "When the law is ambiguous, get both conservative and aggressive positions with AAR rulings and tribunal precedents.",
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-950",
  },
]

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Nav */}
      <header className="border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <Scale className="h-6 w-6 text-amber-600" />
            <span className="text-lg font-bold">KaraVeda</span>
          </div>
          <nav className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">Dashboard</Button>
            </Link>
            <Link href="/dashboard/calculator">
              <Button variant="ghost" size="sm">Calculator</Button>
            </Link>
            <Link href="/chat">
              <Button size="sm">
                <MessageSquare className="mr-1.5 h-4 w-4" />
                Chat
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:py-24">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
            <Sparkles className="h-4 w-4" />
            AI-Powered Chartered Accountant
          </div>

          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            KaraVeda{" "}
            <span className="text-amber-600">(करवेद)</span>
          </h1>
          <p className="mb-2 text-xl text-foreground sm:text-2xl">
            Your AI CA Assistant
          </p>
          <p className="mb-8 text-lg text-muted-foreground">
            30 years of tax expertise, powered by AI
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/chat">
              <Button size="lg" className="gap-2 px-8">
                <MessageSquare className="h-5 w-5" />
                Start Chatting
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="gap-2 px-8">
                <FileText className="h-5 w-5" />
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="border-t border-border bg-muted/30 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-10 text-center text-2xl font-bold text-foreground sm:text-3xl">
            Everything a CA knows, available 24/7
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <Card key={f.title} className="transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className={`mb-4 inline-flex rounded-lg p-2.5 ${f.bg}`}>
                    <f.icon className={`h-6 w-6 ${f.color}`} />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-4 text-2xl font-bold text-foreground">
            Ready to simplify your tax queries?
          </h2>
          <p className="mb-6 text-muted-foreground">
            Ask about GST, Income Tax, TDS, or any Indian taxation topic. Get instant, cited answers.
          </p>
          <Link href="/chat">
            <Button size="lg" className="gap-2">
              <MessageSquare className="h-5 w-5" />
              Start a Conversation
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-4 py-6">
        <div className="mx-auto max-w-6xl text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <Scale className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-semibold">KaraVeda (करवेद)</span>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            <strong>Disclaimer:</strong> KaraVeda provides AI-generated tax information for educational and reference purposes only.
            It does not constitute professional legal or tax advice. Always consult a qualified Chartered Accountant or tax
            professional before making financial decisions. The information may not reflect the latest amendments or your
            specific circumstances.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} KaraVeda. Built with Next.js, Claude AI, and Qdrant.
          </p>
        </div>
      </footer>
    </div>
  )
}
