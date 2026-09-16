"use client";

import { useState } from "react";
import { Button } from "react-bootstrap";
import { FaDownload } from "react-icons/fa";
import Swal from "sweetalert2";

import { downloadTripTahsilatDokumu } from "@/services/tripService";

export default function TripDocumentDownloadButtons({ tripId }) {
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    setDownloading(true);

    try {
      await downloadTripTahsilatDokumu(tripId);
    } catch (error) {
      console.error(error);

      await Swal.fire({
        icon: "error",
        title: "Hata",
        text: error.message || "Tahsilat dökümü indirilemedi.",
      });
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Button
      variant="outline-success"
      onClick={handleDownload}
      disabled={downloading}
    >
      <FaDownload className="me-2" aria-hidden="true" />
      Tahsilat Dökümü İndir
    </Button>
  );
}
