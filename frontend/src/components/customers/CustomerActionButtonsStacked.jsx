"use client";

import { Button } from "react-bootstrap";
import { FaEdit, FaEye, FaMoneyBillWave, FaTrash } from "react-icons/fa";

function getSecondaryColClass(count) {
  if (count <= 1) return "col-12";
  if (count === 2) return "col-6";
  return "col-4";
}

function ActionButton({ colClass, variant, onClick, locked, label, icon: Icon }) {
  return (
    <div className={colClass}>
      <Button
        variant={variant}
        className="customer-action-buttons__btn ui-card-actions__btn touch-target w-100"
        onClick={onClick}
        disabled={locked}
        aria-label={label}
      >
        <Icon className="me-1" aria-hidden="true" />
        {label}
      </Button>
    </div>
  );
}

export default function CustomerActionButtonsStacked({
  onView,
  onEdit,
  onDelete,
  onNewCollection,
  showEdit,
  showDelete,
  disabled,
  deleting,
}) {
  const locked = disabled || deleting;
  const col = getSecondaryColClass(1 + (showEdit ? 1 : 0) + (showDelete ? 1 : 0));

  return (
    <div className="customer-action-buttons customer-action-buttons--stacked">
      {onNewCollection && (
        <div className="customer-action-buttons__primary-row">
          <Button
            variant="success"
            className="customer-action-buttons__btn ui-card-actions__btn touch-target w-100"
            onClick={onNewCollection}
            disabled={locked}
            aria-label="Yeni Tahsilat"
          >
            <FaMoneyBillWave className="me-1" aria-hidden="true" />
            Yeni Tahsilat
          </Button>
        </div>
      )}
      <div className="customer-action-buttons__secondary-row row g-2">
        <ActionButton colClass={col} variant="outline-primary" onClick={onView} locked={locked} label="Görüntüle" icon={FaEye} />
        {showEdit && (
          <ActionButton colClass={col} variant="outline-warning" onClick={onEdit} locked={locked} label="Düzenle" icon={FaEdit} />
        )}
        {showDelete && (
          <ActionButton colClass={col} variant="outline-danger" onClick={onDelete} locked={locked} label="Sil" icon={FaTrash} />
        )}
      </div>
    </div>
  );
}
