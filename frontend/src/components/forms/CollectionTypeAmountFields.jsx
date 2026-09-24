import { Form, Col } from "react-bootstrap";
import { COLLECTION_TYPES } from "./collectionFormTypes";

export default function CollectionTypeAmountFields({
  form,
  isFormDisabled,
  onChange,
  onPaymentTypeChange,
}) {
  return (
    <>
      <Col xs={12} md={6} lg={4}>
        <Form.Group>
          <Form.Label>Ödeme Türü</Form.Label>
          <Form.Select
            value={form.paymentType}
            onChange={onPaymentTypeChange}
            disabled={isFormDisabled}
          >
            {COLLECTION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </Col>
      <Col xs={12} md={6} lg={4}>
        <Form.Group>
          <Form.Label>Tutar</Form.Label>
          <Form.Control
            required
            type="number"
            min="1"
            step="0.01"
            name="amount"
            value={form.amount}
            onChange={onChange}
            disabled={isFormDisabled}
          />
        </Form.Group>
      </Col>
    </>
  );
}
