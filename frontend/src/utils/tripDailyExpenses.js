const EMPTY_DAILY_EXPENSE_VALUES = {
  mealAmount: "",
  hotelAmount: "",
  hotelDetail: "",
  fuelInvoiceAmount: "",
  fuelDetail: "",
  otherAmount: "",
  otherDetail: "",
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
      hotelDetail:
        existing?.hotelDetail ?? EMPTY_DAILY_EXPENSE_VALUES.hotelDetail,
      fuelInvoiceAmount:
        existing?.fuelInvoiceAmount ??
        EMPTY_DAILY_EXPENSE_VALUES.fuelInvoiceAmount,
      fuelDetail:
        existing?.fuelDetail ?? EMPTY_DAILY_EXPENSE_VALUES.fuelDetail,
      otherAmount:
        existing?.otherAmount ?? EMPTY_DAILY_EXPENSE_VALUES.otherAmount,
      otherDetail:
        existing?.otherDetail ?? EMPTY_DAILY_EXPENSE_VALUES.otherDetail,
      eveningHotelKm:
        existing?.eveningHotelKm ?? EMPTY_DAILY_EXPENSE_VALUES.eveningHotelKm,
    };
  });
}
