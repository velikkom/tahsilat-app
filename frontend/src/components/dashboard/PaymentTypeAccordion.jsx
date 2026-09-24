"use client";

import { Accordion } from "react-bootstrap";
import { formatCurrency } from "@/utils/dashboardFormatters";
import { buildPaymentTypeSections } from "@/utils/paymentTypeAccordion";
import CustomerList from "./CustomerList";
import MailOrderCompanyAccordion from "./MailOrderCompanyAccordion";

export default function PaymentTypeAccordion({ data }) {
  const sections = buildPaymentTypeSections(data);

  if (sections.length === 0) {
    return <p className="text-muted mb-0">Bu ay ödeme türü kaydı yok.</p>;
  }

  return (
    <Accordion flush className="payment-type-accordion">
      {sections.map((section) => (
        <Accordion.Item
          key={section.paymentType}
          eventKey={section.paymentType}
          id={section.collapseId}
          className="payment-type-accordion__item"
        >
          <Accordion.Header className="payment-type-accordion__header">
            <span className="d-flex justify-content-between align-items-center w-100 pe-3 gap-3">
              <span>{section.label}</span>
              <span className="fw-semibold text-nowrap">
                {formatCurrency(section.totalAmount)}
              </span>
            </span>
          </Accordion.Header>
          <Accordion.Body className="payment-type-accordion__body">
            {section.companies.length === 0 ? (
              <p className="text-muted small mb-0">
                Bu ay bu ödeme türünde firma yok.
              </p>
            ) : section.paymentType === "MAIL_ORDER" ? (
              <MailOrderCompanyAccordion companies={section.companies} />
            ) : (
              <CustomerList customers={section.companies} />
            )}
          </Accordion.Body>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}
