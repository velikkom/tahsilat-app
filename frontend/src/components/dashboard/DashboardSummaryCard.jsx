"use client";

import Link from "next/link";
import { formatCurrency } from "@/utils/dashboardFormatters";

export default function DashboardSummaryCard({ card, value, subtitle }) {
  const body = (
    <div
      className={`ui-stat-card ui-stat-card--${card.tone} card border-0 shadow-sm h-100`}
    >
      <div className="card-body p-3">
        <div className="ui-stat-card__label text-muted">{card.label}</div>
        <div className="ui-stat-card__value fw-bold mt-1">
          {formatCurrency(value)}
        </div>
        <div className="text-muted small mt-1">{subtitle || card.hint}</div>
      </div>
    </div>
  );

  if (card.href) {
    return (
      <Link href={card.href} className="text-decoration-none text-reset">
        {body}
      </Link>
    );
  }

  return body;
}
