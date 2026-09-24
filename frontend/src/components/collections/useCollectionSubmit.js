import { useCallback } from "react";
import {
  createCollection,
  updateCollection,
} from "@/services/collectionService";

export default function useCollectionSubmit({
  isBusy,
  submitMutation,
  modalMode,
  editingCollection,
  resetModalState,
  refreshAll,
}) {
  return useCallback(
    async (payload) => {
      if (isBusy) {
        return;
      }

      if (modalMode === "edit" && editingCollection?.id) {
        await submitMutation.run({
          action: () => updateCollection(editingCollection.id, payload),
          successText: "Tahsilat başarıyla güncellendi.",
          errorText: "Tahsilat kaydedilirken hata oluştu.",
          onSuccess: async () => {
            resetModalState();
            await refreshAll();
          },
        });
        return;
      }

      await submitMutation.run({
        action: () => createCollection(payload),
        successText: "Tahsilat başarıyla oluşturuldu.",
        errorText: "Tahsilat kaydedilirken hata oluştu.",
        onSuccess: async () => {
          resetModalState();
          await refreshAll();
        },
      });
    },
    [isBusy, modalMode, editingCollection, submitMutation, resetModalState, refreshAll]
  );
}
