"use client";

import { useCallback, useEffect, useState } from "react";
import { getRoles } from "@/services/userService";

export default function useRoles(enabled = true) {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setRoles([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getRoles();
      setRoles(data);
    } catch (err) {
      setError(err.message);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { roles, loading, error, refresh };
}
