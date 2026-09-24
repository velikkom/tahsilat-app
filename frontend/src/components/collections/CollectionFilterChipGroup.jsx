"use client";

import { Button } from "react-bootstrap";
import { getPaymentTypeTone } from "@/utils/collectionUtils";

export default function CollectionFilterChipGroup({
  label,
  options,
  value,
  onChange,
  disabled,
  colorByPaymentType = false,
}) {
  return (
    <div className="collection-filter-group">
      <span className="collection-filter-group__label text-muted">{label}</span>
      <div className="ui-filter-scroll d-flex gap-2">
        {options.map((option) => {
          const isActive = value === option.value;
          const tone =
            colorByPaymentType && option.value !== "ALL"
              ? getPaymentTypeTone(option.value)
              : null;

          return (
            <Button
              key={option.value}
              variant={isActive ? "primary" : "outline-secondary"}
              className={[
                "ui-filter-chip",
                "flex-shrink-0",
                "touch-target",
                tone ? `payment-type-chip payment-type-chip--${tone}` : "",
                tone && isActive ? "is-active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onChange(option.value)}
              disabled={disabled}
              aria-pressed={isActive}
            >
              {option.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
