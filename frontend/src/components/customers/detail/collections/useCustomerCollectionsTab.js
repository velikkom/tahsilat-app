import { useCallback, useMemo } from "react";
import useBreakpoint from "@/hooks/useBreakpoint";
import useConfirmedMutation from "@/hooks/useConfirmedMutation";
import useCustomerCollections from "@/hooks/useCustomerCollections";
import useDueMaturitySummary from "@/context/DueMaturityContext";
import { buildCollectionsSummary } from "@/utils/collectionUtils";
import useCollectionDrawer from "./useCollectionDrawer";
import useCollectionModal from "./useCollectionModal";
import useCollectionRowActions from "./useCollectionRowActions";
import useCollectionsFilters from "./useCollectionsFilters";

export default function useCustomerCollectionsTab(customer) {
  const { collections, loading, refresh } = useCustomerCollections(
    customer.id
  );
  const { refresh: refreshDueMaturity } = useDueMaturitySummary();
  const { isMobile } = useBreakpoint();
  const submitMutation = useConfirmedMutation();
  const rowActionMutation = useConfirmedMutation();
  const busy = submitMutation.isRunning || rowActionMutation.isRunning;

  const refreshAll = useCallback(async () => {
    await refresh();
    await refreshDueMaturity({ silent: true });
  }, [refresh, refreshDueMaturity]);

  const summary = useMemo(
    () => buildCollectionsSummary(collections),
    [collections]
  );
  const filters = useCollectionsFilters(collections);
  const drawer = useCollectionDrawer();
  const modal = useCollectionModal({
    submitMutation,
    busy,
    refreshAll,
    closeDrawer: drawer.closeDrawer,
  });
  const rowActions = useCollectionRowActions({
    rowActionMutation,
    busy,
    refreshAll,
    closeDrawer: drawer.closeDrawer,
  });

  return {
    loading,
    busy,
    isMobile,
    collections,
    summary,
    hasCollections: collections.length > 0,
    hasFilteredResults: filters.filteredCollections.length > 0,
    isSubmitting: submitMutation.isRunning,
    ...filters,
    ...drawer,
    ...modal,
    ...rowActions,
  };
}
