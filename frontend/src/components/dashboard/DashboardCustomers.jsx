"use client";

import Link from "next/link";
import { useTopCustomers } from "@/hooks/useDashboardMetrics";
import useDashboardYear from "@/context/DashboardYearContext";
import { formatCurrency } from "@/utils/dashboardFormatters";
import DashboardWidget from "./DashboardWidget";

export default function DashboardCustomers() {
  const { year } = useDashboardYear();
  const { data, loading, error, refresh } = useTopCustomers(10, year);
  const customers = data?.customers || [];

  return (
    <DashboardWidget
      title="Müşteri bazlı"
      loading={loading}
      error={error}
      onRetry={refresh}
    >
      {customers.length === 0 ? (
        <p className="text-muted mb-0">Henüz tahsilat kaydı yok.</p>
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
