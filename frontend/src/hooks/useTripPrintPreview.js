"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getTripPrintPreview } from "@/services/tripService";

export default function useTripPrintPreview() {
  const params = useParams();

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPreview();
  }, []);

  async function fetchPreview() {
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
  }

  return {
    preview,
    loading,
    error,
    refresh: fetchPreview,
  };
}
