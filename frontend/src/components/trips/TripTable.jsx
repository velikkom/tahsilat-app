"use client";

import { memo } from "react";
import Link from "next/link";
import { Button, Table } from "react-bootstrap";
import { FaDownload, FaEdit, FaFileInvoice, FaTrash } from "react-icons/fa";

import { formatDate } from "@/utils/collectionUtils";

function TripTable({
  trips = [],
  onDelete,
  onDownloadExpense,
  onDownloadCollection,
  disabled = false,
  deletingId = null,
  downloadingExpenseId = null,
  downloadingCollectionId = null,
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
            const isDownloadingExpense = downloadingExpenseId === trip.id;
            const isDownloadingCollection = downloadingCollectionId === trip.id;
            const isDisabled = disabled || isDeleting;

            return (
              <tr key={trip.id}>
                <td>
                  {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                </td>

                <td>{trip.vehiclePlate || "-"}</td>

                <td>{trip.salesmanName || "-"}</td>

                <td className="text-end">
                  <div className="d-flex justify-content-end gap-2">
                    <Button
                      variant="outline-success"
                      className="touch-target d-inline-flex align-items-center gap-2"
                      onClick={() => onDownloadExpense?.(trip)}
                      disabled={disabled || isDownloadingExpense}
                      aria-label="Harcama dökümü indir"
                      title="Harcama dökümü (Form 2)"
                    >
                      <FaDownload aria-hidden="true" />
                      Harcama
                    </Button>

                    <Button
                      variant="outline-info"
                      className="touch-target d-inline-flex align-items-center gap-2"
                      onClick={() => onDownloadCollection?.(trip)}
                      disabled={disabled || isDownloadingCollection}
                      aria-label="Tahsilat dökümü indir"
                      title="Tahsilat dökümü (Form 1)"
                    >
                      <FaFileInvoice aria-hidden="true" />
                      Tahsilat
                    </Button>

                    <Link
                      href={`/trips/${trip.id}`}
                      className="btn btn-outline-warning touch-target d-inline-flex align-items-center gap-2"
                      aria-label="Düzenle"
                      title="Düzenle"
                    >
                      <FaEdit aria-hidden="true" />
                      Düzenle
                    </Link>

                    <Button
                      variant="outline-danger"
                      className="touch-target d-inline-flex align-items-center gap-2"
                      onClick={() => onDelete?.(trip)}
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
