import { useCallback, useState } from "react";

export default function useCustomerDialogs({
  isBusy,
  router,
  collectionMutation,
  customerMutation,
  clearLastCreatedCustomerId,
}) {
  const [showFilters, setShowFilters] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [collectionCustomerId, setCollectionCustomerId] = useState("");
  const openDetail = useCallback((customer) => {
    if (customer?.id) {
      router.push(`/customers/${customer.id}`);
    }
  }, [router]);

  const openCreateModal = useCallback(() => {
    if (isBusy) {
      return;
    }
    setModalMode("create");
    setEditingCustomer(null);
    setShowCustomerModal(true);
  }, [isBusy]);

  const openEditModal = useCallback((customer) => {
    if (isBusy) {
      return;
    }
    setModalMode("edit");
    setEditingCustomer(customer);
    setShowCustomerModal(true);
  }, [isBusy]);

  const openCollectionModal = useCallback((customer) => {
    if (isBusy || !customer?.id) {
      return;
    }
    setCollectionCustomerId(customer.id);
    setShowCollectionModal(true);
  }, [isBusy]);

  const closeCollectionModal = useCallback(() => {
    if (collectionMutation.isRunning) {
      return;
    }
    setShowCollectionModal(false);
    setCollectionCustomerId("");
    clearLastCreatedCustomerId();
  }, [collectionMutation.isRunning, clearLastCreatedCustomerId]);

  const closeCustomerModal = useCallback(() => {
    if (!customerMutation.isRunning) {
      setShowCustomerModal(false);
      setEditingCustomer(null);
      setModalMode("create");
    }
  }, [customerMutation.isRunning]);

  return {
    showFilters,
    setShowFilters,
    showCustomerModal,
    modalMode,
    editingCustomer,
    showCollectionModal,
    collectionCustomerId,
    openDetail,
    openCreateModal,
    openEditModal,
    openCollectionModal,
    closeCollectionModal,
    closeCustomerModal,
  };
}
