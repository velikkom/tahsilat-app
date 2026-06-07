"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getPendingUsersCount } from "@/services/userService";
import useCurrentUser from "@/hooks/useCurrentUser";

const PendingUsersCountContext = createContext(null);

export function PendingUsersCountProvider({ children }) {
  const { isAdmin, loading: userLoading } = useCurrentUser();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const enabled = isAdmin && !userLoading;

  const refresh = useCallback(async ({ silent = false } = {}) => {
    if (!enabled) {
      setCount(0);
      setLoading(false);
      return;
    }

    try {
      if (!silent) {
        setLoading(true);
      }
      const data = await getPendingUsersCount();
      setCount(data?.count ?? 0);
    } catch {
      setCount(0);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [enabled]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ count, loading, refresh, enabled }),
    [count, loading, refresh, enabled]
  );

  return (
    <PendingUsersCountContext.Provider value={value}>
      {children}
    </PendingUsersCountContext.Provider>
  );
}

export default function usePendingUserCount() {
  const context = useContext(PendingUsersCountContext);

  if (!context) {
    throw new Error(
      "usePendingUserCount must be used within PendingUsersCountProvider"
    );
  }

  return context;
}
