"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Spinner } from "react-bootstrap";
import Swal from "sweetalert2";

import CollectionHeader from "@/components/collections/CollectionHeader";
import CollectionStats from "@/components/collections/CollectionStats";
import CollectionPageActions from "@/components/collections/CollectionPageActions";
import CollectionFilters from "@/components/collections/CollectionFilters";
import CollectionQuickFilters from "@/components/collections/CollectionQuickFilters";
import CollectionTable from "@/components/collections/CollectionTable";
import CollectionCardGrid from "@/components/collections/CollectionCardGrid";
import CollectionEmptyState from "@/components/collections/CollectionEmptyState";
import FloatingAddButton from "@/components/collections/FloatingAddButton";
import NewCollectionModal from "@/components/collections/NewCollectionModal";
import ImportCollectionsModal from "@/components/collections/ImportCollectionsModal";
import CustomerCollectionDrawer from "@/components/customers/detail/collections/CustomerCollectionDrawer";

import useCollections from "@/hooks/useCollections";
import useCustomers from "@/hooks/useCustomers";
import {
  createCollection,
  deleteCollection,
  updateCollection,
} from "@/services/collectionService";
import {
  EMPTY_COLLECTION_FILTERS,
  buildPageCollectionStats,
  filterCollections,
  formatCurrency,
} from "@/utils/collectionUtils";

export default function CollectionsView() {
  const { collections, loading, refresh } = useCollections();
  const {
    customers,
    loading: loadingCustomers,
    lastCreatedCustomerId,
    clearLastCreatedCustomerId,
  } = useCustomers();

  const [filters, setFilters] = useState(EMPTY_COLLECTION_FILTERS);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [modalMode, setModalMode] = useState("create");
  const [editingCollection, setEditingCollection] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const submittingRef = useRef(false);
  const deletingRef = useRef(false);

  const isBusy = isSubmitting || isDeleting;

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

  const executeSubmission = useCallback(
    async (action, successText) => {
      if (submittingRef.current || deletingRef.current) {
        return;
      }

      submittingRef.current = true;
      setIsSubmitting(true);

      try {
        await action();
        resetModalState();

        await Swal.fire({
          icon: "success",
          title: "Başarılı",
          text: successText,
          confirmButtonText: "Tamam",
          allowOutsideClick: false,
          allowEscapeKey: false,
        });

        await refresh();
      } catch (error) {
        console.error(error);

        await Swal.fire({
          icon: "error",
          title: "Hata",
          text: error.message || "Tahsilat kaydedilirken hata oluştu.",
        });
      } finally {
        submittingRef.current = false;
        setIsSubmitting(false);
      }
    },
    [refresh, resetModalState]
  );

  const handleModalSubmit = useCallback(
    async (payload) => {
      if (modalMode === "edit" && editingCollection?.id) {
        await executeSubmission(
          () => updateCollection(editingCollection.id, payload),
          "Tahsilat başarıyla güncellendi."
        );
        return;
      }

      await executeSubmission(
        () => createCollection(payload),
        "Tahsilat başarıyla oluşturuldu."
      );
    },
    [modalMode, editingCollection, executeSubmission]
  );

  const handleDeleteCollection = useCallback(
    async (collection) => {
      if (!collection?.id || isBusy || deletingRef.current) {
        return;
      }

      const confirmation = await Swal.fire({
        title: "Emin misiniz?",
        text: "Bu tahsilatı silmek istediğinize emin misiniz?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Evet, sil",
        cancelButtonText: "İptal",
        reverseButtons: true,
        focusCancel: true,
      });

      if (!confirmation.isConfirmed) {
        return;
      }

      if (deletingRef.current) {
        return;
      }

      deletingRef.current = true;
      setIsDeleting(true);
      setDeletingId(collection.id);

      try {
        await deleteCollection(collection.id);
        setShowDrawer(false);

        await Swal.fire({
          icon: "success",
          title: "Başarılı",
          text: "Tahsilat başarıyla silindi.",
          confirmButtonText: "Tamam",
          allowOutsideClick: false,
          allowEscapeKey: false,
        });

        await refresh();
      } catch (error) {
        console.error(error);

        await Swal.fire({
          icon: "error",
          title: "Hata",
          text: error.message || "Tahsilat silinirken hata oluştu.",
        });
      } finally {
        deletingRef.current = false;
        setIsDeleting(false);
        setDeletingId(null);
      }
    },
    [isBusy, refresh]
  );

  const handleCloseModal = useCallback(() => {
    if (isSubmitting) {
      return;
    }

    resetModalState();
  }, [isSubmitting, resetModalState]);

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
    await refresh();
  }, [refresh]);

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

  const handleMarkAsPaid = useCallback(async (collection) => {
    await Swal.fire({
      icon: "info",
      title: "Yakında",
      text: `"${formatCurrency(
        collection.amount
      )}" tutarındaki tahsilatı tahsil edildi olarak işaretleme özelliği için backend endpoint'i bekleniyor.`,
      confirmButtonText: "Tamam",
    });
  }, []);

  const selectedCustomerName =
    selectedCollection?.customerName ||
    customerMap[selectedCollection?.customerId]?.companyName ||
    "";

  const hasCollections = collections.length > 0;
  const hasFilteredResults = filteredCollections.length > 0;

  return (
    <div className="collections-page">
      <CollectionHeader />

      {!loading && hasCollections && <CollectionStats stats={stats} />}

      <CollectionPageActions
        onCreate={handleOpenCreateModal}
        onImport={handleOpenImportModal}
        disabled={isBusy}
      />

      {hasCollections && (
        <div className="card border-0 shadow-sm collection-filters-panel mb-3">
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

      <div className="card border-0 shadow-sm collection-content-panel">
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

      <FloatingAddButton onClick={handleOpenCreateModal} disabled={isBusy} />

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
        submitting={isSubmitting}
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
