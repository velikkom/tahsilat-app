import Link from "next/link";
import { Button } from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";

export default function TripDokumuPreviewNav({
  side,
  pageCount,
  pageIndex,
  onShowSide,
  onPageIndexChange,
}) {
  return (
    <div className="trip-print-page__toolbar-group">
      <Link
        href="/trips"
        className="btn btn-outline-secondary touch-target d-inline-flex align-items-center gap-2"
      >
        <FaArrowLeft aria-hidden="true" />
        Geri
      </Link>
      <Button
        variant={side === "on" ? "dark" : "outline-dark"}
        className="touch-target"
        aria-pressed={side === "on"}
        onClick={() => onShowSide("on")}
      >
        Ön
      </Button>
      <Button
        variant={side === "arka" ? "dark" : "outline-dark"}
        className="touch-target"
        aria-pressed={side === "arka"}
        onClick={() => onShowSide("arka")}
      >
        Arka
      </Button>
      {pageCount > 1 &&
        Array.from({ length: pageCount }, (_, index) => (
          <Button
            key={`${side}-${index}`}
            variant={pageIndex === index ? "secondary" : "outline-secondary"}
            className="touch-target"
            onClick={() => onPageIndexChange(index)}
          >
            {index + 1}
          </Button>
        ))}
    </div>
  );
}
