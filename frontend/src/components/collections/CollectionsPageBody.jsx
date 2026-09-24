"use client";

import CollectionHeader from "@/components/collections/CollectionHeader";
import CollectionStats from "@/components/collections/CollectionStats";
import CollectionPageActions from "@/components/collections/CollectionPageActions";
import CollectionsToolbar from "@/components/collections/CollectionsToolbar";
import CollectionsResults from "@/components/collections/CollectionsResults";
import DueMaturityBanner from "@/components/collections/DueMaturityBanner";
import FloatingAddButton from "@/components/ui/FloatingAddButton";

export default function CollectionsPageBody({
  loading,
  hasCollections,
  collectionsCount,
  list,
  actions,
}) {
  return (
    <div className="collections-page ui-page-with-fab">
      <CollectionHeader />
      <DueMaturityBanner />
      {!loading && hasCollections && <CollectionStats stats={list.stats} />}
      <CollectionPageActions
        onCreate={actions.openCreateModal}
        onImport={actions.openImportModal}
        disabled={actions.isBusy}
      />
      {hasCollections && (
        <CollectionsToolbar
          filters={list.filters}
          hasActiveFilters={list.hasActiveFilters}
          onSearchChange={(value) => list.updateFilter("searchQuery", value)}
          onPaymentTypeChange={(value) =>
            list.updateFilter("paymentType", value)
          }
          onStatusChange={(value) => list.updateFilter("status", value)}
          onClearFilters={list.clearFilters}
          onQuickFilterChange={(value) =>
            list.updateFilter("quickFilter", value)
          }
          isBusy={actions.isBusy}
        />
      )}
      <div className="card border-0 shadow-sm ui-panel-card collection-content-panel">
        <div className="card-body">
          <CollectionsResults
            loading={loading}
            hasCollections={hasCollections}
            filteredCollections={list.filteredCollections}
            collectionsCount={collectionsCount}
            customerMap={list.customerMap}
            onCreate={actions.openCreateModal}
            onClearFilters={list.clearFilters}
            onView={actions.openDrawer}
            onEdit={actions.openEditModal}
            onDelete={actions.handleDeleteCollection}
            onMarkAsPaid={actions.handleMarkAsPaid}
            isBusy={actions.isBusy}
            deletingId={actions.deletingId}
          />
        </div>
      </div>
      <FloatingAddButton
        onClick={actions.openCreateModal}
        disabled={actions.isBusy}
        ariaLabel="Yeni tahsilat ekle"
      />
    </div>
  );
}
