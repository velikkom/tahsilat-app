"use client";

import { Button } from "react-bootstrap";
import { FaCheck, FaEdit, FaEye, FaTrash } from "react-icons/fa";

export default function CollectionTableActions({
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
    <div className="collection-table-actions d-flex justify-content-end gap-2 flex-wrap">
      {showMarkAsPaid && (
        <Button
          variant="outline-success"
          className="collection-table-actions__btn touch-target"
          onClick={() => onMarkAsPaid?.(row)}
          disabled={isDisabled || !markEnabled}
          title={markTitle}
          aria-label="Tahsil Edildi"
        >
          <FaCheck className="me-1" aria-hidden="true" />
          Tahsil Edildi
        </Button>
      )}

      <Button
        variant="outline-primary"
        className="collection-table-actions__btn touch-target"
        onClick={() => onView?.(row)}
        disabled={isDisabled}
        aria-label="Görüntüle"
      >
        <FaEye className="me-1" aria-hidden="true" />
        Görüntüle
      </Button>

      <Button
        variant="outline-warning"
        className="collection-table-actions__btn touch-target"
        onClick={() => onEdit?.(row)}
        disabled={isDisabled}
        aria-label="Düzenle"
      >
        <FaEdit className="me-1" aria-hidden="true" />
        Düzenle
      </Button>

      <Button
        variant="outline-danger"
        className="collection-table-actions__btn touch-target"
        onClick={() => onDelete?.(row)}
        disabled={isDisabled}
        aria-label="Sil"
      >
        <FaTrash className="me-1" aria-hidden="true" />
        Sil
      </Button>
    </div>
  );
}
