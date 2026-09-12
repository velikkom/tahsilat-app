"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Col, Form, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";

import TripTable from "@/components/trips/TripTable";
import TripCardGrid from "@/components/trips/TripCardGrid";
import FloatingAddButton from "@/components/ui/FloatingAddButton";

import useTrips from "@/hooks/useTrips";
import {
  deleteTrip,
  downloadTripCollectionDocument,
  downloadTripExpenseDocument,
} from "@/services/tripService";

const EMPTY_DATE_FILTERS = { fromDate: "", toDate: "" };

export default function TripsView() {
  const router = useRouter();

  const [appliedFilters, setAppliedFilters] = useState(EMPTY_DATE_FILTERS);
  const [draftFilters, setDraftFilters] = useState(EMPTY_DATE_FILTERS);

  const { trips, loading, refresh } = useTrips(appliedFilters);

  const [isBusy, setIsBusy] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [downloadingExpenseId, setDownloadingExpenseId] = useState(null);
  const [downloadingCollectionId, setDownloadingCollectionId] = useState(null);

  const isRangeInvalid = useMemo(() => {
    return Boolean(
      draftFilters.fromDate &&
        draftFilters.toDate &&
        draftFilters.toDate < draftFilters.fromDate
    );
  }, [draftFilters]);

  const handleFilterFieldChange = useCallback((event) => {
    const { name, value } = event.target;
    setDraftFilters((previous) => ({ ...previous, [name]: value }));
  }, []);

  const handleApplyFilters = useCallback(
    (event) => {
      event.preventDefault();

      if (isRangeInvalid) {
        return;
      }

      setAppliedFilters(draftFilters);
    },
    [draftFilters, isRangeInvalid]
  );

  const handleClearFilters = useCallback(() => {
    setDraftFilters(EMPTY_DATE_FILTERS);
    setAppliedFilters(EMPTY_DATE_FILTERS);
  }, []);

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

  const handleDownloadExpense = useCallback(async (trip) => {
    if (!trip?.id) {
      return;
    }

    setDownloadingExpenseId(trip.id);

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
      setDownloadingExpenseId(null);
    }
  }, []);

  const handleDownloadCollection = useCallback(async (trip) => {
    if (!trip?.id) {
      return;
    }

    setDownloadingCollectionId(trip.id);

    try {
      await downloadTripCollectionDocument(trip.id);
    } catch (error) {
      console.error(error);

      await Swal.fire({
        icon: "error",
        title: "Hata",
        text: error.message || "Tahsilat dökümü indirilemedi.",
      });
    } finally {
      setDownloadingCollectionId(null);
    }
  }, []);

  const hasTrips = trips.length > 0;

  return (
    <div className="trips-page ui-page-with-fab">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2 mb-3 mb-md-4">
        <div>
          <h2 className="fw-bold page-header__title mb-1">Turlar</h2>
          <p className="text-muted mb-0">
            Saha turu, harcama ve tahsilat dökümü yönetimi
          </p>
        </div>

        <Link
          href="/trips/new"
          className="btn btn-primary d-none d-lg-inline-flex align-items-center gap-2"
        >
          Yeni Tur
        </Link>
      </div>

      <div className="card border-0 shadow-sm ui-panel-card mb-3">
        <div className="card-body">
          <Form className="d-flex flex-wrap align-items-end gap-3" onSubmit={handleApplyFilters}>
            <Col xs={12} sm="auto">
              <Form.Group>
                <Form.Label>Başlangıç Tarihi</Form.Label>
                <Form.Control
                  type="date"
                  name="fromDate"
                  value={draftFilters.fromDate}
                  onChange={handleFilterFieldChange}
                  isInvalid={isRangeInvalid}
                />
              </Form.Group>
            </Col>

            <Col xs={12} sm="auto">
              <Form.Group>
                <Form.Label>Bitiş Tarihi</Form.Label>
                <Form.Control
                  type="date"
                  name="toDate"
                  value={draftFilters.toDate}
                  onChange={handleFilterFieldChange}
                  isInvalid={isRangeInvalid}
                />
                {isRangeInvalid && (
                  <div className="invalid-feedback d-block">
                    Bitiş tarihi başlangıç tarihinden önce olamaz.
                  </div>
                )}
              </Form.Group>
            </Col>

            <Col xs={12} sm="auto" className="d-flex gap-2">
              <Button type="submit" variant="primary" disabled={isRangeInvalid}>
                Filtrele
              </Button>
              <Button type="button" variant="outline-secondary" onClick={handleClearFilters}>
                Temizle
              </Button>
            </Col>
          </Form>
        </div>
      </div>

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
                  onDelete={handleDelete}
                  onDownloadExpense={handleDownloadExpense}
                  onDownloadCollection={handleDownloadCollection}
                  disabled={isBusy}
                  deletingId={deletingId}
                  downloadingExpenseId={downloadingExpenseId}
                  downloadingCollectionId={downloadingCollectionId}
                />
              </div>

              <div className="d-lg-none">
                <TripCardGrid
                  trips={trips}
                  onDelete={handleDelete}
                  onDownloadExpense={handleDownloadExpense}
                  onDownloadCollection={handleDownloadCollection}
                  disabled={isBusy}
                  deletingId={deletingId}
                  downloadingExpenseId={downloadingExpenseId}
                  downloadingCollectionId={downloadingCollectionId}
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
