import { Col, Form } from "react-bootstrap";

export default function TripFormNumberField({
  label,
  name,
  value,
  onChange,
  disabled,
  step,
}) {
  return (
    <Col xs={6} md={3}>
      <Form.Group>
        <Form.Label>{label}</Form.Label>
        <Form.Control
          type="number"
          min="0"
          step={step}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      </Form.Group>
    </Col>
  );
}
