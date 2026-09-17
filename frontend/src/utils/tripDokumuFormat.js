const AMOUNT_FORMATTER = new Intl.NumberFormat("tr-TR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const DATE_FORMATTER = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export const ON_DAY_CAPACITY = 6;
export const ARKA_ROW_CAPACITY = 30;

export function parseLocalDate(value) {
  if (!value) {
    return null;
  }

  const [year, month, day] = String(value).slice(0, 10).split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

export function formatIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDaysIso(iso, days) {
  const date = parseLocalDate(iso);

  if (!date) {
    return "";
  }

  date.setDate(date.getDate() + days);
  return formatIsoDate(date);
}

export function formatFormDate(value) {
  const date = value instanceof Date ? value : parseLocalDate(value);
  return date ? DATE_FORMATTER.format(date) : "";
}

export function formatFormAmount(value, { zero = false } = {}) {
  if (value == null || value === "") {
    return "";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return "";
  }

  if (!zero && number === 0) {
    return "";
  }

  return AMOUNT_FORMATTER.format(number);
}

export function toNumber(value) {
  const number = Number(value);
  return Number.isNaN(number) ? 0 : number;
}

export function tripDayCount(startDate, endDate) {
  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);

  if (!start || !end || end < start) {
    return 1;
  }

  return Math.round((end - start) / 86400000) + 1;
}

export function dayTotal(expense) {
  if (!expense) {
    return 0;
  }

  return (
    toNumber(expense.mealAmount) +
    toNumber(expense.hotelAmount) +
    toNumber(expense.fuelInvoiceAmount) +
    toNumber(expense.otherAmount)
  );
}
