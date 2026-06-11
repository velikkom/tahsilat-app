"use client";

import CustomerActionButtons from "./CustomerActionButtons";
import { formatCustomerField } from "@/utils/customerUtils";
import { FaBuilding, FaPhone, FaUser } from "react-icons/fa";

export default function CustomerCard({
  customer,
  onView,
  onEdit,
  onDelete,
  showEdit = true,
  showDelete = true,
  disabled = false,
  deleting = false,
}) {
  const isActive = customer?.active !== false;

  return (
    <article
      className={`customer-card card border-0 shadow-sm rounded-4 ${
        isActive ? "customer-card--active" : "customer-card--inactive"
      }`}
    >
      <div className="card-body p-3 p-md-4">
        <h3 className="customer-card__title fw-bold mb-3">
          {formatCustomerField(customer.companyName)}
        </h3>

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

        <div className="customer-card__actions mt-3 pt-3 border-top">
          <CustomerActionButtons
            onView={() => onView?.(customer)}
            onEdit={() => onEdit?.(customer)}
            onDelete={() => onDelete?.(customer)}
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
