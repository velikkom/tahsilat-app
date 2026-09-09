export const MAX_TRIP_DAYS = 14;

export const DAILY_EXPENSE_FIELDS = [
  { key: "mealAmount", label: "Yemek", step: "0.01" },
  { key: "hotelAmount", label: "Otel", step: "0.01" },
  { key: "fuelInvoiceAmount", label: "Yakıt Faturaları", step: "0.01" },
  { key: "otherAmount", label: "Diğer", step: "0.01" },
  { key: "eveningHotelKm", label: "Akşam Otele Giriş KM", step: "1" },
];

function toLocalDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toIsoDate(date) {
  return date.toISOString().split("T")[0];
}

/**
 * Builds an inclusive array of ISO date strings between startDate and
 * endDate. Returns an empty array for missing/invalid input or when
 * endDate is before startDate.
 */
export function buildDateRange(startDate, endDate) {
  const start = toLocalDate(startDate);
  const end = toLocalDate(endDate);

  if (!start || !end || end < start) {
    return [];
  }

  const days = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    days.push(toIsoDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

const EMPTY_DAILY_EXPENSE_VALUES = {
  mealAmount: "",
  hotelAmount: "",
  fuelInvoiceAmount: "",
  otherAmount: "",
  eveningHotelKm: "",
};

/**
 * Regenerates the daily expense rows for the given date range, keeping
 * values already entered for days that are still within range and
 * dropping rows for days that fell out of range.
 */
export function mergeDailyExpensesForRange(days, existingExpenses = []) {
  const byDate = new Map();

  for (const expense of existingExpenses) {
    if (expense?.expenseDate) {
      byDate.set(expense.expenseDate, expense);
    }
  }

  return days.map((expenseDate) => {
    const existing = byDate.get(expenseDate);

    return {
      expenseDate,
      mealAmount: existing?.mealAmount ?? EMPTY_DAILY_EXPENSE_VALUES.mealAmount,
      hotelAmount:
        existing?.hotelAmount ?? EMPTY_DAILY_EXPENSE_VALUES.hotelAmount,
      fuelInvoiceAmount:
        existing?.fuelInvoiceAmount ??
        EMPTY_DAILY_EXPENSE_VALUES.fuelInvoiceAmount,
      otherAmount:
        existing?.otherAmount ?? EMPTY_DAILY_EXPENSE_VALUES.otherAmount,
      eveningHotelKm:
        existing?.eveningHotelKm ?? EMPTY_DAILY_EXPENSE_VALUES.eveningHotelKm,
    };
  });
}
