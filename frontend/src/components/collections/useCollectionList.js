import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  EMPTY_COLLECTION_FILTERS,
  buildPageCollectionStats,
  filterCollections,
  quickFilterFromSearchParams,
} from "@/utils/collectionUtils";

export default function useCollectionList(collections, customers) {
  const searchParams = useSearchParams();
  const queryFilter = quickFilterFromSearchParams(searchParams);
  const [filters, setFilters] = useState(() => ({
    ...EMPTY_COLLECTION_FILTERS,
    quickFilter: queryFilter,
  }));
  const [queryFilterApplied, setQueryFilterApplied] = useState(queryFilter);

  if (queryFilter !== "ALL" && queryFilterApplied !== queryFilter) {
    setQueryFilterApplied(queryFilter);
    setFilters((prev) => ({ ...prev, quickFilter: queryFilter }));
  }

  if (queryFilter === "ALL" && queryFilterApplied !== "ALL") {
    setQueryFilterApplied("ALL");
  }

  const customerMap = useMemo(() => {
    const map = {};
    for (const customer of customers) {
      if (customer?.id) {
        map[customer.id] = customer;
      }
    }
    return map;
  }, [customers]);

  const stats = useMemo(
    () => buildPageCollectionStats(collections),
    [collections]
  );
  const filteredCollections = useMemo(
    () => filterCollections(collections, filters),
    [collections, filters]
  );
  const hasActiveFilters =
    filters.searchQuery.trim().length > 0 ||
    filters.paymentType !== "ALL" ||
    filters.status !== "ALL" ||
    filters.quickFilter !== "ALL";

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(EMPTY_COLLECTION_FILTERS);
  }, []);

  return {
    filters,
    stats,
    filteredCollections,
    customerMap,
    hasActiveFilters,
    updateFilter,
    clearFilters,
  };
}
