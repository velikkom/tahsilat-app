import { useCallback, useState } from "react";
import useConfirmedMutation from "@/hooks/useConfirmedMutation";
import useCollectionDialogs from "@/components/collections/useCollectionDialogs";
import useCollectionItemActions from "@/components/collections/useCollectionItemActions";
import useCollectionSubmit from "@/components/collections/useCollectionSubmit";

export default function useCollectionActions({
  refresh,
  refreshDueMaturity,
  clearLastCreatedCustomerId,
}) {
  const submitMutation = useConfirmedMutation();
  const deleteMutation = useConfirmedMutation();
  const isBusy = submitMutation.isRunning || deleteMutation.isRunning;
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [modalMode, setModalMode] = useState("create");
  const [editingCollection, setEditingCollection] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const refreshAll = useCallback(async () => {
    await refresh();
    await refreshDueMaturity({ silent: true });
  }, [refresh, refreshDueMaturity]);

  const resetModalState = useCallback(() => {
    setShowModal(false);
    setModalMode("create");
    setEditingCollection(null);
    clearLastCreatedCustomerId();
  }, [clearLastCreatedCustomerId]);

  const handleModalSubmit = useCollectionSubmit({
    isBusy,
    submitMutation,
    modalMode,
    editingCollection,
    resetModalState,
    refreshAll,
  });
  const { handleDeleteCollection, handleMarkAsPaid } = useCollectionItemActions({
    isBusy,
    submitMutation,
    deleteMutation,
    refreshAll,
    setShowDrawer,
    setSelectedCollection,
    setDeletingId,
  });
  const dialogs = useCollectionDialogs({
    isBusy,
    submitMutation,
    resetModalState,
    setShowModal,
    setShowImportModal,
    setShowDrawer,
    setSelectedCollection,
    setModalMode,
    setEditingCollection,
  });

  return {
    isBusy,
    showModal,
    showImportModal,
    showDrawer,
    selectedCollection,
    modalMode,
    editingCollection,
    deletingId,
    submitMutation,
    handleModalSubmit,
    handleDeleteCollection,
    handleMarkAsPaid,
    handleImportCompleted: refreshAll,
    ...dialogs,
  };
}
