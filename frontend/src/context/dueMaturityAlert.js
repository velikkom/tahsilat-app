import Swal from "sweetalert2";
import { formatCurrency } from "@/utils/collectionUtils";

let dueMaturityAlertShown = false;

function todayStorageKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `due-maturity-alert-${year}-${month}-${day}`;
}

export function maybeShowDueMaturityAlert(count, amount) {
  if (dueMaturityAlertShown) {
    return;
  }

  const storageKey = todayStorageKey();

  try {
    if (sessionStorage.getItem(storageKey)) {
      dueMaturityAlertShown = true;
      return;
    }

    sessionStorage.setItem(storageKey, "1");
  } catch {
    // Private mode / blocked storage: module flag still prevents repeats.
  }

  dueMaturityAlertShown = true;

  Swal.fire({
    icon: "warning",
    title: "Vadesi gelen çek/senet",
    text: `${count} kayıt · ${formatCurrency(amount)}. Tahsil Edildi butonu aktif.`,
    confirmButtonText: "Tamam",
    timer: 8000,
    timerProgressBar: true,
  });
}
