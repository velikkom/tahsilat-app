export function buildChartFontSize(isMobile) {
  return isMobile ? 10 : 12;
}

export function buildBarChartScaleOptions(isMobile) {
  const fontSize = buildChartFontSize(isMobile);

  return {
    x: {
      ticks: {
        font: { size: fontSize },
        maxRotation: isMobile ? 45 : 0,
        minRotation: isMobile ? 45 : 0,
      },
    },
    y: {
      beginAtZero: true,
      ticks: {
        font: { size: fontSize },
        callback(value) {
          return new Intl.NumberFormat("tr-TR", {
            notation: "compact",
            compactDisplay: "short",
          }).format(value);
        },
      },
    },
  };
}

export function buildHorizontalBarScaleOptions(isMobile) {
  const fontSize = buildChartFontSize(isMobile);

  return {
    x: {
      beginAtZero: true,
      ticks: {
        font: { size: fontSize },
        callback(value) {
          return new Intl.NumberFormat("tr-TR", {
            notation: "compact",
            compactDisplay: "short",
          }).format(value);
        },
      },
    },
    y: {
      ticks: {
        font: { size: fontSize },
        autoSkip: false,
      },
    },
  };
}

export function buildLegendOptions(isMobile, position = "bottom") {
  return {
    position,
    labels: {
      font: { size: buildChartFontSize(isMobile) },
      boxWidth: isMobile ? 10 : 12,
    },
  };
}
