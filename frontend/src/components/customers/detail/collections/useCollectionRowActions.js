import { useCallback } from "react";
import {
  deleteCollection,
  markCollectionAsPaid,
} from "@/services/collectionService";
import {
  canMarkCollectionAsPaid,
  formatCurrency,
} from "@/utils/collectionUtils";

export default function useCollectionRowActions({
  rowActionMutation,
  busy,
  refreshAll,
  closeDrawer,
}) {
  const handleDeleteCollection = useCallback(
    async (collection) => {
      if (!collection?.id || busy) {
        return;
      }

      await rowActionMutation.run({
        confirm: {
          title: "Emin misiniz?",
          text: "Bu tahsilatı silmek istediğinize emin misiniz?",
          confirmButtonText: "Evet, sil",
        },
        action: () => deleteCollection(collection.id),
        successText: "Tahsilat başarıyla silindi.",
        errorText: "Tahsilat silinirken hata oluştu.",
        onSuccess: async () => {
          closeDrawer();
          await refreshAll();
        },
      });
    },
    [busy, rowActionMutation, refreshAll, closeDrawer]
  );

  const handleMarkAsPaid = useCallback(
    async (collection) => {
      if (!collection?.id || busy || !canMarkCollectionAsPaid(collection)) {
        return;
      }

      await rowActionMutation.run({
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
          closeDrawer();
          await refreshAll();
        },
      });
    },
    [busy, rowActionMutation, refreshAll, closeDrawer]
  );

  return { handleDeleteCollection, handleMarkAsPaid };
}
