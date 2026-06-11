"use client";

import { useEffect, useState } from "react";
import { Button, Form, Modal, Spinner } from "react-bootstrap";

const EMPTY_FORM = {
  companyName: "",
  authorizedPerson: "",
  phone: "",
  taxNumber: "",
  address: "",
};

function mapCustomerToForm(customer) {
  return {
    companyName: customer?.companyName || "",
    authorizedPerson: customer?.authorizedPerson || "",
    phone: customer?.phone || "",
    taxNumber: customer?.taxNumber || "",
    address: customer?.address || "",
  };
}

export default function CustomerCreateModal({
  show,
  mode = "create",
  customer = null,
  submitting = false,
  onClose,
  onSubmit,
}) {
  const [validated, setValidated] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const isEditMode = mode === "edit";

  useEffect(() => {
    if (show) {
      setValidated(false);
      setForm(
        isEditMode && customer ? mapCustomerToForm(customer) : EMPTY_FORM
      );
    }
  }, [show, isEditMode, customer]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const formElement = event.currentTarget;

    if (!formElement.checkValidity()) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    onSubmit?.({
      companyName: form.companyName.trim(),
      authorizedPerson: form.authorizedPerson.trim(),
      phone: form.phone.trim(),
      taxNumber: form.taxNumber.trim(),
      address: form.address.trim(),
    });
  }

  return (
    <Modal show={show} onHide={onClose} centered backdrop="static">
      <Modal.Header closeButton={!submitting}>
        <Modal.Title>
          {isEditMode ? "Müşteriyi Düzenle" : "Yeni Müşteri"}
        </Modal.Title>
      </Modal.Header>

      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Body className="d-flex flex-column gap-3">
          <Form.Group controlId="customer-company-name">
            <Form.Label>Şirket Adı</Form.Label>
            <Form.Control
              name="companyName"
              value={form.companyName}
              onChange={handleChange}
              required
              disabled={submitting}
            />
            <Form.Control.Feedback type="invalid">
              Şirket adı zorunludur.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="customer-authorized-person">
            <Form.Label>Yetkili Kişi</Form.Label>
            <Form.Control
              name="authorizedPerson"
              value={form.authorizedPerson}
              onChange={handleChange}
              required={isEditMode}
              disabled={submitting}
            />
            {isEditMode && (
              <Form.Control.Feedback type="invalid">
                Yetkili kişi zorunludur.
              </Form.Control.Feedback>
            )}
          </Form.Group>

          <Form.Group controlId="customer-phone">
            <Form.Label>Telefon</Form.Label>
            <Form.Control
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required={isEditMode}
              disabled={submitting}
            />
            {isEditMode && (
              <Form.Control.Feedback type="invalid">
                Telefon zorunludur.
              </Form.Control.Feedback>
            )}
          </Form.Group>

          <Form.Group controlId="customer-tax-number">
            <Form.Label>Vergi No</Form.Label>
            <Form.Control
              name="taxNumber"
              value={form.taxNumber}
              onChange={handleChange}
              disabled={submitting}
            />
          </Form.Group>

          <Form.Group controlId="customer-address">
            <Form.Label>Adres</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="address"
              value={form.address}
              onChange={handleChange}
              disabled={submitting}
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={onClose}
            disabled={submitting}
          >
            İptal
          </Button>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Spinner
                  animation="border"
                  size="sm"
                  className="me-2"
                  aria-hidden="true"
                />
                Kaydediliyor...
              </>
            ) : isEditMode ? (
              "Güncelle"
            ) : (
              "Kaydet"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
