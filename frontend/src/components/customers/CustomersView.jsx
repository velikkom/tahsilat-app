"use client";

import CustomersPageBody from "@/components/customers/CustomersPageBody";
import CustomersPageModals from "@/components/customers/CustomersPageModals";
import useCustomers from "@/hooks/useCustomers";
import useCurrentUser from "@/hooks/useCurrentUser";
import useCustomerList from "@/components/customers/useCustomerList";
import useCustomerActions from "@/components/customers/useCustomerActions";

export default function CustomersView() {
  const customersState = useCustomers();
  const { isAdmin } = useCurrentUser();
  const list = useCustomerList(customersState.customers);
  const actions = useCustomerActions({
    refresh: customersState.refresh,
    registerCustomerCreated: customersState.registerCustomerCreated,
    clearLastCreatedCustomerId: customersState.clearLastCreatedCustomerId,
  });
  const defaultCustomerId =
    actions.collectionCustomerId || customersState.lastCreatedCustomerId;

  return (
    <>
      <CustomersPageBody
        loading={customersState.loading}
        hasCustomers={customersState.customers.length > 0}
        list={list}
        actions={actions}
        isAdmin={isAdmin}
        customersCount={customersState.customers.length}
      />
      <CustomersPageModals
        showFilters={actions.showFilters}
        filters={list.filters}
        onHideFilters={() => actions.setShowFilters(false)}
        onApplyFilters={list.setFilters}
        onResetFilters={list.clearFilters}
        showCustomerModal={actions.showCustomerModal}
        modalMode={actions.modalMode}
        editingCustomer={actions.editingCustomer}
        customerSubmitting={actions.customerMutation.isRunning}
        onCloseCustomerModal={actions.closeCustomerModal}
        onSubmitCustomer={actions.handleModalSubmit}
        showCollectionModal={actions.showCollectionModal}
        onCloseCollectionModal={actions.closeCollectionModal}
        onSubmitCollection={actions.handleCollectionSubmit}
        customers={customersState.customers}
        collectionSubmitting={actions.collectionMutation.isRunning}
        loadingCustomers={customersState.loading}
        defaultCustomerId={defaultCustomerId}
        lockCustomerSelection={Boolean(defaultCustomerId)}
      />
    </>
  );
}
