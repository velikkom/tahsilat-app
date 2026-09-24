"use client";

import CollectionFilters from "@/components/collections/CollectionFilters";
import CollectionQuickFilters from "@/components/collections/CollectionQuickFilters";

export default function CollectionsToolbar({
  filters,
  hasActiveFilters,
  onSearchChange,
  onPaymentTypeChange,
  onStatusChange,
  onClearFilters,
  onQuickFilterChange,
  isBusy,
}) {
  return (
    <div className="card border-0 shadow-sm ui-panel-card collection-filters-panel mb-3">
      <div className="card-body d-flex flex-column gap-3">
        <CollectionFilters
          searchQuery={filters.searchQuery}
          onSearchChange={onSearchChange}
          paymentType={filters.paymentType}
          onPaymentTypeChange={onPaymentTypeChange}
          status={filters.status}
          onStatusChange={onStatusChange}
          onClear={onClearFilters}
          hasActiveFilters={hasActiveFilters}
          disabled={isBusy}
        />
        <CollectionQuickFilters
          value={filters.quickFilter}
          onChange={onQuickFilterChange}
          disabled={isBusy}
        />
      </div>
    </div>
  );
}
