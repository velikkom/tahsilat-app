"use client";

import { Button } from "react-bootstrap";
import { FaEdit, FaEye, FaMoneyBillWave, FaTrash } from "react-icons/fa";

export default function CustomerActionButtonsCompact({
  onView,
  onEdit,
  onDelete,
  onNewCollection,
  showEdit,
  showDelete,
  disabled,
  deleting,
}) {
  const buttonSize = "sm";
  const locked = disabled || deleting;

  return (
    <div className="customer-action-buttons customer-action-buttons--compact d-flex gap-2 flex-wrap">
      {onNewCollection && (
        <Button
          variant="success"
          size={buttonSize}
          className="customer-action-buttons__btn ui-card-actions__btn touch-target"
          onClick={onNewCollection}
          disabled={locked}
          aria-label="Yeni Tahsilat"
        >
          <FaMoneyBillWave className="me-1" aria-hidden="true" />
          Yeni Tahsilat
        </Button>
      )}
      <Button
        variant="outline-primary"
        size={buttonSize}
        className="customer-action-buttons__btn ui-card-actions__btn touch-target"
        onClick={onView}
        disabled={locked}
        aria-label="Görüntüle"
      >
        <FaEye className="me-1" aria-hidden="true" />
        Görüntüle
      </Button>
      {showEdit && (
        <Button
          variant="outline-warning"
          size={buttonSize}
          className="customer-action-buttons__btn ui-card-actions__btn touch-target"
          onClick={onEdit}
          disabled={locked}
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
          className="customer-action-buttons__btn ui-card-actions__btn touch-target"
          onClick={onDelete}
          disabled={locked}
          aria-label="Sil"
        >
          <FaTrash className="me-1" aria-hidden="true" />
          Sil
        </Button>
      )}
    </div>
  );
}
