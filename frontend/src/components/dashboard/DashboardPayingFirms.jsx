"use client";

import useDashboardYear, {
  DASHBOARD_MONTH_OPTIONS,
} from "@/context/DashboardYearContext";
import { usePayingCustomerCount } from "@/hooks/useDashboardMetrics";

const MONTH_SHORT = [
  "Oca", "Şub", "Mar", "Nis", "May", "Haz",
  "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara",
];

function monthName(month) {
  return DASHBOARD_MONTH_OPTIONS.find((option) => option.value === month)
    ?.label;
}

function lastVisibleMonth(year) {
  const now = new Date();

  if (year < now.getFullYear()) {
    return 12;
  }

  return year === now.getFullYear() ? now.getMonth() + 1 : 0;
}

function summaryFor(data, year, month) {
  if (year == null) {
    return {
      value: data.count,
      period: "Tüm yıllar",
      detail: null,
    };
  }

  const item = month != null ? data.months?.[month - 1] : null;

  if (!item) {
    return {
      value: data.count,
      period: `${year} yılı`,
      detail: null,
    };
  }

  const name = monthName(month);
  const range = month === 1 ? `Ocak ${year}` : `Ocak–${name} ${year}`;
  const parts = [`${name}: ${item.count} firma ödedi`];

  if (item.newCount > 0) {
    parts.push(`${item.newCount} yeni firma`);
  }

  return {
    value: item.cumulativeCount,
    period: range,
    detail: parts.join(" · "),
  };
}

export default function DashboardPayingFirms() {
  const { year, month, setMonth } = useDashboardYear();
  const { data, loading, error } = usePayingCustomerCount(year);

  if (loading && !data) {
    return (
      <div className="dashboard-paying-firms">
        <div className="dashboard-paying-firms__value">…</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="dashboard-paying-firms">
        <div className="dashboard-paying-firms__value">—</div>
        <div className="text-muted small">Firma sayısı alınamadı</div>
      </div>
    );
  }

  const summary = summaryFor(data, year, month);
  const lastMonth = year != null ? lastVisibleMonth(year) : 0;
  const months = (data.months || []).filter((item) => item.month <= lastMonth);

  return (
    <div className="dashboard-paying-firms-panel">
      <div className="dashboard-paying-firms">
        <div className="dashboard-paying-firms__value">{summary.value}</div>
        <div>
          <div className="dashboard-paying-firms__label">
            firma ile çalışıldı
          </div>
          <div className="text-muted small">{summary.period}</div>
          {summary.detail && (
            <div className="text-muted small">{summary.detail}</div>
          )}
        </div>
      </div>

      {months.length > 0 && (
        <div
          className="dashboard-paying-firms__months"
          aria-label="Aylara göre çalışılan firma sayısı"
        >
          {months.map((item) => (
            <button
              key={item.month}
              type="button"
              className={`dashboard-paying-firms__month${
                item.month === month ? " is-active" : ""
              }`}
              onClick={() => setMonth(item.month)}
              title={`${monthName(item.month)}: ${item.count} firma ödedi, ocaktan beri ${item.cumulativeCount} firma`}
            >
              <span className="dashboard-paying-firms__month-name">
                {MONTH_SHORT[item.month - 1]}
              </span>
              <span className="dashboard-paying-firms__month-value">
                {item.cumulativeCount}
              </span>
              <span className="dashboard-paying-firms__month-new">
                {item.newCount > 0 ? `+${item.newCount}` : "\u00a0"}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
