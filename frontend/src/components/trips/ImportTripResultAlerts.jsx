import { Alert, Col, Form } from "react-bootstrap";

import { formatNumber } from "@/utils/dashboardFormatters";

export default function ImportTripResultAlerts({
  activeResult,
  importResult,
  confirmOverlap,
  onConfirmOverlapChange,
}) {
  return (
    <>
      {activeResult.hasOverlap && !importResult && (
        <Col md={12}>
          <Alert variant="warning" className="mb-0">
            <Form.Check
              type="checkbox"
              id="confirm-trip-overlap"
              label="Bu satış personeli için aynı tarih aralığıyla çakışan aktif bir tur var. Yine de içe aktarmak istediğimi onaylıyorum."
              checked={confirmOverlap}
              onChange={(e) => onConfirmOverlapChange(e.target.checked)}
            />
          </Alert>
        </Col>
      )}
      {importResult && (
        <Col md={12}>
          <Alert
            variant={importResult.importedRows > 0 ? "success" : "danger"}
            className="mb-0"
          >
            {importResult.importedRows > 0
              ? `Tur oluşturuldu, ${formatNumber(importResult.importedRows)} tahsilat kaydı içe aktarıldı.`
              : "İçe aktarma yapılamadı - aşağıdaki sorunları kontrol edin."}
          </Alert>
        </Col>
      )}
    </>
  );
}
