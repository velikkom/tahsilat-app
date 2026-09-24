"use client";

import CustomersHeader from "@/components/customers/CustomersHeader";
import CustomerStats from "@/components/customers/CustomerStats";
import CustomersToolbar from "@/components/customers/CustomersToolbar";
import CustomersResults from "@/components/customers/CustomersResults";
import FloatingAddButton from "@/components/ui/FloatingAddButton";

export default function CustomersPageBody({
  loading,
  hasCustomers,
  list,
  actions,
  isAdmin,
  customersCount,
}) {
  return (
    <>
      <div
        className={`customers-page ui-page-with-fab d-flex flex-column gap-3${
          list.hasActiveFilters ? " customers-page--filtering" : ""
        }`}
      >
        <CustomersHeader />
        {!loading && hasCustomers && !list.hasActiveFilters && (
          <CustomerStats stats={list.stats} />
        )}
        {hasCustomers && (
          <CustomersToolbar
            searchQuery={list.searchQuery}
            onSearchChange={list.setSearchQuery}
            quickFilter={list.quickFilter}
            onQuickFilterChange={list.setQuickFilter}
            hasActiveFilters={list.hasActiveFilters}
            onClearFilters={list.clearFilters}
            onOpenFilters={() => actions.setShowFilters(true)}
            onCreate={actions.openCreateModal}
            isAdmin={isAdmin}
            isBusy={actions.isBusy}
          />
        )}
        <div className="card border-0 shadow-sm ui-panel-card customer-content-panel">
          <div className="card-body">
            <CustomersResults
              loading={loading}
              hasCustomers={hasCustomers}
              filteredCustomers={list.filteredCustomers}
              totalCount={customersCount}
              mobilePagination={list.mobilePagination}
              onCreate={actions.openCreateModal}
              onClearFilters={list.clearFilters}
              onView={actions.openDetail}
              onEdit={actions.openEditModal}
              onDelete={actions.handleDeleteCustomer}
              onNewCollection={actions.openCollectionModal}
              onPreviousPage={() =>
                list.setMobilePage((page) => Math.max(1, page - 1))
              }
              onNextPage={() =>
                list.setMobilePage((page) =>
                  Math.min(list.mobilePagination.totalPages, page + 1)
                )
              }
              isAdmin={isAdmin}
              isBusy={actions.isBusy}
              deletingId={actions.deletingId}
            />
          </div>
        </div>
      </div>
      {isAdmin && (
        <FloatingAddButton
          onClick={actions.openCreateModal}
          disabled={actions.isBusy}
          ariaLabel="Yeni müşteri ekle"
        />
      )}
    </>
  );
}
