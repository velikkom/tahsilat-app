import { useCallback, useMemo, useState } from "react";
import {
  formatCurrency,
  getEffectiveStatus,
  getPaymentTypeLabel,
} from "@/utils/collectionUtils";

export default function useCollectionsFilters(collections) {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentTypeFilters, setPaymentTypeFilters] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("TABLE");

  const filteredCollections = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase("tr-TR");

    return collections.filter((collection) => {
      const status = getEffectiveStatus(collection);
      if (statusFilter !== "ALL" && status !== statusFilter) {
        return false;
      }
      if (
        paymentTypeFilters.length > 0 &&
        !paymentTypeFilters.includes(collection.paymentType)
      ) {
        return false;
      }
      if (!normalizedSearch) {
        return true;
      }

      const haystack = [
        collection.description || "",
        collection.paymentType || "",
        getPaymentTypeLabel(collection.paymentType),
        String(collection.amount ?? ""),
        formatCurrency(collection.amount),
      ]
        .join(" ")
        .toLocaleLowerCase("tr-TR");

      return haystack.includes(normalizedSearch);
    });
  }, [collections, statusFilter, paymentTypeFilters, searchTerm]);

  const handleTogglePaymentType = useCallback((paymentType) => {
    setPaymentTypeFilters((prev) =>
      prev.includes(paymentType)
        ? prev.filter((value) => value !== paymentType)
        : [...prev, paymentType]
    );
  }, []);

  const handleClearFilters = useCallback(() => {
    setStatusFilter("ALL");
    setPaymentTypeFilters([]);
    setSearchTerm("");
  }, []);

  return {
    statusFilter,
    setStatusFilter,
    paymentTypeFilters,
    searchTerm,
    setSearchTerm,
    viewMode,
    setViewMode,
    filteredCollections,
    handleTogglePaymentType,
    handleClearFilters,
  };
}
