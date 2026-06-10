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
