"use client";

import { Button } from "react-bootstrap";
import { FaEdit, FaEye, FaMoneyBillWave, FaTrash } from "react-icons/fa";

export default function CustomerActionButtons({
  onView,
  onEdit,
  onDelete,
  onNewCollection,
  showEdit = true,
  showDelete = true,
  disabled = false,
  deleting = false,
  compact = false,
}) {
  const buttonSize = compact ? "sm" : undefined;

  return (
    <div
      className={`customer-action-buttons d-flex gap-2 ${
        compact ? "flex-wrap" : ""
      }`}
    >
      {onNewCollection && (
        <Button
          variant="success"
          size={buttonSize}
          className={`customer-action-buttons__btn ui-card-actions__btn touch-target ${
            compact ? "" : "flex-fill"
          }`}
          onClick={onNewCollection}
          disabled={disabled || deleting}
          aria-label="Yeni Tahsilat"
        >
          <FaMoneyBillWave className="me-1" aria-hidden="true" />
          Yeni Tahsilat
        </Button>
      )}

      <Button
        variant="outline-primary"
        size={buttonSize}
        className="customer-action-buttons__btn ui-card-actions__btn flex-fill touch-target"
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
          size={buttonSize}
          className="customer-action-buttons__btn ui-card-actions__btn flex-fill touch-target"
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
          size={buttonSize}
          className="customer-action-buttons__btn ui-card-actions__btn flex-fill touch-target"
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
