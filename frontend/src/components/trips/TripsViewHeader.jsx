import Link from "next/link";
import { Button } from "react-bootstrap";

export default function TripsViewHeader({ onOpenImport }) {
  return (
    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2 mb-3 mb-md-4">
      <div>
        <h2 className="fw-bold page-header__title mb-1">Turlar</h2>
        <p className="text-muted mb-0">
          Saha turu, harcama ve tahsilat dökümü yönetimi
        </p>
      </div>
      <div className="d-none d-lg-flex align-items-center gap-2">
        <Button variant="outline-primary" onClick={onOpenImport}>
          Excel&apos;den İçe Aktar
        </Button>
        <Link
          href="/trips/new"
          className="btn btn-primary d-inline-flex align-items-center gap-2"
        >
          Yeni Tur
        </Link>
      </div>
    </div>
  );
}
