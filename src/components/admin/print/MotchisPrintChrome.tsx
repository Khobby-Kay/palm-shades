import type { ReactNode } from "react";
import { adminPrintBrand } from "@/lib/admin/print-brand";

type MotchisPrintChromeProps = {
  documentTitle: string;
  reference?: string;
  date?: string;
  children: ReactNode;
};

export function MotchisPrintChrome({
  documentTitle,
  reference,
  date,
  children,
}: MotchisPrintChromeProps) {
  const printedDate = date ?? new Date().toLocaleString("en-GH");

  return (
    <div className="border-2 border-gray-800 p-6">
      <div className="flex justify-between items-start border-b-2 border-gray-800 pb-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold">{adminPrintBrand.name}</h1>
          <p className="text-sm text-gray-600">{documentTitle}</p>
          <p className="text-xs text-gray-500 mt-1">{adminPrintBrand.tagline}</p>
          <p className="text-xs text-gray-500">{adminPrintBrand.address}</p>
          <p className="text-xs text-gray-500">
            {adminPrintBrand.phone} · {adminPrintBrand.email}
          </p>
        </div>
        <div className="text-right">
          {reference && <p className="font-bold text-lg">{reference}</p>}
          <p className="text-sm">{printedDate}</p>
        </div>
      </div>

      {children}

      <div className="border-t-2 border-gray-800 pt-4 text-center text-sm text-gray-600">
        <p>Thank you for choosing {adminPrintBrand.shortName}!</p>
        <p>
          {adminPrintBrand.siteLabel} · Questions? {adminPrintBrand.phone}
        </p>
      </div>
    </div>
  );
}
