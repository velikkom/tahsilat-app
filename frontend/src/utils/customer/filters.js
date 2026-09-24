import {
  CUSTOMER_ACTIVE_FILTER,
  CUSTOMER_QUICK_FILTER,
} from "./constants";
import { isCreatedThisMonth, isCustomerActive } from "./status";

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

function matchesField(value, filterValue) {
  if (!filterValue) {
    return true;
  }

  return value?.toLowerCase().includes(filterValue.trim().toLowerCase());
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

    if (!matchesField(customer.companyName, filters.companyName)) {
      return false;
    }

    if (!matchesField(customer.authorizedPerson, filters.authorizedPerson)) {
      return false;
    }

    if (!matchesField(customer.phone, filters.phone)) {
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
