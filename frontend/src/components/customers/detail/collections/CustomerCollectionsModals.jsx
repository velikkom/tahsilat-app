"use client";

import NewCollectionModal from "@/components/collections/NewCollectionModal";
import CustomerCollectionDrawer from "./CustomerCollectionDrawer";

export default function CustomerCollectionsModals({
  customer,
  showDrawer,
  selectedCollection,
  busy,
  onHideDrawer,
  onEdit,
  onDelete,
  onMarkAsPaid,
  showModal,
  onCloseModal,
  onSubmitModal,
  isSubmitting,
  modalMode,
  editingCollection,
}) {
  return (
    <>
      <CustomerCollectionDrawer
        show={showDrawer}
        collection={selectedCollection}
        customerName={customer.companyName}
        busy={busy}
        onHide={onHideDrawer}
        onEdit={onEdit}
        onDelete={onDelete}
        onMarkAsPaid={onMarkAsPaid}
      />

      <NewCollectionModal
        show={showModal}
        onClose={onCloseModal}
        onSubmit={onSubmitModal}
        customers={[customer]}
        submitting={isSubmitting}
        loadingCustomers={false}
        mode={modalMode}
        initialCollection={editingCollection}
        defaultCustomerId={customer.id}
      />
    </>
  );
}
