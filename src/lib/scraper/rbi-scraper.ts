import { load } from "cheerio";

export interface RBINotification {
  notificationNumber: string;
  date: string;
  subject: string;
  body: string;
  category: "tds" | "fema" | "digital-payments" | "general";
  sourceUrl: string;
}

const RBI_BASE_URL = "https://rbi.org.in";

const ENDPOINTS = {
  notifications: "/Scripts/NotificationUser.aspx",
  circulars: "/Scripts/BS_CircularIndexDisplay.aspx",
} as const;

type CheerioRoot = ReturnType<typeof load>;

// Keywords to filter tax-relevant RBI notifications
const CATEGORY_KEYWORDS: Record<RBINotification["category"], string[]> = {
  tds: ["tds", "tax deducted", "tax deduction", "withholding tax", "section 194", "section 195"],
  fema: ["fema", "foreign exchange", "lrs", "liberalised remittance", "ecb", "external commercial"],
  "digital-payments": ["digital payment", "upi", "authentication", "2fa", "afa", "payment aggregator", "prepaid", "e-mandate"],
  general: [],
};

function categorizeNotification(subject: string): RBINotification["category"] {
  const lower = subject.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === "general") continue;
    if (keywords.some((kw) => lower.includes(kw))) {
      return category as RBINotification["category"];
    }
  }
  return "general";
}

async function fetchPage(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; KaraVeda/1.0; Tax Research Bot)",
      Accept: "text/html,application/xhtml+xml",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return response.text();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseRBIRow(
  $: CheerioRoot,
  row: any
): RBINotification | null {
  const cells = $(row).find("td");
  if (cells.length < 3) return null;

  const notificationNumber = $(cells[0]).text().trim();
  const date = $(cells[1]).text().trim();
  const subject = $(cells[2]).text().trim();
  const link = $(row).find("a").attr("href") || "";
  const sourceUrl = link.startsWith("http") ? link : `${RBI_BASE_URL}${link}`;

  if (!subject) return null;

  return {
    notificationNumber,
    date,
    subject,
    body: "",
    category: categorizeNotification(subject),
    sourceUrl,
  };
}

async function fetchNotificationBody(
  notification: RBINotification
): Promise<RBINotification> {
  if (!notification.sourceUrl) return notification;

  try {
    const html = await fetchPage(notification.sourceUrl);
    const $ = load(html);

    const body =
      $("#divContent").text().trim() ||
      $(".tablebg").text().trim() ||
      $(".content-area").text().trim() ||
      $("main").text().trim();

    return { ...notification, body: body.slice(0, 50000) };
  } catch {
    return notification;
  }
}

export async function scrapeRBINotifications(): Promise<RBINotification[]> {
  const html = await fetchPage(`${RBI_BASE_URL}${ENDPOINTS.notifications}`);
  const $ = load(html);

  const notifications: RBINotification[] = [];
  $("table tbody tr, .grid-row").each((_, row) => {
    const parsed = parseRBIRow($, row);
    if (parsed) notifications.push(parsed);
  });

  return notifications;
}

export async function scrapeRBICirculars(): Promise<RBINotification[]> {
  const html = await fetchPage(`${RBI_BASE_URL}${ENDPOINTS.circulars}`);
  const $ = load(html);

  const notifications: RBINotification[] = [];
  $("table tbody tr, .grid-row").each((_, row) => {
    const parsed = parseRBIRow($, row);
    if (parsed) notifications.push(parsed);
  });

  return notifications;
}

export async function scrapeRBIPortal(options?: {
  dateFrom?: string;
  dateTo?: string;
  includeBody?: boolean;
  categoriesFilter?: RBINotification["category"][];
}): Promise<RBINotification[]> {
  const [notifications, circulars] = await Promise.all([
    scrapeRBINotifications(),
    scrapeRBICirculars(),
  ]);

  let results = [...notifications, ...circulars];

  // Filter to only tax-relevant notifications (exclude general by default)
  if (options?.categoriesFilter) {
    results = results.filter((n) =>
      options.categoriesFilter!.includes(n.category)
    );
  } else {
    // By default, only include tax-relevant categories
    results = results.filter((n) => n.category !== "general");
  }

  if (options?.dateFrom || options?.dateTo) {
    results = results.filter((n) => {
      if (!n.date) return true;
      const notifDate = new Date(n.date);
      if (isNaN(notifDate.getTime())) return true;
      if (options.dateFrom && notifDate < new Date(options.dateFrom))
        return false;
      if (options.dateTo && notifDate > new Date(options.dateTo)) return false;
      return true;
    });
  }

  if (options?.includeBody) {
    results = await Promise.all(results.map(fetchNotificationBody));
  }

  return results;
}
