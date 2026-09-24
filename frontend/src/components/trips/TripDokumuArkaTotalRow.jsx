import { formatFormAmount } from "@/utils/tripDokumuFormat";

export default function TripDokumuArkaTotalRow({
  cash,
  senet,
  cek,
  mailOrder,
  havale,
  posYkb,
  posTeb,
}) {
  return (
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
  );
}
