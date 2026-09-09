"use client";

import TripForm from "@/components/trips/TripForm";

export default function NewTripPage() {
  return (
    <div className="trip-form-page d-flex flex-column gap-3 gap-md-4">
      <div>
        <h1 className="fw-bold page-header__title mb-1">Yeni Tur</h1>
        <p className="text-muted mb-0">Tur ve harcama bilgilerini girin.</p>
      </div>

      <TripForm mode="create" />
    </div>
  );
}
