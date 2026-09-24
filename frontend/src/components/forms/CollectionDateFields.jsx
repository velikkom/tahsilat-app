import { Form, Col } from "react-bootstrap";

export default function CollectionDateFields({
  form,
  validated,
  requiresMaturityDate,
  isFormDisabled,
  onChange,
}) {
  return (
    <>
      <Col xs={12} md={6} lg={4}>
        <Form.Group>
          <Form.Label>Tahsilat Tarihi</Form.Label>
          <Form.Control
            required
            type="date"
            name="collectionDate"
            value={form.collectionDate}
            onChange={onChange}
            disabled={isFormDisabled}
          />
        </Form.Group>
      </Col>
      <Col xs={12} md={6} lg={4}>
        <Form.Group>
          <Form.Label>Vade Tarihi</Form.Label>
          <Form.Control
            type="date"
            name="maturityDate"
            value={form.maturityDate}
            onChange={onChange}
            disabled={!requiresMaturityDate || isFormDisabled}
            required={requiresMaturityDate}
          />
          {requiresMaturityDate && validated && !form.maturityDate && (
            <div className="invalid-feedback d-block">
              Vade tarihi zorunludur.
            </div>
          )}
        </Form.Group>
      </Col>
    </>
  );
}
