"use client";

import { Modal, Button, Form, Spinner } from "react-bootstrap";
import CollectionFormFields from "@/components/forms/CollectionFormFields";
import useNewCollectionModal from "./useNewCollectionModal";

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
  const modal = useNewCollectionModal({
    show,
    onClose,
    onSubmit,
    submitting,
    loadingCustomers,
    mode,
    initialCollection,
    defaultCustomerId,
  });

  return (
    <Modal
      show={show}
      onHide={modal.handleClose}
      centered
      size="lg"
      backdrop="static"
      keyboard={!submitting}
      dialogClassName="responsive-modal"
    >
      <Form noValidate validated={modal.validated} onSubmit={modal.handleSubmit}>
        <Modal.Header closeButton={!submitting}>
          <Modal.Title>
            {modal.isEditMode ? "Tahsilat Düzenle" : "Yeni Tahsilat"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CollectionFormFields
            form={modal.form}
            validated={modal.validated}
            requiresMaturityDate={modal.requiresMaturityDate}
            isFormDisabled={modal.isFormDisabled}
            onChange={modal.handleChange}
            onPaymentTypeChange={modal.handlePaymentTypeChange}
            customers={customers}
            loadingCustomers={loadingCustomers}
            lockCustomerSelection={lockCustomerSelection}
            mailOrderCompanies={modal.mailOrderCompanies}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={modal.handleClose} disabled={submitting}>
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
