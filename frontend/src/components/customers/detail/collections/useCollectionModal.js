import { useCallback, useState } from "react";
import { createCollection, updateCollection } from "@/services/collectionService";

export default function useCollectionModal({
  submitMutation,
  busy,
  refreshAll,
  closeDrawer,
}) {
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingCollection, setEditingCollection] = useState(null);

  const resetModal = useCallback(() => {
    setShowModal(false);
    setModalMode("create");
    setEditingCollection(null);
  }, []);

  const handleOpenCreateModal = useCallback(() => {
    if (busy) return;
    setModalMode("create");
    setEditingCollection(null);
    setShowModal(true);
  }, [busy]);

  const handleEditCollection = useCallback(
    (collection) => {
      if (busy) return;
      closeDrawer();
      setModalMode("edit");
      setEditingCollection(collection);
      setShowModal(true);
    },
    [busy, closeDrawer]
  );

  const handleCloseModal = useCallback(() => {
    if (!submitMutation.isRunning) {
      resetModal();
    }
  }, [submitMutation.isRunning, resetModal]);

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
          resetModal();
          await refreshAll();
        },
      });
    },
    [busy, modalMode, editingCollection, submitMutation, refreshAll, resetModal]
  );

  return {
    showModal,
    modalMode,
    editingCollection,
    handleOpenCreateModal,
    handleEditCollection,
    handleCloseModal,
    handleModalSubmit,
  };
}
