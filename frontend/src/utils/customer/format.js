export function formatCustomerDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatCustomerField(value) {
  if (value == null || value === "") {
    return "-";
  }

  return value;
}

export function customerDisplayName(customer) {
  return (customer?.name || customer?.companyName || "").trim();
}
