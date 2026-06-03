"use client";

import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import {
  formatCurrency,
  formatNumber,
  formatPaymentType,
} from "@/utils/dashboardFormatters";
import DashboardWidget from "./DashboardWidget";
import MetricCard from "./MetricCard";

export default function DashboardMetrics() {
  const { data, loading, error, refresh } = useDashboardMetrics();

  if (loading || error) {
    return (
      <div className="col-12">
        <DashboardWidget
          title="Özet Metrikler"
          loading={loading}
          error={error}
          onRetry={refresh}
        />
      </div>
    );
  }

  const metrics = [
    {
      title: "Toplam Tahsilat",
      value: formatCurrency(data?.totalCollectionsAmount),
    },
    {
      title: "Bu Ay Tahsilat",
      value: formatCurrency(data?.currentMonthCollectionsAmount),
    },
    {
      title: "Bu Yıl Tahsilat",
      value: formatCurrency(data?.currentYearCollectionsAmount),
    },
    {
      title: "Toplam Müşteri",
      value: formatNumber(data?.totalActiveCustomers),
    },
    {
      title: "En Çok Tahsilat Yapılan Firma",
      value: data?.topCustomerCompanyName || "-",
      subtitle: data?.topCustomerTotalAmount
        ? formatCurrency(data.topCustomerTotalAmount)
        : "Henüz tahsilat yok",
    },
    {
      title: "En Çok Kullanılan Ödeme Türü",
      value: formatPaymentType(data?.mostUsedPaymentType),
      subtitle: data?.mostUsedPaymentTypeCount
        ? `${formatNumber(data.mostUsedPaymentTypeCount)} işlem`
        : "Henüz tahsilat yok",
    },
  ];

  return metrics.map((metric) => (
    <MetricCard
      key={metric.title}
      title={metric.title}
      value={metric.value}
      subtitle={metric.subtitle}
    />
  ));
}
