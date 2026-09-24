import { Button, Col, Form } from "react-bootstrap";

export default function TripsFilterForm({
  draftFilters,
  isRangeInvalid,
  onFieldChange,
  onApply,
  onClear,
}) {
  return (
    <div className="card border-0 shadow-sm ui-panel-card mb-3">
      <div className="card-body">
        <Form
          className="d-flex flex-wrap align-items-end gap-3"
          onSubmit={onApply}
        >
          <Col xs={12} sm="auto">
            <Form.Group>
              <Form.Label>Başlangıç Tarihi</Form.Label>
              <Form.Control
                type="date"
                name="fromDate"
                value={draftFilters.fromDate}
                onChange={onFieldChange}
                isInvalid={isRangeInvalid}
              />
            </Form.Group>
          </Col>
          <Col xs={12} sm="auto">
            <Form.Group>
              <Form.Label>Bitiş Tarihi</Form.Label>
              <Form.Control
                type="date"
                name="toDate"
                value={draftFilters.toDate}
                onChange={onFieldChange}
                isInvalid={isRangeInvalid}
              />
              {isRangeInvalid && (
                <div className="invalid-feedback d-block">
                  Bitiş tarihi başlangıç tarihinden önce olamaz.
                </div>
              )}
            </Form.Group>
          </Col>
          <Col xs={12} sm="auto" className="d-flex gap-2">
            <Button type="submit" variant="primary" disabled={isRangeInvalid}>
              Filtrele
            </Button>
            <Button type="button" variant="outline-secondary" onClick={onClear}>
              Temizle
            </Button>
          </Col>
        </Form>
      </div>
    </div>
  );
}
