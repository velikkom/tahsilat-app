"use client";

import { useMemo, useState } from "react";
import useDashboardYear from "@/context/DashboardYearContext";
import { usePaymentTypeDistribution } from "@/hooks/useDashboardMetrics";
import {
  formatCurrency,
  formatPaymentType,
} from "@/utils/dashboardFormatters";
import DashboardWidget from "./DashboardWidget";
import PaymentTypeCustomersModal from "./PaymentTypeCustomersModal";

export default function DashboardPaymentTypes() {
  const { year } = useDashboardYear();
  const { data, loading, error, refresh } = usePaymentTypeDistribution(year);
  const [selectedPaymentType, setSelectedPaymentType] = useState(null);

  const items = useMemo(() => {
    return [...(data?.items || [])].sort(
      (a, b) => Number(b.totalAmount ?? 0) - Number(a.totalAmount ?? 0)
    );
  }, [data]);

  const maxAmount = Number(items[0]?.totalAmount ?? 0);

  return (
    <>
      <DashboardWidget
        title="Ödeme türü"
        loading={loading}
        error={error}
        onRetry={refresh}
      >
        {items.length === 0 ? (
          <p className="text-muted mb-0">Henüz tahsilat kaydı yok.</p>
        ) : (
          <div className="dashboard-list">
            {items.map((item) => {
              const amount = Number(item.totalAmount ?? 0);
              const width = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;

              return (
                <button
                  type="button"
                  key={item.paymentType}
                  className="dashboard-list__row dashboard-list__row--button"
                  onClick={() => setSelectedPaymentType(item.paymentType)}
                >
                  <div className="min-width-0 flex-grow-1">
                    <div className="d-flex justify-content-between gap-2">
                      <span className="fw-semibold text-truncate">
                        {formatPaymentType(item.paymentType)}
                      </span>
                      <span className="fw-bold text-nowrap">
                        {formatCurrency(amount)}
                      </span>
                    </div>
                    <div className="dashboard-bar mt-2" aria-hidden="true">
                      <span style={{ width: `${width}%` }} />
                    </div>
                    <div className="small text-muted mt-1">
                      {item.percentage ?? 0}% · {item.count ?? 0} işlem
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </DashboardWidget>

      <PaymentTypeCustomersModal
        show={Boolean(selectedPaymentType)}
        onHide={() => setSelectedPaymentType(null)}
        paymentType={selectedPaymentType}
        year={year}
      />
    </>
  );
}
