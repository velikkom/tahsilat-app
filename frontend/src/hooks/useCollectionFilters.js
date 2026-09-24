"use client";

import { useState } from "react";
import { createDefaultFilters } from "./collectionFilterDefaults";

export default function useCollectionFilters() {
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [filters, setFilters] = useState(createDefaultFilters());

  function clearFilter() {
    setFilters(createDefaultFilters());
    setGlobalFilterValue("");
  }

  function onGlobalFilterChange(e) {
    const value = e.target.value;
    const _filters = { ...filters };
    _filters.global.value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  }

  return {
    filters,
    setFilters,
    globalFilterValue,
    clearFilter,
    onGlobalFilterChange,
  };
}
