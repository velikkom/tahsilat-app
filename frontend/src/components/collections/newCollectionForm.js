export const createInitialForm = (defaultCustomerId = "") => ({
  customerId: defaultCustomerId,
  amount: "",
  paymentType: "CASH",
  collectionDate: new Date().toISOString().split("T")[0],
  maturityDate: "",
  description: "",
  receiptNumber: "",
  mikroSr: "",
  mikroNo: "",
  bankName: "",
  mailOrderCompany: "",
});

export const mapCollectionToForm = (collection) => ({
  customerId: collection?.customerId || "",
  amount: collection?.amount != null ? String(collection.amount) : "",
  paymentType: collection?.paymentType || "CASH",
  collectionDate: collection?.collectionDate || "",
  maturityDate: collection?.maturityDate || "",
  description: collection?.description || "",
  receiptNumber: collection?.receiptNumber || "",
  mikroSr: collection?.mikroSr || "",
  mikroNo: collection?.mikroNo || "",
  bankName: collection?.bankName || "",
  mailOrderCompany: collection?.mailOrderCompany || "",
});

export function applyPaymentTypeChange(prev, value) {
  return {
    ...prev,
    paymentType: value,
    maturityDate:
      value === "CHECK" || value === "PROMISSORY_NOTE"
        ? prev.maturityDate
        : "",
    mailOrderCompany: value === "MAIL_ORDER" ? prev.mailOrderCompany : "",
  };
}

export function buildCollectionSubmitPayload(
  form,
  requiresMaturityDate,
  mailOrderCompany
) {
  return {
    customerId: form.customerId,
    amount: Number(form.amount),
    paymentType: form.paymentType,
    collectionDate: form.collectionDate,
    maturityDate: requiresMaturityDate ? form.maturityDate : null,
    description: form.description,
    receiptNumber: form.receiptNumber || null,
    mikroSr: form.mikroSr || null,
    mikroNo: form.mikroNo || null,
    bankName: form.bankName || null,
    mailOrderCompany:
      form.paymentType === "MAIL_ORDER" ? mailOrderCompany || null : null,
  };
}
