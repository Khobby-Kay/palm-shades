import Papa from "papaparse";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { downloadBlob, stamp } from "./export-utils";

export type AnalyticsMetrics = {
  revenue: number;
  orders: number;
  aov: number;
};

export type SalesRow = {
  date: string;
  sales: number;
  orders: number;
};

export type CategoryRow = {
  name: string;
  value: number;
};

export type ProductRow = {
  name: string;
  revenue: number;
  units: number;
};

export type AnalyticsExportPayload = {
  timeRangeLabel: string;
  generatedAt: Date;
  metrics: AnalyticsMetrics;
  salesData: SalesRow[];
  categoryRevenue: CategoryRow[];
  topProducts: ProductRow[];
};

function money(n: number): string {
  return `GH₵${n.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function sectionRows(title: string, headers: string[], rows: string[][]): string[][] {
  return [[title], headers, ...rows, []];
}

export function exportAnalyticsCsv(data: AnalyticsExportPayload) {
  const rows: string[][] = [
    ["Palm Shades Analytics Report"],
    ["Period", data.timeRangeLabel],
    ["Generated", data.generatedAt.toLocaleString("en-GH")],
    [],
    ...sectionRows("Summary", ["Metric", "Value"], [
      ["Total Revenue", money(data.metrics.revenue)],
      ["Total Orders", String(data.metrics.orders)],
      ["Average Order Value", money(data.metrics.aov)],
    ]),
    ...sectionRows(
      "Daily Sales",
      ["Date", "Revenue (GHS)", "Orders"],
      data.salesData.map((r) => [
        r.date,
        (r.sales ?? 0).toFixed(2),
        String(r.orders ?? 0),
      ])
    ),
    ...sectionRows(
      "Revenue by Category",
      ["Category", "Revenue (GHS)", "% of Total"],
      (() => {
        const total = data.categoryRevenue.reduce((s, c) => s + c.value, 0);
        return data.categoryRevenue.map((c) => [
          c.name,
          c.value.toFixed(2),
          total > 0 ? `${((c.value / total) * 100).toFixed(1)}%` : "0%",
        ]);
      })()
    ),
    ...sectionRows(
      "Top Products",
      ["Product", "Units Sold", "Revenue (GHS)"],
      data.topProducts.map((p) => [
        p.name,
        String(p.units),
        p.revenue.toFixed(2),
      ])
    ),
  ];

  const csv = Papa.unparse(rows);
  downloadBlob(
    new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    `motchis-analytics-${stamp()}.csv`
  );
}

export function exportAnalyticsPdf(data: AnalyticsExportPayload) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  doc.setFontSize(18);
  doc.setTextColor(30, 30, 30);
  doc.text("Palm Shades — Analytics Report", 14, y);

  y += 8;
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(`Period: ${data.timeRangeLabel}`, 14, y);
  y += 5;
  doc.text(`Generated: ${data.generatedAt.toLocaleString("en-GH")}`, 14, y);
  y += 10;

  autoTable(doc, {
    startY: y,
    head: [["Metric", "Value"]],
    body: [
      ["Total Revenue", money(data.metrics.revenue)],
      ["Total Orders", String(data.metrics.orders)],
      ["Average Order Value", money(data.metrics.aov)],
    ],
    theme: "grid",
    headStyles: { fillColor: [30, 30, 30] },
    margin: { left: 14, right: 14 },
  });

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  autoTable(doc, {
    startY: y,
    head: [["Date", "Revenue (GHS)", "Orders"]],
    body:
      data.salesData.length > 0
        ? data.salesData.map((r) => [
            r.date,
            (r.sales ?? 0).toFixed(2),
            String(r.orders ?? 0),
          ])
        : [["No sales in this period", "—", "—"]],
    theme: "striped",
    headStyles: { fillColor: [16, 185, 129] },
    margin: { left: 14, right: 14 },
    styles: { fontSize: 9 },
  });

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  const catTotal = data.categoryRevenue.reduce((s, c) => s + c.value, 0);

  autoTable(doc, {
    startY: y,
    head: [["Category", "Revenue (GHS)", "Share"]],
    body:
      data.categoryRevenue.length > 0
        ? data.categoryRevenue.map((c) => [
            c.name,
            c.value.toFixed(2),
            catTotal > 0
              ? `${((c.value / catTotal) * 100).toFixed(1)}%`
              : "0%",
          ])
        : [["No category data", "—", "—"]],
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 14, right: 14 },
    styles: { fontSize: 9 },
  });

  doc.addPage();
  y = 18;
  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.text("Top Performing Products", 14, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    head: [["#", "Product", "Units", "Revenue (GHS)"]],
    body:
      data.topProducts.length > 0
        ? data.topProducts.map((p, i) => [
            String(i + 1),
            p.name,
            String(p.units),
            p.revenue.toFixed(2),
          ])
        : [["—", "No product sales in this period", "—", "—"]],
    theme: "grid",
    headStyles: { fillColor: [30, 30, 30] },
    margin: { left: 14, right: 14 },
    styles: { fontSize: 9 },
  });

  const footerY = doc.internal.pageSize.getHeight() - 10;
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(
    "Palm Shades · Paid orders only · motchis-house-of-beauty.vercel.app",
    pageWidth / 2,
    footerY,
    { align: "center" }
  );

  doc.save(`motchis-analytics-${stamp()}.pdf`);
}

export function timeRangeLabel(range: string): string {
  const labels: Record<string, string> = {
    "7days": "Last 7 Days",
    "30days": "Last 30 Days",
    "90days": "Last 90 Days",
    year: "This Year",
  };
  return labels[range] ?? range;
}
