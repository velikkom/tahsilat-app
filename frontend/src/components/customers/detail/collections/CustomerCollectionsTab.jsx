"use client";

import { Spinner } from "react-bootstrap";
import CustomerCollectionsModals from "./CustomerCollectionsModals";
import CustomerCollectionsResults from "./CustomerCollectionsResults";
import CustomerCollectionsSummary from "./CustomerCollectionsSummary";
import CustomerCollectionsToolbar from "./CustomerCollectionsToolbar";
import useCustomerCollectionsTab from "./useCustomerCollectionsTab";

export default function CustomerCollectionsTab({ customer }) {
  const tab = useCustomerCollectionsTab(customer);

  if (tab.loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  return (
    <div className="customer-collections-tab d-flex flex-column gap-3 gap-md-4">
      {tab.hasCollections && (
        <CustomerCollectionsSummary summary={tab.summary} />
      )}

      {tab.hasCollections && (
        <CustomerCollectionsToolbar
          searchTerm={tab.searchTerm}
          onSearchChange={tab.setSearchTerm}
          viewMode={tab.viewMode}
          onViewModeChange={tab.setViewMode}
          onCreate={tab.handleOpenCreateModal}
          statusFilter={tab.statusFilter}
          onStatusFilterChange={tab.setStatusFilter}
          paymentTypeFilters={tab.paymentTypeFilters}
          onTogglePaymentType={tab.handleTogglePaymentType}
        />
      )}

      <CustomerCollectionsResults
        hasCollections={tab.hasCollections}
        hasFilteredResults={tab.hasFilteredResults}
        viewMode={tab.viewMode}
        isMobile={tab.isMobile}
        filteredCollections={tab.filteredCollections}
        collectionsCount={tab.collections.length}
        busy={tab.busy}
        onCreate={tab.handleOpenCreateModal}
        onClearFilters={tab.handleClearFilters}
        onSelect={tab.handleSelectCollection}
        onEdit={tab.handleEditCollection}
        onDelete={tab.handleDeleteCollection}
        onMarkAsPaid={tab.handleMarkAsPaid}
      />

      <CustomerCollectionsModals
        customer={customer}
        showDrawer={tab.showDrawer}
        selectedCollection={tab.selectedCollection}
        busy={tab.busy}
        onHideDrawer={tab.closeDrawer}
        onEdit={tab.handleEditCollection}
        onDelete={tab.handleDeleteCollection}
        onMarkAsPaid={tab.handleMarkAsPaid}
        showModal={tab.showModal}
        onCloseModal={tab.handleCloseModal}
        onSubmitModal={tab.handleModalSubmit}
        isSubmitting={tab.isSubmitting}
        modalMode={tab.modalMode}
        editingCollection={tab.editingCollection}
      />
    </div>
  );
}
