import { formatPaymentType } from "@/utils/dashboardFormatters";

const COLLAPSE_IDS = {
  MAIL_ORDER: "collapseMailorder",
  PROMISSORY_NOTE: "collapseSenet",
  CASH: "collapseNakit",
  BANK_TRANSFER: "collapseHavale",
  CHECK: "collapseCek",
  POS_YKB: "collapsePosYkb",
  POS_TEB: "collapsePosTeb",
};

export function paymentTypeCollapseId(paymentType) {
  return COLLAPSE_IDS[paymentType] || `collapse${paymentType || "Other"}`;
}

export function buildPaymentTypeSections(data) {
  const items = data?.items || [];
  const mailOrderCompanies = data?.mailOrderCompanies || [];

  return items.map((item) => {
    const companies =
      item.companies?.length > 0
        ? item.companies
        : item.paymentType === "MAIL_ORDER"
          ? mailOrderCompanies
          : [];

    return {
      paymentType: item.paymentType,
      collapseId: paymentTypeCollapseId(item.paymentType),
      label: formatPaymentType(item.paymentType),
      totalAmount: item.totalAmount,
      companies,
    };
  });
}
