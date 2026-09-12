"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getTrips } from "@/services/tripService";

export default function useTrips(filters = {}) {
  const { fromDate, toDate } = filters;

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const requestIdRef = useRef(0);

  const fetchTrips = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    try {
      setLoading(true);

      const data = await getTrips({
        size: 200,
        fromDate,
        toDate,
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
  }, [fromDate, toDate]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  return {
    trips,
    loading,
    refresh: fetchTrips,
  };
}
