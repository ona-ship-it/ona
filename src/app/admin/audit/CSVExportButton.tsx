"use client";
import React from "react";

type Props = {
  entries: Array<{
    id?: string;
    user_id?: string | null;
    page?: string | null;
    action?: string | null;
    note?: string | null;
    created_at?: string;
    [key: string]: any;
  }>;
};

export function CSVExportButton({ entries }: Props) {
  const handleExport = () => {
    try {
      const headers = ["id", "user_id", "email", "page", "action", "note", "created_at"];
      const rows = (entries || []).map((e) =>
        headers
          .map((h) => {
            const v = e?.[h];
            const s = v == null ? "" : String(v);
            // Escape quotes and wrap in quotes to be CSV-safe
            return `"${s.replace(/"/g, '""')}"`;
          })
          .join(",")
      );
      const csv = [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `admin-audit-${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("CSV export failed:", err);
      alert("Failed to export CSV");
    }
  };

  return (
    <button onClick={handleExport} className="border px-3 py-1 rounded bg-white hover:bg-gray-50">
      Export CSV
    </button>
  );
}