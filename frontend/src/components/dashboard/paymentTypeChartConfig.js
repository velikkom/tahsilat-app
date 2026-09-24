import { formatPaymentType } from "@/utils/dashboardFormatters";
import { buildLegendOptions } from "@/utils/chartResponsive";

const CHART_COLORS = [
  "#0d6efd",
  "#ffc107",
  "#198754",
  "#0dcaf0",
  "#6f42c1",
];

export function buildPaymentTypeChartData(data) {
  const items = data?.items || [];

  return {
    labels: items.map((item) => formatPaymentType(item.paymentType)),
    datasets: [
      {
        data: items.map((item) => Number(item.totalAmount ?? 0)),
        backgroundColor: CHART_COLORS.slice(0, items.length),
      },
    ],
  };
}

export function buildPaymentTypeChartOptions(data, isMobile, setSelectedPaymentType) {
  return {
    maintainAspectRatio: false,
    onClick: (_event, elements) => {
      if (!elements?.length || !data?.items?.length) {
        return;
      }

      const item = data.items[elements[0].index];

      if (item?.paymentType) {
        setSelectedPaymentType(item.paymentType);
      }
    },
    plugins: {
      legend: buildLegendOptions(isMobile),
      tooltip: {
        callbacks: {
          label(context) {
            const item = data?.items?.[context.dataIndex];
            const amount = new Intl.NumberFormat("tr-TR", {
              style: "currency",
              currency: "TRY",
            }).format(context.raw ?? 0);

            return `${amount} (${item?.percentage ?? 0}%)`;
          },
        },
      },
    },
  };
}
