"use client";

import { useCallback, useMemo, useState } from "react";
import { Spinner } from "react-bootstrap";
import { useSearchParams } from "next/navigation";

import CollectionHeader from "@/components/collections/CollectionHeader";
import CollectionStats from "@/components/collections/CollectionStats";
import CollectionPageActions from "@/components/collections/CollectionPageActions";
import CollectionFilters from "@/components/collections/CollectionFilters";
import CollectionQuickFilters from "@/components/collections/CollectionQuickFilters";
import CollectionTable from "@/components/collections/CollectionTable";
import CollectionCardGrid from "@/components/collections/CollectionCardGrid";
import CollectionEmptyState from "@/components/collections/CollectionEmptyState";
import DueMaturityBanner from "@/components/collections/DueMaturityBanner";
import FloatingAddButton from "@/components/ui/FloatingAddButton";
import NewCollectionModal from "@/components/collections/NewCollectionModal";
import ImportCollectionsModal from "@/components/collections/ImportCollectionsModal";
import CustomerCollectionDrawer from "@/components/customers/detail/collections/CustomerCollectionDrawer";

import useCollections from "@/hooks/useCollections";
import useConfirmedMutation from "@/hooks/useConfirmedMutation";
import useCustomers from "@/hooks/useCustomers";
import useDueMaturitySummary from "@/context/DueMaturityContext";
import {
  createCollection,
  deleteCollection,
  markCollectionAsPaid,
  updateCollection,
} from "@/services/collectionService";
import {
  EMPTY_COLLECTION_FILTERS,
  buildPageCollectionStats,
  canMarkCollectionAsPaid,
  filterCollections,
  formatCurrency,
  quickFilterFromSearchParams,
} from "@/utils/collectionUtils";

export default function CollectionsView() {
  const searchParams = useSearchParams();
  const queryFilter = quickFilterFromSearchParams(searchParams);
  const { collections, loading, refresh } = useCollections();
  const { refresh: refreshDueMaturity } = useDueMaturitySummary();
  const {
    customers,
    loading: loadingCustomers,
    lastCreatedCustomerId,
    clearLastCreatedCustomerId,
  } = useCustomers();

  const [filters, setFilters] = useState(() => ({
    ...EMPTY_COLLECTION_FILTERS,
    quickFilter: queryFilter,
  }));
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [modalMode, setModalMode] = useState("create");
  const [editingCollection, setEditingCollection] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [queryFilterApplied, setQueryFilterApplied] = useState(queryFilter);

  const submitMutation = useConfirmedMutation();
  const deleteMutation = useConfirmedMutation();

  const isBusy = submitMutation.isRunning || deleteMutation.isRunning;

  if (queryFilter !== "ALL" && queryFilterApplied !== queryFilter) {
    setQueryFilterApplied(queryFilter);
    setFilters((prev) => ({ ...prev, quickFilter: queryFilter }));
  }

  if (queryFilter === "ALL" && queryFilterApplied !== "ALL") {
    setQueryFilterApplied("ALL");
  }

  const refreshAll = useCallback(async () => {
    await refresh();
    await refreshDueMaturity({ silent: true });
  }, [refresh, refreshDueMaturity]);

  const customerMap = useMemo(() => {
    const map = {};

    for (const customer of customers) {
      if (customer?.id) {
        map[customer.id] = customer;
      }
    }

    return map;
  }, [customers]);

  const stats = useMemo(
    () => buildPageCollectionStats(collections),
    [collections]
  );

  const filteredCollections = useMemo(
    () => filterCollections(collections, filters),
    [collections, filters]
  );

  const hasActiveFilters = useMemo(() => {
    return (
      filters.searchQuery.trim().length > 0 ||
      filters.paymentType !== "ALL" ||
      filters.status !== "ALL" ||
      filters.quickFilter !== "ALL"
    );
  }, [filters]);

  const resetModalState = useCallback(() => {
    setShowModal(false);
    setModalMode("create");
    setEditingCollection(null);
    clearLastCreatedCustomerId();
  }, [clearLastCreatedCustomerId]);

  const handleModalSubmit = useCallback(
    async (payload) => {
      if (isBusy) {
        return;
      }

      if (modalMode === "edit" && editingCollection?.id) {
        await submitMutation.run({
          action: () => updateCollection(editingCollection.id, payload),
          successText: "Tahsilat başarıyla güncellendi.",
          errorText: "Tahsilat kaydedilirken hata oluştu.",
          onSuccess: async () => {
            resetModalState();
            await refreshAll();
          },
        });
        return;
      }

      await submitMutation.run({
        action: () => createCollection(payload),
        successText: "Tahsilat başarıyla oluşturuldu.",
        errorText: "Tahsilat kaydedilirken hata oluştu.",
        onSuccess: async () => {
          resetModalState();
          await refreshAll();
        },
      });
    },
    [isBusy, modalMode, editingCollection, submitMutation, resetModalState, refreshAll]
  );

  const handleDeleteCollection = useCallback(
    async (collection) => {
      if (!collection?.id || isBusy) {
        return;
      }

      await deleteMutation.run({
        confirm: {
          title: "Emin misiniz?",
          text: "Bu tahsilatı silmek istediğinize emin misiniz?",
          confirmButtonText: "Evet, sil",
        },
        onConfirmed: () => setDeletingId(collection.id),
        action: () => deleteCollection(collection.id),
        successText: "Tahsilat başarıyla silindi.",
        errorText: "Tahsilat silinirken hata oluştu.",
        onSuccess: async () => {
          setShowDrawer(false);
          await refreshAll();
        },
      });

      setDeletingId(null);
    },
    [isBusy, refreshAll, deleteMutation]
  );

  const handleCloseModal = useCallback(() => {
    if (submitMutation.isRunning) {
      return;
    }

    resetModalState();
  }, [submitMutation.isRunning, resetModalState]);

  const handleOpenCreateModal = useCallback(() => {
    if (isBusy) {
      return;
    }

    setModalMode("create");
    setEditingCollection(null);
    setShowModal(true);
  }, [isBusy]);

  const handleEditCollection = useCallback(
    (collection) => {
      if (isBusy) {
        return;
      }

      setShowDrawer(false);
      setModalMode("edit");
      setEditingCollection(collection);
      setShowModal(true);
    },
    [isBusy]
  );

  const handleViewCollection = useCallback((collection) => {
    setSelectedCollection(collection);
    setShowDrawer(true);
  }, []);

  const handleOpenImportModal = useCallback(() => {
    if (isBusy) {
      return;
    }

    setShowImportModal(true);
  }, [isBusy]);

  const handleImportCompleted = useCallback(async () => {
    await refreshAll();
  }, [refreshAll]);

  const handleClearFilters = useCallback(() => {
    setFilters(EMPTY_COLLECTION_FILTERS);
  }, []);

  const handleSearchChange = useCallback((searchQuery) => {
    setFilters((prev) => ({ ...prev, searchQuery }));
  }, []);

  const handlePaymentTypeChange = useCallback((paymentType) => {
    setFilters((prev) => ({ ...prev, paymentType }));
  }, []);

  const handleStatusChange = useCallback((status) => {
    setFilters((prev) => ({ ...prev, status }));
  }, []);

  const handleQuickFilterChange = useCallback((quickFilter) => {
    setFilters((prev) => ({ ...prev, quickFilter }));
  }, []);

  const handleMarkAsPaid = useCallback(
    async (collection) => {
      if (!collection?.id || isBusy || !canMarkCollectionAsPaid(collection)) {
        return;
      }

      await submitMutation.run({
        confirm: {
          title: "Emin misiniz?",
          text: `"${formatCurrency(
            collection.amount
          )}" tutarındaki tahsilatı tahsil edildi olarak işaretlemek istediğinize emin misiniz?`,
          confirmButtonText: "Evet, işaretle",
        },
        action: () => markCollectionAsPaid(collection.id),
        successText: "Tahsilat tahsil edildi olarak işaretlendi.",
        errorText: "Tahsilat tahsil edildi olarak işaretlenirken hata oluştu.",
        onSuccess: async () => {
          setShowDrawer(false);
          setSelectedCollection(null);
          await refreshAll();
        },
      });
    },
    [isBusy, submitMutation, refreshAll]
  );

  const selectedCustomerName =
    selectedCollection?.customerName ||
    customerMap[selectedCollection?.customerId]?.companyName ||
    "";

  const hasCollections = collections.length > 0;
  const hasFilteredResults = filteredCollections.length > 0;

  return (
    <div className="collections-page ui-page-with-fab">
      <CollectionHeader />

      <DueMaturityBanner />

      {!loading && hasCollections && <CollectionStats stats={stats} />}

      <CollectionPageActions
        onCreate={handleOpenCreateModal}
        onImport={handleOpenImportModal}
        disabled={isBusy}
      />

      {hasCollections && (
        <div className="card border-0 shadow-sm ui-panel-card collection-filters-panel mb-3">
          <div className="card-body d-flex flex-column gap-3">
            <CollectionFilters
              searchQuery={filters.searchQuery}
              onSearchChange={handleSearchChange}
              paymentType={filters.paymentType}
              onPaymentTypeChange={handlePaymentTypeChange}
              status={filters.status}
              onStatusChange={handleStatusChange}
              onClear={handleClearFilters}
              hasActiveFilters={hasActiveFilters}
              disabled={isBusy}
            />

            <CollectionQuickFilters
              value={filters.quickFilter}
              onChange={handleQuickFilterChange}
              disabled={isBusy}
            />
          </div>
        </div>
      )}

      <div className="card border-0 shadow-sm ui-panel-card collection-content-panel">
        <div className="card-body">
          {loading ? (
            <div className="d-flex justify-content-center py-5">
              <Spinner animation="border" role="status" />
            </div>
          ) : !hasCollections ? (
            <CollectionEmptyState onCreate={handleOpenCreateModal} />
          ) : !hasFilteredResults ? (
            <CollectionEmptyState
              filtered
              onClearFilters={handleClearFilters}
            />
          ) : (
            <>
              <div className="d-none d-lg-block">
                <CollectionTable
                  collections={filteredCollections}
                  onView={handleViewCollection}
                  onEdit={handleEditCollection}
                  onDelete={handleDeleteCollection}
                  onMarkAsPaid={handleMarkAsPaid}
                  disabled={isBusy}
                  deletingId={deletingId}
                />
              </div>

              <div className="d-lg-none">
                <CollectionCardGrid
                  collections={filteredCollections}
                  customerMap={customerMap}
                  onView={handleViewCollection}
                  onEdit={handleEditCollection}
                  onDelete={handleDeleteCollection}
                  onMarkAsPaid={handleMarkAsPaid}
                  disabled={isBusy}
                  deletingId={deletingId}
                />
              </div>

              <div className="text-muted small mt-3">
                {filteredCollections.length} / {collections.length} kayıt
                gösteriliyor
              </div>
            </>
          )}
        </div>
      </div>

      <FloatingAddButton
        onClick={handleOpenCreateModal}
        disabled={isBusy}
        ariaLabel="Yeni tahsilat ekle"
      />

      <CustomerCollectionDrawer
        show={showDrawer}
        collection={selectedCollection}
        customerName={selectedCustomerName}
        busy={isBusy}
        onHide={() => setShowDrawer(false)}
        onEdit={handleEditCollection}
        onDelete={handleDeleteCollection}
        onMarkAsPaid={handleMarkAsPaid}
      />

      <NewCollectionModal
        show={showModal}
        onClose={handleCloseModal}
        onSubmit={handleModalSubmit}
        customers={customers}
        submitting={submitMutation.isRunning}
        loadingCustomers={loadingCustomers}
        mode={modalMode}
        initialCollection={editingCollection}
        defaultCustomerId={
          modalMode === "create" ? lastCreatedCustomerId : ""
        }
        lockCustomerSelection={Boolean(
          modalMode === "create" && lastCreatedCustomerId
        )}
      />

      <ImportCollectionsModal
        show={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImported={handleImportCompleted}
      />
    </div>
  );
}
