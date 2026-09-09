"use client";

import { useState } from "react";
import { Button } from "react-bootstrap";
import { FaDownload, FaFileInvoice } from "react-icons/fa";
import Swal from "sweetalert2";

import {
  downloadTripCollectionDocument,
  downloadTripExpenseDocument,
} from "@/services/tripService";

export default function TripDocumentDownloadButtons({ tripId }) {
  const [downloadingExpense, setDownloadingExpense] = useState(false);
  const [downloadingCollection, setDownloadingCollection] = useState(false);

  async function handleDownloadExpense() {
    setDownloadingExpense(true);

    try {
      await downloadTripExpenseDocument(tripId);
    } catch (error) {
      console.error(error);

      await Swal.fire({
        icon: "error",
        title: "Hata",
        text: error.message || "Harcama dokümanı indirilemedi.",
      });
    } finally {
      setDownloadingExpense(false);
    }
  }

  async function handleDownloadCollection() {
    setDownloadingCollection(true);

    try {
      await downloadTripCollectionDocument(tripId);
    } catch (error) {
      console.error(error);

      await Swal.fire({
        icon: "error",
        title: "Hata",
        text: error.message || "Tahsilat dökümü indirilemedi.",
      });
    } finally {
      setDownloadingCollection(false);
    }
  }

  return (
    <div className="d-flex flex-wrap gap-2">
      <Button
        variant="outline-success"
        onClick={handleDownloadExpense}
        disabled={downloadingExpense}
      >
        <FaDownload className="me-2" aria-hidden="true" />
        Harcama Dökümü (Form 2)
      </Button>

      <Button
        variant="outline-info"
        onClick={handleDownloadCollection}
        disabled={downloadingCollection}
      >
        <FaFileInvoice className="me-2" aria-hidden="true" />
        Tahsilat Dökümü (Form 1)
      </Button>
    </div>
  );
}
