import { formatFormAmount } from "@/utils/tripDokumuFormat";

export default function TripDokumuOnSplitExpenseRows({
  labelTop,
  labelBottom,
  days,
  amountKey,
  detailKey,
  amountKeyPrefix,
  detailKeyPrefix,
  total,
}) {
  return (
    <>
      <tr>
        <td rowSpan={2} className="dokumu-label dokumu-split-label">
          <span>{labelTop}</span>
          <span>{labelBottom}</span>
        </td>
        {days.map((day) => (
          <td key={`${amountKeyPrefix}-${day.expenseDate}`}>
            {formatFormAmount(day[amountKey])}
          </td>
        ))}
        <td rowSpan={2} className="dokumu-fill dokumu-strong">
          {formatFormAmount(total, { zero: true })}
        </td>
      </tr>
      <tr>
        {days.map((day) => (
          <td key={`${detailKeyPrefix}-${day.expenseDate}`} className="dokumu-detail">
            {day[detailKey] || ""}
          </td>
        ))}
      </tr>
    </>
  );
}
