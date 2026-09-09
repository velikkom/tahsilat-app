"use client";

import { Spinner } from "react-bootstrap";

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
      <div>
        <h1 className="fw-bold page-header__title mb-1">Tur Düzenle</h1>
        <p className="text-muted mb-0">{trip.salesmanName}</p>
      </div>

      <TripForm mode="edit" trip={trip} />
    </div>
  );
}
