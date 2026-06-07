"use client";

import { Button } from "react-bootstrap";
import { Tag } from "primereact/tag";
import {
  formatCurrency,
  formatPaymentType,
} from "@/utils/dashboardFormatters";

function statusSeverity(status) {
  return status === "PAID" ? "success" : "warning";
}

export default function RecentCollectionCard({ collection, onDetail }) {
  return (
    <article className="user-card">
      <div className="user-card__header">
        <h3 className="user-card__name">{collection.customerName}</h3>
        <Tag value={collection.status} severity={statusSeverity(collection.status)} />
      </div>

      <div className="user-card__email">
        {formatCurrency(collection.amount)} ·{" "}
        {formatPaymentType(collection.paymentType)}
      </div>

      <div className="text-muted small mb-3">{collection.collectionDate}</div>

      <Button
        variant="outline-primary"
        className="user-card__detail-btn touch-target w-100"
        onClick={() => onDetail?.(collection)}
      >
        Detay
      </Button>
    </article>
  );
}
