"use client";

import { Button } from "react-bootstrap";
import { FaFilter, FaPlus } from "react-icons/fa";
import CustomerSearchBar from "@/components/customers/CustomerSearchBar";
import CustomerQuickFilters from "@/components/customers/CustomerQuickFilters";

export default function CustomersToolbar({
  searchQuery,
  onSearchChange,
  quickFilter,
  onQuickFilterChange,
  hasActiveFilters,
  onClearFilters,
  onOpenFilters,
  onCreate,
  isAdmin,
  isBusy,
}) {
  return (
    <div className="card border-0 shadow-sm ui-panel-card customer-filters-panel">
      <div className="card-body d-flex flex-column gap-3">
        <div className="d-flex flex-column flex-md-row gap-2 align-items-stretch">
          <CustomerSearchBar value={searchQuery} onChange={onSearchChange} />
          {hasActiveFilters && (
            <Button
              variant="outline-secondary"
              className="customer-filters__clear-btn touch-target flex-shrink-0"
              onClick={onClearFilters}
              disabled={isBusy}
            >
              <i className="pi pi-filter-slash me-1" aria-hidden="true" />
              Temizle
            </Button>
          )}
        </div>

        <div className="customers-toolbar__actions d-flex flex-column flex-md-row gap-2">
          <Button
            variant="outline-secondary"
            className="customers-toolbar__filter-btn touch-target"
            onClick={onOpenFilters}
            disabled={isBusy}
          >
            <FaFilter className="me-2" aria-hidden="true" />
            Filtrele
          </Button>
          {isAdmin && (
            <Button
              variant="primary"
              className="customers-toolbar__create-btn touch-target d-none d-lg-inline-flex"
              onClick={onCreate}
              disabled={isBusy}
            >
              <FaPlus className="me-2" aria-hidden="true" />
              Yeni Müşteri
            </Button>
          )}
        </div>

        <CustomerQuickFilters
          value={quickFilter}
          onChange={onQuickFilterChange}
          disabled={isBusy}
        />
      </div>
    </div>
  );
}
