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

export const PAYMENT_TYPE_LABELS = {
  CASH: "Nakit",
  BANK_TRANSFER: "Havale",
  CREDIT_CARD: "Kredi Kartı",
  CHECK: "Çek",
  PROMISSORY_NOTE: "Müşteri Senedi",
};

export const STATUS_LABELS = {
  PENDING: "Bekliyor",
  PAID: "Tahsil Edildi",
  OVERDUE: "Vadesi Geçti",
  CANCELLED: "İptal",
};

export const STATUS_VARIANTS = {
  PAID: "success",
  PENDING: "warning",
  OVERDUE: "danger",
  CANCELLED: "secondary",
};

export const MATURITY_PAYMENT_TYPES = ["CHECK", "PROMISSORY_NOTE"];

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

export function getPaymentTypeLabel(paymentType) {
  return PAYMENT_TYPE_LABELS[paymentType] || paymentType || "-";
}

export function getStatusLabel(status) {
  return STATUS_LABELS[status] || status || "-";
}

export function getStatusVariant(status) {
  return STATUS_VARIANTS[status] || "secondary";
}

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/*
 * Backend'de OVERDUE status'u yok (PENDING / PAID / CANCELLED).
 * Vadesi gecmis PENDING kayitlar frontend'de OVERDUE olarak turetilir.
 */
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

export function hasMaturityTracking(collection) {
  return (
    MATURITY_PAYMENT_TYPES.includes(collection?.paymentType) &&
    Boolean(collection?.maturityDate)
  );
}

/*
 * Vadeye kalan gun sayisi. Pozitif: vade gelecekte, negatif: gecikmis.
 * Vade takibi olmayan odeme turlerinde (CASH, CREDIT_CARD, ...) null doner.
 */
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

export function buildCollectionsSummary(collections) {
  const summary = {
    totalAmount: 0,
    pendingAmount: 0,
    overdueAmount: 0,
    paidAmount: 0,
    totalCount: collections.length,
    averageAmount: 0,
    maxAmount: 0,
    lastCollectionDate: null,
  };

  for (const collection of collections) {
    const amount = Number(collection.amount) || 0;
    const status = getEffectiveStatus(collection);

    summary.totalAmount += amount;

    if (status === "PENDING") {
      summary.pendingAmount += amount;
    } else if (status === "OVERDUE") {
      summary.overdueAmount += amount;
    } else if (status === "PAID") {
      summary.paidAmount += amount;
    }

    if (amount > summary.maxAmount) {
      summary.maxAmount = amount;
    }

    if (
      collection.collectionDate &&
      (!summary.lastCollectionDate ||
        collection.collectionDate > summary.lastCollectionDate)
    ) {
      summary.lastCollectionDate = collection.collectionDate;
    }
  }

  summary.averageAmount =
    summary.totalCount > 0 ? summary.totalAmount / summary.totalCount : 0;

  return summary;
}

export const EMPTY_COLLECTION_FILTERS = {
  searchQuery: "",
  paymentType: "ALL",
  status: "ALL",
  quickFilter: "ALL",
};

const PAYMENT_TYPE_FILTER_OPTIONS = [
  { value: "ALL", label: "Tümü" },
  { value: "CASH", label: "Nakit" },
  { value: "CREDIT_CARD", label: "Kredi Kartı" },
  { value: "CHECK", label: "Çek" },
  { value: "PROMISSORY_NOTE", label: "Müşteri Senedi" },
  { value: "BANK_TRANSFER", label: "Havale" },
];

const STATUS_FILTER_OPTIONS = [
  { value: "ALL", label: "Tümü" },
  { value: "PAID", label: "Tahsil Edildi" },
  { value: "PENDING", label: "Bekliyor" },
  { value: "OVERDUE", label: "Vadesi Geçti" },
];

const QUICK_FILTER_OPTIONS = [
  { value: "ALL", label: "Tümü" },
  { value: "THIS_MONTH", label: "Bu Ay" },
  { value: "PENDING", label: "Bekleyen" },
  { value: "OVERDUE", label: "Vadesi Geçen" },
];

export { PAYMENT_TYPE_FILTER_OPTIONS, STATUS_FILTER_OPTIONS, QUICK_FILTER_OPTIONS };

function isCollectionInCurrentMonth(collectionDate) {
  if (!collectionDate) {
    return false;
  }

  const date = new Date(collectionDate);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  );
}

export function filterCollections(collections, filters = EMPTY_COLLECTION_FILTERS) {
  const normalizedSearch = (filters.searchQuery || "").trim().toLocaleLowerCase("tr-TR");

  return collections.filter((collection) => {
    const effectiveStatus = getEffectiveStatus(collection);

    if (filters.paymentType !== "ALL" && collection.paymentType !== filters.paymentType) {
      return false;
    }

    if (filters.status !== "ALL" && effectiveStatus !== filters.status) {
      return false;
    }

    if (filters.quickFilter === "THIS_MONTH" && !isCollectionInCurrentMonth(collection.collectionDate)) {
      return false;
    }

    if (filters.quickFilter === "PENDING" && effectiveStatus !== "PENDING") {
      return false;
    }

    if (filters.quickFilter === "OVERDUE" && effectiveStatus !== "OVERDUE") {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    const haystack = [
      collection.customerName || "",
      collection.description || "",
      collection.paymentType || "",
      getPaymentTypeLabel(collection.paymentType),
      getStatusLabel(effectiveStatus),
      String(collection.amount ?? ""),
      formatCurrency(collection.amount),
      formatDate(collection.collectionDate),
      formatDate(collection.maturityDate),
    ]
      .join(" ")
      .toLocaleLowerCase("tr-TR");

    return haystack.includes(normalizedSearch);
  });
}

export function buildPageCollectionStats(collections) {
  const summary = buildCollectionsSummary(collections);

  let thisMonthAmount = 0;

  for (const collection of collections) {
    if (isCollectionInCurrentMonth(collection.collectionDate)) {
      thisMonthAmount += Number(collection.amount) || 0;
    }
  }

  return {
    totalAmount: summary.totalAmount,
    thisMonthAmount,
    pendingAmount: summary.pendingAmount + summary.overdueAmount,
  };
}

export function groupCollectionsByMonth(collections) {
  const groups = new Map();

  const sorted = [...collections].sort((a, b) =>
    (b.collectionDate || "").localeCompare(a.collectionDate || "")
  );

  for (const collection of sorted) {
    const key = collection.collectionDate
      ? collection.collectionDate.slice(0, 7)
      : "unknown";

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        label: formatMonthYear(collection.collectionDate),
        items: [],
      });
    }

    groups.get(key).items.push(collection);
  }

  return Array.from(groups.values());
}
