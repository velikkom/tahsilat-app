"use client";

import { FaBuilding, FaPhone, FaUser } from "react-icons/fa";
import { formatCustomerField } from "@/utils/customerUtils";

export default function CustomerCardMeta({ customer }) {
  return (
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
  );
}
