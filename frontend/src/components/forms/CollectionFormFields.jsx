"use client";

import { Form, Row, Col } from "react-bootstrap";

const COLLECTION_TYPES = [
  { value: "CASH", label: "Nakit" },
  { value: "BANK_TRANSFER", label: "Havale / EFT" },
  { value: "CHECK", label: "Çek" },
  { value: "PROMISSORY_NOTE", label: "Senet" },
  { value: "CREDIT_CARD", label: "Kredi Kartı" },
];

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
}) {
  return (
    <Row className="g-3">
      <Col xs={12}>
        <Form.Group>
          <Form.Label>Müşteri</Form.Label>
          <Form.Select
            required
            name="customerId"
            value={form.customerId}
            onChange={onChange}
            disabled={isFormDisabled || lockCustomerSelection}
          >
            <option value="">
              {loadingCustomers ? "Müşteriler yükleniyor..." : "Müşteri Seçiniz"}
            </option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name || customer.companyName}
              </option>
            ))}
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            Müşteri seçiniz.
          </Form.Control.Feedback>
        </Form.Group>
      </Col>

      <Col xs={12} md={6} lg={4}>
        <Form.Group>
          <Form.Label>Ödeme Türü</Form.Label>
          <Form.Select
            value={form.paymentType}
            onChange={onPaymentTypeChange}
            disabled={isFormDisabled}
          >
            {COLLECTION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </Col>

      <Col xs={12} md={6} lg={4}>
        <Form.Group>
          <Form.Label>Tutar</Form.Label>
          <Form.Control
            required
            type="number"
            min="1"
            step="0.01"
            name="amount"
            value={form.amount}
            onChange={onChange}
            disabled={isFormDisabled}
          />
        </Form.Group>
      </Col>

      <Col xs={12} md={6} lg={4}>
        <Form.Group>
          <Form.Label>Tahsilat Tarihi</Form.Label>
          <Form.Control
            required
            type="date"
            name="collectionDate"
            value={form.collectionDate}
            onChange={onChange}
            disabled={isFormDisabled}
          />
        </Form.Group>
      </Col>

      <Col xs={12} md={6} lg={4}>
        <Form.Group>
          <Form.Label>Vade Tarihi</Form.Label>
          <Form.Control
            type="date"
            name="maturityDate"
            value={form.maturityDate}
            onChange={onChange}
            disabled={!requiresMaturityDate || isFormDisabled}
            required={requiresMaturityDate}
          />
          {requiresMaturityDate && validated && !form.maturityDate && (
            <div className="invalid-feedback d-block">
              Vade tarihi zorunludur.
            </div>
          )}
        </Form.Group>
      </Col>

      <Col xs={12} md={6} lg={3}>
        <Form.Group>
          <Form.Label>Tahsilat Makbuz No</Form.Label>
          <Form.Control
            type="text"
            name="receiptNumber"
            value={form.receiptNumber}
            onChange={onChange}
            disabled={isFormDisabled}
          />
        </Form.Group>
      </Col>

      <Col xs={12} md={6} lg={3}>
        <Form.Group>
          <Form.Label>Mikro Kay.No SR</Form.Label>
          <Form.Control
            type="text"
            name="mikroSr"
            value={form.mikroSr}
            onChange={onChange}
            disabled={isFormDisabled}
          />
        </Form.Group>
      </Col>

      <Col xs={12} md={6} lg={3}>
        <Form.Group>
          <Form.Label>Mikro Kay.No NO</Form.Label>
          <Form.Control
            type="text"
            name="mikroNo"
            value={form.mikroNo}
            onChange={onChange}
            disabled={isFormDisabled}
          />
        </Form.Group>
      </Col>

      <Col xs={12} md={6} lg={3}>
        <Form.Group>
          <Form.Label>Banka Adı</Form.Label>
          <Form.Control
            type="text"
            name="bankName"
            value={form.bankName}
            onChange={onChange}
            disabled={isFormDisabled}
          />
        </Form.Group>
      </Col>

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
