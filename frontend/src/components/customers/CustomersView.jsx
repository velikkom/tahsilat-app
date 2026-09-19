"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Spinner } from "react-bootstrap";
import { FaFilter, FaPlus } from "react-icons/fa";

import CustomersHeader from "@/components/customers/CustomersHeader";
import CustomerStats from "@/components/customers/CustomerStats";
import CustomerSearchBar from "@/components/customers/CustomerSearchBar";
import CustomerQuickFilters from "@/components/customers/CustomerQuickFilters";
import CustomerCardGrid from "@/components/customers/CustomerCardGrid";
import CustomerPagination from "@/components/customers/CustomerPagination";
import CustomersDesktopTable from "@/components/customers/CustomersDesktopTable";
import CustomerFiltersDrawer from "@/components/customers/CustomerFiltersDrawer";
import CustomerCreateModal from "@/components/customers/CustomerCreateModal";
import CustomerEmptyState from "@/components/customers/CustomerEmptyState";
import FloatingAddButton from "@/components/ui/FloatingAddButton";
import NewCollectionModal from "@/components/collections/NewCollectionModal";

import useConfirmedMutation from "@/hooks/useConfirmedMutation";
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
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState(EMPTY_CUSTOMER_FILTERS);
  const [quickFilter, setQuickFilter] = useState(CUSTOMER_QUICK_FILTER.ALL);
  const [mobilePage, setMobilePage] = useState(1);

  const [showFilters, setShowFilters] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  const [modalMode, setModalMode] = useState("create");
  const [editingCustomer, setEditingCustomer] = useState(null);

  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [collectionCustomerId, setCollectionCustomerId] = useState("");

  const [deletingId, setDeletingId] = useState(null);

  const customerMutation = useConfirmedMutation();
  const collectionMutation = useConfirmedMutation();
  const deleteMutation = useConfirmedMutation();

  const isBusy =
    customerMutation.isRunning ||
    collectionMutation.isRunning ||
    deleteMutation.isRunning;

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
    if (!customer?.id) {
      return;
    }

    router.push(`/customers/${customer.id}`);
  }, [router]);

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

      setCollectionCustomerId(customer.id);
      setShowCollectionModal(true);
    },
    [isBusy]
  );

  const closeCollectionModal = useCallback(() => {
    if (collectionMutation.isRunning) {
      return;
    }

    setShowCollectionModal(false);
    setCollectionCustomerId("");
    clearLastCreatedCustomerId();
  }, [collectionMutation.isRunning, clearLastCreatedCustomerId]);

  const handleCollectionSubmit = useCallback(
    async (payload) => {
      await collectionMutation.run({
        action: () => createCollection(payload),
        successText: "Tahsilat başarıyla oluşturuldu.",
        errorText: "Tahsilat kaydedilemedi.",
        onSuccess: closeCollectionModal,
      });
    },
    [collectionMutation, closeCollectionModal]
  );

  const closeCustomerModal = useCallback(() => {
    if (customerMutation.isRunning) {
      return;
    }

    setShowCustomerModal(false);
    setEditingCustomer(null);
    setModalMode("create");
  }, [customerMutation.isRunning]);

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
      if (modalMode === "edit" && editingCustomer?.id) {
        await customerMutation.run({
          action: () => updateCustomer(editingCustomer.id, payload),
          successText: "Müşteri başarıyla güncellendi.",
          errorText: "Müşteri kaydedilemedi.",
          onSuccess: async () => {
            closeCustomerModal();
            await refresh();
          },
        });
        return;
      }

      await customerMutation.run({
        action: () => createCustomer(payload),
        successText: "Müşteri başarıyla oluşturuldu.",
        errorText: "Müşteri kaydedilemedi.",
        onSuccess: async (createdCustomer) => {
          await registerCustomerCreated(createdCustomer);
          closeCustomerModal();
        },
      });
    },
    [
      modalMode,
      editingCustomer,
      customerMutation,
      closeCustomerModal,
      refresh,
      registerCustomerCreated,
    ]
  );

  const handleDeleteCustomer = useCallback(
    async (customer) => {
      if (!customer?.id || isBusy) {
        return;
      }

      await deleteMutation.run({
        confirm: {
          title: "Emin misiniz?",
          text: `${customer.companyName} müşterisini silmek istediğinize emin misiniz?`,
          confirmButtonText: "Evet, sil",
        },
        onConfirmed: () => setDeletingId(customer.id),
        action: () => deleteCustomer(customer.id),
        successText: "Müşteri başarıyla silindi.",
        errorText: "Müşteri silinemedi.",
        onSuccess: refresh,
      });

      setDeletingId(null);
    },
    [isBusy, refresh, deleteMutation]
  );

  const hasCustomers = customers.length > 0;
  const hasFilteredResults = filteredCustomers.length > 0;

  return (
    <>
      <div
        className={`customers-page ui-page-with-fab d-flex flex-column gap-3${
          hasActiveFilters ? " customers-page--filtering" : ""
        }`}
      >
        <CustomersHeader />

        {!loading && hasCustomers && !hasActiveFilters && (
          <CustomerStats stats={stats} />
        )}

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
                <div className="customer-results-meta text-muted small mb-3">
                  {filteredCustomers.length} / {customers.length} kayıt
                  gösteriliyor
                </div>

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
        submitting={customerMutation.isRunning}
        onClose={closeCustomerModal}
        onSubmit={handleModalSubmit}
      />

      <NewCollectionModal
        show={showCollectionModal}
        onClose={closeCollectionModal}
        onSubmit={handleCollectionSubmit}
        customers={customers}
        submitting={collectionMutation.isRunning}
        loadingCustomers={loading}
        defaultCustomerId={collectionCustomerId || lastCreatedCustomerId}
        lockCustomerSelection={Boolean(
          collectionCustomerId || lastCreatedCustomerId
        )}
      />
    </>
  );
}
