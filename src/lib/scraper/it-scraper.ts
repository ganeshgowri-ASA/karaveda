import * as cheerio from "cheerio";

export interface ITNotification {
  circularNumber: string;
  date: string;
  subject: string;
  body: string;
  type: "circular" | "notification";
  sourceUrl: string;
}

const IT_BASE_URL = "https://incometaxindia.gov.in";

const ENDPOINTS = {
  circulars: "/pages/communications/circulars.aspx",
  notifications: "/pages/communications/notifications.aspx",
} as const;

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

function parseITRow(
  $: cheerio.CheerioAPI,
  row: cheerio.Element,
  type: "circular" | "notification"
): ITNotification | null {
  const cells = $(row).find("td");
  if (cells.length < 3) return null;

  const circularNumber = $(cells[0]).text().trim();
  const date = $(cells[1]).text().trim();
  const subject = $(cells[2]).text().trim();
  const link = $(cells[2]).find("a").attr("href") || $(cells[0]).find("a").attr("href") || "";
  const sourceUrl = link.startsWith("http") ? link : `${IT_BASE_URL}${link}`;

  if (!circularNumber || !subject) return null;

  return {
    circularNumber,
    date,
    subject,
    body: "",
    type,
    sourceUrl,
  };
}

async function fetchNotificationBody(
  notification: ITNotification
): Promise<ITNotification> {
  if (!notification.sourceUrl) return notification;

  try {
    const html = await fetchPage(notification.sourceUrl);
    const $ = cheerio.load(html);

    const body =
      $(".order-content").text().trim() ||
      $("#ContentPlaceHolder_lblBodyContent").text().trim() ||
      $(".content-area").text().trim() ||
      $("main").text().trim();

    return { ...notification, body: body.slice(0, 50000) };
  } catch {
    return notification;
  }
}

export async function scrapeITCirculars(): Promise<ITNotification[]> {
  const html = await fetchPage(`${IT_BASE_URL}${ENDPOINTS.circulars}`);
  const $ = cheerio.load(html);

  const notifications: ITNotification[] = [];
  $("table tbody tr, .grid-row").each((_, row) => {
    const parsed = parseITRow($, row, "circular");
    if (parsed) notifications.push(parsed);
  });

  return notifications;
}

export async function scrapeITNotifications(): Promise<ITNotification[]> {
  const html = await fetchPage(`${IT_BASE_URL}${ENDPOINTS.notifications}`);
  const $ = cheerio.load(html);

  const notifications: ITNotification[] = [];
  $("table tbody tr, .grid-row").each((_, row) => {
    const parsed = parseITRow($, row, "notification");
    if (parsed) notifications.push(parsed);
  });

  return notifications;
}

export async function scrapeIncomeTaxPortal(options?: {
  dateFrom?: string;
  dateTo?: string;
  includeBody?: boolean;
}): Promise<ITNotification[]> {
  const [circulars, notifications] = await Promise.all([
    scrapeITCirculars(),
    scrapeITNotifications(),
  ]);

  let results = [...circulars, ...notifications];

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
