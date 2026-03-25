import { NextRequest, NextResponse } from "next/server";
import { scrapeGSTPortal } from "@/lib/scraper/gst-scraper";
import { scrapeIncomeTaxPortal } from "@/lib/scraper/it-scraper";
import { scrapeRBIPortal } from "@/lib/scraper/rbi-scraper";
import { indexDocument } from "@/lib/rag/embeddings";

type Source = "gst" | "it" | "rbi" | "all";

interface ScraperRequest {
  source: Source;
  date_from?: string;
  date_to?: string;
}

export async function POST(request: NextRequest) {
  const { source, date_from, date_to } =
    (await request.json()) as ScraperRequest;

  if (!source || !["gst", "it", "rbi", "all"].includes(source)) {
    return NextResponse.json(
      { error: "Invalid source. Must be one of: gst, it, rbi, all" },
      { status: 400 }
    );
  }

  const results: {
    source: string;
    scraped: number;
    indexed: number;
    errors: string[];
  }[] = [];

  const sources: Source[] = source === "all" ? ["gst", "it", "rbi"] : [source];

  for (const src of sources) {
    const sourceResult = { source: src, scraped: 0, indexed: 0, errors: [] as string[] };

    try {
      if (src === "gst") {
        const notifications = await scrapeGSTPortal({
          dateFrom: date_from,
          dateTo: date_to,
          includeBody: true,
        });
        sourceResult.scraped = notifications.length;

        for (const notif of notifications) {
          try {
            const content = `${notif.subject}\n\n${notif.body}`;
            if (content.trim().length < 50) continue;

            await indexDocument(content, {
              act: "CGST Act 2017",
              section: notif.notificationNumber,
              fy_year: extractFYYear(notif.date),
              effective_date: notif.date,
              type: notif.type,
              source_url: notif.sourceUrl,
              title: notif.subject,
            });
            sourceResult.indexed++;
          } catch (err) {
            sourceResult.errors.push(
              `Failed to index GST ${notif.notificationNumber}: ${err instanceof Error ? err.message : String(err)}`
            );
          }
        }
      }

      if (src === "it") {
        const notifications = await scrapeIncomeTaxPortal({
          dateFrom: date_from,
          dateTo: date_to,
          includeBody: true,
        });
        sourceResult.scraped = notifications.length;

        for (const notif of notifications) {
          try {
            const content = `${notif.subject}\n\n${notif.body}`;
            if (content.trim().length < 50) continue;

            await indexDocument(content, {
              act: "Income Tax Act 1961",
              section: notif.circularNumber,
              fy_year: extractFYYear(notif.date),
              effective_date: notif.date,
              type: notif.type,
              source_url: notif.sourceUrl,
              title: notif.subject,
            });
            sourceResult.indexed++;
          } catch (err) {
            sourceResult.errors.push(
              `Failed to index IT ${notif.circularNumber}: ${err instanceof Error ? err.message : String(err)}`
            );
          }
        }
      }

      if (src === "rbi") {
        const notifications = await scrapeRBIPortal({
          dateFrom: date_from,
          dateTo: date_to,
          includeBody: true,
        });
        sourceResult.scraped = notifications.length;

        for (const notif of notifications) {
          try {
            const content = `${notif.subject}\n\n${notif.body}`;
            if (content.trim().length < 50) continue;

            const actMap: Record<string, string> = {
              tds: "Income Tax Act 1961",
              fema: "FEMA 1999",
              "digital-payments": "Payment and Settlement Systems Act 2007",
              general: "RBI Act 1934",
            };

            await indexDocument(content, {
              act: actMap[notif.category],
              section: notif.notificationNumber,
              fy_year: extractFYYear(notif.date),
              effective_date: notif.date,
              type: "notification",
              source_url: notif.sourceUrl,
              title: notif.subject,
            });
            sourceResult.indexed++;
          } catch (err) {
            sourceResult.errors.push(
              `Failed to index RBI ${notif.notificationNumber}: ${err instanceof Error ? err.message : String(err)}`
            );
          }
        }
      }
    } catch (err) {
      sourceResult.errors.push(
        `Scraping failed for ${src}: ${err instanceof Error ? err.message : String(err)}`
      );
    }

    results.push(sourceResult);
  }

  const totalScraped = results.reduce((sum, r) => sum + r.scraped, 0);
  const totalIndexed = results.reduce((sum, r) => sum + r.indexed, 0);
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);

  return NextResponse.json({
    success: true,
    summary: {
      totalScraped,
      totalIndexed,
      totalErrors,
    },
    results,
  });
}

function extractFYYear(dateStr: string): string {
  if (!dateStr) return "Unknown";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Unknown";
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  // Indian FY runs April to March
  if (month >= 4) {
    return `${year}-${(year + 1).toString().slice(2)}`;
  }
  return `${year - 1}-${year.toString().slice(2)}`;
}
