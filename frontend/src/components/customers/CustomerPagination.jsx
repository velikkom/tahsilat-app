"use client";

import { Button } from "react-bootstrap";

export default function CustomerPagination({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
  disabled = false,
}) {
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  return (
    <div className="customer-pagination d-flex align-items-center justify-content-between gap-3">
      <Button
        variant="outline-primary"
        className="customer-pagination__btn touch-target"
        onClick={onPrevious}
        disabled={disabled || isFirstPage}
      >
        Önceki
      </Button>

      <span className="customer-pagination__status text-muted fw-semibold">
        {currentPage}/{totalPages}
      </span>

      <Button
        variant="outline-primary"
        className="customer-pagination__btn touch-target"
        onClick={onNext}
        disabled={disabled || isLastPage}
      >
        Sonraki
      </Button>
    </div>
  );
}
