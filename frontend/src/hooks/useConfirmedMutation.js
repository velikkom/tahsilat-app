"use client";

import { useCallback, useRef, useState } from "react";
import Swal from "sweetalert2";

const CONFIRM_DEFAULTS = {
  icon: "warning",
  showCancelButton: true,
  confirmButtonText: "Evet",
  cancelButtonText: "İptal",
  reverseButtons: true,
  focusCancel: true,
};

const SUCCESS_DEFAULTS = {
  icon: "success",
  title: "Başarılı",
  confirmButtonText: "Tamam",
};

const ERROR_DEFAULTS = {
  icon: "error",
  title: "Hata",
};

/**
 * Sayfa genelinde tekrarlanan "onayla (opsiyonel) -> işlemi çalıştır ->
 * başarı/hata toast'ı göster" akışını tek yerde toplar. `run()` eşzamanlı
 * ikinci bir çağrıyı yok sayar (çift tıklamaya karşı), so isRunning tek bir
 * mutation'ı temsil eder - bir sayfada birden fazla bağımsız mutation
 * (örn. oluşturma ve silme) için ayrı ayrı useConfirmedMutation() çağırın.
 */
export default function useConfirmedMutation() {
  const [isRunning, setIsRunning] = useState(false);
  const runningRef = useRef(false);

  const run = useCallback(
    async ({ confirm, onConfirmed, action, successText, errorText, onSuccess }) => {
      if (runningRef.current) {
        return { confirmed: false, ok: false };
      }

      if (confirm) {
        const result = await Swal.fire({ ...CONFIRM_DEFAULTS, ...confirm });

        if (!result.isConfirmed) {
          return { confirmed: false, ok: false };
        }
      }

      if (onConfirmed) {
        onConfirmed();
      }

      runningRef.current = true;
      setIsRunning(true);

      try {
        const value = await action();

        if (successText) {
          await Swal.fire({
            ...SUCCESS_DEFAULTS,
            text: successText,
            allowOutsideClick: false,
            allowEscapeKey: false,
          });
        }

        if (onSuccess) {
          await onSuccess(value);
        }

        return { confirmed: true, ok: true, value };
      } catch (error) {
        console.error(error);

        await Swal.fire({
          ...ERROR_DEFAULTS,
          text: error.message || errorText || "İşlem sırasında hata oluştu.",
        });

        return { confirmed: true, ok: false, error };
      } finally {
        runningRef.current = false;
        setIsRunning(false);
      }
    },
    []
  );

  return { run, isRunning };
}
