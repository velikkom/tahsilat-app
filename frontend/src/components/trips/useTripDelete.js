import { useCallback, useState } from "react";
import Swal from "sweetalert2";

import { deleteTrip } from "@/services/tripService";

export default function useTripDelete(refresh) {
  const [isBusy, setIsBusy] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = useCallback(
    async (trip) => {
      if (!trip?.id || isBusy) {
        return;
      }

      const confirmation = await Swal.fire({
        title: "Emin misiniz?",
        text: "Bu turu silmek istediğinize emin misiniz?",
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

      setIsBusy(true);
      setDeletingId(trip.id);

      try {
        await deleteTrip(trip.id);

        await Swal.fire({
          icon: "success",
          title: "Başarılı",
          text: "Tur başarıyla silindi.",
          confirmButtonText: "Tamam",
          allowOutsideClick: false,
          allowEscapeKey: false,
        });

        await refresh();
      } catch (error) {
        console.error(error);

        await Swal.fire({
          icon: "error",
          title: "Hata",
          text: error.message || "Tur silinirken hata oluştu.",
        });
      } finally {
        setIsBusy(false);
        setDeletingId(null);
      }
    },
    [isBusy, refresh]
  );

  return { isBusy, deletingId, handleDelete };
}
