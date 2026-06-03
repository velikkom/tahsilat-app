"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Modal, Button, Form, Row, Col, Spinner } from "react-bootstrap";

const COLLECTION_TYPES = [
  { value: "CASH", label: "Nakit" },
  { value: "BANK_TRANSFER", label: "Havale / EFT" },
  { value: "CHECK", label: "Çek" },
  { value: "PROMISSORY_NOTE", label: "Senet" },
  { value: "CREDIT_CARD", label: "Kredi Kartı" },
];

const createInitialForm = () => ({
  customerId: "",
  amount: "",
  paymentType: "CASH",
  collectionDate: new Date().toISOString().split("T")[0],
  maturityDate: "",
  description: "",
});

export default function NewCollectionModal({
  show,
  onClose,
  onSubmit,
  customers = [],
  submitting = false,
  loadingCustomers = false,
}) {
  const [validated, setValidated] = useState(false);
  const [form, setForm] = useState(createInitialForm());
  const submitLockRef = useRef(false);

  useEffect(() => {
    if (show) {
      setValidated(false);
      setForm(createInitialForm());
      submitLockRef.current = false;
    }
  }, [show]);

  useEffect(() => {
    if (!submitting) {
      submitLockRef.current = false;
    }
  }, [submitting]);

  const requiresMaturityDate = useMemo(() => {
    return (
      form.paymentType === "CHECK" || form.paymentType === "PROMISSORY_NOTE"
    );
  }, [form.paymentType]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePaymentTypeChange = (e) => {
    const value = e.target.value;

    setForm((prev) => ({
      ...prev,
      paymentType: value,
      maturityDate:
        value === "CHECK" || value === "PROMISSORY_NOTE"
          ? prev.maturityDate
          : "",
    }));
  };

  const handleClose = () => {
    if (submitting || submitLockRef.current) {
      return;
    }

    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting || submitLockRef.current) {
      return;
    }

    const formElement = e.currentTarget;

    if (!formElement.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    if (requiresMaturityDate && !form.maturityDate) {
      setValidated(true);
      return;
    }

    submitLockRef.current = true;

    const payload = {
      customerId: form.customerId,
      amount: Number(form.amount),
      paymentType: form.paymentType,
      collectionDate: form.collectionDate,
      maturityDate: requiresMaturityDate ? form.maturityDate : null,
      description: form.description,
    };

    await onSubmit(payload);
  };

  const isFormDisabled = submitting || loadingCustomers;

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      size="lg"
      backdrop="static"
      keyboard={!submitting}
    >
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Header closeButton={!submitting}>
          <Modal.Title>Yeni Tahsilat</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Row className="g-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label>Müşteri</Form.Label>

                <Form.Select
                  required
                  name="customerId"
                  value={form.customerId}
                  onChange={handleChange}
                  disabled={isFormDisabled}
                >
                  <option value="">
                    {loadingCustomers
                      ? "Müşteriler yükleniyor..."
                      : "Müşteri Seçiniz"}
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

            <Col md={6}>
              <Form.Group>
                <Form.Label>Ödeme Türü</Form.Label>

                <Form.Select
                  value={form.paymentType}
                  onChange={handlePaymentTypeChange}
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

            <Col md={6}>
              <Form.Group>
                <Form.Label>Tutar</Form.Label>

                <Form.Control
                  required
                  type="number"
                  min="1"
                  step="0.01"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  disabled={isFormDisabled}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Tahsilat Tarihi</Form.Label>

                <Form.Control
                  required
                  type="date"
                  name="collectionDate"
                  value={form.collectionDate}
                  onChange={handleChange}
                  disabled={isFormDisabled}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Vade Tarihi</Form.Label>

                <Form.Control
                  type="date"
                  name="maturityDate"
                  value={form.maturityDate}
                  onChange={handleChange}
                  disabled={!requiresMaturityDate || isFormDisabled}
                  required={requiresMaturityDate}
                />
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group>
                <Form.Label>Açıklama</Form.Label>

                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  disabled={isFormDisabled}
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={submitting}
          >
            İptal
          </Button>

          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Spinner size="sm" className="me-2" />
                Kaydediliyor...
              </>
            ) : (
              "Kaydet"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
