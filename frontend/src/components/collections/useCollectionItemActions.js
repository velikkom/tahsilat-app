import { useCallback } from "react";
import {
  deleteCollection,
  markCollectionAsPaid,
} from "@/services/collectionService";
import {
  canMarkCollectionAsPaid,
  formatCurrency,
} from "@/utils/collectionUtils";

export default function useCollectionItemActions({
  isBusy,
  submitMutation,
  deleteMutation,
  refreshAll,
  setShowDrawer,
  setSelectedCollection,
  setDeletingId,
}) {
  const handleDeleteCollection = useCallback(
    async (collection) => {
      if (!collection?.id || isBusy) {
        return;
      }

      await deleteMutation.run({
        confirm: {
          title: "Emin misiniz?",
          text: "Bu tahsilatı silmek istediğinize emin misiniz?",
          confirmButtonText: "Evet, sil",
        },
        onConfirmed: () => setDeletingId(collection.id),
        action: () => deleteCollection(collection.id),
        successText: "Tahsilat başarıyla silindi.",
        errorText: "Tahsilat silinirken hata oluştu.",
        onSuccess: async () => {
          setShowDrawer(false);
          await refreshAll();
        },
      });

      setDeletingId(null);
    },
    [isBusy, refreshAll, deleteMutation, setDeletingId, setShowDrawer]
  );

  const handleMarkAsPaid = useCallback(
    async (collection) => {
      if (!collection?.id || isBusy || !canMarkCollectionAsPaid(collection)) {
        return;
      }

      await submitMutation.run({
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
          setSelectedCollection(null);
          await refreshAll();
        },
      });
    },
    [isBusy, submitMutation, refreshAll, setShowDrawer, setSelectedCollection]
  );

  return { handleDeleteCollection, handleMarkAsPaid };
}
