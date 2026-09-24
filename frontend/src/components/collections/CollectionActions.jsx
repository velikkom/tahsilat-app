"use client";

import { memo } from "react";
import CollectionCardActions from "./CollectionCardActions";
import CollectionTableActions from "./CollectionTableActions";
import { getCollectionActionState } from "./collectionActionState";

function CollectionActions({
  row,
  onView,
  onEdit,
  onDelete,
  onMarkAsPaid,
  disabled = false,
  deletingId = null,
  variant = "table",
}) {
  const actionState = getCollectionActionState(row, disabled, deletingId);
  const ActionView =
    variant === "card" ? CollectionCardActions : CollectionTableActions;

  return (
    <ActionView
      row={row}
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
      onMarkAsPaid={onMarkAsPaid}
      {...actionState}
    />
  );
}

export default memo(CollectionActions);
