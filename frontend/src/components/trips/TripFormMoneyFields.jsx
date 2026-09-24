import { Row } from "react-bootstrap";

import TripFormNumberField from "@/components/trips/TripFormNumberField";

export default function TripFormMoneyFields({ form, submitting, onFieldChange }) {
  return (
    <Row className="g-3 mt-1">
      <TripFormNumberField
        label="Aldığı Haftalık"
        name="weeklyAllowance"
        value={form.weeklyAllowance}
        onChange={onFieldChange}
        disabled={submitting}
        step="0.01"
      />
      <TripFormNumberField
        label="Primden Düşülecek Tahsilat"
        name="commissionExcludedAmount"
        value={form.commissionExcludedAmount}
        onChange={onFieldChange}
        disabled={submitting}
        step="0.01"
      />
      <TripFormNumberField
        label="Aldığı Prim"
        name="commissionReceived"
        value={form.commissionReceived}
        onChange={onFieldChange}
        disabled={submitting}
        step="0.01"
      />
      <TripFormNumberField
        label="Fazladan Alınan"
        name="extraReceived"
        value={form.extraReceived}
        onChange={onFieldChange}
        disabled={submitting}
        step="0.01"
      />
      <TripFormNumberField
        label="Aldığı AGİ"
        name="agiReceived"
        value={form.agiReceived}
        onChange={onFieldChange}
        disabled={submitting}
        step="0.01"
      />
    </Row>
  );
}
