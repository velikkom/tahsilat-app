import Link from "next/link";
import { Button } from "react-bootstrap";
import { FaDownload, FaEdit, FaPrint, FaShareAlt } from "react-icons/fa";

export default function TripDokumuPreviewActions({
  tripId,
  sharing,
  downloading,
  onShare,
  onDownload,
}) {
  return (
    <div className="trip-print-page__toolbar-group">
      <Button
        variant="outline-primary"
        className="touch-target d-inline-flex align-items-center gap-2"
        onClick={() => window.print()}
      >
        <FaPrint aria-hidden="true" />
        Yazdır
      </Button>
      <Button
        variant="outline-info"
        className="touch-target d-inline-flex align-items-center gap-2"
        onClick={onShare}
        disabled={sharing}
      >
        <FaShareAlt aria-hidden="true" />
        {sharing ? "Paylaşılıyor..." : "Paylaş"}
      </Button>
      <Button
        variant="outline-success"
        className="touch-target d-inline-flex align-items-center gap-2"
        onClick={onDownload}
        disabled={downloading}
      >
        <FaDownload aria-hidden="true" />
        {downloading ? "İndiriliyor..." : "İndir"}
      </Button>
      <Link
        href={`/trips/${tripId}`}
        className="btn btn-outline-warning touch-target d-inline-flex align-items-center gap-2"
      >
        <FaEdit aria-hidden="true" />
        Düzelt
      </Link>
    </div>
  );
}
