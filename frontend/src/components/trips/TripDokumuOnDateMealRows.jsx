import { formatFormAmount, formatFormDate } from "@/utils/tripDokumuFormat";

export default function TripDokumuOnDateMealRows({ dayDates, days, mealTotal }) {
  return (
    <>
      <tr>
        <td className="dokumu-head">TARİH</td>
        {dayDates.map((date) => (
          <td key={date} className="dokumu-date dokumu-fill">
            {formatFormDate(date)}
          </td>
        ))}
        <td className="dokumu-head">TOPLAM</td>
      </tr>
      <tr>
        <td className="dokumu-label">YEMEK BEDELİ</td>
        {days.map((day) => (
          <td key={`meal-${day.expenseDate}`}>
            {formatFormAmount(day.mealAmount)}
          </td>
        ))}
        <td className="dokumu-fill dokumu-strong">
          {formatFormAmount(mealTotal, { zero: true })}
        </td>
      </tr>
    </>
  );
}
