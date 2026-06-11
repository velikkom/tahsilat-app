"use client";

import { Button } from "react-bootstrap";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";

export default function CustomerActionButtons({
  onView,
  onEdit,
  onDelete,
  showEdit = true,
  showDelete = true,
  disabled = false,
  deleting = false,
}) {
  return (
    <div className="customer-action-buttons d-flex gap-2">
      <Button
        variant="outline-primary"
        className="customer-action-buttons__btn flex-fill touch-target"
        onClick={onView}
        disabled={disabled || deleting}
        aria-label="Görüntüle"
      >
        <FaEye className="me-1" aria-hidden="true" />
        Görüntüle
      </Button>

      {showEdit && (
        <Button
          variant="outline-warning"
          className="customer-action-buttons__btn flex-fill touch-target"
          onClick={onEdit}
          disabled={disabled || deleting}
          aria-label="Düzenle"
        >
          <FaEdit className="me-1" aria-hidden="true" />
          Düzenle
        </Button>
      )}

      {showDelete && (
        <Button
          variant="outline-danger"
          className="customer-action-buttons__btn flex-fill touch-target"
          onClick={onDelete}
          disabled={disabled || deleting}
          aria-label="Sil"
        >
          <FaTrash className="me-1" aria-hidden="true" />
          Sil
        </Button>
      )}
    </div>
  );
}
