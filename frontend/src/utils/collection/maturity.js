import { formatDate } from "./formatters";

export const MATURITY_PAYMENT_TYPES = ["CHECK", "PROMISSORY_NOTE"];

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function parseLocalIsoDate(value) {
  if (!value) {
    return null;
  }

  const [year, month, day] = String(value).slice(0, 10).split("-").map(Number);

  if (!year || !month || !day) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  return new Date(year, month - 1, day);
}

export function isMaturityDue(collection) {
  const maturity = parseLocalIsoDate(collection?.maturityDate);
  return Boolean(maturity && maturity.getTime() <= startOfToday().getTime());
}

export function hasMaturityTracking(collection) {
  return (
    MATURITY_PAYMENT_TYPES.includes(collection?.paymentType) &&
    Boolean(collection?.maturityDate)
  );
}

export function getEffectiveStatus(collection) {
  if (!collection) {
    return "PENDING";
  }

  if (
    collection.status === "PENDING" &&
    collection.maturityDate &&
    new Date(collection.maturityDate) < startOfToday()
  ) {
    return "OVERDUE";
  }

  return collection.status || "PENDING";
}

export function showsMarkAsPaidAction(collection) {
  if (!hasMaturityTracking(collection)) {
    return false;
  }

  const status = getEffectiveStatus(collection);
  return status === "PENDING" || status === "OVERDUE";
}

export function canMarkCollectionAsPaid(collection) {
  return showsMarkAsPaidAction(collection) && isMaturityDue(collection);
}

export function getMarkAsPaidButtonTitle(collection) {
  if (canMarkCollectionAsPaid(collection)) {
    return "Tahsil Edildi olarak işaretle";
  }

  return `Vade tarihinde aktif olur (${formatDate(collection?.maturityDate)})`;
}
