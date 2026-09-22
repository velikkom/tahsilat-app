"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Spinner } from "react-bootstrap";
import useDashboardYear, {
  DASHBOARD_MONTH_OPTIONS,
} from "@/context/DashboardYearContext";
import { getMonthPaymentBreakdown } from "@/services/dashboardService";
import { formatCurrency } from "@/utils/dashboardFormatters";
import DashboardWidget from "./DashboardWidget";
import PaymentTypeAccordion from "./PaymentTypeAccordion";

export default function DashboardMonthDetail() {
  const { month, chartYear } = useDashboardYear();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (month == null) {
      return;
    }

    let cancelled = false;

    getMonthPaymentBreakdown(chartYear, month)
      .then((result) => {
        if (cancelled) {
          return;
        }

        setData(result);
        setError("");
      })
      .catch((err) => {
        if (cancelled) {
          return;
        }

        setError(err.message || "Ay detayı alınamadı");
        setData(null);
      });

    return () => {
      cancelled = true;
    };
  }, [chartYear, month]);

  if (month == null) {
    return null;
  }

  const loading = !error && (!data || data.year !== chartYear || data.month !== month);
  const monthName =
    DASHBOARD_MONTH_OPTIONS.find((option) => option.value === month)?.label ||
    "";

  const customers = data?.customers || [];

  return (
    <DashboardWidget title={`${monthName} ${chartYear} detayı`}>

      {loading && (
        <div className="d-flex justify-content-center py-4">
          <Spinner animation="border" size="sm" />
        </div>
      )}

      {error && <div className="alert alert-danger mb-0">{error}</div>}

      {!loading && !error && data && (
        <div className="row g-4">
          <div className="col-12 col-md-4">
            <div className="small text-muted text-uppercase fw-semibold">
              Ödendi
            </div>
            <div className="fw-bold">{formatCurrency(data.paidAmount)}</div>
          </div>
          <div className="col-12 col-md-4">
            <div className="small text-muted text-uppercase fw-semibold">
              Ödenmedi
            </div>
            <div className="fw-bold">{formatCurrency(data.unpaidAmount)}</div>
          </div>
          <div className="col-12 col-md-4">
            <div className="small text-muted text-uppercase fw-semibold">
              Toplam
            </div>
            <div className="fw-bold">{formatCurrency(data.totalAmount)}</div>
          </div>

          <div className="col-12">
            <h3 className="h6 fw-bold">Ödeme türleri</h3>
            <PaymentTypeAccordion data={data} />
          </div>

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
        </div>
      )}
    </DashboardWidget>
  );
}
