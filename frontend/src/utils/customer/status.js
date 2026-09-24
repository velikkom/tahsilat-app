export function isCustomerActive(customer) {
  return customer?.active !== false;
}

export function getCustomerStatusLabel(customer) {
  return isCustomerActive(customer) ? "Aktif" : "Pasif";
}

export function getCustomerStatusVariant(customer) {
  return isCustomerActive(customer) ? "success" : "secondary";
}

export function isCreatedThisMonth(createdAt) {
  if (!createdAt) {
    return false;
  }

  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  );
}
