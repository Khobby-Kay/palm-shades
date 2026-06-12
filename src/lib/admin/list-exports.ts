import { downloadCsv, downloadPdfReport, money, stamp } from "./export-utils";

export type CustomerExportRow = {
  name: string;
  email: string;
  phone: string;
  orders: number;
  totalSpent: number;
  joined: string;
  lastOrder: string;
  status: string;
  isGuest?: boolean;
};

export type OrderExportRow = {
  orderId: string;
  customer: string;
  email: string;
  date: string;
  items: number;
  total: number;
  status: string;
  payment: string;
};

export type InventoryExportRow = {
  sku: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  status: string;
};

export type CustomerInsightExportRow = {
  name: string;
  email: string;
  phone: string;
  segment: string;
  orders: number;
  totalSpent: number;
  avgOrderValue: number;
  lifetimeValue: number;
  joinDate: string;
  lastOrder: string;
  riskLevel: string;
  engagementScore: number;
};

function segmentLabel(segment: string): string {
  const labels: Record<string, string> = {
    vip: "VIP Customer",
    returning: "Returning",
    new: "New Customer",
    "at-risk": "At Risk",
  };
  return labels[segment] ?? segment;
}

export function exportCustomersCsv(rows: CustomerExportRow[], filename?: string) {
  downloadCsv(
    [
      ["Name", "Email", "Phone", "Orders", "Total Spent (GHS)", "Joined", "Last Order", "Status", "Type"],
      ...rows.map((r) => [
        r.name,
        r.email,
        r.phone,
        String(r.orders),
        r.totalSpent.toFixed(2),
        r.joined,
        r.lastOrder,
        r.status,
        r.isGuest ? "Guest" : "Registered",
      ]),
    ],
    filename ?? `motchis-customers-${stamp()}.csv`
  );
}

export function exportCustomersPdf(rows: CustomerExportRow[], title = "Customer List") {
  downloadPdfReport({
    title: `Palm Shades — ${title}`,
    subtitle: `${rows.length} customer${rows.length === 1 ? "" : "s"}`,
    filename: `motchis-customers-${stamp()}.pdf`,
    sections: [
      {
        head: ["Name", "Email", "Phone", "Orders", "Spent", "Status"],
        body: rows.map((r) => [
          r.name,
          r.email,
          r.phone,
          String(r.orders),
          money(r.totalSpent),
          r.status,
        ]),
      },
    ],
  });
}

export function exportOrdersCsv(rows: OrderExportRow[], filename?: string) {
  downloadCsv(
    [
      ["Order ID", "Customer", "Email", "Date", "Items", "Total (GHS)", "Status", "Payment"],
      ...rows.map((r) => [
        r.orderId,
        r.customer,
        r.email,
        r.date,
        String(r.items),
        r.total.toFixed(2),
        r.status,
        r.payment,
      ]),
    ],
    filename ?? `motchis-orders-${stamp()}.csv`
  );
}

export function exportOrdersPdf(rows: OrderExportRow[], title = "Orders Report") {
  const totalRevenue = rows.reduce((s, r) => s + r.total, 0);
  downloadPdfReport({
    title: `Palm Shades — ${title}`,
    subtitle: `${rows.length} order${rows.length === 1 ? "" : "s"} · Total ${money(totalRevenue)}`,
    filename: `motchis-orders-${stamp()}.pdf`,
    sections: [
      {
        head: ["Order ID", "Customer", "Date", "Items", "Total", "Status", "Payment"],
        body: rows.map((r) => [
          r.orderId,
          r.customer,
          r.date,
          String(r.items),
          money(r.total),
          r.status,
          r.payment,
        ]),
      },
    ],
  });
}

export function exportInventoryCsv(rows: InventoryExportRow[], filename?: string) {
  downloadCsv(
    [
      ["SKU", "Product Name", "Category", "Current Stock", "Price (GHS)", "Status"],
      ...rows.map((r) => [
        r.sku,
        r.name,
        r.category,
        String(r.stock),
        r.price.toFixed(2),
        r.status,
      ]),
    ],
    filename ?? `motchis-inventory-${stamp()}.csv`
  );
}

export function exportInventoryPdf(rows: InventoryExportRow[], title = "Inventory Report") {
  const lowStock = rows.filter((r) => r.status === "low").length;
  const outOfStock = rows.filter((r) => r.status === "out").length;
  downloadPdfReport({
    title: `Palm Shades — ${title}`,
    subtitle: `${rows.length} products · ${lowStock} low stock · ${outOfStock} out of stock`,
    filename: `motchis-inventory-${stamp()}.pdf`,
    sections: [
      {
        head: ["SKU", "Product", "Category", "Stock", "Price", "Status"],
        body: rows.map((r) => [
          r.sku,
          r.name,
          r.category,
          String(r.stock),
          money(r.price),
          r.status === "good" ? "In Stock" : r.status === "low" ? "Low Stock" : "Out of Stock",
        ]),
      },
    ],
  });
}

export function exportCustomerInsightsCsv(
  rows: CustomerInsightExportRow[],
  filename?: string
) {
  downloadCsv(
    [
      [
        "Name",
        "Email",
        "Phone",
        "Segment",
        "Orders",
        "Total Spent (GHS)",
        "Avg Order (GHS)",
        "Lifetime Value (GHS)",
        "Join Date",
        "Last Order",
        "Risk Level",
        "Engagement Score",
      ],
      ...rows.map((r) => [
        r.name,
        r.email,
        r.phone,
        segmentLabel(r.segment),
        String(r.orders),
        r.totalSpent.toFixed(2),
        r.avgOrderValue.toFixed(2),
        r.lifetimeValue.toFixed(2),
        new Date(r.joinDate).toLocaleDateString("en-GH"),
        new Date(r.lastOrder).toLocaleDateString("en-GH"),
        r.riskLevel,
        String(r.engagementScore),
      ]),
    ],
    filename ?? `motchis-customer-insights-${stamp()}.csv`
  );
}

export function exportCustomerInsightsPdf(
  rows: CustomerInsightExportRow[],
  title = "Customer Insights"
) {
  downloadPdfReport({
    title: `Palm Shades — ${title}`,
    subtitle: `${rows.length} customer${rows.length === 1 ? "" : "s"}`,
    filename: `motchis-customer-insights-${stamp()}.pdf`,
    sections: [
      {
        head: ["Name", "Segment", "Orders", "CLV", "Risk", "Engagement"],
        body: rows.map((r) => [
          r.name,
          segmentLabel(r.segment),
          String(r.orders),
          money(r.lifetimeValue),
          r.riskLevel,
          `${r.engagementScore}%`,
        ]),
      },
    ],
  });
}
