"use client";

import { Spinner } from "react-bootstrap";

import TripDocumentDownloadButtons from "@/components/trips/TripDocumentDownloadButtons";
import TripForm from "@/components/trips/TripForm";
import useTripDetail from "@/hooks/useTripDetail";

export default function EditTripPage() {
  const { trip, loading } = useTripDetail();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  if (!trip) {
    return <div className="alert alert-danger">Tur bulunamadı.</div>;
  }

  return (
    <div className="trip-form-page d-flex flex-column gap-3 gap-md-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
        <div>
          <h1 className="fw-bold page-header__title mb-1">Tur Düzenle</h1>
          <p className="text-muted mb-0">{trip.salesmanName}</p>
        </div>

        <TripDocumentDownloadButtons tripId={trip.id} />
      </div>

      <TripForm mode="edit" trip={trip} />
    </div>
  );
}
