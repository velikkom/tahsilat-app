"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const BreadcrumbLabelsContext = createContext({
  labels: {},
  setLabel: () => {},
  clearLabel: () => {},
});

export function BreadcrumbLabelsProvider({ children }) {
  const [labels, setLabels] = useState({});

  const setLabel = useCallback((href, label) => {
    if (!href || !label) {
      return;
    }

    setLabels((current) => {
      if (current[href] === label) {
        return current;
      }

      return { ...current, [href]: label };
    });
  }, []);

  const clearLabel = useCallback((href) => {
    setLabels((current) => {
      if (!current[href]) {
        return current;
      }

      const next = { ...current };
      delete next[href];
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ labels, setLabel, clearLabel }),
    [labels, setLabel, clearLabel]
  );

  return (
    <BreadcrumbLabelsContext.Provider value={value}>
      {children}
    </BreadcrumbLabelsContext.Provider>
  );
}

export function useBreadcrumbLabel(href, label) {
  const { setLabel, clearLabel } = useContext(BreadcrumbLabelsContext);

  useEffect(() => {
    if (!href || !label) {
      return undefined;
    }

    setLabel(href, label);

    return () => {
      clearLabel(href);
    };
  }, [href, label, setLabel, clearLabel]);
}

export function useBreadcrumbLabels() {
  return useContext(BreadcrumbLabelsContext);
}
