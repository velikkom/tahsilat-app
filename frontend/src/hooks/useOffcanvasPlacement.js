"use client";

import { useEffect, useState } from "react";

export default function useOffcanvasPlacement(query) {
  const [placement, setPlacement] = useState("end");

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    function updatePlacement() {
      setPlacement(mediaQuery.matches ? "bottom" : "end");
    }

    updatePlacement();
    mediaQuery.addEventListener("change", updatePlacement);

    return () => mediaQuery.removeEventListener("change", updatePlacement);
  }, [query]);

  return placement;
}
