"use client";

import useDashboardYear, {
  DASHBOARD_MONTH_OPTIONS,
} from "@/context/DashboardYearContext";
import { usePayingCustomerCount } from "@/hooks/useDashboardMetrics";

function periodLabel(year, month) {
  const monthName = DASHBOARD_MONTH_OPTIONS.find(
    (option) => option.value === month
  )?.label;

  if (month != null && year != null) {
    return `${monthName} ${year}`;
  }

  if (year != null) {
    return `${year} yılı`;
  }

  return "Tüm yıllar";
}

export default function DashboardPayingFirms() {
  const { year, month } = useDashboardYear();
  const { data, loading, error } = usePayingCustomerCount(year, month);
  const count = Number(data?.count ?? 0);
  const paidCount = Number(data?.paidCount ?? 0);
  const ready = !loading && !error;

  return (
    <div className="dashboard-paying-firms">
      <div className="dashboard-paying-firms__value">
        {loading ? "…" : error ? "—" : count}
      </div>
      <div>
        <div className="dashboard-paying-firms__label">aktif firma</div>
        <div className="text-muted small">
          {periodLabel(year, month)}
          {ready && ` · ${paidCount} firma ödedi`}
        </div>
      </div>
    </div>
  );
}
