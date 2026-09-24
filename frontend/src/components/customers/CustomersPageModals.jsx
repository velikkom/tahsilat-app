"use client";

import CustomerFiltersDrawer from "@/components/customers/CustomerFiltersDrawer";
import CustomerCreateModal from "@/components/customers/CustomerCreateModal";
import NewCollectionModal from "@/components/collections/NewCollectionModal";

export default function CustomersPageModals({
  showFilters,
  filters,
  onHideFilters,
  onApplyFilters,
  onResetFilters,
  showCustomerModal,
  modalMode,
  editingCustomer,
  customerSubmitting,
  onCloseCustomerModal,
  onSubmitCustomer,
  showCollectionModal,
  onCloseCollectionModal,
  onSubmitCollection,
  customers,
  collectionSubmitting,
  loadingCustomers,
  defaultCustomerId,
  lockCustomerSelection,
}) {
  return (
    <>
      <CustomerFiltersDrawer
        show={showFilters}
        filters={filters}
        onHide={onHideFilters}
        onApply={onApplyFilters}
        onReset={onResetFilters}
      />
      <CustomerCreateModal
        show={showCustomerModal}
        mode={modalMode}
        customer={editingCustomer}
        submitting={customerSubmitting}
        onClose={onCloseCustomerModal}
        onSubmit={onSubmitCustomer}
      />
      <NewCollectionModal
        show={showCollectionModal}
        onClose={onCloseCollectionModal}
        onSubmit={onSubmitCollection}
        customers={customers}
        submitting={collectionSubmitting}
        loadingCustomers={loadingCustomers}
        defaultCustomerId={defaultCustomerId}
        lockCustomerSelection={lockCustomerSelection}
      />
    </>
  );
}
