import Swal from "sweetalert2";

import { downloadTripTahsilatDokumu } from "@/services/tripService";

export default async function runDokumuDownload({
  tripId,
  downloading,
  setDownloading,
}) {
  if (!tripId || downloading) {
    return;
  }

  setDownloading(true);

  try {
    await downloadTripTahsilatDokumu(tripId);
  } catch (downloadError) {
    console.error(downloadError);

    await Swal.fire({
      icon: "error",
      title: "Hata",
      text: downloadError.message || "Tahsilat dökümü indirilemedi.",
    });
  } finally {
    setDownloading(false);
  }
}
