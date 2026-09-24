"use client";

import { createContext, useContext } from "react";
import useCurrentUser from "@/hooks/useCurrentUser";
import useDueMaturityState from "./useDueMaturityState";

const DueMaturityContext = createContext(null);

export function DueMaturityProvider({ children }) {
  const { user, loading: userLoading } = useCurrentUser();
  const enabled = Boolean(user) && !userLoading;
  const value = useDueMaturityState(enabled);

  return (
    <DueMaturityContext.Provider value={value}>
      {children}
    </DueMaturityContext.Provider>
  );
}

export default function useDueMaturitySummary() {
  const context = useContext(DueMaturityContext);

  if (!context) {
    throw new Error(
      "useDueMaturitySummary must be used within DueMaturityProvider"
    );
  }

  return context;
}
