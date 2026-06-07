"use client";

import { useCallback, useEffect, useState } from "react";
import { getCurrentUser } from "@/services/userService";

export default function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCurrentUser();
      setUser(data);
    } catch (err) {
      setError(err.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isAdmin = user?.role === "ROLE_ADMIN";

  return { user, loading, error, isAdmin, refresh };
}
