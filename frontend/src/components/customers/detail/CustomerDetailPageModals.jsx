import CustomerCreateModal from "@/components/customers/CustomerCreateModal";
import NewCollectionModal from "@/components/collections/NewCollectionModal";

export default function CustomerDetailPageModals({
  customer,
  showCustomerModal,
  showCollectionModal,
  isSubmitting,
  isSubmittingCollection,
  onCloseCustomerModal,
  onCloseCollectionModal,
  onSubmitCustomer,
  onSubmitCollection,
}) {
  if (!customer) {
    return null;
  }

  return (
    <>
      <CustomerCreateModal
        show={showCustomerModal}
        mode="edit"
        customer={customer}
        submitting={isSubmitting}
        onClose={onCloseCustomerModal}
        onSubmit={onSubmitCustomer}
      />
      <NewCollectionModal
        show={showCollectionModal}
        onClose={onCloseCollectionModal}
        onSubmit={onSubmitCollection}
        customers={[customer]}
        submitting={isSubmittingCollection}
        defaultCustomerId={customer.id}
        lockCustomerSelection
      />
    </>
  );
}
