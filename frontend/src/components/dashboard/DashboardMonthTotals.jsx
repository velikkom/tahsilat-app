"use client";

import { formatCurrency } from "@/utils/dashboardFormatters";

const TOTALS = [
  { key: "paidAmount", label: "Ödendi" },
  { key: "unpaidAmount", label: "Ödenmedi" },
  { key: "totalAmount", label: "Toplam" },
];

export default function DashboardMonthTotals({ data }) {
  return (
    <>
      {TOTALS.map((item) => (
        <div className="col-12 col-md-4" key={item.key}>
          <div className="small text-muted text-uppercase fw-semibold">
            {item.label}
          </div>
          <div className="fw-bold">{formatCurrency(data[item.key])}</div>
        </div>
      ))}
    </>
  );
}
