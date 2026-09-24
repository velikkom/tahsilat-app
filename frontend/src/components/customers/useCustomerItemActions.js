import { useCallback, useState } from "react";
import { createCollection } from "@/services/collectionService";
import { deleteCustomer } from "@/services/customerService";

export default function useCustomerItemActions({
  isBusy,
  collectionMutation,
  deleteMutation,
  closeCollectionModal,
  refresh,
}) {
  const [deletingId, setDeletingId] = useState(null);

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

  return {
    deletingId,
    handleCollectionSubmit,
    handleDeleteCustomer,
  };
}
