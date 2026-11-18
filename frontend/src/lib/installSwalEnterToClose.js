"use client";

import Swal from "sweetalert2";
import { createSwalEnterKeyListener } from "@/lib/swalEnterKey";

const PATCHED = "__tahsilatSwalEnterClose";

export function installSwalEnterToClose() {
  if (typeof window === "undefined" || Swal[PATCHED]) {
    return;
  }

  Swal[PATCHED] = true;
  const originalFire = Swal.fire.bind(Swal);

  Swal.fire = (...args) => {
    if (args.length !== 1 || !args[0] || typeof args[0] !== "object") {
      return originalFire(...args);
    }

    const options = args[0];
    const userDidOpen = options.didOpen;
    const userWillClose = options.willClose;
    const userDidDestroy = options.didDestroy;
    let detach = () => {};

    const cleanup = () => {
      detach();
      detach = () => {};
    };

    return originalFire({
      ...options,
      didOpen: (popup) => {
        userDidOpen?.(popup);
        const onKeyDown = createSwalEnterKeyListener(popup, options);
        window.addEventListener("keydown", onKeyDown, true);
        detach = () => window.removeEventListener("keydown", onKeyDown, true);
      },
      willClose: (popup) => {
        cleanup();
        userWillClose?.(popup);
      },
      didDestroy: (...destroyArgs) => {
        cleanup();
        userDidDestroy?.(...destroyArgs);
      },
    });
  };
}

installSwalEnterToClose();
