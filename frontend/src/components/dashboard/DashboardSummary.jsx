"use client";

import Link from "next/link";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { formatCurrency } from "@/utils/dashboardFormatters";
import DashboardWidget from "./DashboardWidget";

const CARDS = [
  {
    key: "paid",
    label: "Ödendi",
    tone: "success",
    hint: "Kasaya giren tahsilat",
  },
  {
    key: "unpaid",
    label: "Ödenmedi",
    tone: "warning",
    hint: "Bekleyen çek / senet",
  },
  {
    key: "total",
    label: "Toplam",
    tone: "primary",
    hint: "Ödendi + ödenmedi",
  },
  {
    key: "due",
    label: "Vadesi gelen",
    tone: "danger",
    hint: "Bugün ve gecikmiş",
    href: "/collections?due=1",
  },
];

export default function DashboardSummary() {
  const { data, loading, error, refresh } = useDashboardMetrics();

  if (loading || error) {
    return (
      <DashboardWidget
        title="Tüm tahsilatlar"
        loading={loading}
        error={error}
        onRetry={refresh}
      />
    );
  }

  const paid = Number(data?.paidAmount ?? 0);
  const unpaid = Number(data?.unpaidAmount ?? 0);
  const dueCount = Number(data?.dueMaturityCount ?? 0);

  const values = {
    paid: formatCurrency(paid),
    unpaid: formatCurrency(unpaid),
    total: formatCurrency(paid + unpaid),
    due: formatCurrency(data?.dueMaturityAmount),
  };

  const subtitles = {
    paid: null,
    unpaid: null,
    total: null,
    due: dueCount > 0 ? `${dueCount} kayıt` : "Kayıt yok",
  };

  return (
    <div className="row g-3">
      {CARDS.map((card) => {
        const body = (
          <div
            className={`ui-stat-card ui-stat-card--${card.tone} card border-0 shadow-sm h-100`}
          >
            <div className="card-body p-3">
              <div className="ui-stat-card__label text-muted">{card.label}</div>
              <div className="ui-stat-card__value fw-bold mt-1">
                {values[card.key]}
              </div>
              <div className="text-muted small mt-1">
                {subtitles[card.key] || card.hint}
              </div>
            </div>
          </div>
        );

        return (
          <div className="col-12 col-sm-6 col-xl-3" key={card.key}>
            {card.href ? (
              <Link href={card.href} className="text-decoration-none text-reset">
                {body}
              </Link>
            ) : (
              body
            )}
          </div>
        );
      })}
    </div>
  );
}
