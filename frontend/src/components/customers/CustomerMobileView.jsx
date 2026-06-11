"use client";

import { Spinner } from "react-bootstrap";
import CustomerCard from "./CustomerCard";
import CustomerPagination from "./CustomerPagination";

export default function CustomerMobileView({
  customers = [],
  loading = false,
  currentPage,
  totalPages,
  onPrevious,
  onNext,
  onView,
  onEdit,
  onDelete,
  onNewCollection,
  showEdit = true,
  showDelete = true,
  busy = false,
  deletingId = null,
}) {
  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="customer-card customer-card--empty card border-0 shadow-sm rounded-4 text-center text-muted py-5">
        Müşteri bulunamadı.
      </div>
    );
  }

  return (
    <div className="customer-mobile-view d-flex flex-column gap-3">
      <div className="customer-mobile-view__cards d-flex flex-column gap-3">
        {customers.map((customer) => (
          <CustomerCard
            key={customer.id}
            customer={customer}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            onNewCollection={onNewCollection}
            showEdit={showEdit}
            showDelete={showDelete}
            disabled={busy}
            deleting={deletingId === customer.id}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <CustomerPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevious={onPrevious}
          onNext={onNext}
          disabled={busy}
        />
      )}
    </div>
  );
}
