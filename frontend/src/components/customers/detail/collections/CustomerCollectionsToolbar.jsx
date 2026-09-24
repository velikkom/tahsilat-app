"use client";

import { Button } from "react-bootstrap";
import CustomerCollectionsFilters from "./CustomerCollectionsFilters";
import CustomerCollectionsSearch from "./CustomerCollectionsSearch";
import CustomerCollectionsViewToggle from "./CustomerCollectionsViewToggle";

export default function CustomerCollectionsToolbar({
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onCreate,
  statusFilter,
  onStatusFilterChange,
  paymentTypeFilters,
  onTogglePaymentType,
}) {
  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body d-flex flex-column gap-3">
        <div className="d-flex flex-column flex-lg-row justify-content-between gap-2 gap-lg-3">
          <CustomerCollectionsSearch
            value={searchTerm}
            onChange={onSearchChange}
          />

          <div className="d-flex justify-content-between align-items-center gap-2 flex-shrink-0">
            <CustomerCollectionsViewToggle
              viewMode={viewMode}
              onChange={onViewModeChange}
            />
            <Button size="sm" variant="primary" onClick={onCreate}>
              <i className="pi pi-plus me-1" aria-hidden="true" />
              Yeni
            </Button>
          </div>
        </div>

        <CustomerCollectionsFilters
          statusFilter={statusFilter}
          onStatusFilterChange={onStatusFilterChange}
          paymentTypeFilters={paymentTypeFilters}
          onTogglePaymentType={onTogglePaymentType}
        />
      </div>
    </div>
  );
}
