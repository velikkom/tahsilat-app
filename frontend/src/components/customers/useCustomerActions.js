import { useRouter } from "next/navigation";
import useConfirmedMutation from "@/hooks/useConfirmedMutation";
import useCustomerDialogs from "./useCustomerDialogs";
import useCustomerItemActions from "./useCustomerItemActions";
import useCustomerSubmit from "./useCustomerSubmit";

export default function useCustomerActions({
  refresh,
  registerCustomerCreated,
  clearLastCreatedCustomerId,
}) {
  const router = useRouter();
  const customerMutation = useConfirmedMutation();
  const collectionMutation = useConfirmedMutation();
  const deleteMutation = useConfirmedMutation();
  const isBusy =
    customerMutation.isRunning ||
    collectionMutation.isRunning ||
    deleteMutation.isRunning;
  const dialogs = useCustomerDialogs({
    isBusy,
    router,
    collectionMutation,
    customerMutation,
    clearLastCreatedCustomerId,
  });
  const handleModalSubmit = useCustomerSubmit({
    modalMode: dialogs.modalMode,
    editingCustomer: dialogs.editingCustomer,
    customerMutation,
    closeCustomerModal: dialogs.closeCustomerModal,
    refresh,
    registerCustomerCreated,
  });
  const { deletingId, handleCollectionSubmit, handleDeleteCustomer } =
    useCustomerItemActions({
      isBusy,
      collectionMutation,
      deleteMutation,
      closeCollectionModal: dialogs.closeCollectionModal,
      refresh,
    });

  return {
    isBusy,
    ...dialogs,
    deletingId,
    customerMutation,
    collectionMutation,
    handleCollectionSubmit,
    handleModalSubmit,
    handleDeleteCustomer,
  };
}
