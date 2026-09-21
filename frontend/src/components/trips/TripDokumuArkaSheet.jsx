import { toTurkishUpperCase } from "@/utils/collectionUtils";
import {
  ARKA_ROW_CAPACITY,
  formatFormAmount,
  formatFormDate,
  toNumber,
} from "@/utils/tripDokumuFormat";

export default function TripDokumuArkaSheet({ preview, pageIndex = 0 }) {
  const allRows = preview.collectionRows || [];
  const from = pageIndex * ARKA_ROW_CAPACITY;
  const pageRows = allRows.slice(from, from + ARKA_ROW_CAPACITY);

  const lines = Array.from({ length: ARKA_ROW_CAPACITY }, (_, index) => {
    return pageRows[index] || { siraNo: from + index + 1 };
  });

  const cash = pageRows.reduce((sum, row) => sum + toNumber(row.nakitTutari), 0);
  const senet = pageRows.reduce((sum, row) => sum + toNumber(row.senetTutar), 0);
  const cek = pageRows.reduce((sum, row) => sum + toNumber(row.cekTutar), 0);
  const mailOrder = pageRows.reduce((sum, row) => sum + toNumber(row.mailorder), 0);
  const havale = pageRows.reduce((sum, row) => sum + toNumber(row.havaleTutar), 0);
  const posYkb = pageRows.reduce((sum, row) => sum + toNumber(row.posYkb), 0);
  const posTeb = pageRows.reduce((sum, row) => sum + toNumber(row.posTeb), 0);

  return (
    <div className="dokumu-paper dokumu-paper--arka">
      <table className="dokumu-table dokumu-table--arka">
        <colgroup>
          <col style={{ width: "3.5%" }} />
          <col className="dokumu-col-makbuz" style={{ width: "4%" }} />
          <col style={{ width: "3.5%" }} />
          <col style={{ width: "3.5%" }} />
          <col style={{ width: "20%" }} />
          <col style={{ width: "7%" }} />
          <col style={{ width: "6%" }} />
          <col style={{ width: "6%" }} />
          <col style={{ width: "6%" }} />
          <col style={{ width: "7%" }} />
          <col style={{ width: "5%" }} />
          <col style={{ width: "6%" }} />
          <col style={{ width: "7%" }} />
          <col style={{ width: "6%" }} />
          <col style={{ width: "6%" }} />
          <col style={{ width: "6%" }} />
          <col style={{ width: "5%" }} />
          <col style={{ width: "5%" }} />
        </colgroup>
        <tbody>
          <tr>
            <td colSpan={18} className="dokumu-title dokumu-title--arka">
              TAHSİLAT DÖKÜMÜDÜR
            </td>
          </tr>
          <tr className="dokumu-meta-row">
            <td colSpan={5} className="dokumu-strong dokumu-left">
              SATIŞ PERSONELİ&apos;NİN ADI / SOYADI :{" "}
              {toTurkishUpperCase(preview.salesmanName)}
            </td>
            <td colSpan={8} />
            <td colSpan={2} className="dokumu-date">
              {formatFormDate(preview.endDate)}
            </td>
            <td colSpan={3} />
          </tr>
          <tr>
            <td rowSpan={2} className="dokumu-head">
              SIRA NO
            </td>
            <td rowSpan={2} className="dokumu-head dokumu-col-makbuz">
              TAHSİLAT
              <br />
              MAKBUZ NO
            </td>
            <td colSpan={2} className="dokumu-head">
              MİKRO KAY.NO:
            </td>
            <td rowSpan={2} className="dokumu-head">
              ÜNVANI
            </td>
            <td rowSpan={2} className="dokumu-head">
              TARİH
            </td>
            <td className="dokumu-head">NAKİT</td>
            <td colSpan={2} className="dokumu-head">
              SENET
            </td>
            <td colSpan={3} className="dokumu-head">
              ÇEK
            </td>
            <td colSpan={2} className="dokumu-head">
              MAİLORDER / KREDİ KARTI
            </td>
            <td colSpan={2} className="dokumu-head">
              HAVALE
            </td>
            <td className="dokumu-head">POS</td>
            <td className="dokumu-head">POS</td>
          </tr>
          <tr>
            <td className="dokumu-head">SR.</td>
            <td className="dokumu-head">NO</td>
            <td className="dokumu-head">TUTARI</td>
            <td className="dokumu-head">VADE TARİHİ</td>
            <td className="dokumu-head">TUTARI</td>
            <td className="dokumu-head">BANKA ADI</td>
            <td className="dokumu-head">VADE</td>
            <td className="dokumu-head">TUTARI</td>
            <td className="dokumu-head">FİRMA</td>
            <td className="dokumu-head">TUTAR</td>
            <td className="dokumu-head">BANKA</td>
            <td className="dokumu-head">TUTARI</td>
            <td className="dokumu-head">YKB</td>
            <td className="dokumu-head">TEB</td>
          </tr>
          {lines.map((row) => (
            <tr key={row.siraNo}>
              <td>{row.siraNo}</td>
              <td>{row.receiptNumber || ""}</td>
              <td>{row.mikroSr || ""}</td>
              <td>{row.mikroNo || ""}</td>
              <td className="dokumu-left">{row.customerName || ""}</td>
              <td>{formatFormDate(row.collectionDate)}</td>
              <td>{formatFormAmount(row.nakitTutari)}</td>
              <td>{formatFormDate(row.senetVade)}</td>
              <td>{formatFormAmount(row.senetTutar)}</td>
              <td>{row.cekTutar != null ? row.bankName || "" : ""}</td>
              <td>{formatFormDate(row.cekVade)}</td>
              <td>{formatFormAmount(row.cekTutar)}</td>
              <td>{row.mailorderFirma || ""}</td>
              <td>{formatFormAmount(row.mailorder)}</td>
              <td>{row.havaleTutar != null ? row.havaleBanka || row.bankName || "" : ""}</td>
              <td>{formatFormAmount(row.havaleTutar)}</td>
              <td>{formatFormAmount(row.posYkb)}</td>
              <td>{formatFormAmount(row.posTeb)}</td>
            </tr>
          ))}
          <tr className="dokumu-total-row">
            <td colSpan={5} className="dokumu-section dokumu-right">
              GENEL TOPLAM
            </td>
            <td />
            <td className="dokumu-fill dokumu-strong">
              {formatFormAmount(cash, { zero: true })}
            </td>
            <td colSpan={2} className="dokumu-fill dokumu-strong">
              {formatFormAmount(senet, { zero: true })}
            </td>
            <td colSpan={3} className="dokumu-fill dokumu-strong">
              {formatFormAmount(cek, { zero: true })}
            </td>
            <td className="dokumu-fill" />
            <td className="dokumu-fill dokumu-strong">
              {formatFormAmount(mailOrder, { zero: true })}
            </td>
            <td colSpan={2} className="dokumu-fill dokumu-strong">
              {formatFormAmount(havale, { zero: true })}
            </td>
            <td className="dokumu-fill dokumu-strong">
              {formatFormAmount(posYkb, { zero: true })}
            </td>
            <td className="dokumu-fill dokumu-strong">
              {formatFormAmount(posTeb, { zero: true })}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
