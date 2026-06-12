import Papa from "papaparse";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export function stamp(): string {
  return new Date().toISOString().split("T")[0];
}

export function money(n: number): string {
  return `GH₵${n.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadCsv(rows: string[][], filename: string) {
  const csv = Papa.unparse(rows);
  downloadBlob(
    new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    filename
  );
}

type PdfTableSection = {
  title?: string;
  head: string[];
  body: string[][];
};

export function downloadPdfReport(opts: {
  title: string;
  subtitle?: string;
  filename: string;
  sections: PdfTableSection[];
}) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  doc.setFontSize(18);
  doc.setTextColor(30, 30, 30);
  doc.text(opts.title, 14, y);
  y += 8;

  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  if (opts.subtitle) {
    doc.text(opts.subtitle, 14, y);
    y += 5;
  }
  doc.text(`Generated: ${new Date().toLocaleString("en-GH")}`, 14, y);
  y += 10;

  opts.sections.forEach((section, index) => {
    if (section.title) {
      if (y > 250) {
        doc.addPage();
        y = 18;
      }
      doc.setFontSize(12);
      doc.setTextColor(30, 30, 30);
      doc.text(section.title, 14, y);
      y += 6;
    }

    autoTable(doc, {
      startY: y,
      head: [section.head],
      body: section.body.length > 0 ? section.body : [["No data", "—"]],
      theme: index === 0 ? "grid" : "striped",
      headStyles: { fillColor: [30, 30, 30] },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 9 },
    });

    y =
      (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable
        .finalY + 10;
  });

  const footerY = doc.internal.pageSize.getHeight() - 10;
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(
    "Palm Shades · motchis-house-of-beauty.vercel.app",
    pageWidth / 2,
    footerY,
    { align: "center" }
  );

  doc.save(opts.filename);
}
