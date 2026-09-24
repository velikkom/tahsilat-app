export function quickFilterFromSearchParams(searchParams) {
  if (!searchParams) {
    return "ALL";
  }

  if (searchParams.get("due") === "1") {
    return "DUE_MATURITY";
  }

  const aging = searchParams.get("aging");

  if (aging === "overdue") {
    return "OVERDUE";
  }

  if (aging === "today") {
    return "TODAY_MATURITY";
  }

  if (aging === "soon") {
    return "SOON_MATURITY";
  }

  return "ALL";
}

export const EMPTY_COLLECTION_FILTERS = {
  searchQuery: "",
  paymentType: "ALL",
  status: "ALL",
  quickFilter: "ALL",
};

export const PAYMENT_TYPE_FILTER_OPTIONS = [
  { value: "ALL", label: "Tümü" },
  { value: "CASH", label: "Nakit" },
  { value: "CHECK", label: "Çek" },
  { value: "PROMISSORY_NOTE", label: "Müşteri Senedi" },
  { value: "BANK_TRANSFER", label: "Havale" },
  { value: "MAIL_ORDER", label: "Mailorder" },
  { value: "POS_YKB", label: "POS YKB" },
  { value: "POS_TEB", label: "POS TEB" },
];

export const STATUS_FILTER_OPTIONS = [
  { value: "ALL", label: "Tümü" },
  { value: "PAID", label: "Tahsil Edildi" },
  { value: "PENDING", label: "Bekliyor" },
  { value: "OVERDUE", label: "Vadesi Geçti" },
];

export const QUICK_FILTER_OPTIONS = [
  { value: "ALL", label: "Tümü" },
  { value: "THIS_MONTH", label: "Bu Ay" },
  { value: "PENDING", label: "Bekleyen" },
  { value: "OVERDUE", label: "Vadesi Geçen" },
  { value: "DUE_MATURITY", label: "Vadesi Gelen" },
  { value: "TODAY_MATURITY", label: "Vadesi Bugün" },
  { value: "SOON_MATURITY", label: "7 Gün İçinde" },
];
