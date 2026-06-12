"use client";

import { useEffect, useRef, useState } from "react";

type ExportDropdownProps = {
  onExportCsv: () => void;
  onExportPdf: () => void;
  disabled?: boolean;
  label?: string;
  className?: string;
  variant?: "primary" | "secondary" | "compact";
};

export function ExportDropdown({
  onExportCsv,
  onExportPdf,
  disabled = false,
  label = "Export",
  className = "",
  variant = "primary",
}: ExportDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const baseBtn =
    variant === "primary"
      ? "bg-blue-700 hover:bg-blue-800 text-white"
      : variant === "secondary"
        ? "border-2 border-gray-300 hover:border-gray-400 text-gray-700 bg-white"
        : "bg-gray-700 hover:bg-gray-800 text-white";

  const size =
    variant === "compact"
      ? "px-4 py-2 text-sm"
      : "px-6 py-3 font-semibold";

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        className={`flex items-center justify-center whitespace-nowrap rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${baseBtn} ${size}`}
      >
        <i className="ri-download-line mr-2"></i>
        {label}
        <i className="ri-arrow-down-s-line ml-1"></i>
      </button>
      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          <button
            type="button"
            onClick={() => {
              onExportCsv();
              setOpen(false);
            }}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            <i className="ri-file-excel-2-line text-lg text-emerald-600"></i>
            <span>
              Export CSV
              <span className="mt-0.5 block text-xs font-normal text-gray-500">
                Spreadsheet-friendly
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              onExportPdf();
              setOpen(false);
            }}
            className="flex w-full items-center gap-3 border-t border-gray-100 px-4 py-3 text-left text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            <i className="ri-file-pdf-2-line text-lg text-red-600"></i>
            <span>
              Export PDF
              <span className="mt-0.5 block text-xs font-normal text-gray-500">
                Printable report
              </span>
            </span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
