import Swal from "sweetalert2";
import {
  LOGIN_PATH,
  SESSION_TERMINATED_ALERT,
  SESSION_TERMINATED_MESSAGE,
} from "@/constants/session";
import { clearSession } from "@/utils/tokenStorage";

export class SessionTerminatedError extends Error {
  constructor() {
    super(SESSION_TERMINATED_MESSAGE);
    this.name = "SessionTerminatedError";
  }
}

let sessionTerminationPromise = null;

export function isSessionTerminatedPayload(payload) {
  return payload?.message === SESSION_TERMINATED_MESSAGE;
}

export function handleSessionTerminated() {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (!sessionTerminationPromise) {
    sessionTerminationPromise = (async () => {
      clearSession();

      await Swal.fire({
        icon: "warning",
        title: SESSION_TERMINATED_ALERT.title,
        text: SESSION_TERMINATED_ALERT.text,
        confirmButtonText: SESSION_TERMINATED_ALERT.confirmButtonText,
        allowOutsideClick: false,
        allowEscapeKey: false,
      });

      window.location.href = LOGIN_PATH;
    })();
  }

  return sessionTerminationPromise;
}

export function resetSessionTerminationHandler() {
  sessionTerminationPromise = null;
}
