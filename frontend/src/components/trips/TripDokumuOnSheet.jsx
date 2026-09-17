import { toTurkishUpperCase } from "@/utils/collectionUtils";
import {
  ON_DAY_CAPACITY,
  addDaysIso,
  dayTotal,
  formatFormAmount,
  formatFormDate,
  toNumber,
} from "@/utils/tripDokumuFormat";

function expenseByDate(dailyExpenses = []) {
  const map = new Map();

  for (const expense of dailyExpenses) {
    map.set(expense.expenseDate, expense);
  }

  return map;
}

export default function TripDokumuOnSheet({ preview, pageIndex = 0 }) {
  const totals = preview.collectionTotals || {};
  const expenses = expenseByDate(preview.dailyExpenses);
  const pageIsPrimary = pageIndex === 0;

  const dayDates = Array.from({ length: ON_DAY_CAPACITY }, (_, index) =>
    addDaysIso(preview.startDate, pageIndex * ON_DAY_CAPACITY + index)
  );

  const days = dayDates.map((date) => expenses.get(date) || { expenseDate: date });

  const mealTotal = days.reduce((sum, day) => sum + toNumber(day.mealAmount), 0);
  const hotelTotal = days.reduce((sum, day) => sum + toNumber(day.hotelAmount), 0);
  const fuelTotal = days.reduce((sum, day) => sum + toNumber(day.fuelInvoiceAmount), 0);
  const otherTotal = days.reduce((sum, day) => sum + toNumber(day.otherAmount), 0);
  const pageExpenseTotal = days.reduce((sum, day) => sum + dayTotal(day), 0);

  const cash = toNumber(totals.cash);
  const senet = toNumber(totals.promissoryNote);
  const cek = toNumber(totals.check);
  const mailOrder = toNumber(totals.mailOrder);
  const posYkb = toNumber(totals.posYkb);
  const posTeb = toNumber(totals.posTeb);
  const havale = toNumber(totals.bankTransfer);
  const genelToplam = cash + senet + cek + mailOrder + posYkb + posTeb + havale;
  const excluded = toNumber(preview.commissionExcludedAmount);
  const primMatrah = Math.round(((genelToplam - excluded) / 1.2) * 100) / 100;
  const prim = Math.round(primMatrah * 0.01 * 100) / 100;
  const masraf = toNumber(preview.expenseTotal);
  const haftalik = toNumber(preview.weeklyAllowance);
  const extra = toNumber(preview.extraReceived);
  const agi = toNumber(preview.agiReceived);
  const kalanNakit = cash - masraf - haftalik - prim - extra - agi;

  const cekAdet = (preview.collectionRows || []).filter((row) => row.cekTutar != null).length;
  const senetAdet = (preview.collectionRows || []).filter((row) => row.senetTutar != null).length;

  return (
    <div className="dokumu-paper dokumu-paper--on">
      <table className="dokumu-table dokumu-table--on">
        <colgroup>
          <col className="dokumu-col-label" />
          <col span={6} />
          <col className="dokumu-col-total" />
        </colgroup>
        <tbody>
          <tr>
            <td colSpan={8} className="dokumu-title">
              DENOTO KOLL.ŞTİ.AİT SATIŞ PERSONELİ HARCAMA DÖKÜMANIDIR
            </td>
          </tr>
          <tr>
            <td colSpan={8} className="dokumu-note">
              ÖNEMLİ NOT:BU BELGENİN SATICI İLE ŞİRKET-ŞİRKET İLE SATIŞ PERSONELİ
              ARASINDAKİ ANLAŞMAZLIKLARDA DELİL OLARAK KULLANILACAĞINI PEŞİN OLARAK
              KABUL EDERİM.
            </td>
          </tr>
          <tr>
            <td />
            <td className="dokumu-head">DENİZLİ ÇIKIŞ KM.</td>
            <td className="dokumu-head">ÇIKIŞ YAKIT TUTARI</td>
            <td className="dokumu-head">SEY.ALINAN YAKIT</td>
            <td className="dokumu-head">DENİZLİ GİRİŞ KM.</td>
            <td className="dokumu-head">TOPLAM KM</td>
            <td className="dokumu-head">TOPL.YAKIT TUTARI</td>
            <td className="dokumu-head">ONAY</td>
          </tr>
          <tr>
            <td />
            <td>{pageIsPrimary ? preview.denizliExitKm ?? "" : ""}</td>
            <td>
              {pageIsPrimary ? formatFormAmount(preview.exitFuelAmount) : ""}
            </td>
            <td>
              {pageIsPrimary ? formatFormAmount(preview.tripFuelAmount) : ""}
            </td>
            <td>{pageIsPrimary ? preview.denizliEntryKm ?? "" : ""}</td>
            <td>{pageIsPrimary ? preview.totalKm ?? "" : ""}</td>
            <td>
              {pageIsPrimary ? formatFormAmount(preview.totalFuelAmount, { zero: true }) : ""}
            </td>
            <td />
          </tr>
          <tr>
            <td className="dokumu-head">TARİH</td>
            {dayDates.map((date) => (
              <td key={date} className="dokumu-date dokumu-fill">
                {formatFormDate(date)}
              </td>
            ))}
            <td className="dokumu-head">TOPLAM</td>
          </tr>
          <tr>
            <td className="dokumu-label">YEMEK BEDELİ</td>
            {days.map((day) => (
              <td key={`meal-${day.expenseDate}`}>
                {formatFormAmount(day.mealAmount)}
              </td>
            ))}
            <td className="dokumu-fill dokumu-strong">
              {formatFormAmount(mealTotal, { zero: true })}
            </td>
          </tr>
          <tr>
            <td rowSpan={2} className="dokumu-label dokumu-split-label">
              <span>TUTAR</span>
              <span>OTEL İSMİ / FATURA NO</span>
            </td>
            {days.map((day) => (
              <td key={`hotel-amt-${day.expenseDate}`}>
                {formatFormAmount(day.hotelAmount)}
              </td>
            ))}
            <td rowSpan={2} className="dokumu-fill dokumu-strong">
              {formatFormAmount(hotelTotal, { zero: true })}
            </td>
          </tr>
          <tr>
            {days.map((day) => (
              <td key={`hotel-det-${day.expenseDate}`} className="dokumu-detail">
                {day.hotelDetail || ""}
              </td>
            ))}
          </tr>
          <tr>
            <td rowSpan={2} className="dokumu-label dokumu-split-label">
              <span>TUTAR</span>
              <span>AL.FİRMA / FATURA NO</span>
            </td>
            {days.map((day) => (
              <td key={`fuel-amt-${day.expenseDate}`}>
                {formatFormAmount(day.fuelInvoiceAmount)}
              </td>
            ))}
            <td rowSpan={2} className="dokumu-fill dokumu-strong">
              {formatFormAmount(fuelTotal, { zero: true })}
            </td>
          </tr>
          <tr>
            {days.map((day) => (
              <td key={`fuel-det-${day.expenseDate}`} className="dokumu-detail">
                {day.fuelDetail || ""}
              </td>
            ))}
          </tr>
          <tr>
            <td rowSpan={2} className="dokumu-label dokumu-split-label">
              <span>TUTAR</span>
              <span>FİRMA / AÇIKLAMA</span>
            </td>
            {days.map((day) => (
              <td key={`other-amt-${day.expenseDate}`}>
                {formatFormAmount(day.otherAmount)}
              </td>
            ))}
            <td rowSpan={2} className="dokumu-fill dokumu-strong">
              {formatFormAmount(otherTotal, { zero: true })}
            </td>
          </tr>
          <tr>
            {days.map((day) => (
              <td key={`other-det-${day.expenseDate}`} className="dokumu-detail">
                {day.otherDetail || ""}
              </td>
            ))}
          </tr>
          <tr>
            <td className="dokumu-label">AKŞAM OTELE GİRİŞ KM.</td>
            {days.map((day) => (
              <td key={`km-${day.expenseDate}`}>{day.eveningHotelKm ?? ""}</td>
            ))}
            <td />
          </tr>
          <tr>
            <td className="dokumu-label">TOPLAM</td>
            {days.map((day) => (
              <td key={`tot-${day.expenseDate}`} className="dokumu-strong">
                {formatFormAmount(dayTotal(day))}
              </td>
            ))}
            <td className="dokumu-fill dokumu-strong">
              {formatFormAmount(pageExpenseTotal, { zero: true })}
            </td>
          </tr>
          <tr>
            <td className="dokumu-head">TARİH</td>
            <td>{formatFormDate(preview.endDate)}</td>
            <td className="dokumu-head">SATIŞ PERSONELİ</td>
            <td colSpan={2} className="dokumu-strong">
              {toTurkishUpperCase(preview.salesmanName)}
            </td>
            <td className="dokumu-head">PLAKA</td>
            <td colSpan={2} className="dokumu-strong">
              {preview.vehiclePlate || ""}
            </td>
          </tr>
          <tr>
            <td colSpan={2} className="dokumu-section">
              TAHSİLAT DÖKÜMÜ
            </td>
            <td className="dokumu-head">PİRİMDEN DÜŞÜLECEK TAHSİLAT</td>
            <td className="dokumu-head">NAKİT TAHSİLAT TOPLAMI</td>
            <td className="dokumu-strong">
              {formatFormAmount(cash, { zero: true })}
            </td>
            <td colSpan={3} />
          </tr>
          <tr>
            <td>NAKİT TAHSİLAT TOPLAMI</td>
            <td className="dokumu-strong">{formatFormAmount(cash, { zero: true })}</td>
            <td>{formatFormAmount(preview.commissionExcludedAmount)}</td>
            <td>MASRAF TOPLAMI</td>
            <td className="dokumu-strong">
              {formatFormAmount(masraf, { zero: true })}
            </td>
            <td colSpan={3} />
          </tr>
          <tr>
            <td>SENET TAHSİLAT TOPLAMI</td>
            <td className="dokumu-strong">{formatFormAmount(senet, { zero: true })}</td>
            <td />
            <td>ALDIĞI HAFTALIK</td>
            <td>{formatFormAmount(preview.weeklyAllowance)}</td>
            <td colSpan={3} />
          </tr>
          <tr>
            <td>ÇEK TAHSİLAT TOPLAMI</td>
            <td className="dokumu-strong">{formatFormAmount(cek, { zero: true })}</td>
            <td />
            <td>ALDIĞI PRİM</td>
            <td className="dokumu-strong">{formatFormAmount(prim, { zero: true })}</td>
            <td colSpan={3} />
          </tr>
          <tr>
            <td>MAİLORDER</td>
            <td className="dokumu-strong">
              {formatFormAmount(mailOrder, { zero: true })}
            </td>
            <td />
            <td>FAZLADAN ALDIĞI</td>
            <td>{formatFormAmount(preview.extraReceived)}</td>
            <td colSpan={3} />
          </tr>
          <tr>
            <td>KREDİ KARTI / YKB TAHS.TOP.</td>
            <td className="dokumu-strong">
              {formatFormAmount(posYkb, { zero: true })}
            </td>
            <td />
            <td>ALDIĞI AGİ</td>
            <td>{formatFormAmount(preview.agiReceived)}</td>
            <td colSpan={3} />
          </tr>
          <tr>
            <td>KREDİ KARTI / TEB TAHS.TOP.</td>
            <td className="dokumu-strong">
              {formatFormAmount(posTeb, { zero: true })}
            </td>
            <td />
            <td>KALAN NAKİT</td>
            <td className="dokumu-strong">
              {formatFormAmount(kalanNakit, { zero: true })}
            </td>
            <td colSpan={3} />
          </tr>
          <tr>
            <td>HAVALE TAHSİLAT TOPLAMI</td>
            <td className="dokumu-strong">
              {formatFormAmount(havale, { zero: true })}
            </td>
            <td />
            <td className="dokumu-head">İMZASI</td>
            <td />
            <td colSpan={3} />
          </tr>
          <tr>
            <td>GENEL TOPLAM</td>
            <td className="dokumu-strong">
              {formatFormAmount(genelToplam, { zero: true })}
            </td>
            <td colSpan={4} className="dokumu-section">
              EVRAK / NAKİT / TESLİM EDEN / TESLİM ALAN MİKTAR VE TUTARLARI
            </td>
            <td colSpan={2} />
          </tr>
          <tr>
            <td>PRİM HAKEDİŞ MATRAHI</td>
            <td className="dokumu-strong">
              {formatFormAmount(primMatrah, { zero: true })}
            </td>
            <td>NAKİT TESLİM ALINAN</td>
            <td className="dokumu-strong">
              {formatFormAmount(kalanNakit, { zero: true })}
            </td>
            <td colSpan={2} />
            <td className="dokumu-head">TESLİM EDEN / MUHASEBE ONAY</td>
            <td className="dokumu-head">TESLİM ALAN OLCAY CANDOĞAN ONAY</td>
          </tr>
          <tr>
            <td>%1 ALDIĞI PRİM TUTARI</td>
            <td className="dokumu-strong">{formatFormAmount(prim, { zero: true })}</td>
            <td>ÇEK / TESLİM ALINAN</td>
            <td className="dokumu-strong">{cekAdet || ""}</td>
            <td className="dokumu-head">TUTAR</td>
            <td className="dokumu-strong">{formatFormAmount(cek, { zero: true })}</td>
            <td />
            <td />
          </tr>
          <tr>
            <td>ALDIĞI AVANS TUTARI</td>
            <td />
            <td>SENET / TESLİM ALINAN</td>
            <td className="dokumu-strong">{senetAdet || ""}</td>
            <td className="dokumu-head">TUTAR</td>
            <td className="dokumu-strong">
              {formatFormAmount(senet, { zero: true })}
            </td>
            <td />
            <td />
          </tr>
          <tr>
            <td colSpan={2} className="dokumu-head">
              TESLİM EDEN / ADI SOYADI / İMZA
            </td>
            <td />
            <td colSpan={2} className="dokumu-head">
              İMZASI
            </td>
            <td colSpan={3} />
          </tr>
        </tbody>
      </table>
    </div>
  );
}
