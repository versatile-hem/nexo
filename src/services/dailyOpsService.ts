import { db } from "@/mocks/data";
import {
  DailyOpsOrderRow,
  DailyOpsReturnRow,
  DailyReport,
  ProductOption,
  SalesChannel,
} from "@/mocks/types";
import { mockResponse } from "@/services/api";

export interface DailyReportPayload {
  date: string;
  channel: SalesChannel;
  orders: DailyOpsOrderRow[];
  returns: DailyOpsReturnRow[];
}

export const dailyOpsService = {
  saveDailyReport: (payload: DailyReportPayload) => {
    const report: DailyReport = {
      id: `dr-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...payload,
    };
    db.dailyReports.unshift(report);
    return mockResponse(report);
  },

  getDailyReports: () => mockResponse([...db.dailyReports]),

  parseRawInput: (text: string, products: ProductOption[] = []) => {
    const productMap = new Map(products.map((item) => [normalize(item.name), item]));
    const parsed: DailyOpsOrderRow[] = [];

    text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .forEach((line) => {
        const [left, right] = line.split("=");
        if (!left || !right) {
          return;
        }

        const courier = normalizeCourier(left.trim());
        const match = right.trim().match(/^(\d+)\s+(.+)$/);
        if (!courier || !match) {
          return;
        }

        const qty = Number(match[1]);
        const productName = match[2].trim();
        if (!Number.isFinite(qty) || qty <= 0 || !productName) {
          return;
        }

        const matched = productMap.get(normalize(productName));

        parsed.push({
          courier,
          productId: matched?.id,
          productName: matched?.name ?? productName,
          qty,
          unit: "nos",
        });
      });

    return mockResponse(parsed);
  },
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function normalizeCourier(value: string) {
  const canonicalMap = new Map([
    ["shadowfax", "Shadowfax"],
    ["delhivery", "Delhivery"],
    ["xpressbees", "Xpressbees"],
    ["ekart", "Ekart"],
    ["amazon shipping", "Amazon Shipping"],
    ["other", "Other"],
  ]);

  return canonicalMap.get(normalize(value)) ?? "Other";
}
