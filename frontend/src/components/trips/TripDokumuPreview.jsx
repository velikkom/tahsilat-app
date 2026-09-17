"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button, Spinner } from "react-bootstrap";
import { FaArrowLeft, FaDownload, FaEdit, FaPrint, FaShareAlt } from "react-icons/fa";
import Swal from "sweetalert2";

import TripDokumuArkaSheet from "@/components/trips/TripDokumuArkaSheet";
import TripDokumuOnSheet from "@/components/trips/TripDokumuOnSheet";
import useTripPrintPreview from "@/hooks/useTripPrintPreview";
import { formatDate } from "@/utils/collectionUtils";
import {
  downloadTripTahsilatDokumu,
  getTripTahsilatDokumuFile,
} from "@/services/tripService";
import {
  ARKA_ROW_CAPACITY,
  ON_DAY_CAPACITY,
  tripDayCount,
} from "@/utils/tripDokumuFormat";

export default function TripDokumuPreview() {
  const params = useParams();
  const tripId = params.id;
  const { preview, loading, error } = useTripPrintPreview();
  const [side, setSide] = useState("on");
  const [pageIndex, setPageIndex] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);

  const onPageCount = useMemo(() => {
    if (!preview) {
      return 1;
    }

    return Math.max(
      1,
      Math.ceil(tripDayCount(preview.startDate, preview.endDate) / ON_DAY_CAPACITY)
    );
  }, [preview]);

  const arkaPageCount = useMemo(() => {
    if (!preview) {
      return 1;
    }

    return Math.max(
      1,
      Math.ceil((preview.collectionRows?.length || 1) / ARKA_ROW_CAPACITY)
    );
  }, [preview]);

  const pageCount = side === "on" ? onPageCount : arkaPageCount;

  function showSide(nextSide) {
    setSide(nextSide);
    setPageIndex(0);
  }

  useEffect(() => {
    document.body.classList.add("trip-print-active");
    return () => document.body.classList.remove("trip-print-active");
  }, []);

  useEffect(() => {
    document.body.classList.toggle("trip-print-arka", side === "arka");
    return () => document.body.classList.remove("trip-print-arka");
  }, [side]);

  async function handleDownload() {
    if (!tripId || downloading) {
      return;
    }

    setDownloading(true);

    try {
      await downloadTripTahsilatDokumu(tripId);
    } catch (downloadError) {
      console.error(downloadError);

      await Swal.fire({
        icon: "error",
        title: "Hata",
        text: downloadError.message || "Tahsilat dökümü indirilemedi.",
      });
    } finally {
      setDownloading(false);
    }
  }

  async function handleShare() {
    if (!tripId || sharing) {
      return;
    }

    setSharing(true);

    const title = `Tahsilat Dökümü — ${preview.salesmanName || ""}`.trim();
    const text = [
      formatDate(preview.startDate),
      formatDate(preview.endDate),
      preview.vehiclePlate,
    ]
      .filter((part) => part && part !== "-")
      .join(" · ");

    try {
      const file = await getTripTahsilatDokumuFile(tripId);
      const canShareFile = (() => {
        try {
          return Boolean(navigator.canShare?.({ files: [file] }));
        } catch {
          return false;
        }
      })();

      if (canShareFile) {
        await navigator.share({ title, text, files: [file] });
        return;
      }

      if (typeof navigator.share === "function") {
        await navigator.share({ title, text, url: window.location.href });
        return;
      }

      await navigator.clipboard.writeText(window.location.href);

      await Swal.fire({
        icon: "success",
        title: "Bağlantı kopyalandı",
        text: "Bu tarayıcı paylaşımı desteklemiyor. Döküm sayfasının bağlantısı panoya alındı.",
        confirmButtonText: "Tamam",
      });
    } catch (shareError) {
      if (shareError?.name === "AbortError") {
        return;
      }

      console.error(shareError);

      await Swal.fire({
        icon: "error",
        title: "Hata",
        text: shareError.message || "Döküm paylaşılamadı.",
      });
    } finally {
      setSharing(false);
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  if (error || !preview) {
    return (
      <div className="trip-print-page">
        <div className="trip-print-page__toolbar">
          <Link
            href="/trips"
            className="btn btn-outline-secondary touch-target d-inline-flex align-items-center gap-2"
          >
            <FaArrowLeft aria-hidden="true" />
            Geri
          </Link>
          <Link
            href={`/trips/${tripId}`}
            className="btn btn-outline-warning touch-target d-inline-flex align-items-center gap-2"
          >
            <FaEdit aria-hidden="true" />
            Düzelt
          </Link>
        </div>
        <div className="alert alert-danger">Çıktı önizlemesi bulunamadı.</div>
      </div>
    );
  }

  return (
    <div className="trip-print-page">
      <div className="trip-print-page__toolbar">
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
            onClick={() => showSide("on")}
          >
            Ön
          </Button>
          <Button
            variant={side === "arka" ? "dark" : "outline-dark"}
            className="touch-target"
            aria-pressed={side === "arka"}
            onClick={() => showSide("arka")}
          >
            Arka
          </Button>
          {pageCount > 1 &&
            Array.from({ length: pageCount }, (_, index) => (
              <Button
                key={`${side}-${index}`}
                variant={pageIndex === index ? "secondary" : "outline-secondary"}
                className="touch-target"
                onClick={() => setPageIndex(index)}
              >
                {index + 1}
              </Button>
            ))}
        </div>

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
            onClick={handleShare}
            disabled={sharing}
          >
            <FaShareAlt aria-hidden="true" />
            {sharing ? "Paylaşılıyor..." : "Paylaş"}
          </Button>
          <Button
            variant="outline-success"
            className="touch-target d-inline-flex align-items-center gap-2"
            onClick={handleDownload}
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
      </div>

      {side === "on" ? (
        <TripDokumuOnSheet preview={preview} pageIndex={pageIndex} />
      ) : (
        <TripDokumuArkaSheet preview={preview} pageIndex={pageIndex} />
      )}
    </div>
  );
}
