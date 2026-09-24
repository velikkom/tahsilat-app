"use client";

import { Modal, Row, Col, Alert } from "react-bootstrap";
import ImportCollectionsFileFields from "./ImportCollectionsFileFields";
import ImportCollectionsIssuesTable from "./ImportCollectionsIssuesTable";
import ImportCollectionsModalFooter from "./ImportCollectionsModalFooter";
import ImportCollectionsResultAlert from "./ImportCollectionsResultAlert";
import ImportCollectionsSummary from "./ImportCollectionsSummary";
import useImportCollectionsModal from "./useImportCollectionsModal";

export default function ImportCollectionsModal({ show, onClose, onImported }) {
  const modal = useImportCollectionsModal({ onClose, onImported });
  const activeResult = modal.importResult || modal.dryRunResult;

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
        <Modal.Title>Excel Tahsilat Import</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="g-3">
          <ImportCollectionsFileFields
            isBusy={modal.isBusy}
            onFileChange={modal.handleFileChange}
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
              <ImportCollectionsSummary activeResult={activeResult} />
              <ImportCollectionsResultAlert importResult={modal.importResult} />
              {activeResult.issues?.length > 0 && (
                <ImportCollectionsIssuesTable issues={activeResult.issues} />
              )}
            </>
          )}
        </Row>
      </Modal.Body>
      <ImportCollectionsModalFooter {...modal} />
    </Modal>
  );
}
