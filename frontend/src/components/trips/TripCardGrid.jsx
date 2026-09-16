"use client";

import { memo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "react-bootstrap";
import { FaDownload, FaEdit, FaTrash } from "react-icons/fa";

import { formatDate } from "@/utils/collectionUtils";

function TripCardGrid({
  trips = [],
  onDelete,
  onDownload,
  disabled = false,
  deletingId = null,
  downloadingId = null,
}) {
  const router = useRouter();

  return (
    <div className="d-flex flex-column gap-3">
      {trips.map((trip) => {
        const isDeleting = deletingId === trip.id;
        const isDownloading = downloadingId === trip.id;
        const isDisabled = disabled || isDeleting;

        return (
          <div
            key={trip.id}
            className="card border-0 shadow-sm trip-card"
            onDoubleClick={() => router.push(`/trips/${trip.id}/print`)}
          >
            <div className="card-body">
              <div className="mb-3">
                <div className="fw-semibold">
                  {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                </div>
                <div className="text-muted small">
                  {trip.vehiclePlate || "Plaka girilmedi"}
                </div>
                <div className="text-muted small">{trip.salesmanName}</div>
              </div>

              <div className="trip-card-actions">
                <Button
                  variant="outline-success"
                  className="trip-card-actions__btn touch-target"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDownload?.(trip);
                  }}
                  onDoubleClick={(event) => event.stopPropagation()}
                  disabled={disabled || isDownloading}
                  aria-label="Tahsilat dökümü indir"
                >
                  <FaDownload size={16} className="trip-card-actions__icon" aria-hidden="true" />
                  Döküm
                </Button>

                <Link
                  href={`/trips/${trip.id}`}
                  className="btn btn-outline-warning trip-card-actions__btn touch-target"
                  aria-label="Düzenle"
                  onClick={(event) => event.stopPropagation()}
                  onDoubleClick={(event) => event.stopPropagation()}
                >
                  <FaEdit size={16} className="trip-card-actions__icon" aria-hidden="true" />
                  Düzenle
                </Link>

                <Button
                  variant="outline-danger"
                  className="trip-card-actions__btn touch-target"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete?.(trip);
                  }}
                  onDoubleClick={(event) => event.stopPropagation()}
                  disabled={isDisabled}
                  aria-label="Sil"
                >
                  <FaTrash size={16} className="trip-card-actions__icon" aria-hidden="true" />
                  Sil
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default memo(TripCardGrid);
