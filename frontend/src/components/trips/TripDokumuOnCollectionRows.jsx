import { formatFormAmount } from "@/utils/tripDokumuFormat";

import TripDokumuOnCollectionTail from "@/components/trips/TripDokumuOnCollectionTail";

export default function TripDokumuOnCollectionRows({
  preview,
  cash,
  senet,
  cek,
  mailOrder,
  posYkb,
  posTeb,
  havale,
  masraf,
  prim,
  kalanNakit,
}) {
  return (
    <>
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
      <TripDokumuOnCollectionTail
        preview={preview}
        mailOrder={mailOrder}
        posYkb={posYkb}
        posTeb={posTeb}
        havale={havale}
        kalanNakit={kalanNakit}
      />
    </>
  );
}
