"use client";

import { memo } from "react";
import Link from "next/link";
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
  return (
    <div className="d-flex flex-column gap-3">
      {trips.map((trip) => {
        const isDeleting = deletingId === trip.id;
        const isDownloading = downloadingId === trip.id;
        const isDisabled = disabled || isDeleting;

        return (
          <div key={trip.id} className="card border-0 shadow-sm trip-card">
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

              <div className="d-flex gap-2">
                <Button
                  variant="outline-success"
                  className="flex-fill touch-target"
                  onClick={() => onDownload?.(trip)}
                  disabled={disabled || isDownloading}
                  aria-label="Excel indir"
                >
                  <FaDownload className="me-1" aria-hidden="true" />
                  Excel
                </Button>

                <Link
                  href={`/trips/${trip.id}`}
                  className="btn btn-outline-warning flex-fill touch-target"
                  aria-label="Düzenle"
                >
                  <FaEdit className="me-1" aria-hidden="true" />
                  Düzenle
                </Link>

                <Button
                  variant="outline-danger"
                  className="flex-fill touch-target"
                  onClick={() => onDelete?.(trip)}
                  disabled={isDisabled}
                  aria-label="Sil"
                >
                  <FaTrash className="me-1" aria-hidden="true" />
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
