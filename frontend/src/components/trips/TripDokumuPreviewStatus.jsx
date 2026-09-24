import Link from "next/link";
import { Spinner } from "react-bootstrap";
import { FaArrowLeft, FaEdit } from "react-icons/fa";

export function TripDokumuPreviewLoading() {
  return (
    <div className="d-flex justify-content-center align-items-center py-5">
      <Spinner animation="border" role="status" />
    </div>
  );
}

export function TripDokumuPreviewMissing({ tripId }) {
  return (
    <div className="trip-print-page">
      <div className="trip-print-page__toolbar">
        <Link
          href="/trips"
          className="btn btn-outline-secondary touch-target d-inline-flex align-items-center gap-2"
        >
          <FaArrowLeft aria-hidden="true" />
          Geri
        </Link>
        <Link
          href={`/trips/${tripId}`}
          className="btn btn-outline-warning touch-target d-inline-flex align-items-center gap-2"
        >
          <FaEdit aria-hidden="true" />
          Düzelt
        </Link>
      </div>
      <div className="alert alert-danger">Çıktı önizlemesi bulunamadı.</div>
    </div>
  );
}
