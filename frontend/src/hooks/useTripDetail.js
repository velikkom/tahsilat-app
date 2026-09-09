"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getTripById } from "@/services/tripService";

export default function useTripDetail() {
  const params = useParams();

  const [trip, setTrip] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrip();
  }, []);

  async function fetchTrip() {
    try {
      setLoading(true);

      const data = await getTripById(params.id);

      setTrip(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return {
    trip,
    loading,
    refresh: fetchTrip,
  };
}
