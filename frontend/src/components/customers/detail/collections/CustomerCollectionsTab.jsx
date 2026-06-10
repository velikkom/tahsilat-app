"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Button, ButtonGroup, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";

import useBreakpoint from "@/hooks/useBreakpoint";
import useCustomerCollections from "@/hooks/useCustomerCollections";
import {
  deleteCollection,
  updateCollection,
  createCollection,
} from "@/services/collectionService";
import {
  buildCollectionsSummary,
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const mutationLockRef = useRef(false);

  const busy = isSubmitting || isMutating;

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
    if (isSubmitting) {
      return;
    }
    setShowModal(false);
    setModalMode("create");
    setEditingCollection(null);
  }, [isSubmitting]);

  const handleModalSubmit = useCallback(
    async (payload) => {
      setIsSubmitting(true);

      try {
        if (modalMode === "edit" && editingCollection?.id) {
          await updateCollection(editingCollection.id, payload);
        } else {
          await createCollection(payload);
        }

        setShowModal(false);
        setModalMode("create");
        setEditingCollection(null);

        await Swal.fire({
          icon: "success",
          title: "Başarılı",
          text:
            modalMode === "edit"
              ? "Tahsilat başarıyla güncellendi."
              : "Tahsilat başarıyla oluşturuldu.",
          confirmButtonText: "Tamam",
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
        setIsSubmitting(false);
      }
    },
    [modalMode, editingCollection, refresh]
  );

  const handleDeleteCollection = useCallback(
    async (collection) => {
      if (!collection?.id || busy || mutationLockRef.current) {
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

      mutationLockRef.current = true;
      setIsMutating(true);

      try {
        await deleteCollection(collection.id);

        setShowDrawer(false);

        await Swal.fire({
          icon: "success",
          title: "Başarılı",
          text: "Tahsilat başarıyla silindi.",
          confirmButtonText: "Tamam",
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
        mutationLockRef.current = false;
        setIsMutating(false);
      }
    },
    [busy, refresh]
  );

  /*
   * TODO(backend): Status guncellemek icin ayri bir endpoint yok.
   * UpdateCollectionRequest status alani icermiyor ve PUT /collections/{id}
   * tum alanlari zorunlu kiliyor. Backend'e
   * PATCH /api/v1/collections/{id}/status (veya mark-as-paid) endpoint'i
   * eklendiginde asagidaki bilgilendirme yerine gercek cagri baglanmali.
   */
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
        submitting={isSubmitting}
        loadingCustomers={false}
        mode={modalMode}
        initialCollection={editingCollection}
        defaultCustomerId={customer.id}
      />
    </div>
  );
}
