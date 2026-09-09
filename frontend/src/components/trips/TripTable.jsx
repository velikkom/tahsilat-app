"use client";

import { memo } from "react";
import Link from "next/link";
import { Button, Table } from "react-bootstrap";
import { FaDownload, FaEdit, FaTrash } from "react-icons/fa";

import { formatDate } from "@/utils/collectionUtils";

function TripTable({
  trips = [],
  onDelete,
  onDownload,
  disabled = false,
  deletingId = null,
  downloadingId = null,
}) {
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
            const isDownloading = downloadingId === trip.id;
            const isDisabled = disabled || isDeleting;

            return (
              <tr key={trip.id}>
                <td>
                  {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                </td>

                <td>{trip.vehiclePlate || "-"}</td>

                <td>{trip.salesmanName || "-"}</td>

                <td className="text-end">
                  <div className="d-flex justify-content-end gap-1">
                    <Button
                      variant="outline-success"
                      size="sm"
                      className="touch-target"
                      onClick={() => onDownload?.(trip)}
                      disabled={disabled || isDownloading}
                      aria-label="Excel indir"
                    >
                      <FaDownload aria-hidden="true" />
                    </Button>

                    <Link
                      href={`/trips/${trip.id}`}
                      className="btn btn-outline-warning btn-sm touch-target"
                      aria-label="Düzenle"
                    >
                      <FaEdit aria-hidden="true" />
                    </Link>

                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="touch-target"
                      onClick={() => onDelete?.(trip)}
                      disabled={isDisabled}
                      aria-label="Sil"
                    >
                      <FaTrash aria-hidden="true" />
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
