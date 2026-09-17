"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getTripPrintPreview } from "@/services/tripService";

export default function useTripPrintPreview() {
  const params = useParams();

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPreview = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getTripPrintPreview(params.id);

      setPreview(data);
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    // Fetching on mount / trip change is the purpose of this hook.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async preview load
    void fetchPreview();
  }, [fetchPreview]);

  return {
    preview,
    loading,
    error,
    refresh: fetchPreview,
  };
}
