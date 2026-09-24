"use client";

import CustomerDetailPageBody from "@/components/customers/detail/CustomerDetailPageBody";
import CustomerDetailPageModals from "@/components/customers/detail/CustomerDetailPageModals";
import useCustomerDetailPage from "@/components/customers/detail/useCustomerDetailPage";

export default function CustomerDetailPage() {
  const page = useCustomerDetailPage();

  return (
    <>
      <CustomerDetailPageBody
        loading={page.loading}
        customer={page.customer}
        isAdmin={page.isAdmin}
        busy={page.busy}
        dataKey={page.dataKey}
        onNewCollection={() => page.setShowCollectionModal(true)}
        onEdit={page.handleEdit}
        onDelete={page.handleDelete}
      />
      <CustomerDetailPageModals
        customer={page.customer}
        showCustomerModal={page.showCustomerModal}
        showCollectionModal={page.showCollectionModal}
        isSubmitting={page.isSubmitting}
        isSubmittingCollection={page.isSubmittingCollection}
        onCloseCustomerModal={() => {
          if (!page.isSubmitting) {
            page.setShowCustomerModal(false);
          }
        }}
        onCloseCollectionModal={() => {
          if (!page.isSubmittingCollection) {
            page.setShowCollectionModal(false);
          }
        }}
        onSubmitCustomer={page.handleModalSubmit}
        onSubmitCollection={page.handleCollectionSubmit}
      />
    </>
  );
}
