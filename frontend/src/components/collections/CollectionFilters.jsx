"use client";

import { memo } from "react";
import { Button, Form } from "react-bootstrap";
import {
  PAYMENT_TYPE_FILTER_OPTIONS,
  STATUS_FILTER_OPTIONS,
} from "@/utils/collectionUtils";

function FilterChipGroup({ label, options, value, onChange, disabled }) {
  return (
    <div className="collection-filter-group">
      <span className="collection-filter-group__label text-muted">{label}</span>
      <div className="collection-filter-scroll d-flex gap-2">
        {options.map((option) => (
          <Button
            key={option.value}
            size="sm"
            variant={value === option.value ? "primary" : "outline-secondary"}
            className="collection-filter-chip flex-shrink-0 touch-target"
            onClick={() => onChange(option.value)}
            disabled={disabled}
            aria-pressed={value === option.value}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

function CollectionFilters({
  searchQuery,
  onSearchChange,
  paymentType,
  onPaymentTypeChange,
  status,
  onStatusChange,
  onClear,
  hasActiveFilters = false,
  disabled = false,
}) {
  return (
    <div className="collection-filters d-flex flex-column gap-3">
      <div className="collection-filters__search-row d-flex gap-2 align-items-stretch">
        <div className="collection-search-input-wrapper flex-grow-1 position-relative">
          <i
            className="pi pi-search collection-search-input-wrapper__icon text-muted"
            aria-hidden="true"
          />
          <Form.Control
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Tahsilat ara..."
            className="collection-search-input touch-target"
            disabled={disabled}
            aria-label="Tahsilat ara"
          />
        </div>

        {hasActiveFilters && (
          <Button
            variant="outline-secondary"
            className="collection-filters__clear-btn touch-target flex-shrink-0"
            onClick={onClear}
            disabled={disabled}
          >
            <i className="pi pi-filter-slash me-1" aria-hidden="true" />
            Temizle
          </Button>
        )}
      </div>

      <FilterChipGroup
        label="Ödeme Tipi"
        options={PAYMENT_TYPE_FILTER_OPTIONS}
        value={paymentType}
        onChange={onPaymentTypeChange}
        disabled={disabled}
      />

      <FilterChipGroup
        label="Durum"
        options={STATUS_FILTER_OPTIONS}
        value={status}
        onChange={onStatusChange}
        disabled={disabled}
      />
    </div>
  );
}

export default memo(CollectionFilters);
