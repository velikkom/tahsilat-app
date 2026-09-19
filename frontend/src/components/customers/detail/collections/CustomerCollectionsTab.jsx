"use client";

import { useCallback, useMemo, useState } from "react";
import { Button, ButtonGroup, Spinner } from "react-bootstrap";

import useBreakpoint from "@/hooks/useBreakpoint";
import useConfirmedMutation from "@/hooks/useConfirmedMutation";
import useCustomerCollections from "@/hooks/useCustomerCollections";
import useDueMaturitySummary from "@/context/DueMaturityContext";
import {
  deleteCollection,
  updateCollection,
  createCollection,
  markCollectionAsPaid,
} from "@/services/collectionService";
import {
  buildCollectionsSummary,
  canMarkCollectionAsPaid,
  formatCurrency,
  getEffectiveStatus,
  getPaymentTypeLabel,
} from "@/utils/collectionUtils";

import NewCollectionModal from "@/components/collections/NewCollectionModal";
import CustomerCollectionsSummary from "./CustomerCollectionsSummary";
import CustomerCollectionsFilters from "./CustomerCollectionsFilters";
import CustomerCollectionsSearch from "./CustomerCollectionsSearch";
import CustomerCollectionsTable from "./CustomerCollectionsTable";
import CustomerCollectionCard from "./CustomerCollectionCard";
import CustomerCollectionDrawer from "./CustomerCollectionDrawer";
import CustomerCollectionsTimeline from "./CustomerCollectionsTimeline";
import EmptyCollectionsState from "./EmptyCollectionsState";

export default function CustomerCollectionsTab({ customer }) {
  const { collections, loading, refresh } = useCustomerCollections(
    customer.id
  );
  const { refresh: refreshDueMaturity } = useDueMaturitySummary();
  const { isMobile } = useBreakpoint();

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentTypeFilters, setPaymentTypeFilters] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("TABLE");

  const [selectedCollection, setSelectedCollection] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingCollection, setEditingCollection] = useState(null);

  const submitMutation = useConfirmedMutation();
  const rowActionMutation = useConfirmedMutation();

  const busy = submitMutation.isRunning || rowActionMutation.isRunning;

  const refreshAll = useCallback(async () => {
    await refresh();
    await refreshDueMaturity({ silent: true });
  }, [refresh, refreshDueMaturity]);

  const summary = useMemo(
    () => buildCollectionsSummary(collections),
    [collections]
  );

  const filteredCollections = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase("tr-TR");

    return collections.filter((collection) => {
      const status = getEffectiveStatus(collection);

      if (statusFilter !== "ALL" && status !== statusFilter) {
        return false;
      }

      if (
        paymentTypeFilters.length > 0 &&
        !paymentTypeFilters.includes(collection.paymentType)
      ) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const haystack = [
        collection.description || "",
        collection.paymentType || "",
        getPaymentTypeLabel(collection.paymentType),
        String(collection.amount ?? ""),
        formatCurrency(collection.amount),
      ]
        .join(" ")
        .toLocaleLowerCase("tr-TR");

      return haystack.includes(normalizedSearch);
    });
  }, [collections, statusFilter, paymentTypeFilters, searchTerm]);

  const hasActiveFilters =
    statusFilter !== "ALL" ||
    paymentTypeFilters.length > 0 ||
    searchTerm.trim().length > 0;

  const handleTogglePaymentType = useCallback((paymentType) => {
    setPaymentTypeFilters((prev) =>
      prev.includes(paymentType)
        ? prev.filter((value) => value !== paymentType)
        : [...prev, paymentType]
    );
  }, []);

  const handleClearFilters = useCallback(() => {
    setStatusFilter("ALL");
    setPaymentTypeFilters([]);
    setSearchTerm("");
  }, []);

  const handleSelectCollection = useCallback((collection) => {
    setSelectedCollection(collection);
    setShowDrawer(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setShowDrawer(false);
  }, []);

  const handleOpenCreateModal = useCallback(() => {
    if (busy) {
      return;
    }
    setModalMode("create");
    setEditingCollection(null);
    setShowModal(true);
  }, [busy]);

  const handleEditCollection = useCallback(
    (collection) => {
      if (busy) {
        return;
      }
      setShowDrawer(false);
      setModalMode("edit");
      setEditingCollection(collection);
      setShowModal(true);
    },
    [busy]
  );

  const handleCloseModal = useCallback(() => {
    if (submitMutation.isRunning) {
      return;
    }
    setShowModal(false);
    setModalMode("create");
    setEditingCollection(null);
  }, [submitMutation.isRunning]);

  const handleModalSubmit = useCallback(
    async (payload) => {
      if (busy) {
        return;
      }

      const isEdit = modalMode === "edit" && Boolean(editingCollection?.id);

      await submitMutation.run({
        action: () =>
          isEdit
            ? updateCollection(editingCollection.id, payload)
            : createCollection(payload),
        successText: isEdit
          ? "Tahsilat başarıyla güncellendi."
          : "Tahsilat başarıyla oluşturuldu.",
        errorText: "Tahsilat kaydedilirken hata oluştu.",
        onSuccess: async () => {
          setShowModal(false);
          setModalMode("create");
          setEditingCollection(null);
          await refreshAll();
        },
      });
    },
    [busy, modalMode, editingCollection, submitMutation, refreshAll]
  );

  const handleDeleteCollection = useCallback(
    async (collection) => {
      if (!collection?.id || busy) {
        return;
      }

      await rowActionMutation.run({
        confirm: {
          title: "Emin misiniz?",
          text: "Bu tahsilatı silmek istediğinize emin misiniz?",
          confirmButtonText: "Evet, sil",
        },
        action: () => deleteCollection(collection.id),
        successText: "Tahsilat başarıyla silindi.",
        errorText: "Tahsilat silinirken hata oluştu.",
        onSuccess: async () => {
          setShowDrawer(false);
          await refreshAll();
        },
      });
    },
    [busy, rowActionMutation, refreshAll]
  );

  const handleMarkAsPaid = useCallback(
    async (collection) => {
      if (!collection?.id || busy || !canMarkCollectionAsPaid(collection)) {
        return;
      }

      await rowActionMutation.run({
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
          await refreshAll();
        },
      });
    },
    [busy, rowActionMutation, refreshAll]
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  const hasCollections = collections.length > 0;
  const hasFilteredResults = filteredCollections.length > 0;

  return (
    <div className="customer-collections-tab d-flex flex-column gap-3 gap-md-4">
      {hasCollections && <CustomerCollectionsSummary summary={summary} />}

      {hasCollections && (
        <div className="card border-0 shadow-sm">
          <div className="card-body d-flex flex-column gap-3">
            <div className="d-flex flex-column flex-lg-row justify-content-between gap-2 gap-lg-3">
              <CustomerCollectionsSearch
                value={searchTerm}
                onChange={setSearchTerm}
              />

              <div className="d-flex justify-content-between align-items-center gap-2 flex-shrink-0">
                <ButtonGroup size="sm">
                  <Button
                    variant={
                      viewMode === "TABLE" ? "primary" : "outline-secondary"
                    }
                    onClick={() => setViewMode("TABLE")}
                  >
                    <i className="pi pi-table me-1" aria-hidden="true" />
                    Tablo
                  </Button>
                  <Button
                    variant={
                      viewMode === "TIMELINE" ? "primary" : "outline-secondary"
                    }
                    onClick={() => setViewMode("TIMELINE")}
                  >
                    <i className="pi pi-sort-amount-down me-1" aria-hidden="true" />
                    Timeline
                  </Button>
                </ButtonGroup>

                <Button size="sm" variant="primary" onClick={handleOpenCreateModal}>
                  <i className="pi pi-plus me-1" aria-hidden="true" />
                  Yeni
                </Button>
              </div>
            </div>

            <CustomerCollectionsFilters
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              paymentTypeFilters={paymentTypeFilters}
              onTogglePaymentType={handleTogglePaymentType}
            />
          </div>
        </div>
      )}

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {!hasCollections ? (
            <EmptyCollectionsState onCreate={handleOpenCreateModal} />
          ) : !hasFilteredResults ? (
            <EmptyCollectionsState
              filtered
              onClearFilters={handleClearFilters}
            />
          ) : viewMode === "TIMELINE" ? (
            <CustomerCollectionsTimeline
              collections={filteredCollections}
              onSelect={handleSelectCollection}
            />
          ) : isMobile ? (
            <div className="d-flex flex-column gap-2">
              {filteredCollections.map((collection) => (
                <CustomerCollectionCard
                  key={collection.id}
                  collection={collection}
                  onSelect={handleSelectCollection}
                  onMarkAsPaid={handleMarkAsPaid}
                  busy={busy}
                />
              ))}
            </div>
          ) : (
            <CustomerCollectionsTable
              collections={filteredCollections}
              onSelect={handleSelectCollection}
              onEdit={handleEditCollection}
              onDelete={handleDeleteCollection}
              onMarkAsPaid={handleMarkAsPaid}
              busy={busy}
            />
          )}

          {hasCollections && hasFilteredResults && (
            <div className="text-muted small mt-3">
              {filteredCollections.length} / {collections.length} kayıt
              gösteriliyor
            </div>
          )}
        </div>
      </div>

      <CustomerCollectionDrawer
        show={showDrawer}
        collection={selectedCollection}
        customerName={customer.companyName}
        busy={busy}
        onHide={closeDrawer}
        onEdit={handleEditCollection}
        onDelete={handleDeleteCollection}
        onMarkAsPaid={handleMarkAsPaid}
      />

      <NewCollectionModal
        show={showModal}
        onClose={handleCloseModal}
        onSubmit={handleModalSubmit}
        customers={[customer]}
        submitting={submitMutation.isRunning}
        loadingCustomers={false}
        mode={modalMode}
        initialCollection={editingCollection}
        defaultCustomerId={customer.id}
      />
    </div>
  );
}
