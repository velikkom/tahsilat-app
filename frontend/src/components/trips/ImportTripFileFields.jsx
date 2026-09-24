import { Col, Form } from "react-bootstrap";

export default function ImportTripFileFields({
  isBusy,
  onCollectionFileChange,
  onExpenseFileChange,
}) {
  return (
    <>
      <Col md={6}>
        <Form.Group>
          <Form.Label>Tahsilat Dökümü (Form 1 / ARKA)</Form.Label>
          <Form.Control
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={onCollectionFileChange}
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
            onChange={onExpenseFileChange}
            disabled={isBusy}
          />
        </Form.Group>
      </Col>
    </>
  );
}
