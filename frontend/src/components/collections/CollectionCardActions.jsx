"use client";

import { Button } from "react-bootstrap";
import { FaCheck, FaEdit, FaEye, FaTrash } from "react-icons/fa";

export default function CollectionCardActions({
  row,
  onView,
  onEdit,
  onDelete,
  onMarkAsPaid,
  isDisabled,
  showMarkAsPaid,
  markEnabled,
  markTitle,
}) {
  return (
    <div className="collection-card-actions d-flex flex-column gap-2">
      {showMarkAsPaid && (
        <Button
          variant="outline-success"
          className="collection-card-actions__btn ui-card-actions__btn w-100 touch-target"
          onClick={() => onMarkAsPaid?.(row)}
          disabled={isDisabled || !markEnabled}
          title={markTitle}
          aria-label="Tahsil Edildi"
        >
          <FaCheck className="me-1" aria-hidden="true" />
          Tahsil Edildi
        </Button>
      )}

      <div className="d-flex gap-2">
        <Button
          variant="outline-primary"
          className="collection-card-actions__btn ui-card-actions__btn flex-fill touch-target"
          onClick={() => onView?.(row)}
          disabled={isDisabled}
          aria-label="Görüntüle"
        >
          <FaEye className="me-1" aria-hidden="true" />
          Görüntüle
        </Button>

        <Button
          variant="outline-warning"
          className="collection-card-actions__btn ui-card-actions__btn flex-fill touch-target"
          onClick={() => onEdit?.(row)}
          disabled={isDisabled}
          aria-label="Düzenle"
        >
          <FaEdit className="me-1" aria-hidden="true" />
          Düzenle
        </Button>

        <Button
          variant="outline-danger"
          className="collection-card-actions__btn ui-card-actions__btn flex-fill touch-target"
          onClick={() => onDelete?.(row)}
          disabled={isDisabled}
          aria-label="Sil"
        >
          <FaTrash className="me-1" aria-hidden="true" />
          Sil
        </Button>
      </div>
    </div>
  );
}
