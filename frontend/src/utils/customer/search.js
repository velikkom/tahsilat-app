function customerSearchKey(value) {
  return (value || "").toLocaleUpperCase("tr-TR").trim().replaceAll("İ", "I");
}

export function filterCustomersByQuery(customers = [], query) {
  const normalizedQuery = customerSearchKey(query);

  if (!normalizedQuery) {
    return customers;
  }

  return customers.filter((customer) => {
    const haystack = customerSearchKey(
      [
        customer.name,
        customer.companyName,
        customer.authorizedPerson,
        customer.taxNumber,
      ]
        .filter(Boolean)
        .join(" ")
    );

    return haystack.includes(normalizedQuery);
  });
}
