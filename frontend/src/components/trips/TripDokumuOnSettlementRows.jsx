import { formatFormAmount } from "@/utils/tripDokumuFormat";

export default function TripDokumuOnSettlementRows({
  genelToplam,
  primMatrah,
  prim,
  kalanNakit,
  cek,
  senet,
  cekAdet,
  senetAdet,
}) {
  return (
    <>
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
    </>
  );
}
