"use client";

import { memo } from "react";
import { Badge, Button } from "react-bootstrap";
import CustomerActionButtons from "./CustomerActionButtons";
import {
  formatCustomerField,
  getCustomerStatusLabel,
  getCustomerStatusVariant,
  isCustomerActive,
} from "@/utils/customerUtils";
import { FaBuilding, FaPhone, FaUser } from "react-icons/fa";

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
  const statusVariant = getCustomerStatusVariant(customer);

  return (
    <article
      className={`customer-card ui-entity-card card border-0 shadow-sm h-100 ${
        isActive
          ? "ui-entity-card--accent-success"
          : "ui-entity-card--accent-secondary"
      }`}
    >
      <div className="card-body d-flex flex-column gap-3 p-3 p-md-4 min-width-0">
        <div className="customer-card__header d-flex justify-content-between align-items-start gap-2">
          <h3 className="customer-card__title fw-bold mb-0 text-truncate min-width-0">
            {formatCustomerField(customer.companyName)}
          </h3>

          <Badge
            bg={statusVariant}
            className="customer-card__status-badge flex-shrink-0"
          >
            {getCustomerStatusLabel(customer)}
          </Badge>
        </div>

        <ul className="customer-card__meta list-unstyled mb-0 d-flex flex-column gap-2">
          <li className="d-flex align-items-start gap-2 text-secondary">
            <FaUser className="customer-card__icon mt-1" aria-hidden="true" />
            <span>{formatCustomerField(customer.authorizedPerson)}</span>
          </li>
          <li className="d-flex align-items-start gap-2 text-secondary">
            <FaPhone className="customer-card__icon mt-1" aria-hidden="true" />
            <span>{formatCustomerField(customer.phone)}</span>
          </li>
          <li className="d-flex align-items-start gap-2 text-secondary">
            <FaBuilding className="customer-card__icon mt-1" aria-hidden="true" />
            <span>{formatCustomerField(customer.taxNumber)}</span>
          </li>
        </ul>

        <div className="customer-card__actions mt-auto pt-3 border-top min-width-0">
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
