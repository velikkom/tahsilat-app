import { buildBarChartScaleOptions } from "@/utils/chartResponsive";

export function buildMonthlyCollectionsChartData(data) {
  const months = data?.months || [];

  return {
    labels: months.map((item) => item.monthName),
    datasets: [
      {
        label: "Ödendi",
        data: months.map((item) => Number(item.paidAmount ?? item.totalAmount ?? 0)),
        backgroundColor: "rgba(22, 163, 74, 0.75)",
        borderColor: "rgb(22, 163, 74)",
        borderWidth: 1,
        borderRadius: 4,
        stack: "collections",
      },
      {
        label: "Ödenmedi",
        data: months.map((item) => Number(item.unpaidAmount ?? 0)),
        backgroundColor: "rgba(217, 119, 6, 0.75)",
        borderColor: "rgb(217, 119, 6)",
        borderWidth: 1,
        borderRadius: 4,
        stack: "collections",
      },
    ],
  };
}

export function buildMonthlyCollectionsChartOptions({
  isMobile,
  data,
  year,
  chartYear,
  setYear,
  setMonth,
}) {
  const scales = buildBarChartScaleOptions(isMobile);

  return {
    maintainAspectRatio: false,
    onClick: (_event, elements) => {
      if (!elements?.length || !data?.months?.length) {
        return;
      }

      const monthItem = data.months[elements[0].index];

      if (monthItem) {
        if (year == null) {
          setYear(chartYear);
        }

        setMonth(monthItem.month);
      }
    },
    plugins: {
      legend: { display: true, position: "bottom" },
      tooltip: {
        callbacks: {
          label(context) {
            return `${context.dataset.label}: ${new Intl.NumberFormat("tr-TR", {
              style: "currency",
              currency: "TRY",
            }).format(context.raw ?? 0)}`;
          },
        },
      },
    },
    scales: {
      ...scales,
      x: { ...scales.x, stacked: true },
      y: { ...scales.y, stacked: true },
    },
  };
}
