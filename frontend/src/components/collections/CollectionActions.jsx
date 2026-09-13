"use client";

import { memo } from "react";
import { Button } from "react-bootstrap";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";

function CollectionActions({
  row,
  onView,
  onEdit,
  onDelete,
  disabled = false,
  deletingId = null,
  variant = "table",
}) {
  const isDeleting = deletingId === row?.id;
  const isDisabled = disabled || isDeleting;

  if (variant === "card") {
    return (
      <div className="collection-card-actions d-flex gap-2">
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
    );
  }

  return (
    <div className="collection-table-actions d-flex justify-content-end gap-2 flex-wrap">
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

export default memo(CollectionActions);
