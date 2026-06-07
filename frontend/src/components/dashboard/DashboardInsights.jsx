"use client";

import useDashboardYear from "@/context/DashboardYearContext";
import { useDashboardInsights } from "@/hooks/useDashboardMetrics";
import {
  formatCurrency,
  formatPaymentType,
} from "@/utils/dashboardFormatters";
import DashboardWidget from "./DashboardWidget";

export default function DashboardInsights() {
  const { year } = useDashboardYear();
  const { data, loading, error, refresh } = useDashboardInsights(year);

  return (
    <DashboardWidget
      title="Dashboard Insights"
      loading={loading}
      error={error}
      onRetry={refresh}
    >
      {data && (
        <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
          <li>
            📈 En çok kullanılan ödeme türü:{" "}
            <strong>{formatPaymentType(data.mostUsedPaymentType)}</strong>
          </li>
          <li>
            🏆 En yüksek tahsilat yapan firma:{" "}
            <strong>{data.topCustomerCompanyName || "-"}</strong>
            {Number(data.topCustomerTotalAmount) > 0 && (
              <span className="text-muted">
                {" "}
                ({formatCurrency(data.topCustomerTotalAmount)})
              </span>
            )}
          </li>
          <li>
            📅 En yüksek tahsilat yapılan ay:{" "}
            <strong>
              {data.highestMonthName
                ? `${data.highestMonthName} ${year ?? new Date().getFullYear()}`
                : "-"}
            </strong>
            {Number(data.highestMonthTotalAmount) > 0 && (
              <span className="text-muted">
                {" "}
                ({formatCurrency(data.highestMonthTotalAmount)})
              </span>
            )}
          </li>
        </ul>
      )}
    </DashboardWidget>
  );
}
