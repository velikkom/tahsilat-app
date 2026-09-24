"use client";

import { useEffect, useState } from "react";
import { Form, Modal } from "react-bootstrap";
import CustomerCreateFormFields from "./CustomerCreateFormFields";
import CustomerCreateModalFooter from "./CustomerCreateModalFooter";
import {
  EMPTY_FORM,
  buildCustomerSubmitPayload,
  mapCustomerToForm,
} from "./customerCreateForm";

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

    onSubmit?.(buildCustomerSubmitPayload(form));
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
          <CustomerCreateFormFields
            form={form}
            isEditMode={isEditMode}
            submitting={submitting}
            onChange={handleChange}
          />
        </Modal.Body>
        <CustomerCreateModalFooter
          isEditMode={isEditMode}
          submitting={submitting}
          onClose={onClose}
        />
      </Form>
    </Modal>
  );
}
