import { Alert, Col } from "react-bootstrap";
import { formatNumber } from "@/utils/dashboardFormatters";

export default function ImportCollectionsResultAlert({ importResult }) {
  if (!importResult) {
    return null;
  }

  return (
    <Col md={12}>
      <Alert variant="success" className="mb-0">
        {formatNumber(importResult.importedRows)} kayıt başarıyla
        içe aktarıldı.
      </Alert>
    </Col>
  );
}
