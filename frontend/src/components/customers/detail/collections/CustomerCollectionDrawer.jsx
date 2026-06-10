"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Offcanvas } from "react-bootstrap";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatMaturityDays,
  getEffectiveStatus,
  getPaymentTypeLabel,
  getStatusLabel,
  getStatusVariant,
} from "@/utils/collectionUtils";

function DetailField({ label, children }) {
  return (
    <div className="customer-collection-drawer__field">
      <span className="customer-collection-drawer__label text-muted">
        {label}
      </span>
      <div className="customer-collection-drawer__value">{children}</div>
    </div>
  );
}

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
  const [placement, setPlacement] = useState("end");

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");

    function updatePlacement() {
      setPlacement(mediaQuery.matches ? "bottom" : "end");
    }

    updatePlacement();
    mediaQuery.addEventListener("change", updatePlacement);

    return () => mediaQuery.removeEventListener("change", updatePlacement);
  }, []);

  if (!collection) {
    return null;
  }

  const status = getEffectiveStatus(collection);
  const maturityDays = formatMaturityDays(collection);
  const canMarkAsPaid = status === "PENDING" || status === "OVERDUE";

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

        <div className="customer-collection-drawer__fields">
          <DetailField label="Müşteri">
            {collection.customerName || customerName || "-"}
          </DetailField>

          <DetailField label="Ödeme Türü">
            {getPaymentTypeLabel(collection.paymentType)}
          </DetailField>

          <DetailField label="Tahsilat Tarihi">
            {formatDate(collection.collectionDate)}
          </DetailField>

          <DetailField label="Vade Tarihi">
            {formatDate(collection.maturityDate)}
            {maturityDays.text !== "*" && (
              <span className={`ms-2 fw-semibold text-${maturityDays.tone}`}>
                ({maturityDays.text})
              </span>
            )}
          </DetailField>

          <DetailField label="Açıklama">
            {collection.description || "-"}
          </DetailField>

          <DetailField label="Oluşturulma Tarihi">
            {formatDateTime(collection.createdAt)}
          </DetailField>

          <DetailField label="Son Güncelleme">
            {formatDateTime(collection.updatedAt)}
          </DetailField>
        </div>

        <div className="d-flex flex-column gap-2 mt-auto">
          {canMarkAsPaid && (
            <Button
              variant="success"
              disabled={busy}
              onClick={() => onMarkAsPaid(collection)}
            >
              <i className="pi pi-check me-2" aria-hidden="true" />
              Tahsil Edildi
            </Button>
          )}

          <div className="d-flex gap-2">
            <Button
              variant="outline-warning"
              className="flex-fill"
              disabled={busy}
              onClick={() => onEdit(collection)}
            >
              <i className="pi pi-pencil me-2" aria-hidden="true" />
              Düzenle
            </Button>

            <Button
              variant="outline-danger"
              className="flex-fill"
              disabled={busy}
              onClick={() => onDelete(collection)}
            >
              <i className="pi pi-trash me-2" aria-hidden="true" />
              Sil
            </Button>
          </div>
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
}
