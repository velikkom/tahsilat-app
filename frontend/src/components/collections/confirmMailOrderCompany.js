import Swal from "sweetalert2";
import { isKnownMailOrderCompany } from "@/utils/collectionUtils";

export async function confirmMailOrderCompany(
  mailOrderCompany,
  mailOrderCompanies
) {
  const known = isKnownMailOrderCompany(mailOrderCompany, mailOrderCompanies);

  if (known) {
    return true;
  }

  const confirmation = await Swal.fire({
    icon: "question",
    title:
      mailOrderCompanies.length === 0
        ? "İlk mailorder firması"
        : "Firma kayıtlı değil",
    text: `"${mailOrderCompany}" kayıtlı değil. Kaydedeyim mi?`,
    showCancelButton: true,
    confirmButtonText: "Evet, kaydet",
    cancelButtonText: "Vazgeç",
    reverseButtons: true,
    focusCancel: true,
  });

  return confirmation.isConfirmed;
}
