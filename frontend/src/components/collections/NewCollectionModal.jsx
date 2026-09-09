"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import CollectionFormFields from "@/components/forms/CollectionFormFields";
import useCustomers from "@/hooks/useCustomers";

const createInitialForm = (defaultCustomerId = "") => ({
  customerId: defaultCustomerId,
  amount: "",
  paymentType: "CASH",
  collectionDate: new Date().toISOString().split("T")[0],
  maturityDate: "",
  description: "",
  receiptNumber: "",
  mikroSr: "",
  mikroNo: "",
  bankName: "",
});

const mapCollectionToForm = (collection) => ({
  customerId: collection?.customerId || "",
  amount: collection?.amount != null ? String(collection.amount) : "",
  paymentType: collection?.paymentType || "CASH",
  collectionDate: collection?.collectionDate || "",
  maturityDate: collection?.maturityDate || "",
  description: collection?.description || "",
  receiptNumber: collection?.receiptNumber || "",
  mikroSr: collection?.mikroSr || "",
  mikroNo: collection?.mikroNo || "",
  bankName: collection?.bankName || "",
});

export default function NewCollectionModal({
  show,
  onClose,
  onSubmit,
  customers = [],
  submitting = false,
  loadingCustomers = false,
  mode = "create",
  initialCollection = null,
  defaultCustomerId = "",
  lockCustomerSelection = false,
}) {
  const { refreshCustomers } = useCustomers();
  const [validated, setValidated] = useState(false);
  const [form, setForm] = useState(createInitialForm());
  const submitLockRef = useRef(false);
  const isEditMode = mode === "edit";

  useEffect(() => {
    if (show) {
      refreshCustomers({ silent: true });
    }
  }, [show, refreshCustomers]);

  useEffect(() => {
    if (show) {
      setValidated(false);
      submitLockRef.current = false;
      setForm(
        isEditMode && initialCollection
          ? mapCollectionToForm(initialCollection)
          : createInitialForm(defaultCustomerId)
      );
    }
  }, [show, isEditMode, initialCollection?.id, defaultCustomerId]);

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
    setForm((prev) => ({ ...prev, [name]: value }));
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

    await onSubmit({
      customerId: form.customerId,
      amount: Number(form.amount),
      paymentType: form.paymentType,
      collectionDate: form.collectionDate,
      maturityDate: requiresMaturityDate ? form.maturityDate : null,
      description: form.description,
      receiptNumber: form.receiptNumber || null,
      mikroSr: form.mikroSr || null,
      mikroNo: form.mikroNo || null,
      bankName: form.bankName || null,
    });
  };

  const isFormDisabled = submitting || loadingCustomers;
  const modalTitle = isEditMode ? "Tahsilat Düzenle" : "Yeni Tahsilat";

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      size="lg"
      backdrop="static"
      keyboard={!submitting}
      dialogClassName="responsive-modal"
    >
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Header closeButton={!submitting}>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <CollectionFormFields
            form={form}
            validated={validated}
            requiresMaturityDate={requiresMaturityDate}
            isFormDisabled={isFormDisabled}
            onChange={handleChange}
            onPaymentTypeChange={handlePaymentTypeChange}
            customers={customers}
            loadingCustomers={loadingCustomers}
            lockCustomerSelection={lockCustomerSelection}
          />
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={submitting}>
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
