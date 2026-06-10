"use client";

import { Badge, Button } from "react-bootstrap";
import {
  formatCurrency,
  formatDate,
  formatMaturityDays,
  getEffectiveStatus,
  getPaymentTypeLabel,
  getStatusLabel,
  getStatusVariant,
} from "@/utils/collectionUtils";

export default function CustomerCollectionCard({
  collection,
  onSelect,
  onMarkAsPaid,
  busy = false,
}) {
  const status = getEffectiveStatus(collection);
  const maturityDays = formatMaturityDays(collection);
  const canMarkAsPaid = status === "PENDING" || status === "OVERDUE";

  return (
    <div
      className="customer-collection-card card border-0 shadow-sm"
      role="button"
      onClick={() => onSelect(collection)}
    >
      <div className="card-body p-3 d-flex flex-column gap-2">
        <div className="d-flex justify-content-between align-items-start gap-2">
          <span className="customer-collection-card__amount fw-bold">
            {formatCurrency(collection.amount)}
          </span>

          <Badge bg={getStatusVariant(status)}>{getStatusLabel(status)}</Badge>
        </div>

        <div className="d-flex flex-wrap gap-2 align-items-center">
          <span className="customer-collection-card__type badge text-bg-light border">
            {getPaymentTypeLabel(collection.paymentType)}
          </span>

          {collection.maturityDate && (
            <span className="text-muted small">
              <i className="pi pi-calendar me-1" aria-hidden="true" />
              {formatDate(collection.maturityDate)}
            </span>
          )}

          {maturityDays.text !== "*" && (
            <span className={`small fw-semibold text-${maturityDays.tone}`}>
              {maturityDays.text}
            </span>
          )}
        </div>

        {collection.description && (
          <div className="text-muted small text-truncate">
            {collection.description}
          </div>
        )}

        {canMarkAsPaid && (
          <div onClick={(e) => e.stopPropagation()}>
            <Button
              size="sm"
              variant="outline-success"
              className="w-100"
              disabled={busy}
              onClick={() => onMarkAsPaid(collection)}
            >
              <i className="pi pi-check me-1" aria-hidden="true" />
              Tahsil Edildi
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
