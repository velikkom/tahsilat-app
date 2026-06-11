import { apiFetchJson } from "@/services/apiClient";

export function getCustomers({ page = 0, size = 100 } = {}) {
  return apiFetchJson(`/customers?page=${page}&size=${size}`, {
    errorMessage: "Customers fetch failed",
  });
}

export function getCustomerById(id) {
  return apiFetchJson(`/customers/${id}`, {
    errorMessage: "Customer fetch failed",
  });
}

export function getCustomerCollections(customerId, { size = 500 } = {}) {
  return apiFetchJson(
    `/collections/customer/${customerId}?page=0&size=${size}`,
    {
      errorMessage: "Collections fetch failed",
    }
  );
}
