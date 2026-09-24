import { Col, Form } from "react-bootstrap";

export default function ImportCollectionsFileFields({ isBusy, onFileChange }) {
  return (
    <Col md={12}>
      <Form.Group>
        <Form.Label>Excel Dosyası (.xlsx)</Form.Label>
        <Form.Control
          type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={onFileChange}
          disabled={isBusy}
        />
        <Form.Text className="text-muted">
          Kolonlar: Tahsilat Tarihi, Müşteri, Ödeme Türü, Tutar, Vade Tarihi
        </Form.Text>
      </Form.Group>
    </Col>
  );
}
