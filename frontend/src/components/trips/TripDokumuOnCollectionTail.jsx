import { formatFormAmount } from "@/utils/tripDokumuFormat";

export default function TripDokumuOnCollectionTail({
  preview,
  mailOrder,
  posYkb,
  posTeb,
  havale,
  kalanNakit,
}) {
  return (
    <>
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
    </>
  );
}
