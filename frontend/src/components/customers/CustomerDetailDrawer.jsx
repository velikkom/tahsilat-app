"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Offcanvas } from "react-bootstrap";
import CustomerPhoneActions from "./CustomerPhoneActions";
import {
  formatCustomerDate,
  formatCustomerField,
  getCustomerStatusLabel,
  getCustomerStatusVariant,
} from "@/utils/customerUtils";

function DetailField({ label, children }) {
  return (
    <div className="customer-detail-field">
      <span className="customer-detail-field__label">{label}</span>
      <div className="customer-detail-field__value">{children}</div>
    </div>
  );
}

export default function CustomerDetailDrawer({
  show,
  customer,
  onHide,
  onEdit,
  onDelete,
  onNewCollection,
  showEdit = true,
  showDelete = true,
  busy = false,
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

  if (!customer) {
    return null;
  }

  const statusVariant = getCustomerStatusVariant(customer);

  return (
    <Offcanvas
      show={show}
      onHide={onHide}
      placement={placement}
      className={`customer-detail-drawer ${
        placement === "bottom" ? "customer-detail-drawer--bottom" : ""
      }`}
    >
      <Offcanvas.Header closeButton className="border-bottom">
        <Offcanvas.Title>Müşteri Detayı</Offcanvas.Title>
      </Offcanvas.Header>

      <Offcanvas.Body className="d-flex flex-column gap-4">
        <div className="d-flex align-items-center flex-wrap gap-2">
          <span className="customer-detail-drawer__company fw-bold fs-5">
            {formatCustomerField(customer.companyName)}
          </span>
          <Badge bg={statusVariant}>{getCustomerStatusLabel(customer)}</Badge>
        </div>

        <div className="customer-detail-fields">
          <DetailField label="Yetkili Kişi">
            {formatCustomerField(customer.authorizedPerson)}
          </DetailField>

          <DetailField label="Telefon">
            {customer.phone ? (
              <CustomerPhoneActions phone={customer.phone} />
            ) : (
              "-"
            )}
          </DetailField>

          <DetailField label="Vergi No">
            {formatCustomerField(customer.taxNumber)}
          </DetailField>
          <DetailField label="Adres">
            {formatCustomerField(customer.address)}
          </DetailField>
          <DetailField label="Oluşturulma Tarihi">
            {formatCustomerDate(customer.createdAt)}
          </DetailField>
        </div>

        <div className="customer-detail-drawer__actions d-flex flex-column gap-2 mt-auto">
          <Button
            variant="success"
            className="customer-detail-drawer__action-btn touch-target w-100"
            disabled={busy}
            onClick={() => onNewCollection?.(customer)}
          >
            <i className="pi pi-wallet me-2" aria-hidden="true" />
            Yeni Tahsilat
          </Button>

          <div className="d-flex gap-2">
            {showEdit && (
              <Button
                variant="outline-warning"
                className="customer-detail-drawer__action-btn flex-fill touch-target"
                disabled={busy}
                onClick={() => onEdit?.(customer)}
              >
                <i className="pi pi-pencil me-2" aria-hidden="true" />
                Düzenle
              </Button>
            )}

            {showDelete && (
              <Button
                variant="outline-danger"
                className="customer-detail-drawer__action-btn flex-fill touch-target"
                disabled={busy}
                onClick={() => onDelete?.(customer)}
              >
                <i className="pi pi-trash me-2" aria-hidden="true" />
                Sil
              </Button>
            )}
          </div>
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
}
