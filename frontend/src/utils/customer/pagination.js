import { CUSTOMER_PAGE_SIZE } from "./constants";

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
