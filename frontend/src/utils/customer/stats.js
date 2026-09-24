import { isCreatedThisMonth, isCustomerActive } from "./status";

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
