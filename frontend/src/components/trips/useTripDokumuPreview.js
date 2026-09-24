import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import useTripPrintPreview from "@/hooks/useTripPrintPreview";
import {
  ARKA_ROW_CAPACITY,
  ON_DAY_CAPACITY,
  tripDayCount,
} from "@/utils/tripDokumuFormat";

export default function useTripDokumuPreview() {
  const params = useParams();
  const tripId = params.id;
  const { preview, loading, error } = useTripPrintPreview();
  const [side, setSide] = useState("on");
  const [pageIndex, setPageIndex] = useState(0);

  const onPageCount = useMemo(() => {
    if (!preview) {
      return 1;
    }

    return Math.max(
      1,
      Math.ceil(tripDayCount(preview.startDate, preview.endDate) / ON_DAY_CAPACITY)
    );
  }, [preview]);

  const arkaPageCount = useMemo(() => {
    if (!preview) {
      return 1;
    }

    return Math.max(
      1,
      Math.ceil((preview.collectionRows?.length || 1) / ARKA_ROW_CAPACITY)
    );
  }, [preview]);

  useEffect(() => {
    document.body.classList.add("trip-print-active");
    return () => document.body.classList.remove("trip-print-active");
  }, []);

  useEffect(() => {
    document.body.classList.toggle("trip-print-arka", side === "arka");
    return () => document.body.classList.remove("trip-print-arka");
  }, [side]);

  function showSide(nextSide) {
    setSide(nextSide);
    setPageIndex(0);
  }

  return {
    tripId,
    preview,
    loading,
    error,
    side,
    pageIndex,
    pageCount: side === "on" ? onPageCount : arkaPageCount,
    showSide,
    setPageIndex,
  };
}
