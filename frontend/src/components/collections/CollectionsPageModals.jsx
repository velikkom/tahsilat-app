"use client";

import NewCollectionModal from "@/components/collections/NewCollectionModal";
import ImportCollectionsModal from "@/components/collections/ImportCollectionsModal";
import CustomerCollectionDrawer from "@/components/customers/detail/collections/CustomerCollectionDrawer";

export default function CollectionsPageModals({
  showDrawer,
  selectedCollection,
  selectedCustomerName,
  isBusy,
  onHideDrawer,
  onEdit,
  onDelete,
  onMarkAsPaid,
  showModal,
  onCloseModal,
  onSubmit,
  customers,
  submitting,
  loadingCustomers,
  modalMode,
  editingCollection,
  lastCreatedCustomerId,
  showImportModal,
  onCloseImport,
  onImported,
}) {
  return (
    <>
      <CustomerCollectionDrawer
        show={showDrawer}
        collection={selectedCollection}
        customerName={selectedCustomerName}
        busy={isBusy}
        onHide={onHideDrawer}
        onEdit={onEdit}
        onDelete={onDelete}
        onMarkAsPaid={onMarkAsPaid}
      />
      <NewCollectionModal
        show={showModal}
        onClose={onCloseModal}
        onSubmit={onSubmit}
        customers={customers}
        submitting={submitting}
        loadingCustomers={loadingCustomers}
        mode={modalMode}
        initialCollection={editingCollection}
        defaultCustomerId={modalMode === "create" ? lastCreatedCustomerId : ""}
        lockCustomerSelection={Boolean(
          modalMode === "create" && lastCreatedCustomerId
        )}
      />
      <ImportCollectionsModal
        show={showImportModal}
        onClose={onCloseImport}
        onImported={onImported}
      />
    </>
  );
}
