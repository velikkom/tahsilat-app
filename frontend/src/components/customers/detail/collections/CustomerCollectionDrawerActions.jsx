"use client";

import { Button } from "react-bootstrap";
import {
  canMarkCollectionAsPaid,
  getMarkAsPaidButtonTitle,
  showsMarkAsPaidAction,
} from "@/utils/collectionUtils";

export default function CustomerCollectionDrawerActions({
  collection,
  busy = false,
  onEdit,
  onDelete,
  onMarkAsPaid,
}) {
  const showMarkAsPaid = showsMarkAsPaidAction(collection);
  const markEnabled = canMarkCollectionAsPaid(collection);

  return (
    <div className="d-flex flex-column gap-2 mt-auto">
      {showMarkAsPaid && (
        <Button
          variant="success"
          disabled={busy || !markEnabled}
          onClick={() => onMarkAsPaid(collection)}
          title={getMarkAsPaidButtonTitle(collection)}
        >
          <i className="pi pi-check me-2" aria-hidden="true" />
          Tahsil Edildi
        </Button>
      )}

      <div className="d-flex gap-2">
        <Button
          variant="outline-warning"
          className="flex-fill"
          disabled={busy}
          onClick={() => onEdit(collection)}
        >
          <i className="pi pi-pencil me-2" aria-hidden="true" />
          Düzenle
        </Button>

        <Button
          variant="outline-danger"
          className="flex-fill"
          disabled={busy}
          onClick={() => onDelete(collection)}
        >
          <i className="pi pi-trash me-2" aria-hidden="true" />
          Sil
        </Button>
      </div>
    </div>
  );
}
