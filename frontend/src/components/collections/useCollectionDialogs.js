import { useCallback } from "react";

export default function useCollectionDialogs({
  isBusy,
  submitMutation,
  resetModalState,
  setShowModal,
  setShowImportModal,
  setShowDrawer,
  setSelectedCollection,
  setModalMode,
  setEditingCollection,
}) {
  const openCreateModal = useCallback(() => {
    if (isBusy) {
      return;
    }

    setModalMode("create");
    setEditingCollection(null);
    setShowModal(true);
  }, [isBusy, setModalMode, setEditingCollection, setShowModal]);

  const openEditModal = useCallback(
    (collection) => {
      if (isBusy) {
        return;
      }

      setShowDrawer(false);
      setModalMode("edit");
      setEditingCollection(collection);
      setShowModal(true);
    },
    [isBusy, setShowDrawer, setModalMode, setEditingCollection, setShowModal]
  );

  const openDrawer = useCallback((collection) => {
    setSelectedCollection(collection);
    setShowDrawer(true);
  }, [setSelectedCollection, setShowDrawer]);

  const closeDrawer = useCallback(() => {
    setShowDrawer(false);
  }, [setShowDrawer]);

  const openImportModal = useCallback(() => {
    if (isBusy) {
      return;
    }

    setShowImportModal(true);
  }, [isBusy, setShowImportModal]);

  const closeImportModal = useCallback(() => {
    setShowImportModal(false);
  }, [setShowImportModal]);

  const closeModal = useCallback(() => {
    if (submitMutation.isRunning) {
      return;
    }

    resetModalState();
  }, [submitMutation.isRunning, resetModalState]);

  return {
    openCreateModal,
    openEditModal,
    openDrawer,
    closeDrawer,
    openImportModal,
    closeImportModal,
    closeModal,
  };
}
