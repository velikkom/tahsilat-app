"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import { FaFilter, FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";

import CustomersHeader from "@/components/customers/CustomersHeader";
import CustomerStats from "@/components/customers/CustomerStats";
import CustomerSearchBar from "@/components/customers/CustomerSearchBar";
import CustomerQuickFilters from "@/components/customers/CustomerQuickFilters";
import CustomerCardGrid from "@/components/customers/CustomerCardGrid";
import CustomerPagination from "@/components/customers/CustomerPagination";
import CustomersDesktopTable from "@/components/customers/CustomersDesktopTable";
import CustomerDetailDrawer from "@/components/customers/CustomerDetailDrawer";
import CustomerFiltersDrawer from "@/components/customers/CustomerFiltersDrawer";
import CustomerCreateModal from "@/components/customers/CustomerCreateModal";
import CustomerEmptyState from "@/components/customers/CustomerEmptyState";
import FloatingAddButton from "@/components/ui/FloatingAddButton";
import NewCollectionModal from "@/components/collections/NewCollectionModal";

import useCustomers from "@/hooks/useCustomers";
import useCurrentUser from "@/hooks/useCurrentUser";
import { createCollection } from "@/services/collectionService";
import {
  createCustomer,
  deleteCustomer,
  updateCustomer,
} from "@/services/customerService";
import {
  CUSTOMER_ACTIVE_FILTER,
  CUSTOMER_QUICK_FILTER,
  EMPTY_CUSTOMER_FILTERS,
  applyCustomerQuickFilter,
  buildPageCustomerStats,
  filterCustomers,
  paginateCustomers,
} from "@/utils/customerUtils";

export default function CustomersView() {
  const {
    customers,
    loading,
    refresh,
    registerCustomerCreated,
    lastCreatedCustomerId,
    clearLastCreatedCustomerId,
  } = useCustomers();
  const { isAdmin } = useCurrentUser();

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState(EMPTY_CUSTOMER_FILTERS);
  const [quickFilter, setQuickFilter] = useState(CUSTOMER_QUICK_FILTER.ALL);
  const [mobilePage, setMobilePage] = useState(1);

  const [showFilters, setShowFilters] = useState(false);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [modalMode, setModalMode] = useState("create");
  const [editingCustomer, setEditingCustomer] = useState(null);

  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [collectionCustomerId, setCollectionCustomerId] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingCollection, setIsSubmittingCollection] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const isBusy = isSubmitting || isSubmittingCollection || isDeleting;

  const stats = useMemo(
    () => buildPageCustomerStats(customers),
    [customers]
  );

  const filteredCustomers = useMemo(() => {
    const base = filterCustomers(customers, searchQuery, filters);
    return applyCustomerQuickFilter(base, quickFilter);
  }, [customers, searchQuery, filters, quickFilter]);

  const mobilePagination = useMemo(
    () => paginateCustomers(filteredCustomers, mobilePage),
    [filteredCustomers, mobilePage]
  );

  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery.trim().length > 0 ||
      quickFilter !== CUSTOMER_QUICK_FILTER.ALL ||
      Boolean(filters.companyName) ||
      Boolean(filters.authorizedPerson) ||
      Boolean(filters.phone) ||
      filters.active !== CUSTOMER_ACTIVE_FILTER.ALL
    );
  }, [searchQuery, quickFilter, filters]);

  useEffect(() => {
    setMobilePage(1);
  }, [searchQuery, filters, quickFilter]);

  useEffect(() => {
    if (mobilePage > mobilePagination.totalPages) {
      setMobilePage(mobilePagination.totalPages);
    }
  }, [mobilePage, mobilePagination.totalPages]);

  const openDetail = useCallback((customer) => {
    setSelectedCustomer(customer);
    setShowDetailDrawer(true);
  }, []);

  const closeDetail = useCallback(() => {
    setShowDetailDrawer(false);
  }, []);

  const openCreateModal = useCallback(() => {
    if (isBusy) {
      return;
    }

    setModalMode("create");
    setEditingCustomer(null);
    setShowCustomerModal(true);
  }, [isBusy]);

  const openEditModal = useCallback(
    (customer) => {
      if (isBusy) {
        return;
      }

      setShowDetailDrawer(false);
      setModalMode("edit");
      setEditingCustomer(customer);
      setShowCustomerModal(true);
    },
    [isBusy]
  );

  const openCollectionModal = useCallback(
    (customer) => {
      if (isBusy || !customer?.id) {
        return;
      }

      setShowDetailDrawer(false);
      setCollectionCustomerId(customer.id);
      setShowCollectionModal(true);
    },
    [isBusy]
  );

  const closeCollectionModal = useCallback(() => {
    if (isSubmittingCollection) {
      return;
    }

    setShowCollectionModal(false);
    setCollectionCustomerId("");
    clearLastCreatedCustomerId();
  }, [isSubmittingCollection, clearLastCreatedCustomerId]);

  const handleCollectionSubmit = useCallback(async (payload) => {
    setIsSubmittingCollection(true);

    try {
      await createCollection(payload);

      await Swal.fire({
        icon: "success",
        title: "Başarılı",
        text: "Tahsilat başarıyla oluşturuldu.",
        confirmButtonText: "Tamam",
      });

      closeCollectionModal();
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Hata",
        text: error.message || "Tahsilat kaydedilemedi.",
      });
    } finally {
      setIsSubmittingCollection(false);
    }
  }, [closeCollectionModal]);

  const closeCustomerModal = useCallback(() => {
    if (isSubmitting) {
      return;
    }

    setShowCustomerModal(false);
    setEditingCustomer(null);
    setModalMode("create");
  }, [isSubmitting]);

  const handleApplyFilters = useCallback((nextFilters) => {
    setFilters(nextFilters);
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setFilters(EMPTY_CUSTOMER_FILTERS);
    setQuickFilter(CUSTOMER_QUICK_FILTER.ALL);
    setSearchQuery("");
  }, []);

  const handleModalSubmit = useCallback(
    async (payload) => {
      setIsSubmitting(true);

      try {
        if (modalMode === "edit" && editingCustomer?.id) {
          await updateCustomer(editingCustomer.id, payload);
          await Swal.fire({
            icon: "success",
            title: "Başarılı",
            text: "Müşteri başarıyla güncellendi.",
            confirmButtonText: "Tamam",
          });
          closeCustomerModal();
          await refresh();
        } else {
          const createdCustomer = await createCustomer(payload);
          await registerCustomerCreated(createdCustomer);
          await Swal.fire({
            icon: "success",
            title: "Başarılı",
            text: "Müşteri başarıyla oluşturuldu.",
            confirmButtonText: "Tamam",
          });
          closeCustomerModal();
        }
      } catch (error) {
        await Swal.fire({
          icon: "error",
          title: "Hata",
          text: error.message || "Müşteri kaydedilemedi.",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [modalMode, editingCustomer, closeCustomerModal, refresh, registerCustomerCreated]
  );

  const handleDeleteCustomer = useCallback(
    async (customer) => {
      if (!customer?.id || isBusy) {
        return;
      }

      const confirmation = await Swal.fire({
        title: "Emin misiniz?",
        text: `${customer.companyName} müşterisini silmek istediğinize emin misiniz?`,
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

      setIsDeleting(true);
      setDeletingId(customer.id);

      try {
        await deleteCustomer(customer.id);

        await Swal.fire({
          icon: "success",
          title: "Başarılı",
          text: "Müşteri başarıyla silindi.",
          confirmButtonText: "Tamam",
        });

        if (selectedCustomer?.id === customer.id) {
          closeDetail();
          setSelectedCustomer(null);
        }

        await refresh();
      } catch (error) {
        await Swal.fire({
          icon: "error",
          title: "Hata",
          text: error.message || "Müşteri silinemedi.",
        });
      } finally {
        setIsDeleting(false);
        setDeletingId(null);
      }
    },
    [isBusy, selectedCustomer, closeDetail, refresh]
  );

  const hasCustomers = customers.length > 0;
  const hasFilteredResults = filteredCustomers.length > 0;

  return (
    <>
      <div className="customers-page ui-page-with-fab d-flex flex-column gap-3 gap-md-4">
        <CustomersHeader />

        {!loading && hasCustomers && <CustomerStats stats={stats} />}

        {hasCustomers && (
          <div className="card border-0 shadow-sm ui-panel-card customer-filters-panel">
            <div className="card-body d-flex flex-column gap-3">
              <div className="d-flex flex-column flex-md-row gap-2 align-items-stretch">
                <CustomerSearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                />

                {hasActiveFilters && (
                  <Button
                    variant="outline-secondary"
                    className="customer-filters__clear-btn touch-target flex-shrink-0"
                    onClick={handleClearAllFilters}
                    disabled={isBusy}
                  >
                    <i className="pi pi-filter-slash me-1" aria-hidden="true" />
                    Temizle
                  </Button>
                )}
              </div>

              <div className="customers-toolbar__actions d-flex flex-column flex-md-row gap-2">
                <Button
                  variant="outline-secondary"
                  className="customers-toolbar__filter-btn touch-target"
                  onClick={() => setShowFilters(true)}
                  disabled={isBusy}
                >
                  <FaFilter className="me-2" aria-hidden="true" />
                  Filtrele
                </Button>

                {isAdmin && (
                  <Button
                    variant="primary"
                    className="customers-toolbar__create-btn touch-target d-none d-lg-inline-flex"
                    onClick={openCreateModal}
                    disabled={isBusy}
                  >
                    <FaPlus className="me-2" aria-hidden="true" />
                    Yeni Müşteri
                  </Button>
                )}
              </div>

              <CustomerQuickFilters
                value={quickFilter}
                onChange={setQuickFilter}
                disabled={isBusy}
              />
            </div>
          </div>
        )}

        <div className="card border-0 shadow-sm ui-panel-card customer-content-panel">
          <div className="card-body">
            {loading ? (
              <div className="d-flex justify-content-center py-5">
                <Spinner animation="border" role="status" />
              </div>
            ) : !hasCustomers ? (
              <CustomerEmptyState
                onCreate={openCreateModal}
                showCreate={isAdmin}
              />
            ) : !hasFilteredResults ? (
              <CustomerEmptyState
                filtered
                onClearFilters={handleClearAllFilters}
              />
            ) : (
              <>
                <div className="d-none d-lg-block">
                  <CustomersDesktopTable
                    customers={filteredCustomers}
                    loading={loading}
                    onView={openDetail}
                    onEdit={openEditModal}
                    onDelete={handleDeleteCustomer}
                    onNewCollection={openCollectionModal}
                    showEdit={isAdmin}
                    showDelete={isAdmin}
                    busy={isBusy}
                    deletingId={deletingId}
                  />
                </div>

                <div className="customers-page__card-list d-lg-none d-flex flex-column gap-3 min-width-0">
                  <CustomerCardGrid
                    customers={mobilePagination.items}
                    onView={openDetail}
                    onEdit={openEditModal}
                    onDelete={handleDeleteCustomer}
                    onNewCollection={openCollectionModal}
                    showEdit={isAdmin}
                    showDelete={isAdmin}
                    disabled={isBusy}
                    deletingId={deletingId}
                  />

                  {mobilePagination.totalPages > 1 && (
                    <CustomerPagination
                      currentPage={mobilePagination.currentPage}
                      totalPages={mobilePagination.totalPages}
                      onPrevious={() =>
                        setMobilePage((page) => Math.max(1, page - 1))
                      }
                      onNext={() =>
                        setMobilePage((page) =>
                          Math.min(mobilePagination.totalPages, page + 1)
                        )
                      }
                      disabled={isBusy}
                    />
                  )}
                </div>

                <div className="text-muted small mt-3">
                  {filteredCustomers.length} / {customers.length} kayıt
                  gösteriliyor
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {isAdmin && (
        <FloatingAddButton
          onClick={openCreateModal}
          disabled={isBusy}
          ariaLabel="Yeni müşteri ekle"
        />
      )}

      <CustomerDetailDrawer
        show={showDetailDrawer}
        customer={selectedCustomer}
        onHide={closeDetail}
        onEdit={openEditModal}
        onDelete={handleDeleteCustomer}
        onNewCollection={openCollectionModal}
        showEdit={isAdmin}
        showDelete={isAdmin}
        busy={isBusy}
      />

      <CustomerFiltersDrawer
        show={showFilters}
        filters={filters}
        onHide={() => setShowFilters(false)}
        onApply={handleApplyFilters}
        onReset={handleClearAllFilters}
      />

      <CustomerCreateModal
        show={showCustomerModal}
        mode={modalMode}
        customer={editingCustomer}
        submitting={isSubmitting}
        onClose={closeCustomerModal}
        onSubmit={handleModalSubmit}
      />

      <NewCollectionModal
        show={showCollectionModal}
        onClose={closeCollectionModal}
        onSubmit={handleCollectionSubmit}
        customers={customers}
        submitting={isSubmittingCollection}
        loadingCustomers={loading}
        defaultCustomerId={collectionCustomerId || lastCreatedCustomerId}
        lockCustomerSelection={Boolean(
          collectionCustomerId || lastCreatedCustomerId
        )}
      />
    </>
  );
}
