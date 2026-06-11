export const CUSTOMER_PAGE_SIZE = 10;

export const CUSTOMER_ACTIVE_FILTER = {
  ALL: "ALL",
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
};

export const EMPTY_CUSTOMER_FILTERS = {
  companyName: "",
  authorizedPerson: "",
  phone: "",
  active: CUSTOMER_ACTIVE_FILTER.ALL,
};

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

export function filterCustomers(customers, searchQuery, filters) {
  const query = searchQuery.trim().toLowerCase();

  return customers.filter((customer) => {
    if (query) {
      const haystack = [
        customer.companyName,
        customer.authorizedPerson,
        customer.phone,
        customer.taxNumber,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(query)) {
        return false;
      }
    }

    if (
      filters.companyName &&
      !customer.companyName
        ?.toLowerCase()
        .includes(filters.companyName.trim().toLowerCase())
    ) {
      return false;
    }

    if (
      filters.authorizedPerson &&
      !customer.authorizedPerson
        ?.toLowerCase()
        .includes(filters.authorizedPerson.trim().toLowerCase())
    ) {
      return false;
    }

    if (
      filters.phone &&
      !customer.phone
        ?.toLowerCase()
        .includes(filters.phone.trim().toLowerCase())
    ) {
      return false;
    }

    if (filters.active === CUSTOMER_ACTIVE_FILTER.ACTIVE && !customer.active) {
      return false;
    }

    if (
      filters.active === CUSTOMER_ACTIVE_FILTER.INACTIVE &&
      customer.active !== false
    ) {
      return false;
    }

    return true;
  });
}

export function paginateCustomers(customers, page, pageSize = CUSTOMER_PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(customers.length / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: customers.slice(start, start + pageSize),
    currentPage: safePage,
    totalPages,
    totalItems: customers.length,
  };
}
