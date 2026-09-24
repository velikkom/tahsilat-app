"use client";

import { Button } from "react-bootstrap";
import {
  canMarkCollectionAsPaid,
  getMarkAsPaidButtonTitle,
  showsMarkAsPaidAction,
} from "@/utils/collectionUtils";

export default function CustomerCollectionsTableActions({
  collection,
  onEdit,
  onDelete,
  onMarkAsPaid,
  busy = false,
}) {
  const showMarkAsPaid = showsMarkAsPaidAction(collection);
  const markEnabled = canMarkCollectionAsPaid(collection);

  return (
    <div className="d-inline-flex gap-1">
      {showMarkAsPaid && (
        <Button
          size="sm"
          variant="outline-success"
          disabled={busy || !markEnabled}
          onClick={() => onMarkAsPaid(collection)}
          title={getMarkAsPaidButtonTitle(collection)}
        >
          <i className="pi pi-check" aria-hidden="true" />
        </Button>
      )}

      <Button
        size="sm"
        variant="outline-warning"
        disabled={busy}
        onClick={() => onEdit(collection)}
        title="Düzenle"
        aria-label="Tahsilat düzenle"
      >
        <i className="pi pi-pencil" aria-hidden="true" />
      </Button>

      <Button
        size="sm"
        variant="outline-danger"
        disabled={busy}
        onClick={() => onDelete(collection)}
        title="Sil"
        aria-label="Tahsilat sil"
      >
        <i className="pi pi-trash" aria-hidden="true" />
      </Button>
    </div>
  );
}
