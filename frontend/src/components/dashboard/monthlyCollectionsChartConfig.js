import { formatCurrency, formatPaymentType } from "@/utils/dashboardFormatters";
import { buildChartFontSize } from "@/utils/chartResponsive";

const PAYMENT_TYPE_SERIES = [
  { type: "CASH", color: "#16a34a" },
  { type: "BANK_TRANSFER", color: "#2563eb" },
  { type: "CHECK", color: "#d97706" },
  { type: "PROMISSORY_NOTE", color: "#7c3aed" },
  { type: "MAIL_ORDER", color: "#0d9488" },
  { type: "POS_YKB", color: "#4f46e5" },
  { type: "POS_TEB", color: "#e11d48" },
];

function themeColor(variable, fallback) {
  if (typeof document === "undefined") {
    return fallback;
  }

  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim();

  return value || fallback;
}

function formatCompactNumber(value) {
  return new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatCompactAmount(value) {
  const amount = Number(value ?? 0);

  if (!Number.isFinite(amount)) {
    return "0";
  }

  const sign = amount < 0 ? "-" : "";
  const abs = Math.abs(amount);

  if (abs >= 1_000_000) {
    return `${sign}${formatCompactNumber(abs / 1_000_000)} mn`;
  }

  if (abs >= 1_000) {
    return `${sign}${formatCompactNumber(abs / 1_000)} bin`;
  }

  return new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits: 0,
  }).format(amount);
}

function amountFor(month, type) {
  const match = (month?.paymentTypes || []).find(
    (item) => item.paymentType === type
  );

  return Number(match?.amount ?? 0);
}

function visibleSeries(months) {
  return PAYMENT_TYPE_SERIES.filter((series) =>
    months.some((month) => amountFor(month, series.type) > 0)
  );
}

function stackTopRadius(context) {
  const chart = context?.chart;
  const datasetIndex = context?.datasetIndex;
  const dataIndex = context?.dataIndex;

  if (!chart || datasetIndex == null || dataIndex == null) {
    return 0;
  }

  const datasets = chart.data.datasets || [];
  const value = Number(datasets[datasetIndex]?.data?.[dataIndex] ?? 0);

  if (value <= 0) {
    return 0;
  }

  const hasSegmentAbove = datasets
    .slice(datasetIndex + 1)
    .some((dataset) => Number(dataset.data?.[dataIndex] ?? 0) > 0);

  if (hasSegmentAbove) {
    return 0;
  }

  return { topLeft: 6, topRight: 6, bottomLeft: 0, bottomRight: 0 };
}

function tooltipRow(label, value, className = "") {
  const row = document.createElement("div");
  row.className = `monthly-chart-tooltip__row ${className}`.trim();

  const labelEl = document.createElement("span");
  labelEl.className = "monthly-chart-tooltip__label";
  labelEl.textContent = label;

  const valueEl = document.createElement("span");
  valueEl.className = "monthly-chart-tooltip__value";
  valueEl.textContent = value;

  row.append(labelEl, valueEl);
  return row;
}

function tooltipTypeRow(series, amount) {
  const row = document.createElement("div");
  row.className = "monthly-chart-tooltip__row";

  const labelEl = document.createElement("span");
  labelEl.className = "monthly-chart-tooltip__label";

  const swatch = document.createElement("span");
  swatch.className = "monthly-chart-tooltip__swatch";
  swatch.style.background = series.color;

  const name = document.createElement("span");
  name.textContent = formatPaymentType(series.type);

  labelEl.append(swatch, name);

  const valueEl = document.createElement("span");
  valueEl.className = "monthly-chart-tooltip__value";
  valueEl.textContent = formatCurrency(amount);

  row.append(labelEl, valueEl);
  return row;
}

function fillTooltip(element, month, series) {
  element.replaceChildren();

  const title = document.createElement("div");
  title.className = "monthly-chart-tooltip__title";
  title.textContent = month.monthName || "";
  element.append(title);

  element.append(
    tooltipRow("Ödendi", formatCurrency(month.paidAmount)),
    tooltipRow("Ödenmedi", formatCurrency(month.unpaidAmount)),
    tooltipRow(
      "Toplam ciro",
      formatCurrency(month.totalAmount),
      "monthly-chart-tooltip__row--total"
    )
  );

  const types = series
    .map((item) => ({ ...item, amount: amountFor(month, item.type) }))
    .filter((item) => item.amount > 0);

  if (types.length === 0) {
    return;
  }

  const divider = document.createElement("div");
  divider.className = "monthly-chart-tooltip__divider";
  element.append(divider);
  types.forEach((item) => {
    element.append(tooltipTypeRow(item, item.amount));
  });
}

function placeTooltip(element, chart, tooltip) {
  const parent = chart.canvas.closest(".dashboard-chart") || chart.canvas.parentNode;
  const parentRect = parent.getBoundingClientRect();
  const canvasRect = chart.canvas.getBoundingClientRect();
  const tipWidth = element.offsetWidth;
  const tipHeight = element.offsetHeight;
  const originX = canvasRect.left - parentRect.left;
  const originY = canvasRect.top - parentRect.top;
  let left = originX + tooltip.caretX - tipWidth / 2;
  let top = originY + tooltip.caretY - tipHeight - 12;
  const maxLeft = parent.clientWidth - tipWidth - 8;

  if (left < 8) {
    left = 8;
  }

  if (left > maxLeft) {
    left = Math.max(8, maxLeft);
  }

  if (top < 8) {
    top = originY + tooltip.caretY + 14;
  }

  element.style.left = `${left}px`;
  element.style.top = `${top}px`;
}

function externalTooltip(context, months, series) {
  const { chart, tooltip } = context;
  const parent = chart.canvas.closest(".dashboard-chart") || chart.canvas.parentNode;
  const element = parent?.querySelector(".monthly-chart-tooltip");

  if (!element) {
    return;
  }

  const index = tooltip.dataPoints?.[0]?.dataIndex;
  const month = months[index];

  if (tooltip.opacity === 0 || !month) {
    element.style.opacity = "0";
    return;
  }

  fillTooltip(element, month, series);
  element.style.opacity = "1";
  placeTooltip(element, chart, tooltip);
}

export const monthlyTotalLabelPlugin = {
  id: "monthlyTotalLabels",
  afterDatasetsDraw(chart) {
    const totals = chart.options.plugins?.monthlyTotalLabels?.totals || [];
    const { ctx, chartArea } = chart;

    if (!chartArea || !chart.data.datasets?.length) {
      return;
    }

    ctx.save();
    ctx.font = "600 11px Inter, Segoe UI, sans-serif";
    ctx.fillStyle = themeColor("--color-muted", "#64748b");
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";

    const slotWidth = chartArea.width / Math.max(totals.length, 1);

    totals.forEach((total, index) => {
      const amount = Number(total ?? 0);

      if (amount <= 0) {
        return;
      }

      const text = formatCompactAmount(amount);

      if (ctx.measureText(text).width > slotWidth - 6) {
        return;
      }

      let top = null;
      let x = null;

      chart.data.datasets.forEach((dataset, datasetIndex) => {
        if (Number(dataset.data?.[index] ?? 0) <= 0) {
          return;
        }

        const bar = chart.getDatasetMeta(datasetIndex).data[index];

        if (!bar) {
          return;
        }

        if (top == null || bar.y < top) {
          top = bar.y;
          x = bar.x;
        }
      });

      if (top == null || x == null) {
        return;
      }

      ctx.fillText(text, x, top - 4);
    });

    ctx.restore();
  },
};

export function buildMonthlyCollectionsChartData(data) {
  const months = data?.months || [];
  const series = visibleSeries(months);

  return {
    labels: months.map((item) => item.monthName),
    datasets: series.map((item) => ({
      label: formatPaymentType(item.type),
      data: months.map((month) => amountFor(month, item.type)),
      backgroundColor: item.color,
      borderWidth: 0,
      stack: "ciro",
      borderRadius: stackTopRadius,
      borderSkipped: false,
    })),
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
  const months = data?.months || [];
  const series = visibleSeries(months);
  const fontSize = buildChartFontSize(isMobile);
  const tickColor = () => themeColor("--color-muted", "#64748b");

  return {
    maintainAspectRatio: false,
    layout: {
      padding: { top: 18 },
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
    onHover(event, elements) {
      const canvas = event.native?.target;

      if (canvas) {
        canvas.style.cursor = elements?.length ? "pointer" : "default";
      }
    },
    onClick: (_event, elements) => {
      if (!elements?.length || !months.length) {
        return;
      }

      const monthItem = months[elements[0].index];

      if (monthItem) {
        if (year == null) {
          setYear(chartYear);
        }

        setMonth(monthItem.month);
      }
    },
    plugins: {
      legend: {
        display: series.length > 0,
        position: "bottom",
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          borderRadius: 2,
          useBorderRadius: true,
          padding: isMobile ? 10 : 14,
          font: { size: fontSize },
          color: tickColor,
        },
      },
      tooltip: {
        enabled: false,
        external: (context) => externalTooltip(context, months, series),
      },
      monthlyTotalLabels: {
        totals: months.map((month) => Number(month.totalAmount ?? 0)),
      },
    },
    datasets: {
      bar: {
        categoryPercentage: 0.72,
        barPercentage: 0.9,
        maxBarThickness: 42,
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        border: { display: false },
        ticks: {
          font: { size: fontSize },
          color: tickColor,
          maxRotation: isMobile ? 45 : 0,
          minRotation: isMobile ? 45 : 0,
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grace: "14%",
        grid: {
          color: "rgba(148, 163, 184, 0.28)",
          drawTicks: false,
        },
        border: { display: false },
        ticks: {
          font: { size: fontSize },
          color: tickColor,
          maxTicksLimit: 5,
          callback(value) {
            return formatCompactAmount(value);
          },
        },
      },
    },
  };
}
