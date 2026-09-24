"use client";

import { Spinner } from "react-bootstrap";
import useDashboardYear, {
  DASHBOARD_MONTH_OPTIONS,
} from "@/context/DashboardYearContext";
import DashboardWidget from "./DashboardWidget";
import PaymentTypeAccordion from "./PaymentTypeAccordion";
import DashboardMonthCustomers from "./DashboardMonthCustomers";
import DashboardMonthTotals from "./DashboardMonthTotals";
import useDashboardMonthDetail from "./useDashboardMonthDetail";

export default function DashboardMonthDetail() {
  const { month, chartYear } = useDashboardYear();
  const { data, error, loading } = useDashboardMonthDetail(chartYear, month);

  if (month == null) {
    return null;
  }

  const monthName =
    DASHBOARD_MONTH_OPTIONS.find((option) => option.value === month)?.label ||
    "";

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
          <DashboardMonthTotals data={data} />

          <div className="col-12">
            <h3 className="h6 fw-bold">Ödeme türleri</h3>
            <PaymentTypeAccordion data={data} />
          </div>

          <DashboardMonthCustomers
            customers={data?.customers || []}
            monthName={monthName}
            chartYear={chartYear}
          />
        </div>
      )}
    </DashboardWidget>
  );
}
