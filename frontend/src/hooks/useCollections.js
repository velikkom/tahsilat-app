"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getCollections } from "@/services/collectionService";

export default function useCollections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const requestIdRef = useRef(0);

  const fetchCollections = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    try {
      setLoading(true);

      const data = await getCollections({
        size: 500,
      });

      if (requestId !== requestIdRef.current) {
        return;
      }

      setCollections(data.content || []);
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
    fetchCollections();
  }, [fetchCollections]);

  return {
    collections,
    loading,
    refresh: fetchCollections,
  };
}
