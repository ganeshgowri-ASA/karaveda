import { load } from "cheerio";

export interface GSTNotification {
  notificationNumber: string;
  date: string;
  subject: string;
  body: string;
  type: "circular" | "notification";
  sourceUrl: string;
}

const GST_BASE_URL = "https://cbic-gst.gov.in";

const ENDPOINTS = {
  circulars: "/gst-circulars",
  notifications: "/central-tax-notifications",
  advisories: "/advisories",
} as const;

type CheerioRoot = ReturnType<typeof load>;

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
function parseNotificationRow(
  $: CheerioRoot,
  row: any,
  type: "circular" | "notification"
): GSTNotification | null {
  const cells = $(row).find("td");
  if (cells.length < 3) return null;

  const notificationNumber = $(cells[0]).text().trim();
  const date = $(cells[1]).text().trim();
  const subject = $(cells[2]).text().trim();
  const link = $(cells[2]).find("a").attr("href") || "";
  const sourceUrl = link.startsWith("http") ? link : `${GST_BASE_URL}${link}`;

  if (!notificationNumber || !subject) return null;

  return {
    notificationNumber,
    date,
    subject,
    body: "", // Will be populated when detail page is fetched
    type,
    sourceUrl,
  };
}

async function fetchNotificationBody(
  notification: GSTNotification
): Promise<GSTNotification> {
  if (!notification.sourceUrl) return notification;

  try {
    const html = await fetchPage(notification.sourceUrl);
    const $ = load(html);

    // Common content selectors on cbic-gst.gov.in
    const body =
      $(".field-item").text().trim() ||
      $(".node-content").text().trim() ||
      $("article .content").text().trim() ||
      $("main").text().trim();

    return { ...notification, body: body.slice(0, 50000) }; // Cap at 50k chars
  } catch {
    return notification;
  }
}

export async function scrapeGSTCirculars(): Promise<GSTNotification[]> {
  const html = await fetchPage(`${GST_BASE_URL}${ENDPOINTS.circulars}`);
  const $ = load(html);

  const notifications: GSTNotification[] = [];
  $("table tbody tr").each((_, row) => {
    const parsed = parseNotificationRow($, row, "circular");
    if (parsed) notifications.push(parsed);
  });

  return notifications;
}

export async function scrapeGSTNotifications(): Promise<GSTNotification[]> {
  const html = await fetchPage(`${GST_BASE_URL}${ENDPOINTS.notifications}`);
  const $ = load(html);

  const notifications: GSTNotification[] = [];
  $("table tbody tr").each((_, row) => {
    const parsed = parseNotificationRow($, row, "notification");
    if (parsed) notifications.push(parsed);
  });

  return notifications;
}

export async function scrapeGSTPortal(options?: {
  dateFrom?: string;
  dateTo?: string;
  includeBody?: boolean;
}): Promise<GSTNotification[]> {
  const [circulars, notifications] = await Promise.all([
    scrapeGSTCirculars(),
    scrapeGSTNotifications(),
  ]);

  let results = [...circulars, ...notifications];

  // Filter by date range if provided
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

  // Optionally fetch full body content
  if (options?.includeBody) {
    results = await Promise.all(results.map(fetchNotificationBody));
  }

  return results;
}
