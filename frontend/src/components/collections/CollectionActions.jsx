"use client";

import { Button } from "primereact/button";

export default function CollectionActions({
  row,
  onEdit,
  onDelete,
  disabled = false,
  deletingId = null,
}) {
  const isDeleting = deletingId === row?.id;

  return (
    <div className="d-flex gap-1 gap-sm-2 flex-nowrap">
      <Button
        icon="pi pi-eye"
        severity="info"
        rounded
        outlined
        disabled={disabled || isDeleting}
        className="touch-target"
        aria-label="Tahsilat görüntüle"
      />

      <Button
        icon="pi pi-pencil"
        severity="warning"
        rounded
        outlined
        disabled={disabled || isDeleting}
        onClick={() => onEdit?.(row)}
        className="touch-target"
        aria-label="Tahsilat düzenle"
      />

      <Button
        icon="pi pi-trash"
        severity="danger"
        rounded
        outlined
        disabled={disabled || isDeleting}
        loading={isDeleting}
        onClick={() => onDelete?.(row)}
        className="touch-target"
        aria-label="Tahsilat sil"
      />
    </div>
  );
}
