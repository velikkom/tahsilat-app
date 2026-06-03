export const PAYMENT_TYPE_LABELS = {
  CASH: "Nakit",
  CHECK: "Çek",
  CREDIT_CARD: "Kredi Kartı",
  BANK_TRANSFER: "Havale / EFT",
  PROMISSORY_NOTE: "Senet",
};

export function formatCurrency(value) {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatPaymentType(paymentType) {
  return PAYMENT_TYPE_LABELS[paymentType] || paymentType || "-";
}

export function formatNumber(value) {
  return new Intl.NumberFormat("tr-TR").format(Number(value ?? 0));
}
