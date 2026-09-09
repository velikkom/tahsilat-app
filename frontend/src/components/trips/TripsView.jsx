"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Spinner } from "react-bootstrap";
import Swal from "sweetalert2";

import TripTable from "@/components/trips/TripTable";
import TripCardGrid from "@/components/trips/TripCardGrid";
import FloatingAddButton from "@/components/ui/FloatingAddButton";

import useTrips from "@/hooks/useTrips";
import { deleteTrip, downloadTripExpenseDocument } from "@/services/tripService";

export default function TripsView() {
  const router = useRouter();
  const { trips, loading, refresh } = useTrips();

  const [isBusy, setIsBusy] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const handleDelete = useCallback(
    async (trip) => {
      if (!trip?.id || isBusy) {
        return;
      }

      const confirmation = await Swal.fire({
        title: "Emin misiniz?",
        text: "Bu turu silmek istediğinize emin misiniz?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Evet, sil",
        cancelButtonText: "İptal",
        reverseButtons: true,
        focusCancel: true,
      });

      if (!confirmation.isConfirmed) {
        return;
      }

      setIsBusy(true);
      setDeletingId(trip.id);

      try {
        await deleteTrip(trip.id);

        await Swal.fire({
          icon: "success",
          title: "Başarılı",
          text: "Tur başarıyla silindi.",
          confirmButtonText: "Tamam",
          allowOutsideClick: false,
          allowEscapeKey: false,
        });

        await refresh();
      } catch (error) {
        console.error(error);

        await Swal.fire({
          icon: "error",
          title: "Hata",
          text: error.message || "Tur silinirken hata oluştu.",
        });
      } finally {
        setIsBusy(false);
        setDeletingId(null);
      }
    },
    [isBusy, refresh]
  );

  const handleDownload = useCallback(async (trip) => {
    if (!trip?.id) {
      return;
    }

    setDownloadingId(trip.id);

    try {
      await downloadTripExpenseDocument(trip.id);
    } catch (error) {
      console.error(error);

      await Swal.fire({
        icon: "error",
        title: "Hata",
        text: error.message || "Harcama dokümanı indirilemedi.",
      });
    } finally {
      setDownloadingId(null);
    }
  }, []);

  const hasTrips = trips.length > 0;

  return (
    <div className="trips-page ui-page-with-fab">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2 mb-3 mb-md-4">
        <div>
          <h2 className="fw-bold page-header__title mb-1">Turlar</h2>
          <p className="text-muted mb-0">
            Saha turu ve harcama dökümü yönetimi
          </p>
        </div>

        <Link
          href="/trips/new"
          className="btn btn-primary d-none d-lg-inline-flex align-items-center gap-2"
        >
          Yeni Tur
        </Link>
      </div>

      <div className="card border-0 shadow-sm ui-panel-card">
        <div className="card-body">
          {loading ? (
            <div className="d-flex justify-content-center py-5">
              <Spinner animation="border" role="status" />
            </div>
          ) : !hasTrips ? (
            <div className="text-center py-5">
              <p className="text-muted mb-3">Henüz tur kaydı yok.</p>
              <Link href="/trips/new" className="btn btn-primary">
                İlk turu oluştur
              </Link>
            </div>
          ) : (
            <>
              <div className="d-none d-lg-block">
                <TripTable
                  trips={trips}
                  onDelete={handleDelete}
                  onDownload={handleDownload}
                  disabled={isBusy}
                  deletingId={deletingId}
                  downloadingId={downloadingId}
                />
              </div>

              <div className="d-lg-none">
                <TripCardGrid
                  trips={trips}
                  onDelete={handleDelete}
                  onDownload={handleDownload}
                  disabled={isBusy}
                  deletingId={deletingId}
                  downloadingId={downloadingId}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <FloatingAddButton
        onClick={() => router.push("/trips/new")}
        ariaLabel="Yeni tur ekle"
      />
    </div>
  );
}
