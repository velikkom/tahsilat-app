import Swal from "sweetalert2";

import { isShareCanceled, shareFiles } from "@/components/trips/tripDokumuShare";
import {
  downloadTripFile,
  downloadTripTahsilatDokumu,
} from "@/services/tripService";
import { formatDate } from "@/utils/collectionUtils";

export default async function runDokumuShare({
  tripId,
  preview,
  shareFile,
  sharing,
  setSharing,
}) {
  if (!tripId || sharing) {
    return;
  }

  setSharing(true);

  const title = `Tahsilat Dökümü — ${preview.salesmanName || ""}`.trim();
  const text = [
    formatDate(preview.startDate),
    formatDate(preview.endDate),
    preview.vehiclePlate,
  ]
    .filter((part) => part && part !== "-")
    .join(" · ");

  try {
    if (await shareFiles(shareFile, title, text)) {
      return;
    }

    if (shareFile) {
      downloadTripFile(shareFile);
    } else {
      await downloadTripTahsilatDokumu(tripId);
    }

    await Swal.fire({
      icon: "success",
      title: "Excel indirildi",
      text: "Bu tarayıcı doğrudan paylaşım penceresini açamadı. İndirilen dosyayı WhatsApp veya e-posta ile gönderebilirsiniz.",
      confirmButtonText: "Tamam",
    });
  } catch (shareError) {
    if (isShareCanceled(shareError)) {
      return;
    }

    console.error(shareError);

    await Swal.fire({
      icon: "error",
      title: "Hata",
      text: shareError.message || "Döküm paylaşılamadı.",
    });
  } finally {
    setSharing(false);
  }
}
