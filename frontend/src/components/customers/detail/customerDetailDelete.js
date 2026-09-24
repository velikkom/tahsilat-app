import Swal from "sweetalert2";
import { deleteCustomer } from "@/services/customerService";

export async function runCustomerDetailDelete({
  customer,
  router,
  setIsDeleting,
}) {
  const confirmation = await Swal.fire({
    title: "Emin misiniz?",
    text: `${customer.companyName} müşterisini silmek istediğinize emin misiniz?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Evet, sil",
    cancelButtonText: "İptal",
    reverseButtons: true,
    focusCancel: true,
  });

  if (!confirmation.isConfirmed) {
    return;
  }

  setIsDeleting(true);

  try {
    await deleteCustomer(customer.id);
    await Swal.fire({
      icon: "success",
      title: "Başarılı",
      text: "Müşteri başarıyla silindi.",
      confirmButtonText: "Tamam",
    });
    router.push("/customers");
  } catch (error) {
    await Swal.fire({
      icon: "error",
      title: "Hata",
      text: error.message || "Müşteri silinemedi.",
    });
  } finally {
    setIsDeleting(false);
  }
}
