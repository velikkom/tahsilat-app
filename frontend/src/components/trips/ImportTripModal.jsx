"use client";

import { Alert, Col, Modal, Row } from "react-bootstrap";

import ImportTripFileFields from "@/components/trips/ImportTripFileFields";
import ImportTripIssuesTable from "@/components/trips/ImportTripIssuesTable";
import ImportTripModalFooter from "@/components/trips/ImportTripModalFooter";
import ImportTripResultAlerts from "@/components/trips/ImportTripResultAlerts";
import ImportTripSummary from "@/components/trips/ImportTripSummary";
import importTripCanImport from "@/components/trips/importTripCanImport";
import useImportTripModal from "@/components/trips/useImportTripModal";

export default function ImportTripModal({ show, onClose, onImported }) {
  const modal = useImportTripModal({ onClose, onImported });
  const activeResult = modal.importResult || modal.dryRunResult;
  const canImport = importTripCanImport(modal);

  return (
    <Modal
      show={show}
      onHide={modal.handleClose}
      centered
      size="xl"
      backdrop="static"
      keyboard={!modal.isBusy}
      dialogClassName="responsive-modal"
    >
      <Modal.Header closeButton={!modal.isBusy}>
        <Modal.Title>Excel&apos;den Tur İçe Aktar</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="g-3">
          <ImportTripFileFields
            isBusy={modal.isBusy}
            onCollectionFileChange={modal.handleCollectionFileChange}
            onExpenseFileChange={modal.handleExpenseFileChange}
          />
          {modal.error && (
            <Col md={12}>
              <Alert variant="danger" className="mb-0">
                {modal.error}
              </Alert>
            </Col>
          )}
          {activeResult && (
            <>
              <ImportTripSummary activeResult={activeResult} />
              <ImportTripResultAlerts
                activeResult={activeResult}
                importResult={modal.importResult}
                confirmOverlap={modal.confirmOverlap}
                onConfirmOverlapChange={modal.setConfirmOverlap}
              />
              {activeResult.issues?.length > 0 && (
                <ImportTripIssuesTable issues={activeResult.issues} />
              )}
            </>
          )}
        </Row>
      </Modal.Body>
      <ImportTripModalFooter {...modal} canImport={canImport} />
    </Modal>
  );
}
