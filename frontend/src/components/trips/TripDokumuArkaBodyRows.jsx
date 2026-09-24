import { formatFormAmount, formatFormDate } from "@/utils/tripDokumuFormat";

export default function TripDokumuArkaBodyRows({ lines }) {
  return lines.map((row) => (
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
  ));
}
