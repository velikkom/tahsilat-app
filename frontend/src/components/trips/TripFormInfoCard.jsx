import { Card } from "react-bootstrap";

import TripFormDatesRow from "@/components/trips/TripFormDatesRow";
import TripFormKmFields from "@/components/trips/TripFormKmFields";
import TripFormMoneyFields from "@/components/trips/TripFormMoneyFields";
import { MAX_TRIP_DAYS } from "@/utils/tripUtils";

export default function TripFormInfoCard({
  form,
  submitting,
  rangeTooLong,
  dayCount,
  onDateChange,
  onFieldChange,
}) {
  return (
    <Card className="border-0 shadow-sm ui-panel-card">
      <Card.Body>
        <h5 className="fw-bold mb-3">Tur Bilgileri</h5>
        <TripFormDatesRow
          form={form}
          submitting={submitting}
          onDateChange={onDateChange}
          onFieldChange={onFieldChange}
        />
        {(rangeTooLong || dayCount === 0) && (
          <div className="alert alert-danger mt-3 mb-0">
            {rangeTooLong
              ? `Tur süresi en fazla ${MAX_TRIP_DAYS} gün olabilir. Şu an ${dayCount} gün seçili.`
              : "Bitiş tarihi başlangıç tarihinden önce olamaz."}
          </div>
        )}
        <TripFormKmFields
          form={form}
          submitting={submitting}
          onFieldChange={onFieldChange}
        />
        <TripFormMoneyFields
          form={form}
          submitting={submitting}
          onFieldChange={onFieldChange}
        />
      </Card.Body>
    </Card>
  );
}
