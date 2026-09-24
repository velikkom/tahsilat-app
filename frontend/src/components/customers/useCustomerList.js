import { useEffect, useMemo, useState } from "react";
import {
  CUSTOMER_ACTIVE_FILTER,
  CUSTOMER_QUICK_FILTER,
  EMPTY_CUSTOMER_FILTERS,
  applyCustomerQuickFilter,
  buildPageCustomerStats,
  filterCustomers,
  paginateCustomers,
} from "@/utils/customerUtils";

export default function useCustomerList(customers) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState(EMPTY_CUSTOMER_FILTERS);
  const [quickFilter, setQuickFilter] = useState(CUSTOMER_QUICK_FILTER.ALL);
  const [mobilePage, setMobilePage] = useState(1);

  const stats = useMemo(() => buildPageCustomerStats(customers), [customers]);

  const filteredCustomers = useMemo(() => {
    const base = filterCustomers(customers, searchQuery, filters);
    return applyCustomerQuickFilter(base, quickFilter);
  }, [customers, searchQuery, filters, quickFilter]);

  const mobilePagination = useMemo(
    () => paginateCustomers(filteredCustomers, mobilePage),
    [filteredCustomers, mobilePage]
  );

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    quickFilter !== CUSTOMER_QUICK_FILTER.ALL ||
    Boolean(filters.companyName) ||
    Boolean(filters.authorizedPerson) ||
    Boolean(filters.phone) ||
    filters.active !== CUSTOMER_ACTIVE_FILTER.ALL;

  useEffect(() => {
    setMobilePage(1);
  }, [searchQuery, filters, quickFilter]);

  useEffect(() => {
    if (mobilePage > mobilePagination.totalPages) {
      setMobilePage(mobilePagination.totalPages);
    }
  }, [mobilePage, mobilePagination.totalPages]);

  function clearFilters() {
    setFilters(EMPTY_CUSTOMER_FILTERS);
    setQuickFilter(CUSTOMER_QUICK_FILTER.ALL);
    setSearchQuery("");
  }

  return {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    quickFilter,
    setQuickFilter,
    stats,
    filteredCustomers,
    mobilePagination,
    hasActiveFilters,
    setMobilePage,
    clearFilters,
  };
}
