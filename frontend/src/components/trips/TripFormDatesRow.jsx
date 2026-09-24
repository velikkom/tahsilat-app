import { Col, Form, Row } from "react-bootstrap";

export default function TripFormDatesRow({
  form,
  submitting,
  onDateChange,
  onFieldChange,
}) {
  return (
    <Row className="g-3">
      <Col xs={6} md={3}>
        <Form.Group>
          <Form.Label>Başlangıç Tarihi</Form.Label>
          <Form.Control
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={onDateChange}
            required
            disabled={submitting}
          />
        </Form.Group>
      </Col>
      <Col xs={6} md={3}>
        <Form.Group>
          <Form.Label>Bitiş Tarihi</Form.Label>
          <Form.Control
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={onDateChange}
            min={form.startDate}
            required
            disabled={submitting}
          />
        </Form.Group>
      </Col>
      <Col xs={6} md={3}>
        <Form.Group>
          <Form.Label>Araç Plakası</Form.Label>
          <Form.Control
            type="text"
            name="vehiclePlate"
            value={form.vehiclePlate}
            onChange={onFieldChange}
            disabled={submitting}
          />
        </Form.Group>
      </Col>
      <Col xs={6} md={3}>
        <Form.Group>
          <Form.Label>Teslim Alan</Form.Label>
          <Form.Control
            type="text"
            name="receiverName"
            value={form.receiverName}
            onChange={onFieldChange}
            disabled={submitting}
          />
        </Form.Group>
      </Col>
    </Row>
  );
}
