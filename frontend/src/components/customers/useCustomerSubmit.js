import { useCallback } from "react";
import { createCustomer, updateCustomer } from "@/services/customerService";

export default function useCustomerSubmit({
  modalMode,
  editingCustomer,
  customerMutation,
  closeCustomerModal,
  refresh,
  registerCustomerCreated,
}) {
  return useCallback(
    async (payload) => {
      if (modalMode === "edit" && editingCustomer?.id) {
        await customerMutation.run({
          action: () => updateCustomer(editingCustomer.id, payload),
          successText: "Müşteri başarıyla güncellendi.",
          errorText: "Müşteri kaydedilemedi.",
          onSuccess: async () => {
            closeCustomerModal();
            await refresh();
          },
        });
        return;
      }

      await customerMutation.run({
        action: () => createCustomer(payload),
        successText: "Müşteri başarıyla oluşturuldu.",
        errorText: "Müşteri kaydedilemedi.",
        onSuccess: async (createdCustomer) => {
          await registerCustomerCreated(createdCustomer);
          closeCustomerModal();
        },
      });
    },
    [
      modalMode,
      editingCustomer,
      customerMutation,
      closeCustomerModal,
      refresh,
      registerCustomerCreated,
    ]
  );
}
