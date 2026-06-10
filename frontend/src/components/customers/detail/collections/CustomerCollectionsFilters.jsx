"use client";

import { Button, ButtonGroup } from "react-bootstrap";
import { PAYMENT_TYPE_LABELS } from "@/utils/collectionUtils";

const STATUS_FILTERS = [
  { value: "ALL", label: "Tümü" },
  { value: "PENDING", label: "Bekliyor" },
  { value: "PAID", label: "Tahsil Edildi" },
  { value: "OVERDUE", label: "Vadesi Geçti" },
];

const PAYMENT_TYPE_FILTERS = Object.entries(PAYMENT_TYPE_LABELS).map(
  ([value, label]) => ({ value, label })
);

export default function CustomerCollectionsFilters({
  statusFilter,
  onStatusFilterChange,
  paymentTypeFilters,
  onTogglePaymentType,
}) {
  return (
    <div className="d-flex flex-column gap-2">
      <div className="customer-collections-filter-row">
        <span className="customer-collections-filter-row__label text-muted">
          Durum
        </span>

        <ButtonGroup
          size="sm"
          className="customer-collections-filter-group flex-wrap"
        >
          {STATUS_FILTERS.map((filter) => (
            <Button
              key={filter.value}
              variant={
                statusFilter === filter.value ? "primary" : "outline-secondary"
              }
              onClick={() => onStatusFilterChange(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
        </ButtonGroup>
      </div>

      <div className="customer-collections-filter-row">
        <span className="customer-collections-filter-row__label text-muted">
          Ödeme Tipi
        </span>

        <div className="d-flex flex-wrap gap-1">
          {PAYMENT_TYPE_FILTERS.map((filter) => {
            const isActive = paymentTypeFilters.includes(filter.value);

            return (
              <Button
                key={filter.value}
                size="sm"
                variant={isActive ? "primary" : "outline-secondary"}
                className="customer-collections-filter-chip"
                onClick={() => onTogglePaymentType(filter.value)}
                aria-pressed={isActive}
              >
                {filter.label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
