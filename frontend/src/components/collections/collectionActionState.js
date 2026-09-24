import {
  canMarkCollectionAsPaid,
  getMarkAsPaidButtonTitle,
  showsMarkAsPaidAction,
} from "@/utils/collectionUtils";

export function getCollectionActionState(row, disabled, deletingId) {
  const isDeleting = deletingId === row?.id;
  const isDisabled = disabled || isDeleting;

  return {
    isDisabled,
    showMarkAsPaid: showsMarkAsPaidAction(row),
    markEnabled: canMarkCollectionAsPaid(row),
    markTitle: getMarkAsPaidButtonTitle(row),
  };
}
