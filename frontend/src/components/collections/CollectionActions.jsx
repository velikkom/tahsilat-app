"use client";

import { Button } from "primereact/button";

export default function CollectionActions({ row, onEdit, disabled = false }) {
  return (
    <div className="d-flex gap-2">
      <Button
        icon="pi pi-eye"
        severity="info"
        rounded
        outlined
        disabled={disabled}
      />

      <Button
        icon="pi pi-pencil"
        severity="warning"
        rounded
        outlined
        disabled={disabled}
        onClick={() => onEdit?.(row)}
        aria-label="Tahsilat düzenle"
      />

      <Button
        icon="pi pi-trash"
        severity="danger"
        rounded
        outlined
        disabled={disabled}
      />
    </div>
  );
}
