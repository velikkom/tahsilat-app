import { formatFormAmount } from "@/utils/tripDokumuFormat";

export default function TripDokumuOnHeader({ preview, pageIsPrimary }) {
  return (
    <>
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
          {pageIsPrimary
            ? formatFormAmount(preview.totalFuelAmount, { zero: true })
            : ""}
        </td>
        <td />
      </tr>
    </>
  );
}
