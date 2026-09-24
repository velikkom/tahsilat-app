import { Row } from "react-bootstrap";

import TripFormNumberField from "@/components/trips/TripFormNumberField";

export default function TripFormKmFields({ form, submitting, onFieldChange }) {
  return (
    <Row className="g-3 mt-1">
      <TripFormNumberField
        label="Denizli Çıkış KM"
        name="denizliExitKm"
        value={form.denizliExitKm}
        onChange={onFieldChange}
        disabled={submitting}
      />
      <TripFormNumberField
        label="Denizli Giriş KM"
        name="denizliEntryKm"
        value={form.denizliEntryKm}
        onChange={onFieldChange}
        disabled={submitting}
      />
      <TripFormNumberField
        label="Çıkış Yakıt Tutarı"
        name="exitFuelAmount"
        value={form.exitFuelAmount}
        onChange={onFieldChange}
        disabled={submitting}
        step="0.01"
      />
      <TripFormNumberField
        label="Yol Yakıt Tutarı"
        name="tripFuelAmount"
        value={form.tripFuelAmount}
        onChange={onFieldChange}
        disabled={submitting}
        step="0.01"
      />
    </Row>
  );
}
