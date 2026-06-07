"use client";

import { useCallback, useState } from "react";

export default function usePasswordToggle(initialVisible = false) {
  const [visible, setVisible] = useState(initialVisible);

  const toggle = useCallback(() => {
    setVisible((prev) => !prev);
  }, []);

  const inputType = visible ? "text" : "password";

  return { visible, toggle, inputType };
}
