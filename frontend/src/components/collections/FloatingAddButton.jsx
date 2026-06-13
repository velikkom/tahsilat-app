"use client";

import { memo } from "react";
import { Button } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";

function FloatingAddButton({ onClick, disabled = false }) {
  return (
    <Button
      variant="primary"
      className="collection-fab d-lg-none"
      onClick={onClick}
      disabled={disabled}
      aria-label="Yeni tahsilat ekle"
    >
      <FaPlus aria-hidden="true" />
    </Button>
  );
}

export default memo(FloatingAddButton);
