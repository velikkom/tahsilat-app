"use client";

import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import DashboardWidget from "./DashboardWidget";
import DashboardSummaryCard from "./DashboardSummaryCard";
import {
  DASHBOARD_SUMMARY_CARDS,
  buildDashboardSummaryValues,
} from "./dashboardSummaryCards";

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

  const { values, subtitles } = buildDashboardSummaryValues(data);

  return (
    <div className="row g-3">
      {DASHBOARD_SUMMARY_CARDS.map((card) => (
        <div className="col-12 col-sm-6 col-xl-3" key={card.key}>
          <DashboardSummaryCard
            card={card}
            value={values[card.key]}
            subtitle={subtitles[card.key]}
          />
        </div>
      ))}
    </div>
  );
}
