"use client";

import { useCallback, useEffect, useState } from "react";

export default function useSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        close();
      }
    };

    document.body.classList.add("sidebar-drawer-open");
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.classList.remove("sidebar-drawer-open");
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, close]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        close();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [close]);

  return { isOpen, open, close, toggle };
}
