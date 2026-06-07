"use client";

import { useCallback, useEffect, useState } from "react";
import { getPendingUsersCount } from "@/services/userService";

export default function usePendingUserCount(enabled = true) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(enabled);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getPendingUsersCount();
      setCount(data?.count ?? 0);
    } catch {
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { count, loading, refresh };
}
