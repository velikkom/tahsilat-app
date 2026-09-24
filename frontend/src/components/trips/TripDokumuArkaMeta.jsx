import { toTurkishUpperCase } from "@/utils/collectionUtils";
import { formatFormDate } from "@/utils/tripDokumuFormat";

export default function TripDokumuArkaMeta({ preview }) {
  return (
    <>
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
    </>
  );
}
