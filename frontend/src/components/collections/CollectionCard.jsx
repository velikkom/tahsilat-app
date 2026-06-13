"use client";

import { memo } from "react";
import { Badge } from "react-bootstrap";
import CollectionActions from "./CollectionActions";
import {
  formatCurrency,
  formatDate,
  getEffectiveStatus,
  getPaymentTypeLabel,
  getStatusLabel,
  getStatusVariant,
} from "@/utils/collectionUtils";

function CollectionCard({
  collection,
  contactPerson = "",
  onView,
  onEdit,
  onDelete,
  disabled = false,
  deletingId = null,
}) {
  const status = getEffectiveStatus(collection);

  return (
    <article className="collection-card card border-0 shadow-sm h-100">
      <div className="card-body d-flex flex-column gap-3 p-3 p-md-4">
        <div className="collection-card__header d-flex justify-content-between align-items-start gap-2">
          <div className="min-width-0">
            <h3 className="collection-card__company fw-bold mb-1 text-truncate">
              {collection.customerName || "-"}
            </h3>
            {contactPerson && (
              <p className="collection-card__contact text-muted mb-0 text-truncate">
                {contactPerson}
              </p>
            )}
          </div>

          <Badge
            bg="light"
            text="dark"
            className="collection-card__payment-badge flex-shrink-0"
          >
            {getPaymentTypeLabel(collection.paymentType)}
          </Badge>
        </div>

        <div className="collection-card__amount fw-bold">
          {formatCurrency(collection.amount)}
        </div>

        <div className="collection-card__dates d-flex flex-column gap-1">
          <div className="d-flex justify-content-between gap-2">
            <span className="collection-card__date-label text-muted">Tahsilat</span>
            <span className="collection-card__date-value">
              {formatDate(collection.collectionDate)}
            </span>
          </div>

          {collection.maturityDate && (
            <div className="d-flex justify-content-between gap-2">
              <span className="collection-card__date-label text-muted">Vade</span>
              <span className="collection-card__date-value">
                {formatDate(collection.maturityDate)}
              </span>
            </div>
          )}
        </div>

        <div>
          <Badge bg={getStatusVariant(status)} className="collection-card__status">
            {getStatusLabel(status)}
          </Badge>
        </div>

        <CollectionActions
          row={collection}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          disabled={disabled}
          deletingId={deletingId}
          variant="card"
        />
      </div>
    </article>
  );
}

export default memo(CollectionCard);
