import Swal from "sweetalert2";
import { createCollection } from "@/services/collectionService";
import { updateCustomer } from "@/services/customerService";

export async function runCustomerDetailUpdate({
  customer,
  payload,
  refresh,
  setIsSubmitting,
  setShowCustomerModal,
}) {
  setIsSubmitting(true);

  try {
    await updateCustomer(customer.id, payload);
    await Swal.fire({
      icon: "success",
      title: "Başarılı",
      text: "Müşteri başarıyla güncellendi.",
      confirmButtonText: "Tamam",
    });
    setShowCustomerModal(false);
    await refresh();
  } catch (error) {
    await Swal.fire({
      icon: "error",
      title: "Hata",
      text: error.message || "Müşteri kaydedilemedi.",
    });
  } finally {
    setIsSubmitting(false);
  }
}

export async function runCustomerDetailCollection({
  payload,
  refresh,
  setIsSubmittingCollection,
  setShowCollectionModal,
  setDataKey,
}) {
  setIsSubmittingCollection(true);

  try {
    await createCollection(payload);
    await Swal.fire({
      icon: "success",
      title: "Başarılı",
      text: "Tahsilat başarıyla oluşturuldu.",
      confirmButtonText: "Tamam",
    });
    setShowCollectionModal(false);
    setDataKey((current) => current + 1);
    await refresh();
  } catch (error) {
    await Swal.fire({
      icon: "error",
      title: "Hata",
      text: error.message || "Tahsilat kaydedilemedi.",
    });
  } finally {
    setIsSubmittingCollection(false);
  }
}
