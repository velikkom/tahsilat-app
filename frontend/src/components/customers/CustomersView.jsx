"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "react-bootstrap";
import { FaFilter, FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";
import CustomersHeader from "@/components/customers/CustomersHeader";
import CustomerSearchBar from "@/components/customers/CustomerSearchBar";
import CustomerMobileView from "@/components/customers/CustomerMobileView";
import CustomersDesktopTable from "@/components/customers/CustomersDesktopTable";
import CustomerDetailDrawer from "@/components/customers/CustomerDetailDrawer";
import CustomerFiltersDrawer from "@/components/customers/CustomerFiltersDrawer";
import CustomerCreateModal from "@/components/customers/CustomerCreateModal";
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
  EMPTY_CUSTOMER_FILTERS,
  filterCustomers,
  paginateCustomers,
} from "@/utils/customerUtils";

export default function CustomersView() {
  const { customers, loading, refresh } = useCustomers();
  const { isAdmin } = useCurrentUser();

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState(EMPTY_CUSTOMER_FILTERS);
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

  const filteredCustomers = useMemo(
    () => filterCustomers(customers, searchQuery, filters),
    [customers, searchQuery, filters]
  );

  const mobilePagination = useMemo(
    () => paginateCustomers(filteredCustomers, mobilePage),
    [filteredCustomers, mobilePage]
  );

  useEffect(() => {
    setMobilePage(1);
  }, [searchQuery, filters]);

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
    if (isSubmittingCollection) {
      return;
    }

    setShowCollectionModal(false);
    setCollectionCustomerId("");
  }, [isSubmittingCollection]);

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

  const handleResetFilters = useCallback(() => {
    setFilters(EMPTY_CUSTOMER_FILTERS);
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
        } else {
          await createCustomer(payload);
          await Swal.fire({
            icon: "success",
            title: "Başarılı",
            text: "Müşteri başarıyla oluşturuldu.",
            confirmButtonText: "Tamam",
          });
        }

        closeCustomerModal();
        await refresh();
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
    [modalMode, editingCustomer, closeCustomerModal, refresh]
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

  return (
    <>
      <div className="customers-page d-flex flex-column gap-3 gap-md-4">
        <CustomersHeader />

        <div className="customers-toolbar d-flex flex-column gap-2">
          <CustomerSearchBar value={searchQuery} onChange={setSearchQuery} />

          <div className="customers-toolbar__actions d-flex flex-column flex-lg-row gap-2">
            <Button
              variant="outline-secondary"
              className="customers-toolbar__filter-btn touch-target"
              onClick={() => setShowFilters(true)}
            >
              <FaFilter className="me-2" aria-hidden="true" />
              Filtrele
            </Button>

            {isAdmin && (
              <Button
                variant="primary"
                className="customers-toolbar__create-btn touch-target"
                onClick={openCreateModal}
                disabled={isBusy}
              >
                <FaPlus className="me-2" aria-hidden="true" />
                Yeni Müşteri
              </Button>
            )}
          </div>
        </div>

        <div className="customers-page__mobile d-lg-none">
          <CustomerMobileView
            customers={mobilePagination.items}
            loading={loading}
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

        <div className="customers-page__desktop d-none d-lg-block">
          <CustomersDesktopTable
            customers={filteredCustomers}
            loading={loading}
            onView={openDetail}
            onEdit={openEditModal}
            onDelete={handleDeleteCustomer}
            showEdit={isAdmin}
            showDelete={isAdmin}
            busy={isBusy}
            deletingId={deletingId}
          />
        </div>
      </div>

      <CustomerDetailDrawer
        show={showDetailDrawer}
        customer={selectedCustomer}
        onHide={closeDetail}
      />

      <CustomerFiltersDrawer
        show={showFilters}
        filters={filters}
        onHide={() => setShowFilters(false)}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
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
        defaultCustomerId={collectionCustomerId}
        lockCustomerSelection={Boolean(collectionCustomerId)}
      />
    </>
  );
}
