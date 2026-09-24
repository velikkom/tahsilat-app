import { dayTotal, formatFormAmount } from "@/utils/tripDokumuFormat";

export default function TripDokumuOnDayTotalRows({ days, pageExpenseTotal }) {
  return (
    <>
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
    </>
  );
}
