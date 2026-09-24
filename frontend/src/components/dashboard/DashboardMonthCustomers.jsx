"use client";

import Link from "next/link";
import { formatCurrency } from "@/utils/dashboardFormatters";

export default function DashboardMonthCustomers({
  customers,
  monthName,
  chartYear,
}) {
  return (
    <div className="col-12">
      <h3 className="h6 fw-bold">Müşteri bazlı</h3>
      <p className="text-muted small mb-3">
        {monthName} {chartYear} ödemeleri
      </p>
      {customers.length === 0 ? (
        <p className="text-muted mb-0">Bu ay tahsilat yok.</p>
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
        </div>
      )}
    </div>
  );
}
