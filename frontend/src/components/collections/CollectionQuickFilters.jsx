"use client";

import { memo } from "react";
import { Button } from "react-bootstrap";
import { QUICK_FILTER_OPTIONS } from "@/utils/collectionUtils";

function CollectionQuickFilters({ value, onChange, disabled = false }) {
  return (
    <div className="collection-quick-filters">
      <div className="collection-filter-scroll d-flex gap-2">
        {QUICK_FILTER_OPTIONS.map((option) => (
          <Button
            key={option.value}
            size="sm"
            variant={value === option.value ? "primary" : "outline-secondary"}
            className="collection-filter-chip flex-shrink-0 touch-target"
            onClick={() => onChange(option.value)}
            disabled={disabled}
            aria-pressed={value === option.value}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

export default memo(CollectionQuickFilters);
