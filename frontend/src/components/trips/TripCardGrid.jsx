"use client";

import { memo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "react-bootstrap";
import { FaEdit, FaFileAlt, FaTrash } from "react-icons/fa";

import { formatDate } from "@/utils/collectionUtils";

function tripDokumuHref(tripId) {
  return `/trips/${tripId}/print`;
}

function TripCardGrid({
  trips = [],
  onDelete,
  disabled = false,
  deletingId = null,
}) {
  const router = useRouter();

  return (
    <div className="d-flex flex-column gap-3">
      {trips.map((trip) => {
        const isDeleting = deletingId === trip.id;
        const isDisabled = disabled || isDeleting;
        const dokumuHref = tripDokumuHref(trip.id);

        return (
          <div
            key={trip.id}
            className="card border-0 shadow-sm trip-card"
            role="button"
            tabIndex={0}
            onClick={() => router.push(dokumuHref)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                router.push(dokumuHref);
              }
            }}
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
                <Link
                  href={dokumuHref}
                  className="btn btn-outline-success trip-card-actions__btn touch-target"
                  aria-label="Tahsilat dökümünü aç"
                  onClick={(event) => event.stopPropagation()}
                >
                  <FaFileAlt size={16} className="trip-card-actions__icon" aria-hidden="true" />
                  Döküm
                </Link>

                <Link
                  href={`/trips/${trip.id}`}
                  className="btn btn-outline-warning trip-card-actions__btn touch-target"
                  aria-label="Düzenle"
                  onClick={(event) => event.stopPropagation()}
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
