"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getTrips } from "@/services/tripService";

export default function useTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const requestIdRef = useRef(0);

  const fetchTrips = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    try {
      setLoading(true);

      const data = await getTrips({
        size: 200,
      });

      if (requestId !== requestIdRef.current) {
        return;
      }

      setTrips(data.content || []);
    } catch (error) {
      if (requestId === requestIdRef.current) {
        console.error(error);
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  return {
    trips,
    loading,
    refresh: fetchTrips,
  };
}
