"use client";

import { useMemo, useState } from "react";
import { Chart } from "primereact/chart";
import useBreakpoint from "@/hooks/useBreakpoint";
import useDashboardYear from "@/context/DashboardYearContext";
import { usePaymentTypeDistribution } from "@/hooks/useDashboardMetrics";
import DashboardWidget from "./DashboardWidget";
import PaymentTypeCustomersModal from "./PaymentTypeCustomersModal";
import {
  buildPaymentTypeChartData,
  buildPaymentTypeChartOptions,
} from "./paymentTypeChartConfig";

export default function PaymentTypeChart() {
  const { isMobile } = useBreakpoint();
  const { year } = useDashboardYear();
  const { data, loading, error, refresh } = usePaymentTypeDistribution(year);
  const [selectedPaymentType, setSelectedPaymentType] = useState(null);

  const chartData = useMemo(() => buildPaymentTypeChartData(data), [data]);
  const chartOptions = useMemo(
    () => buildPaymentTypeChartOptions(data, isMobile, setSelectedPaymentType),
    [data, isMobile]
  );

  return (
    <>
      <DashboardWidget
        title="Ödeme Türü Dağılımı"
        loading={loading}
        error={error}
        onRetry={refresh}
      >
        <div className="dashboard-chart">
          <Chart type="pie" data={chartData} options={chartOptions} />
        </div>
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
