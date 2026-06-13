"use client";

import { Button } from "react-bootstrap";
import { FaEdit, FaEye, FaMoneyBillWave, FaTrash } from "react-icons/fa";

function getSecondaryColClass(count) {
  if (count <= 1) {
    return "col-12";
  }

  if (count === 2) {
    return "col-6";
  }

  return "col-4";
}

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

  if (compact) {
    return (
      <div className="customer-action-buttons customer-action-buttons--compact d-flex gap-2 flex-wrap">
        {onNewCollection && (
          <Button
            variant="success"
            size={buttonSize}
            className="customer-action-buttons__btn ui-card-actions__btn touch-target"
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
          className="customer-action-buttons__btn ui-card-actions__btn touch-target"
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
            className="customer-action-buttons__btn ui-card-actions__btn touch-target"
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
            className="customer-action-buttons__btn ui-card-actions__btn touch-target"
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

  const secondaryColClass = getSecondaryColClass(
    1 + (showEdit ? 1 : 0) + (showDelete ? 1 : 0)
  );

  return (
    <div className="customer-action-buttons customer-action-buttons--stacked">
      {onNewCollection && (
        <div className="customer-action-buttons__primary-row">
          <Button
            variant="success"
            className="customer-action-buttons__btn ui-card-actions__btn touch-target w-100"
            onClick={onNewCollection}
            disabled={disabled || deleting}
            aria-label="Yeni Tahsilat"
          >
            <FaMoneyBillWave className="me-1" aria-hidden="true" />
            Yeni Tahsilat
          </Button>
        </div>
      )}

      <div className="customer-action-buttons__secondary-row row g-2">
        <div className={secondaryColClass}>
          <Button
            variant="outline-primary"
            className="customer-action-buttons__btn ui-card-actions__btn touch-target w-100"
            onClick={onView}
            disabled={disabled || deleting}
            aria-label="Görüntüle"
          >
            <FaEye className="me-1" aria-hidden="true" />
            Görüntüle
          </Button>
        </div>

        {showEdit && (
          <div className={secondaryColClass}>
            <Button
              variant="outline-warning"
              className="customer-action-buttons__btn ui-card-actions__btn touch-target w-100"
              onClick={onEdit}
              disabled={disabled || deleting}
              aria-label="Düzenle"
            >
              <FaEdit className="me-1" aria-hidden="true" />
              Düzenle
            </Button>
          </div>
        )}

        {showDelete && (
          <div className={secondaryColClass}>
            <Button
              variant="outline-danger"
              className="customer-action-buttons__btn ui-card-actions__btn touch-target w-100"
              onClick={onDelete}
              disabled={disabled || deleting}
              aria-label="Sil"
            >
              <FaTrash className="me-1" aria-hidden="true" />
              Sil
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
