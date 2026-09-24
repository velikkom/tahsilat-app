import { Accordion } from "react-bootstrap";
import { formatCurrency } from "@/utils/dashboardFormatters";
import CustomerList from "./CustomerList";

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

export default function MailOrderCompanyAccordion({ companies }) {
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
