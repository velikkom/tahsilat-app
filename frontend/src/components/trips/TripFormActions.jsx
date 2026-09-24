import { Button, Spinner } from "react-bootstrap";

export default function TripFormActions({
  submitting,
  rangeTooLong,
  dayCount,
  onCancel,
}) {
  return (
    <div className="d-flex justify-content-end gap-2">
      <Button variant="secondary" onClick={onCancel} disabled={submitting}>
        İptal
      </Button>
      <Button
        variant="primary"
        type="submit"
        disabled={submitting || rangeTooLong || dayCount === 0}
      >
        {submitting ? (
          <>
            <Spinner size="sm" className="me-2" />
            Kaydediliyor...
          </>
        ) : (
          "Kaydet"
        )}
      </Button>
    </div>
  );
}
