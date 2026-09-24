"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getDueMaturitySummary } from "@/services/collectionService";
import { maybeShowDueMaturityAlert } from "./dueMaturityAlert";

function applySummary(data, setCount, setAmount) {
  setCount(Number(data?.count) || 0);
  setAmount(Number(data?.amount) || 0);
}

export default function useDueMaturityState(enabled) {
  const [count, setCount] = useState(0);
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(
    async ({ silent = false } = {}) => {
      if (!enabled) {
        setCount(0);
        setAmount(0);
        setLoading(false);
        return;
      }

      try {
        if (!silent) setLoading(true);
        applySummary(await getDueMaturitySummary(), setCount, setAmount);
      } catch {
        setCount(0);
        setAmount(0);
      } finally {
        if (!silent) setLoading(false);
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
        if (!cancelled) applySummary(data, setCount, setAmount);
      })
      .catch(() => {
        if (!cancelled) {
          setCount(0);
          setAmount(0);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  useEffect(() => {
    if (!loading && count > 0) {
      maybeShowDueMaturityAlert(count, amount);
    }
  }, [loading, count, amount]);

  return useMemo(
    () => ({ count, amount, loading, refresh, enabled }),
    [count, amount, loading, refresh, enabled]
  );
}
