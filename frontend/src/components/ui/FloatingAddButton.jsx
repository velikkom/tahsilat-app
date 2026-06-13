"use client";

import { memo } from "react";
import { Button } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";

function FloatingAddButton({
  onClick,
  disabled = false,
  ariaLabel = "Yeni kayıt ekle",
}) {
  return (
    <Button
      variant="primary"
      className="ui-fab d-lg-none"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      <FaPlus aria-hidden="true" />
    </Button>
  );
}

export default memo(FloatingAddButton);
