export const CUSTOMER_PAGE_SIZE = 10;

export const CUSTOMER_ACTIVE_FILTER = {
  ALL: "ALL",
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
};

export const CUSTOMER_QUICK_FILTER = {
  ALL: "ALL",
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  THIS_MONTH: "THIS_MONTH",
};

export const CUSTOMER_QUICK_FILTER_OPTIONS = [
  { value: CUSTOMER_QUICK_FILTER.ALL, label: "Tümü" },
  { value: CUSTOMER_QUICK_FILTER.ACTIVE, label: "Aktif" },
  { value: CUSTOMER_QUICK_FILTER.INACTIVE, label: "Pasif" },
  { value: CUSTOMER_QUICK_FILTER.THIS_MONTH, label: "Bu Ay Eklenen" },
];

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

export function formatPhoneNumber(phone) {
  if (!phone) {
    return "-";
  }

  const digits = phone.replace(/\D/g, "");

  if (digits.length === 11) {
    return digits.replace(/(\d{4})(\d{3})(\d{2})(\d{2})/, "$1 $2 $3 $4");
  }

  if (digits.length === 10) {
    return digits.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, "$1 $2 $3 $4");
  }

  return phone;
}

export function getPhoneDigits(phone) {
  if (!phone) {
    return "";
  }

  return phone.replace(/\D/g, "");
}

export function getWhatsAppNumber(phone) {
  const digits = getPhoneDigits(phone);

  if (!digits) {
    return "";
  }

  if (digits.startsWith("0")) {
    return `90${digits.slice(1)}`;
  }

  if (digits.startsWith("90")) {
    return digits;
  }

  return digits;
}

export function getTelHref(phone) {
  const digits = getPhoneDigits(phone);
  return digits ? `tel:${digits}` : "";
}

export function getWhatsAppHref(phone) {
  const whatsappNumber = getWhatsAppNumber(phone);
  return whatsappNumber ? `https://wa.me/${whatsappNumber}` : "";
}

export function isCustomerActive(customer) {
  return customer?.active !== false;
}

export function getCustomerStatusLabel(customer) {
  return isCustomerActive(customer) ? "Aktif" : "Pasif";
}

export function getCustomerStatusVariant(customer) {
  return isCustomerActive(customer) ? "success" : "secondary";
}

function isCreatedThisMonth(createdAt) {
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

export function buildPageCustomerStats(customers) {
  let activeCount = 0;
  let inactiveCount = 0;
  let thisMonthCount = 0;

  for (const customer of customers) {
    if (isCustomerActive(customer)) {
      activeCount += 1;
    } else {
      inactiveCount += 1;
    }

    if (isCreatedThisMonth(customer.createdAt)) {
      thisMonthCount += 1;
    }
  }

  return {
    totalCount: customers.length,
    activeCount,
    inactiveCount,
    thisMonthCount,
  };
}

export function applyCustomerQuickFilter(customers, quickFilter) {
  if (!quickFilter || quickFilter === CUSTOMER_QUICK_FILTER.ALL) {
    return customers;
  }

  if (quickFilter === CUSTOMER_QUICK_FILTER.ACTIVE) {
    return customers.filter((customer) => isCustomerActive(customer));
  }

  if (quickFilter === CUSTOMER_QUICK_FILTER.INACTIVE) {
    return customers.filter((customer) => !isCustomerActive(customer));
  }

  if (quickFilter === CUSTOMER_QUICK_FILTER.THIS_MONTH) {
    return customers.filter((customer) =>
      isCreatedThisMonth(customer.createdAt)
    );
  }

  return customers;
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
