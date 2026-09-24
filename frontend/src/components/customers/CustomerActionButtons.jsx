"use client";

import CustomerActionButtonsCompact from "./CustomerActionButtonsCompact";
import CustomerActionButtonsStacked from "./CustomerActionButtonsStacked";

export default function CustomerActionButtons({
  onView,
  onEdit,
  onDelete,
  onNewCollection,
  showEdit = true,
  showDelete = true,
  disabled = false,
  deleting = false,
  compact = false,
}) {
  const ActionView = compact
    ? CustomerActionButtonsCompact
    : CustomerActionButtonsStacked;

  return (
    <ActionView
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
      onNewCollection={onNewCollection}
      showEdit={showEdit}
      showDelete={showDelete}
      disabled={disabled}
      deleting={deleting}
    />
  );
}
