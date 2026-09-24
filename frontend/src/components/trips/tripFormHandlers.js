import {
  buildDateRange,
  mergeDailyExpensesForRange,
} from "@/utils/tripUtils";

export function applyFieldChange(setForm, e) {
  const { name, value } = e.target;
  setForm((prev) => ({ ...prev, [name]: value }));
}

export function applyDateChange(setForm, e) {
  const { name, value } = e.target;
  setForm((prev) => {
    const next = { ...prev, [name]: value };
    next.dailyExpenses = mergeDailyExpensesForRange(
      buildDateRange(next.startDate, next.endDate),
      prev.dailyExpenses
    );
    return next;
  });
}

export function applyDailyExpenseChange(setForm, expenseDate, field, value) {
  setForm((prev) => ({
    ...prev,
    dailyExpenses: prev.dailyExpenses.map((row) =>
      row.expenseDate === expenseDate ? { ...row, [field]: value } : row
    ),
  }));
}
