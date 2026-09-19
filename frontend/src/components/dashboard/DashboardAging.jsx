"use client";

import Link from "next/link";
import { useDashboardAging } from "@/hooks/useDashboardMetrics";
import { formatCurrency } from "@/utils/dashboardFormatters";
import DashboardWidget from "./DashboardWidget";

const BUCKETS = [
  {
    key: "overdue",
    label: "Gecikmiş",
    hint: "Vadesi geçmiş çek / senet",
    tone: "danger",
    href: "/collections?aging=overdue",
    countKey: "overdueCount",
    amountKey: "overdueAmount",
  },
  {
    key: "today",
    label: "Bugün",
    hint: "Vadesi bugün",
    tone: "warning",
    href: "/collections?aging=today",
    countKey: "dueTodayCount",
    amountKey: "dueTodayAmount",
  },
  {
    key: "soon",
    label: "7 gün içinde",
    hint: "Yaklaşan vade",
    tone: "info",
    href: "/collections?aging=soon",
    countKey: "upcomingCount",
    amountKey: "upcomingAmount",
  },
];

export default function DashboardAging() {
  const { data, loading, error, refresh } = useDashboardAging();

  if (loading || error) {
    return (
      <DashboardWidget
        title="Vade yaşlandırma"
        loading={loading}
        error={error}
        onRetry={refresh}
      />
    );
  }

  return (
    <section>
      <h2 className="h5 fw-bold mb-3">Vade yaşlandırma</h2>
      <div className="row g-3">
        {BUCKETS.map((bucket) => (
          <div className="col-12 col-md-4" key={bucket.key}>
            <Link
              href={bucket.href}
              className="text-decoration-none text-reset"
            >
              <div
                className={`ui-stat-card ui-stat-card--${bucket.tone} card border-0 shadow-sm h-100`}
              >
                <div className="card-body p-3">
                  <div className="ui-stat-card__label text-muted">
                    {bucket.label}
                  </div>
                  <div className="ui-stat-card__value fw-bold mt-1">
                    {formatCurrency(data?.[bucket.amountKey])}
                  </div>
                  <div className="text-muted small mt-1">
                    {Number(data?.[bucket.countKey] ?? 0)} kayıt · {bucket.hint}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
