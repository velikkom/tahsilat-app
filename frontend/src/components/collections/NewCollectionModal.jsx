"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";
import CollectionFormFields from "@/components/forms/CollectionFormFields";
import useCustomers from "@/hooks/useCustomers";
import { getMailOrderCompanies } from "@/services/collectionService";
import {
  isKnownMailOrderCompany,
  toTurkishUpperCase,
} from "@/utils/collectionUtils";

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
  mailOrderCompany: "",
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
  mailOrderCompany: collection?.mailOrderCompany || "",
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
  const [mailOrderCompanies, setMailOrderCompanies] = useState([]);
  const submitLockRef = useRef(false);
  const isEditMode = mode === "edit";

  useEffect(() => {
    if (!show) {
      return;
    }

    refreshCustomers({ silent: true });

    let cancelled = false;

    getMailOrderCompanies()
      .then((names) => {
        if (!cancelled && Array.isArray(names)) {
          setMailOrderCompanies(names);
        }
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      cancelled = true;
    };
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
      mailOrderCompany: value === "MAIL_ORDER" ? prev.mailOrderCompany : "",
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

    const mailOrderCompany = toTurkishUpperCase(form.mailOrderCompany).trim();

    if (form.paymentType === "MAIL_ORDER" && mailOrderCompany) {
      const known = isKnownMailOrderCompany(
        mailOrderCompany,
        mailOrderCompanies
      );

      if (!known) {
        const confirmation = await Swal.fire({
          icon: "question",
          title:
            mailOrderCompanies.length === 0
              ? "İlk mailorder firması"
              : "Firma kayıtlı değil",
          text: `"${mailOrderCompany}" kayıtlı değil. Kaydedeyim mi?`,
          showCancelButton: true,
          confirmButtonText: "Evet, kaydet",
          cancelButtonText: "Vazgeç",
          reverseButtons: true,
          focusCancel: true,
        });

        if (!confirmation.isConfirmed) {
          return;
        }
      }
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
      mailOrderCompany:
        form.paymentType === "MAIL_ORDER" ? mailOrderCompany || null : null,
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
            mailOrderCompanies={mailOrderCompanies}
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
