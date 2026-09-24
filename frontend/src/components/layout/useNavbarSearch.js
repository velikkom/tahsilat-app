import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import useCustomers from "@/hooks/useCustomers";
import { filterCustomersByQuery } from "@/utils/customerUtils";
import { createNavbarSearchHandlers } from "./navbarSearchHandlers";
import useNavbarSearchDismiss from "./useNavbarSearchDismiss";
import useNavbarSearchShortcut from "./useNavbarSearchShortcut";

const RESULT_LIMIT = 8;

export default function useNavbarSearch({ rootRef, inputRef }) {
  const router = useRouter();
  const { customers, loading } = useCustomers();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const results = useMemo(() => {
    if (!query.trim()) {
      return [];
    }

    return filterCustomersByQuery(customers, query).slice(0, RESULT_LIMIT);
  }, [customers, query]);
  const showPanel = open && query.trim().length > 0;

  useNavbarSearchDismiss(rootRef, setOpen, setExpanded);
  useNavbarSearchShortcut(inputRef, setExpanded, setOpen);

  function resetSearch() {
    setQuery("");
    setOpen(false);
    setExpanded(false);
  }

  const handlers = createNavbarSearchHandlers({
    router,
    results,
    activeIndex,
    showPanel,
    inputRef,
    setOpen,
    setExpanded,
    setActiveIndex,
    resetSearch,
  });

  return {
    router,
    loading,
    query,
    setQuery,
    setOpen,
    activeIndex,
    setActiveIndex,
    expanded,
    setExpanded,
    results,
    showPanel,
    resetSearch,
    ...handlers,
  };
}
