import { useCallback, useMemo, useState } from "react";

const EMPTY_DATE_FILTERS = { fromDate: "", toDate: "" };

export default function useTripDateFilters() {
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_DATE_FILTERS);
  const [draftFilters, setDraftFilters] = useState(EMPTY_DATE_FILTERS);

  const isRangeInvalid = useMemo(() => {
    return Boolean(
      draftFilters.fromDate &&
        draftFilters.toDate &&
        draftFilters.toDate < draftFilters.fromDate
    );
  }, [draftFilters]);

  const handleFilterFieldChange = useCallback((event) => {
    const { name, value } = event.target;
    setDraftFilters((previous) => ({ ...previous, [name]: value }));
  }, []);

  const handleApplyFilters = useCallback(
    (event) => {
      event.preventDefault();

      if (isRangeInvalid) {
        return;
      }

      setAppliedFilters(draftFilters);
    },
    [draftFilters, isRangeInvalid]
  );

  const handleClearFilters = useCallback(() => {
    setDraftFilters(EMPTY_DATE_FILTERS);
    setAppliedFilters(EMPTY_DATE_FILTERS);
  }, []);

  return {
    appliedFilters,
    draftFilters,
    isRangeInvalid,
    handleFilterFieldChange,
    handleApplyFilters,
    handleClearFilters,
  };
}
