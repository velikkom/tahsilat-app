"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button, Spinner } from "react-bootstrap";

import useTripPrintPreview from "@/hooks/useTripPrintPreview";
import { formatCurrency, formatDate } from "@/utils/collectionUtils";

function amountCell(value) {
  return value == null ? "" : formatCurrency(value);
}

function dailyTotal(expense) {
  return (
    Number(expense.mealAmount || 0) +
    Number(expense.hotelAmount || 0) +
    Number(expense.fuelInvoiceAmount || 0) +
    Number(expense.otherAmount || 0)
  );
}

export default function TripPrintPage() {
  const { preview, loading, error } = useTripPrintPreview();

  useEffect(() => {
    document.body.classList.add("trip-print-active");
    return () => document.body.classList.remove("trip-print-active");
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  if (error || !preview) {
    return <div className="alert alert-danger">Çıktı önizlemesi bulunamadı.</div>;
  }

  const totals = preview.collectionTotals || {};

  return (
    <div className="trip-print-page">
      <div className="trip-print-page__toolbar">
        <Button variant="primary" onClick={() => window.print()}>
          Yazdır
        </Button>
        <Link href="/trips" className="btn btn-outline-secondary">
          Geri
        </Link>
      </div>

      {/* Sayfa 1: Form 2 - Harcama dökümü */}
      <div className="trip-print-page__sheet">
        <div className="trip-print-page__title">
          DENOTO KOLL. ŞTİ. AİT SATIŞ PERSONELİ HARCAMA DÖKÜMANIDIR
        </div>

        <div className="trip-print-page__meta">
          <div>
            <strong>Satış Personeli:</strong> {preview.salesmanName || "-"}
          </div>
          <div>
            <strong>Plaka:</strong> {preview.vehiclePlate || "-"}
          </div>
          <div>
            <strong>Çıkış KM:</strong> {preview.denizliExitKm ?? "-"}
          </div>
          <div>
            <strong>Giriş KM:</strong> {preview.denizliEntryKm ?? "-"}
          </div>
          <div>
            <strong>Toplam KM:</strong> {preview.totalKm ?? "-"}
          </div>
          <div>
            <strong>Çıkış Yakıt:</strong> {amountCell(preview.exitFuelAmount)}
          </div>
          <div>
            <strong>Yol Yakıt:</strong> {amountCell(preview.tripFuelAmount)}
          </div>
          <div>
            <strong>Toplam Yakıt:</strong> {amountCell(preview.totalFuelAmount)}
          </div>
        </div>

        <div className="trip-print-page__section-title">Günlük Harcamalar</div>
        <div style={{ overflowX: "auto" }}>
          <table className="trip-print-table">
            <thead>
              <tr>
                <th>Kalem</th>
                {preview.dailyExpenses.map((expense) => (
                  <th key={expense.id || expense.expenseDate}>{formatDate(expense.expenseDate)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Yemek</td>
                {preview.dailyExpenses.map((expense) => (
                  <td key={expense.id || expense.expenseDate}>{amountCell(expense.mealAmount)}</td>
                ))}
              </tr>
              <tr>
                <td>Otel</td>
                {preview.dailyExpenses.map((expense) => (
                  <td key={expense.id || expense.expenseDate}>{amountCell(expense.hotelAmount)}</td>
                ))}
              </tr>
              <tr>
                <td>Yakıt Faturaları</td>
                {preview.dailyExpenses.map((expense) => (
                  <td key={expense.id || expense.expenseDate}>{amountCell(expense.fuelInvoiceAmount)}</td>
                ))}
              </tr>
              <tr>
                <td>Diğer</td>
                {preview.dailyExpenses.map((expense) => (
                  <td key={expense.id || expense.expenseDate}>{amountCell(expense.otherAmount)}</td>
                ))}
              </tr>
              <tr>
                <td>Akşam Otele Giriş KM</td>
                {preview.dailyExpenses.map((expense) => (
                  <td key={expense.id || expense.expenseDate}>{expense.eveningHotelKm ?? ""}</td>
                ))}
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td>TOPLAM</td>
                {preview.dailyExpenses.map((expense) => (
                  <td key={expense.id || expense.expenseDate}>{formatCurrency(dailyTotal(expense))}</td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="trip-print-page__section-title">Tahsilat Özeti</div>
        <div className="trip-print-page__meta">
          <div>
            <strong>Nakit:</strong> {formatCurrency(totals.cash)}
          </div>
          <div>
            <strong>Senet:</strong> {formatCurrency(totals.promissoryNote)}
          </div>
          <div>
            <strong>Çek:</strong> {formatCurrency(totals.check)}
          </div>
          <div>
            <strong>Havale:</strong> {formatCurrency(totals.bankTransfer)}
          </div>
          <div>
            <strong>Mailorder:</strong> {formatCurrency(totals.mailOrder)}
          </div>
          <div>
            <strong>POS YKB:</strong> {formatCurrency(totals.posYkb)}
          </div>
          <div>
            <strong>POS TEB:</strong> {formatCurrency(totals.posTeb)}
          </div>
          <div>
            <strong>Genel Toplam:</strong> {formatCurrency(totals.genelToplam)}
          </div>
          <div>
            <strong>Primden Düşülecek Tahsilat:</strong>{" "}
            {formatCurrency(preview.commissionExcludedAmount)}
          </div>
          <div>
            <strong>%1 Aldığı Prim:</strong> {formatCurrency(preview.commissionReceived)}
          </div>
        </div>

        <div className="trip-print-page__section-title">Mutabakat</div>
        <div className="trip-print-page__meta">
          <div>
            <strong>Nakit Tahsilat:</strong> {formatCurrency(totals.cash)}
          </div>
          <div>
            <strong>Masraf Toplamı:</strong> {formatCurrency(preview.expenseTotal)}
          </div>
          <div>
            <strong>Aldığı Haftalık:</strong> {formatCurrency(preview.weeklyAllowance)}
          </div>
          <div>
            <strong>Aldığı Prim:</strong> {formatCurrency(preview.commissionReceived)}
          </div>
          <div>
            <strong>Fazladan Alınan:</strong> {formatCurrency(preview.extraReceived)}
          </div>
          <div>
            <strong>Aldığı AGİ:</strong> {formatCurrency(preview.agiReceived)}
          </div>
          <div>
            <strong>Kalan Nakit:</strong> {formatCurrency(preview.remainingCash)}
          </div>
          <div>
            <strong>Teslim Alan:</strong> {preview.receiverName || "-"}
          </div>
        </div>
      </div>

      {/* Sayfa 2: Form 1 - Tahsilat dökümü */}
      <div className="trip-print-page__sheet">
        <div className="trip-print-page__title">
          DENOTO KOLL. ŞTİ. AİT SATIŞ PERSONELİ TAHSİLAT DÖKÜMÜDÜR
        </div>

        <div className="trip-print-page__meta">
          <div>
            <strong>Satış Personeli Adı/Soyadı:</strong> {preview.salesmanName || "-"}
          </div>
          <div>
            <strong>Tarih:</strong> {formatDate(preview.startDate)}
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="trip-print-table">
            <thead>
              <tr>
                <th>Sıra No</th>
                <th>Makbuz No</th>
                <th>Mikro SR</th>
                <th>Mikro No</th>
                <th>Ünvanı</th>
                <th>Tarih</th>
                <th>Nakit Tutarı</th>
                <th>Senet Vade</th>
                <th>Senet Tutar</th>
                <th>Banka Adı</th>
                <th>Çek Vade</th>
                <th>Çek Tutar</th>
                <th>Mailorder Firma</th>
                <th>Mailorder Tutar</th>
                <th>Havale Banka</th>
                <th>Havale Tutar</th>
                <th>POS YKB</th>
                <th>POS TEB</th>
              </tr>
            </thead>
            <tbody>
              {preview.collectionRows.map((row) => (
                <tr key={row.siraNo}>
                  <td>{row.siraNo}</td>
                  <td>{row.receiptNumber || ""}</td>
                  <td>{row.mikroSr || ""}</td>
                  <td>{row.mikroNo || ""}</td>
                  <td>{row.customerName || ""}</td>
                  <td>{formatDate(row.collectionDate)}</td>
                  <td>{amountCell(row.nakitTutari)}</td>
                  <td>{row.senetVade ? formatDate(row.senetVade) : ""}</td>
                  <td>{amountCell(row.senetTutar)}</td>
                  <td>{row.bankName || ""}</td>
                  <td>{row.cekVade ? formatDate(row.cekVade) : ""}</td>
                  <td>{amountCell(row.cekTutar)}</td>
                  <td>{row.mailorderFirma || ""}</td>
                  <td>{amountCell(row.mailorder)}</td>
                  <td>{row.havaleBanka || ""}</td>
                  <td>{amountCell(row.havaleTutar)}</td>
                  <td>{amountCell(row.posYkb)}</td>
                  <td>{amountCell(row.posTeb)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4}>GENEL TOPLAM</td>
                <td />
                <td />
                <td>{formatCurrency(totals.cash)}</td>
                <td />
                <td>{formatCurrency(totals.promissoryNote)}</td>
                <td />
                <td />
                <td>{formatCurrency(totals.check)}</td>
                <td />
                <td>{formatCurrency(totals.mailOrder)}</td>
                <td />
                <td>{formatCurrency(totals.bankTransfer)}</td>
                <td>{formatCurrency(totals.posYkb)}</td>
                <td>{formatCurrency(totals.posTeb)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
