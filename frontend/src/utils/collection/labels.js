export const PAYMENT_TYPE_LABELS = {
  CASH: "Nakit",
  BANK_TRANSFER: "Havale",
  CHECK: "Çek",
  PROMISSORY_NOTE: "Müşteri Senedi",
  MAIL_ORDER: "Mailorder",
  POS_YKB: "POS YKB",
  POS_TEB: "POS TEB",
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

export const PAYMENT_TYPE_TONES = {
  CASH: "cash",
  BANK_TRANSFER: "transfer",
  CHECK: "check",
  PROMISSORY_NOTE: "note",
  MAIL_ORDER: "mailorder",
  POS_YKB: "ykb",
  POS_TEB: "teb",
};

export function getPaymentTypeLabel(paymentType) {
  return PAYMENT_TYPE_LABELS[paymentType] || paymentType || "-";
}

export function getPaymentTypeTone(paymentType) {
  return PAYMENT_TYPE_TONES[paymentType] || "unknown";
}

export function getStatusLabel(status) {
  return STATUS_LABELS[status] || status || "-";
}

export function getStatusVariant(status) {
  return STATUS_VARIANTS[status] || "secondary";
}
