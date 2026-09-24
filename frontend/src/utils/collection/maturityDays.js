import { hasMaturityTracking } from "./maturity";

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function getMaturityDays(collection) {
  if (!hasMaturityTracking(collection)) {
    return null;
  }

  const maturity = new Date(collection.maturityDate);
  if (Number.isNaN(maturity.getTime())) {
    return null;
  }

  const diffMs =
    new Date(
      maturity.getFullYear(),
      maturity.getMonth(),
      maturity.getDate()
    ).getTime() - startOfToday().getTime();

  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function formatMaturityDays(collection) {
  const days = getMaturityDays(collection);

  if (days == null) {
    return { text: "*", tone: "muted" };
  }

  if (days >= 0) {
    return { text: `+${days} Gün`, tone: days <= 7 ? "warning" : "success" };
  }

  return { text: `${days} Gün`, tone: "danger" };
}
