"use client";

import { useEffect } from "react";
import {
  startSessionMonitor,
  stopSessionMonitor,
} from "@/services/sessionMonitor";
import { getToken } from "@/utils/tokenStorage";

export default function SessionMonitor() {
  useEffect(() => {
    if (!getToken()) {
      return undefined;
    }

    startSessionMonitor();

    return () => {
      stopSessionMonitor();
    };
  }, []);

  return null;
}
