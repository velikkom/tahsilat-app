export const EMPTY_FORM = {
  companyName: "",
  authorizedPerson: "",
  phone: "",
  taxNumber: "",
  address: "",
};

export function mapCustomerToForm(customer) {
  return {
    companyName: customer?.companyName || "",
    authorizedPerson: customer?.authorizedPerson || "",
    phone: customer?.phone || "",
    taxNumber: customer?.taxNumber || "",
    address: customer?.address || "",
  };
}

export function buildCustomerSubmitPayload(form) {
  return {
    companyName: form.companyName.trim(),
    authorizedPerson: form.authorizedPerson.trim(),
    phone: form.phone.trim(),
    taxNumber: form.taxNumber.trim(),
    address: form.address.trim(),
  };
}
