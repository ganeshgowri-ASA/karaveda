# KaraVeda (करवेद) - AI-Powered CA Assistant

KaraVeda is an AI-powered Chartered Accountant assistant specializing in Indian taxation — GST, Income Tax, TDS/TCS, and RBI compliance. It combines 30 years of simulated CA expertise with real-time government portal scraping and RAG-based document retrieval.

## Features

- **AI Chat Assistant** — Ask any GST, Income Tax, or TDS question. Get cited answers with Act/Section references, AAR rulings, and tribunal precedents.
- **RAG Pipeline** — Scraped government notifications are embedded and stored in Qdrant for context-aware retrieval during chat.
- **Government Portal Scraping** — Automated scrapers for GST (cbic-gst.gov.in), Income Tax (incometaxindia.gov.in), and RBI (rbi.org.in) portals.
- **Tax Calculators** — GST calculator (forward/reverse, CGST/SGST/IGST), Income Tax calculator (old vs new regime FY 2025-26), and comprehensive TDS rate lookup.
- **Professional Dashboard** — GSTR filing due dates, ITC summary, compliance status, ITR type selector, regime comparator, and recent notification feed.
- **Grey Area Analysis** — For ambiguous tax positions, provides both conservative and aggressive interpretations with supporting authorities.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 + React 19 |
| Language | TypeScript (strict) |
| AI Model | Anthropic Claude (Sonnet 4.5) |
| Embeddings | OpenAI text-embedding-3-small (1536d) |
| Vector DB | Qdrant |
| Scraping | Cheerio |
| Styling | Tailwind CSS v4 + Radix UI + shadcn/ui |
| Deployment | Vercel |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Frontend                      │
│  ┌──────────┐  ┌───────────┐  ┌────────────────────┐   │
│  │ Landing   │  │ Dashboard │  │ Chat Interface     │   │
│  │ Page      │  │ + Calc UI │  │ (Streaming SSE)    │   │
│  └──────────┘  └───────────┘  └─────────┬──────────┘   │
│                                          │              │
├──────────────────────────────────────────┼──────────────┤
│                  API Routes              │              │
│  ┌────────────────────────┐  ┌──────────┴───────────┐  │
│  │ /api/scraper           │  │ /api/chat             │  │
│  │ GST, IT, RBI scrapers  │  │ Claude AI + RAG       │  │
│  └──────────┬─────────────┘  └──────────┬───────────┘  │
│             │                           │              │
├─────────────┼───────────────────────────┼──────────────┤
│             ▼                           ▼              │
│  ┌──────────────────┐  ┌──────────────────────────┐    │
│  │ Embeddings       │  │ Qdrant Vector Search     │    │
│  │ (OpenAI API)     │──│ Collection: tax_knowledge│    │
│  └──────────────────┘  └──────────────────────────┘    │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Tax Engine: GST Calculator, IT Calculator, TDS   │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │ CA Persona Prompt (30-year expertise profile)    │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Setup

### Prerequisites

- Node.js 18+
- npm or pnpm

### Environment Variables

Create a `.env.local` file:

```env
# Anthropic (required for chat)
ANTHROPIC_API_KEY=sk-ant-...

# OpenAI (required for embeddings/RAG)
OPENAI_API_KEY=sk-...

# Qdrant (required for RAG vector storage)
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=your-qdrant-api-key
```

### Installation

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the landing page.

### Key Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/chat` | AI chat assistant |
| `/dashboard` | Tax dashboard with GST/IT modules |
| `/dashboard/calculator` | Interactive tax calculators |
| `/api/chat` | Chat API (POST, streaming SSE) |
| `/api/scraper` | Scraper API (POST, triggers portal scraping) |

## Deployment (Vercel)

1. Push the repository to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add the environment variables (ANTHROPIC_API_KEY, OPENAI_API_KEY, QDRANT_URL, QDRANT_API_KEY) in the Vercel dashboard
4. Deploy — Vercel auto-detects Next.js and builds accordingly

### Notes

- The Qdrant instance must be accessible from Vercel's serverless functions (use Qdrant Cloud or a publicly accessible instance)
- Scraper routes may need longer function timeouts for large scraping jobs — configure `maxDuration` in `vercel.json` if needed
- All API routes use Edge-compatible patterns for optimal Vercel deployment

## Disclaimer

KaraVeda provides AI-generated tax information for educational and reference purposes only. It does not constitute professional legal or tax advice. Always consult a qualified Chartered Accountant before making financial decisions.
