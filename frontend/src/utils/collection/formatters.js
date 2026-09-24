const TRY_FORMATTER = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 2,
});

const DATE_FORMATTER = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const DATETIME_FORMATTER = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const MONTH_FORMATTER = new Intl.DateTimeFormat("tr-TR", {
  month: "long",
  year: "numeric",
});

export function formatCurrency(value) {
  if (value == null) {
    return "-";
  }
  return TRY_FORMATTER.format(value);
}

export function formatDate(value) {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : DATE_FORMATTER.format(date);
}

export function formatDateTime(value) {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : DATETIME_FORMATTER.format(date);
}

export function formatMonthYear(value) {
  if (!value) {
    return "Tarihsiz";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Tarihsiz";
  }
  const label = MONTH_FORMATTER.format(date);
  return label.charAt(0).toLocaleUpperCase("tr-TR") + label.slice(1);
}
