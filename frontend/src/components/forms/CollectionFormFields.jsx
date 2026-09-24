"use client";

import { Form, Row, Col } from "react-bootstrap";
import CustomerSelectField from "@/components/forms/CustomerSelectField";
import CollectionDateFields from "./CollectionDateFields";
import CollectionMetaFields from "./CollectionMetaFields";
import CollectionTypeAmountFields from "./CollectionTypeAmountFields";

export default function CollectionFormFields({
  form,
  validated,
  requiresMaturityDate,
  isFormDisabled,
  onChange,
  onPaymentTypeChange,
  customers,
  loadingCustomers,
  lockCustomerSelection = false,
  mailOrderCompanies = [],
}) {
  return (
    <Row className="g-3">
      <Col xs={12}>
        <CustomerSelectField
          value={form.customerId}
          onChange={onChange}
          customers={customers}
          loading={loadingCustomers}
          disabled={isFormDisabled || lockCustomerSelection}
          validated={validated}
        />
      </Col>
      <CollectionTypeAmountFields
        form={form}
        isFormDisabled={isFormDisabled}
        onChange={onChange}
        onPaymentTypeChange={onPaymentTypeChange}
      />
      <CollectionDateFields
        form={form}
        validated={validated}
        requiresMaturityDate={requiresMaturityDate}
        isFormDisabled={isFormDisabled}
        onChange={onChange}
      />
      <CollectionMetaFields
        form={form}
        isFormDisabled={isFormDisabled}
        onChange={onChange}
        mailOrderCompanies={mailOrderCompanies}
      />
      <Col xs={12}>
        <Form.Group>
          <Form.Label>Açıklama</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="description"
            value={form.description}
            onChange={onChange}
            disabled={isFormDisabled}
          />
        </Form.Group>
      </Col>
    </Row>
  );
}
