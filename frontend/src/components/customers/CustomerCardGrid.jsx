"use client";

import { memo } from "react";
import CustomerCard from "./CustomerCard";

function CustomerCardGrid({
  customers = [],
  onView,
  onEdit,
  onDelete,
  onNewCollection,
  showEdit = true,
  showDelete = true,
  disabled = false,
  deletingId = null,
}) {
  return (
    <div className="row row-cols-1 row-cols-md-2 g-3">
      {customers.map((customer) => (
        <div className="col" key={customer.id}>
          <CustomerCard
            customer={customer}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            onNewCollection={onNewCollection}
            showEdit={showEdit}
            showDelete={showDelete}
            disabled={disabled}
            deleting={deletingId === customer.id}
          />
        </div>
      ))}
    </div>
  );
}

export default memo(CustomerCardGrid);
