"use client";

import { useRef, useState } from "react";
import { Modal, Button, Form, Row, Col, Spinner, Alert, Table } from "react-bootstrap";
import {
  dryRunTripImport,
  importTripFromExcel,
} from "@/services/tripImportService";
import { formatNumber } from "@/utils/dashboardFormatters";
import { formatDate } from "@/utils/collectionUtils";

const SUMMARY_FIELDS = [
  { key: "totalRows", label: "Toplam Satır" },
  { key: "validRows", label: "Geçerli Satır" },
  { key: "duplicateRows", label: "Duplicate Satır" },
  { key: "invalidRows", label: "Hatalı Satır" },
];

export default function ImportTripModal({ show, onClose, onImported }) {
  const [collectionFile, setCollectionFile] = useState(null);
  const [expenseFile, setExpenseFile] = useState(null);
  const [dryRunResult, setDryRunResult] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [confirmOverlap, setConfirmOverlap] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState(null);
  const actionLockRef = useRef(false);

  const resetState = () => {
    setCollectionFile(null);
    setExpenseFile(null);
    setDryRunResult(null);
    setImportResult(null);
    setConfirmOverlap(false);
    setIsAnalyzing(false);
    setIsImporting(false);
    setError(null);
    actionLockRef.current = false;
  };

  const isBusy = isAnalyzing || isImporting;

  const handleClose = () => {
    if (isBusy) {
      return;
    }

    resetState();
    onClose();
  };

  const handleCollectionFileChange = (event) => {
    setCollectionFile(event.target.files?.[0] || null);
    setDryRunResult(null);
    setImportResult(null);
    setError(null);
  };

  const handleExpenseFileChange = (event) => {
    setExpenseFile(event.target.files?.[0] || null);
    setDryRunResult(null);
    setImportResult(null);
    setError(null);
  };

  const handleDryRun = async () => {
    if (!collectionFile || !expenseFile || actionLockRef.current || isBusy) {
      return;
    }

    actionLockRef.current = true;
    setIsAnalyzing(true);
    setError(null);
    setImportResult(null);
    setConfirmOverlap(false);

    try {
      const result = await dryRunTripImport(collectionFile, expenseFile);
      setDryRunResult(result);
    } catch (err) {
      setError(err.message || "Dosyalar analiz edilirken hata oluştu.");
      setDryRunResult(null);
    } finally {
      actionLockRef.current = false;
      setIsAnalyzing(false);
    }
  };

  const handleImport = async () => {
    if (
      !collectionFile ||
      !expenseFile ||
      !dryRunResult ||
      dryRunResult.validRows <= 0 ||
      (dryRunResult.hasOverlap && !confirmOverlap) ||
      actionLockRef.current ||
      isBusy
    ) {
      return;
    }

    actionLockRef.current = true;
    setIsImporting(true);
    setError(null);

    try {
      const result = await importTripFromExcel(collectionFile, expenseFile, confirmOverlap);
      setImportResult(result);
      await onImported?.(result);
    } catch (err) {
      setError(err.message || "İçe aktarma sırasında hata oluştu.");
    } finally {
      actionLockRef.current = false;
      setIsImporting(false);
    }
  };

  const activeResult = importResult || dryRunResult;
  const canImport =
    collectionFile &&
    expenseFile &&
    dryRunResult &&
    dryRunResult.validRows > 0 &&
    (!dryRunResult.hasOverlap || confirmOverlap);

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      size="xl"
      backdrop="static"
      keyboard={!isBusy}
      dialogClassName="responsive-modal"
    >
      <Modal.Header closeButton={!isBusy}>
        <Modal.Title>Excel'den Tur İçe Aktar</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Row className="g-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Tahsilat Dökümü (Form 1 / ARKA)</Form.Label>
              <Form.Control
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={handleCollectionFileChange}
                disabled={isBusy}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>Harcama Dökümü (Form 2 / ÖN)</Form.Label>
              <Form.Control
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={handleExpenseFileChange}
                disabled={isBusy}
              />
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
                <div className="import-summary-card border rounded p-3 bg-light">
                  <div className="row g-2">
                    <div className="col-6 col-md-3">
                      <div className="small text-muted">Satış Personeli</div>
                      <div className="fw-bold">{activeResult.salesmanName || "-"}</div>
                    </div>
                    <div className="col-6 col-md-3">
                      <div className="small text-muted">Plaka</div>
                      <div className="fw-bold">{activeResult.vehiclePlate || "-"}</div>
                    </div>
                    <div className="col-6 col-md-3">
                      <div className="small text-muted">Tarih Aralığı</div>
                      <div className="fw-bold">
                        {formatDate(activeResult.startDate)} - {formatDate(activeResult.endDate)}
                      </div>
                    </div>
                    <div className="col-6 col-md-3">
                      <div className="small text-muted">Gün Sayısı</div>
                      <div className="fw-bold">{activeResult.dayCount ?? "-"}</div>
                    </div>
                  </div>
                </div>
              </Col>

              <Col md={12}>
                <div className="row g-2">
                  {SUMMARY_FIELDS.map((field) => (
                    <div key={field.key} className="col-6 col-md-3">
                      <div className="import-summary-card border rounded p-3 h-100 bg-light">
                        <div className="small text-muted">{field.label}</div>
                        <div className="fw-bold fs-5">
                          {formatNumber(activeResult[field.key] ?? 0)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Col>

              {activeResult.hasOverlap && !importResult && (
                <Col md={12}>
                  <Alert variant="warning" className="mb-0">
                    <Form.Check
                      type="checkbox"
                      id="confirm-trip-overlap"
                      label="Bu satış personeli için aynı tarih aralığıyla çakışan aktif bir tur var. Yine de içe aktarmak istediğimi onaylıyorum."
                      checked={confirmOverlap}
                      onChange={(e) => setConfirmOverlap(e.target.checked)}
                    />
                  </Alert>
                </Col>
              )}

              {importResult && (
                <Col md={12}>
                  <Alert variant={importResult.importedRows > 0 ? "success" : "danger"} className="mb-0">
                    {importResult.importedRows > 0
                      ? `Tur oluşturuldu, ${formatNumber(importResult.importedRows)} tahsilat kaydı içe aktarıldı.`
                      : "İçe aktarma yapılamadı - aşağıdaki sorunları kontrol edin."}
                  </Alert>
                </Col>
              )}

              {activeResult.issues?.length > 0 && (
                <Col md={12}>
                  <h6 className="mb-2">Detay Listesi</h6>
                  <div
                    className="table-responsive overflow-x-auto responsive-table-wrapper"
                    style={{ "--table-min-width": "700px" }}
                  >
                    <div className="responsive-table-wrapper__inner">
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
                          {activeResult.issues.map((issue, index) => (
                            <tr key={`${issue.rowNumber || "0"}-${issue.issueType}-${index}`}>
                              <td>{issue.rowNumber ?? "-"}</td>
                              <td>{issue.customerName || "-"}</td>
                              <td>{issue.issueType}</td>
                              <td>{issue.message}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
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
              disabled={!collectionFile || !expenseFile || isBusy}
            >
              {isAnalyzing ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Analiz Ediliyor...
                </>
              ) : (
                "Analiz Et"
              )}
            </Button>

            <Button variant="primary" onClick={handleImport} disabled={!canImport || isBusy}>
              {isImporting ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  İçe Aktarılıyor...
                </>
              ) : (
                "İçe Aktar"
              )}
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
}
