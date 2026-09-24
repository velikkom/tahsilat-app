"use client";

import CollectionsPageBody from "@/components/collections/CollectionsPageBody";
import CollectionsPageModals from "@/components/collections/CollectionsPageModals";
import useCollectionList from "@/components/collections/useCollectionList";
import useCollectionActions from "@/components/collections/useCollectionActions";
import useCollections from "@/hooks/useCollections";
import useCustomers from "@/hooks/useCustomers";
import useDueMaturitySummary from "@/context/DueMaturityContext";

export default function CollectionsView() {
  const { collections, loading, refresh } = useCollections();
  const { refresh: refreshDueMaturity } = useDueMaturitySummary();
  const {
    customers,
    loading: loadingCustomers,
    lastCreatedCustomerId,
    clearLastCreatedCustomerId,
  } = useCustomers();
  const list = useCollectionList(collections, customers);
  const actions = useCollectionActions({
    refresh,
    refreshDueMaturity,
    clearLastCreatedCustomerId,
  });
  const selectedCustomerName =
    actions.selectedCollection?.customerName ||
    list.customerMap[actions.selectedCollection?.customerId]?.companyName ||
    "";

  return (
    <>
      <CollectionsPageBody
        loading={loading}
        hasCollections={collections.length > 0}
        collectionsCount={collections.length}
        list={list}
        actions={actions}
      />
      <CollectionsPageModals
        showDrawer={actions.showDrawer}
        selectedCollection={actions.selectedCollection}
        selectedCustomerName={selectedCustomerName}
        isBusy={actions.isBusy}
        onHideDrawer={actions.closeDrawer}
        onEdit={actions.openEditModal}
        onDelete={actions.handleDeleteCollection}
        onMarkAsPaid={actions.handleMarkAsPaid}
        showModal={actions.showModal}
        onCloseModal={actions.closeModal}
        onSubmit={actions.handleModalSubmit}
        customers={customers}
        submitting={actions.submitMutation.isRunning}
        loadingCustomers={loadingCustomers}
        modalMode={actions.modalMode}
        editingCollection={actions.editingCollection}
        lastCreatedCustomerId={lastCreatedCustomerId}
        showImportModal={actions.showImportModal}
        onCloseImport={actions.closeImportModal}
        onImported={actions.handleImportCompleted}
      />
    </>
  );
}
