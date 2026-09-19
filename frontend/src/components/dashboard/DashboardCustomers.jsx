"use client";

import Link from "next/link";
import { useTopCustomers } from "@/hooks/useDashboardMetrics";
import useDashboardYear, {
  DASHBOARD_MONTH_OPTIONS,
} from "@/context/DashboardYearContext";
import { formatCurrency } from "@/utils/dashboardFormatters";
import DashboardWidget from "./DashboardWidget";

function periodLabel(year, month) {
  const monthName = DASHBOARD_MONTH_OPTIONS.find(
    (option) => option.value === month
  )?.label;

  if (year == null && month == null) {
    return "Tüm dönem toplamı";
  }

  if (year != null && month == null) {
    return `${year} toplamı`;
  }

  if (year == null && month != null) {
    return `${monthName} toplamı`;
  }

  return `${monthName} ${year}`;
}

export default function DashboardCustomers() {
  const { year, month, chartYear } = useDashboardYear();
  const effectiveYear = month != null ? year ?? chartYear : year;
  const { data, loading, error, refresh } = useTopCustomers(
    20,
    effectiveYear,
    month
  );
  const customers = data?.customers || [];
  const label = periodLabel(effectiveYear, month);

  return (
    <DashboardWidget
      title="Müşteri bazlı"
      loading={loading}
      error={error}
      onRetry={refresh}
    >
      <p className="text-muted small mb-3">{label}</p>

      {customers.length === 0 ? (
        <p className="text-muted mb-0">Bu dönemde tahsilat yok.</p>
      ) : (
        <div className="dashboard-list">
          {customers.map((customer) => (
            <Link
              key={customer.customerId}
              href={`/customers/${customer.customerId}`}
              className="dashboard-list__row text-decoration-none text-reset"
            >
              <div className="min-width-0">
                <div className="fw-semibold text-truncate">
                  {customer.companyName}
                </div>
                <div className="small text-muted">
                  Ödendi {formatCurrency(customer.paidAmount)} · Ödenmedi{" "}
                  {formatCurrency(customer.unpaidAmount)}
                </div>
              </div>
              <div className="fw-bold text-nowrap ps-3">
                {formatCurrency(customer.totalAmount)}
              </div>
            </Link>
          ))}

          <Link href="/customers" className="dashboard-list__more">
            Tüm müşteriler
          </Link>
        </div>
      )}
    </DashboardWidget>
  );
}
