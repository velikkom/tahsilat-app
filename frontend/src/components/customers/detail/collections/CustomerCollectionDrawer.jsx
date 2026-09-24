"use client";

import { Badge, Offcanvas } from "react-bootstrap";
import {
  formatCurrency,
  getEffectiveStatus,
  getStatusLabel,
  getStatusVariant,
} from "@/utils/collectionUtils";
import useOffcanvasPlacement from "@/hooks/useOffcanvasPlacement";
import CustomerCollectionDrawerFields from "./CustomerCollectionDrawerFields";
import CustomerCollectionDrawerActions from "./CustomerCollectionDrawerActions";

export default function CustomerCollectionDrawer({
  show,
  collection,
  customerName,
  busy = false,
  onHide,
  onEdit,
  onDelete,
  onMarkAsPaid,
}) {
  const placement = useOffcanvasPlacement("(max-width: 767px)");

  if (!collection) {
    return null;
  }

  const status = getEffectiveStatus(collection);

  return (
    <Offcanvas
      show={show}
      onHide={onHide}
      placement={placement}
      className={`customer-collection-drawer ${
        placement === "bottom" ? "customer-collection-drawer--bottom" : ""
      }`}
    >
      <Offcanvas.Header closeButton className="border-bottom">
        <Offcanvas.Title>Tahsilat Detayı</Offcanvas.Title>
      </Offcanvas.Header>

      <Offcanvas.Body className="d-flex flex-column gap-4">
        <div className="d-flex justify-content-between align-items-center">
          <span className="customer-collection-drawer__amount fw-bold">
            {formatCurrency(collection.amount)}
          </span>
          <Badge bg={getStatusVariant(status)}>{getStatusLabel(status)}</Badge>
        </div>

        <CustomerCollectionDrawerFields
          collection={collection}
          customerName={customerName}
        />

        <CustomerCollectionDrawerActions
          collection={collection}
          busy={busy}
          onEdit={onEdit}
          onDelete={onDelete}
          onMarkAsPaid={onMarkAsPaid}
        />
      </Offcanvas.Body>
    </Offcanvas>
  );
}
