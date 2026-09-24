import { toTurkishUpperCase } from "@/utils/collectionUtils";
import { formatFormDate } from "@/utils/tripDokumuFormat";

export default function TripDokumuOnStaffRow({ preview }) {
  return (
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
  );
}
