"use client";

import { useRef, useState } from "react";
import { Modal, Button, Form, Row, Col, Spinner, Alert, Table } from "react-bootstrap";
import {
  dryRunCollectionImport,
  importCollectionsFromExcel,
} from "@/services/collectionImportService";
import { formatNumber } from "@/utils/dashboardFormatters";

const SUMMARY_FIELDS = [
  { key: "totalRows", label: "Toplam Satır" },
  { key: "validRows", label: "Geçerli Satır" },
  { key: "duplicateRows", label: "Duplicate Satır" },
  { key: "invalidRows", label: "Hatalı Satır" },
];

export default function ImportCollectionsModal({
  show,
  onClose,
  onImported,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dryRunResult, setDryRunResult] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState(null);
  const actionLockRef = useRef(false);

  const resetState = () => {
    setSelectedFile(null);
    setDryRunResult(null);
    setImportResult(null);
    setIsAnalyzing(false);
    setIsImporting(false);
    setError(null);
    actionLockRef.current = false;
  };

  const handleClose = () => {
    if (isAnalyzing || isImporting) {
      return;
    }

    resetState();
    onClose();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;

    setSelectedFile(file);
    setDryRunResult(null);
    setImportResult(null);
    setError(null);
  };

  const handleDryRun = async () => {
    if (!selectedFile || actionLockRef.current || isAnalyzing || isImporting) {
      return;
    }

    actionLockRef.current = true;
    setIsAnalyzing(true);
    setError(null);
    setImportResult(null);

    try {
      const result = await dryRunCollectionImport(selectedFile);
      setDryRunResult(result);
    } catch (err) {
      setError(err.message || "Dosya analiz edilirken hata oluştu.");
      setDryRunResult(null);
    } finally {
      actionLockRef.current = false;
      setIsAnalyzing(false);
    }
  };

  const handleImport = async () => {
    if (
      !selectedFile ||
      !dryRunResult ||
      dryRunResult.validRows <= 0 ||
      actionLockRef.current ||
      isAnalyzing ||
      isImporting
    ) {
      return;
    }

    actionLockRef.current = true;
    setIsImporting(true);
    setError(null);

    try {
      const result = await importCollectionsFromExcel(selectedFile);
      setImportResult(result);
      await onImported?.(result);
    } catch (err) {
      setError(err.message || "Import sırasında hata oluştu.");
    } finally {
      actionLockRef.current = false;
      setIsImporting(false);
    }
  };

  const activeResult = importResult || dryRunResult;
  const isBusy = isAnalyzing || isImporting;

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      size="xl"
      backdrop="static"
      keyboard={!isBusy}
    >
      <Modal.Header closeButton={!isBusy}>
        <Modal.Title>Excel Tahsilat Import</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Row className="g-3">
          <Col md={12}>
            <Form.Group>
              <Form.Label>Excel Dosyası (.xlsx)</Form.Label>
              <Form.Control
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={handleFileChange}
                disabled={isBusy}
              />
              <Form.Text className="text-muted">
                Kolonlar: Tahsilat Tarihi, Müşteri, Ödeme Türü, Tutar, Vade Tarihi
              </Form.Text>
            </Form.Group>
          </Col>

          {error && (
            <Col md={12}>
              <Alert variant="danger" className="mb-0">
                {error}
              </Alert>
            </Col>
          )}

          {activeResult && (
            <>
              <Col md={12}>
                <div className="row g-2">
                  {SUMMARY_FIELDS.map((field) => (
                    <div key={field.key} className="col-6 col-md-3">
                      <div className="border rounded p-3 h-100 bg-light">
                        <div className="small text-muted">{field.label}</div>
                        <div className="fw-bold fs-5">
                          {formatNumber(activeResult[field.key] ?? 0)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Col>

              {importResult && (
                <Col md={12}>
                  <Alert variant="success" className="mb-0">
                    {formatNumber(importResult.importedRows)} kayıt başarıyla
                    içe aktarıldı.
                  </Alert>
                </Col>
              )}

              {activeResult.issues?.length > 0 && (
                <Col md={12}>
                  <h6 className="mb-2">Detay Listesi</h6>
                  <div className="table-responsive">
                    <Table striped bordered hover size="sm" className="mb-0">
                      <thead>
                        <tr>
                          <th>Satır</th>
                          <th>Müşteri</th>
                          <th>Tip</th>
                          <th>Mesaj</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeResult.issues.map((issue) => (
                          <tr key={`${issue.rowNumber}-${issue.issueType}-${issue.message}`}>
                            <td>{issue.rowNumber}</td>
                            <td>{issue.customerName || "-"}</td>
                            <td>{issue.issueType}</td>
                            <td>{issue.message}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Col>
              )}
            </>
          )}
        </Row>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={isBusy}>
          Kapat
        </Button>

        {!importResult && (
          <>
            <Button
              variant="outline-primary"
              onClick={handleDryRun}
              disabled={!selectedFile || isBusy}
            >
              {isAnalyzing ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Analiz Ediliyor...
                </>
              ) : (
                "Analiz Et (Dry Run)"
              )}
            </Button>

            <Button
              variant="primary"
              onClick={handleImport}
              disabled={
                !selectedFile ||
                !dryRunResult ||
                dryRunResult.validRows <= 0 ||
                isBusy
              }
            >
              {isImporting ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  İçe Aktarılıyor...
                </>
              ) : (
                "Import Et"
              )}
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
}
