import { useCallback } from "react";
import { runCustomerDetailDelete } from "./customerDetailDelete";
import {
  runCustomerDetailCollection,
  runCustomerDetailUpdate,
} from "./customerDetailSaves";

export default function useCustomerDetailActions({
  customer,
  router,
  refresh,
  busy,
  setShowCustomerModal,
  setShowCollectionModal,
  setIsSubmitting,
  setIsSubmittingCollection,
  setIsDeleting,
  setDataKey,
}) {
  const handleEdit = useCallback(() => {
    if (busy) {
      return;
    }

    setShowCustomerModal(true);
  }, [busy, setShowCustomerModal]);

  const handleDelete = useCallback(async () => {
    if (!customer?.id || busy) {
      return;
    }

    await runCustomerDetailDelete({ customer, router, setIsDeleting });
  }, [busy, customer, router, setIsDeleting]);

  const handleModalSubmit = useCallback(
    async (payload) => {
      if (!customer?.id) {
        return;
      }

      await runCustomerDetailUpdate({
        customer,
        payload,
        refresh,
        setIsSubmitting,
        setShowCustomerModal,
      });
    },
    [customer, refresh, setIsSubmitting, setShowCustomerModal]
  );

  const handleCollectionSubmit = useCallback(
    async (payload) => {
      await runCustomerDetailCollection({
        payload,
        refresh,
        setIsSubmittingCollection,
        setShowCollectionModal,
        setDataKey,
      });
    },
    [refresh, setIsSubmittingCollection, setShowCollectionModal, setDataKey]
  );

  return {
    handleEdit,
    handleDelete,
    handleModalSubmit,
    handleCollectionSubmit,
  };
}
