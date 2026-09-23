"use client";

import { Accordion, ListGroup } from "react-bootstrap";
import { formatCurrency } from "@/utils/dashboardFormatters";
import { buildPaymentTypeSections } from "@/utils/paymentTypeAccordion";

function CompanyAmountLabel({ company }) {
  return (
    <span className="d-flex justify-content-between align-items-center w-100 pe-3 gap-3">
      <span className="min-width-0">
        <span className="text-break">{company.companyName}</span>
        <span className="text-muted small ms-2">{company.count} işlem</span>
      </span>
      <span className="fw-semibold text-nowrap">
        {formatCurrency(company.totalAmount)}
      </span>
    </span>
  );
}

function CustomerList({ customers }) {
  if (!customers?.length) {
    return (
      <p className="text-muted small mb-0">
        Bu firmadan geçen müşteri ödemesi yok.
      </p>
    );
  }

  return (
    <ListGroup variant="flush" className="payment-type-accordion__companies">
      {customers.map((customer) => (
        <ListGroup.Item
          key={customer.companyName}
          className="d-flex justify-content-between align-items-center gap-3 px-0"
        >
          <span className="min-width-0">
            <span className="text-break">{customer.companyName}</span>
            <span className="text-muted small ms-2">{customer.count} işlem</span>
          </span>
          <span className="fw-semibold text-nowrap">
            {formatCurrency(customer.totalAmount)}
          </span>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
}

function MailOrderCompanyAccordion({ companies }) {
  return (
    <Accordion
      flush
      className="payment-type-accordion payment-type-accordion--nested"
    >
      {companies.map((company) => (
        <Accordion.Item
          key={company.companyName}
          eventKey={company.companyName}
          className="payment-type-accordion__item"
        >
          <Accordion.Header className="payment-type-accordion__header">
            <CompanyAmountLabel company={company} />
          </Accordion.Header>
          <Accordion.Body className="payment-type-accordion__body">
            <CustomerList customers={company.customers} />
          </Accordion.Body>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}

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
