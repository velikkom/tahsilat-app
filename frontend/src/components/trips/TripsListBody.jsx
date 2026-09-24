import Link from "next/link";
import { Spinner } from "react-bootstrap";

import TripCardGrid from "@/components/trips/TripCardGrid";
import TripTable from "@/components/trips/TripTable";

export default function TripsListBody({
  loading,
  hasTrips,
  appliedFilters,
  trips,
  onDelete,
  isBusy,
  deletingId,
}) {
  return (
    <div className="card border-0 shadow-sm ui-panel-card">
      <div className="card-body">
        {loading ? (
          <div className="d-flex justify-content-center py-5">
            <Spinner animation="border" role="status" />
          </div>
        ) : !hasTrips ? (
          <div className="text-center py-5">
            <p className="text-muted mb-3">
              {appliedFilters.fromDate || appliedFilters.toDate
                ? "Seçilen tarih aralığında tur bulunamadı."
                : "Henüz tur kaydı yok."}
            </p>
            <Link href="/trips/new" className="btn btn-primary">
              İlk turu oluştur
            </Link>
          </div>
        ) : (
          <>
            <div className="d-none d-lg-block">
              <TripTable
                trips={trips}
                onDelete={onDelete}
                disabled={isBusy}
                deletingId={deletingId}
              />
            </div>
            <div className="d-lg-none">
              <TripCardGrid
                trips={trips}
                onDelete={onDelete}
                disabled={isBusy}
                deletingId={deletingId}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
