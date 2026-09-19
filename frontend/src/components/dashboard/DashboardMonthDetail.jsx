"use client";

import { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import useDashboardYear, {
  DASHBOARD_MONTH_OPTIONS,
} from "@/context/DashboardYearContext";
import { getMonthPaymentBreakdown } from "@/services/dashboardService";
import {
  formatCurrency,
  formatPaymentType,
} from "@/utils/dashboardFormatters";
import DashboardWidget from "./DashboardWidget";

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

  const items = data?.items || [];
  const mailOrderCompanies = data?.mailOrderCompanies || [];

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

          <div className="col-12 col-lg-6">
            <h3 className="h6 fw-bold">Ödeme türleri</h3>
            <div className="dashboard-list">
              {items.map((item) => (
                <div key={item.paymentType} className="dashboard-list__row">
                  <span>{formatPaymentType(item.paymentType)}</span>
                  <span className="fw-semibold">
                    {formatCurrency(item.totalAmount)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <h3 className="h6 fw-bold">Mailorder firmaları</h3>
            {mailOrderCompanies.length === 0 ? (
              <p className="text-muted mb-0">Bu ay mailorder kaydı yok.</p>
            ) : (
              <div className="dashboard-list">
                {mailOrderCompanies.map((company) => (
                  <div
                    key={company.companyName}
                    className="dashboard-list__row"
                  >
                    <span>
                      {company.companyName}
                      <span className="text-muted small ms-2">
                        {company.count} işlem
                      </span>
                    </span>
                    <span className="fw-semibold">
                      {formatCurrency(company.totalAmount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardWidget>
  );
}
