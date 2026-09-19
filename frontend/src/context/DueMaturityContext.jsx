"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import Swal from "sweetalert2";
import { getDueMaturitySummary } from "@/services/collectionService";
import { formatCurrency } from "@/utils/collectionUtils";
import useCurrentUser from "@/hooks/useCurrentUser";

const DueMaturityContext = createContext(null);

let dueMaturityAlertShown = false;

function todayStorageKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `due-maturity-alert-${year}-${month}-${day}`;
}

export function DueMaturityProvider({ children }) {
  const { user, loading: userLoading } = useCurrentUser();
  const [count, setCount] = useState(0);
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  const enabled = Boolean(user) && !userLoading;

  const refresh = useCallback(
    async ({ silent = false } = {}) => {
      if (!enabled) {
        setCount(0);
        setAmount(0);
        setLoading(false);
        return;
      }

      try {
        if (!silent) {
          setLoading(true);
        }

        const data = await getDueMaturitySummary();
        setCount(Number(data?.count) || 0);
        setAmount(Number(data?.amount) || 0);
      } catch {
        setCount(0);
        setAmount(0);
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [enabled]
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;

    getDueMaturitySummary()
      .then((data) => {
        if (cancelled) {
          return;
        }

        setCount(Number(data?.count) || 0);
        setAmount(Number(data?.amount) || 0);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setCount(0);
        setAmount(0);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  useEffect(() => {
    if (loading || count <= 0 || dueMaturityAlertShown) {
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
  }, [loading, count, amount]);

  const value = useMemo(
    () => ({ count, amount, loading, refresh, enabled }),
    [count, amount, loading, refresh, enabled]
  );

  return (
    <DueMaturityContext.Provider value={value}>
      {children}
    </DueMaturityContext.Provider>
  );
}

export default function useDueMaturitySummary() {
  const context = useContext(DueMaturityContext);

  if (!context) {
    throw new Error(
      "useDueMaturitySummary must be used within DueMaturityProvider"
    );
  }

  return context;
}
