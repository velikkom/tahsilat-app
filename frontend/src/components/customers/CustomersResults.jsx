"use client";

import { Spinner } from "react-bootstrap";
import CustomerCardGrid from "@/components/customers/CustomerCardGrid";
import CustomerPagination from "@/components/customers/CustomerPagination";
import CustomersDesktopTable from "@/components/customers/CustomersDesktopTable";
import CustomerEmptyState from "@/components/customers/CustomerEmptyState";

export default function CustomersResults({
  loading,
  hasCustomers,
  filteredCustomers,
  totalCount,
  mobilePagination,
  onCreate,
  onClearFilters,
  onView,
  onEdit,
  onDelete,
  onNewCollection,
  onPreviousPage,
  onNextPage,
  isAdmin,
  isBusy,
  deletingId,
}) {
  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  if (!hasCustomers) {
    return <CustomerEmptyState onCreate={onCreate} showCreate={isAdmin} />;
  }

  if (filteredCustomers.length === 0) {
    return <CustomerEmptyState filtered onClearFilters={onClearFilters} />;
  }

  return (
    <>
      <div className="customer-results-meta text-muted small mb-3">
        {filteredCustomers.length} / {totalCount} kayıt gösteriliyor
      </div>
      <div className="d-none d-lg-block">
        <CustomersDesktopTable
          customers={filteredCustomers}
          loading={loading}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onNewCollection={onNewCollection}
          showEdit={isAdmin}
          showDelete={isAdmin}
          busy={isBusy}
          deletingId={deletingId}
        />
      </div>
      <div className="customers-page__card-list d-lg-none d-flex flex-column gap-3 min-width-0">
        <CustomerCardGrid
          customers={mobilePagination.items}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onNewCollection={onNewCollection}
          showEdit={isAdmin}
          showDelete={isAdmin}
          disabled={isBusy}
          deletingId={deletingId}
        />
        {mobilePagination.totalPages > 1 && (
          <CustomerPagination
            currentPage={mobilePagination.currentPage}
            totalPages={mobilePagination.totalPages}
            onPrevious={onPreviousPage}
            onNext={onNextPage}
            disabled={isBusy}
          />
        )}
      </div>
    </>
  );
}
