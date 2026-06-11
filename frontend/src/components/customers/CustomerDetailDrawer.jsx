"use client";

import { useEffect, useState } from "react";
import Offcanvas from "react-bootstrap/Offcanvas";
import {
  formatCustomerDate,
  formatCustomerField,
} from "@/utils/customerUtils";

function DetailField({ label, children }) {
  return (
    <div className="customer-detail-field">
      <span className="customer-detail-field__label">{label}</span>
      <div className="customer-detail-field__value">{children}</div>
    </div>
  );
}

export default function CustomerDetailDrawer({ show, customer, onHide }) {
  const [placement, setPlacement] = useState("end");

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 991px)");

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

  const isActive = customer.active !== false;

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
        <div className="d-flex align-items-center gap-2">
          <span
            className={`badge rounded-pill ${
              isActive ? "text-bg-primary" : "text-bg-secondary"
            }`}
          >
            {isActive ? "Aktif" : "Pasif"}
          </span>
        </div>

        <div className="customer-detail-fields">
          <DetailField label="Şirket Adı">
            {formatCustomerField(customer.companyName)}
          </DetailField>
          <DetailField label="Yetkili Kişi">
            {formatCustomerField(customer.authorizedPerson)}
          </DetailField>
          <DetailField label="Telefon">
            {customer.phone ? (
              <a href={`tel:${customer.phone}`}>{customer.phone}</a>
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
      </Offcanvas.Body>
    </Offcanvas>
  );
}
