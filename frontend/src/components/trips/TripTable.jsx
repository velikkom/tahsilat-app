"use client";

import { memo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Table } from "react-bootstrap";
import { FaEdit, FaFileAlt, FaTrash } from "react-icons/fa";

import { formatDate } from "@/utils/collectionUtils";

function tripDokumuHref(tripId) {
  return `/trips/${tripId}/print`;
}

function TripTable({
  trips = [],
  onDelete,
  disabled = false,
  deletingId = null,
}) {
  const router = useRouter();

  return (
    <div className="trip-table-wrapper">
      <Table hover className="trip-table align-middle mb-0">
        <thead>
          <tr>
            <th>Tarih Aralığı</th>
            <th>Plaka</th>
            <th>Satış Personeli</th>
            <th className="text-end">İşlemler</th>
          </tr>
        </thead>

        <tbody>
          {trips.map((trip) => {
            const isDeleting = deletingId === trip.id;
            const isDisabled = disabled || isDeleting;
            const dokumuHref = tripDokumuHref(trip.id);

            return (
              <tr
                key={trip.id}
                className="trip-table__row"
                onClick={() => router.push(dokumuHref)}
              >
                <td>
                  {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                </td>

                <td>{trip.vehiclePlate || "-"}</td>

                <td>{trip.salesmanName || "-"}</td>

                <td className="text-end">
                  <div className="d-flex justify-content-end gap-2">
                    <Link
                      href={dokumuHref}
                      className="btn btn-outline-success touch-target d-inline-flex align-items-center gap-2"
                      aria-label="Tahsilat dökümünü aç"
                      title="Dökümü aç"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <FaFileAlt aria-hidden="true" />
                      Döküm
                    </Link>

                    <Link
                      href={`/trips/${trip.id}`}
                      className="btn btn-outline-warning touch-target d-inline-flex align-items-center gap-2"
                      aria-label="Düzenle"
                      title="Düzenle"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <FaEdit aria-hidden="true" />
                      Düzenle
                    </Link>

                    <Button
                      variant="outline-danger"
                      className="touch-target d-inline-flex align-items-center gap-2"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDelete?.(trip);
                      }}
                      disabled={isDisabled}
                      aria-label="Sil"
                      title="Sil"
                    >
                      <FaTrash aria-hidden="true" />
                      Sil
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}

export default memo(TripTable);
