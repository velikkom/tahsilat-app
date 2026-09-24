"use client";

import { memo } from "react";
import { Badge } from "react-bootstrap";
import CustomerActionButtons from "./CustomerActionButtons";
import CustomerCardMeta from "./CustomerCardMeta";
import {
  formatCustomerField,
  getCustomerStatusLabel,
  getCustomerStatusVariant,
  isCustomerActive,
} from "@/utils/customerUtils";

function CustomerCard({
  customer,
  onView,
  onEdit,
  onDelete,
  onNewCollection,
  showEdit = true,
  showDelete = true,
  disabled = false,
  deleting = false,
}) {
  const isActive = isCustomerActive(customer);
  const locked = disabled || deleting;

  return (
    <article
      className={`customer-card ui-entity-card card border-0 shadow-sm h-100 ${
        isActive
          ? "ui-entity-card--accent-success"
          : "ui-entity-card--accent-secondary"
      }`}
      role="button"
      tabIndex={0}
      onClick={() => !locked && onView?.(customer)}
      onKeyDown={(event) => {
        if (locked || (event.key !== "Enter" && event.key !== " ")) return;
        event.preventDefault();
        onView?.(customer);
      }}
    >
      <div className="card-body d-flex flex-column gap-3 p-3 p-md-4 min-width-0">
        <div className="customer-card__header d-flex justify-content-between align-items-start gap-2">
          <h3 className="customer-card__title fw-bold mb-0 text-truncate min-width-0">
            {formatCustomerField(customer.companyName)}
          </h3>
          <Badge
            bg={getCustomerStatusVariant(customer)}
            className="customer-card__status-badge flex-shrink-0"
          >
            {getCustomerStatusLabel(customer)}
          </Badge>
        </div>
        <CustomerCardMeta customer={customer} />
        <div
          className="customer-card__actions mt-auto pt-3 border-top min-width-0"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <CustomerActionButtons
            onView={() => onView?.(customer)}
            onEdit={() => onEdit?.(customer)}
            onDelete={() => onDelete?.(customer)}
            onNewCollection={() => onNewCollection?.(customer)}
            showEdit={showEdit}
            showDelete={showDelete}
            disabled={disabled}
            deleting={deleting}
          />
        </div>
      </div>
    </article>
  );
}

export default memo(CustomerCard);
