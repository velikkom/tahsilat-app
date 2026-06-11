import { SESSION_CHECK_INTERVAL_MS } from "@/constants/session";
import { checkSession } from "@/services/authService";
import { SessionTerminatedError } from "@/services/sessionTerminatedHandler";
import { getToken } from "@/utils/tokenStorage";

let intervalId = null;
let activeSubscribers = 0;
let isChecking = false;

async function runSessionCheck() {
  if (isChecking || !getToken()) {
    return;
  }

  isChecking = true;

  try {
    await checkSession();
  } catch (error) {
    if (error instanceof SessionTerminatedError) {
      stopSessionMonitor();
    }
  } finally {
    isChecking = false;
  }
}

export function startSessionMonitor() {
  if (typeof window === "undefined") {
    return;
  }

  activeSubscribers += 1;

  if (intervalId !== null) {
    return;
  }

  void runSessionCheck();

  intervalId = window.setInterval(() => {
    void runSessionCheck();
  }, SESSION_CHECK_INTERVAL_MS);
}

export function stopSessionMonitor() {
  activeSubscribers = Math.max(0, activeSubscribers - 1);

  if (activeSubscribers > 0 || intervalId === null) {
    return;
  }

  window.clearInterval(intervalId);
  intervalId = null;
  isChecking = false;
}

export function forceStopSessionMonitor() {
  activeSubscribers = 0;

  if (intervalId !== null) {
    window.clearInterval(intervalId);
    intervalId = null;
  }

  isChecking = false;
}
