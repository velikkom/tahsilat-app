import {
  ON_DAY_CAPACITY,
  addDaysIso,
  dayTotal,
  toNumber,
} from "@/utils/tripDokumuFormat";

function expenseByDate(dailyExpenses = []) {
  const map = new Map();

  for (const expense of dailyExpenses) {
    map.set(expense.expenseDate, expense);
  }

  return map;
}

export default function buildTripDokumuOnModel(preview, pageIndex = 0) {
  const totals = preview.collectionTotals || {};
  const expenses = expenseByDate(preview.dailyExpenses);
  const pageIsPrimary = pageIndex === 0;
  const dayDates = Array.from({ length: ON_DAY_CAPACITY }, (_, index) =>
    addDaysIso(preview.startDate, pageIndex * ON_DAY_CAPACITY + index)
  );
  const days = dayDates.map((date) => expenses.get(date) || { expenseDate: date });
  const mealTotal = days.reduce((sum, day) => sum + toNumber(day.mealAmount), 0);
  const hotelTotal = days.reduce((sum, day) => sum + toNumber(day.hotelAmount), 0);
  const fuelTotal = days.reduce((sum, day) => sum + toNumber(day.fuelInvoiceAmount), 0);
  const otherTotal = days.reduce((sum, day) => sum + toNumber(day.otherAmount), 0);
  const pageExpenseTotal = days.reduce((sum, day) => sum + dayTotal(day), 0);
  const cash = toNumber(totals.cash);
  const senet = toNumber(totals.promissoryNote);
  const cek = toNumber(totals.check);
  const mailOrder = toNumber(totals.mailOrder);
  const posYkb = toNumber(totals.posYkb);
  const posTeb = toNumber(totals.posTeb);
  const havale = toNumber(totals.bankTransfer);
  const genelToplam = cash + senet + cek + mailOrder + posYkb + posTeb + havale;
  const excluded = toNumber(preview.commissionExcludedAmount);
  const primMatrah = Math.round(((genelToplam - excluded) / 1.2) * 100) / 100;
  const prim = Math.round(primMatrah * 0.01 * 100) / 100;
  const masraf = toNumber(preview.expenseTotal);
  const kalanNakit =
    cash -
    masraf -
    toNumber(preview.weeklyAllowance) -
    prim -
    toNumber(preview.extraReceived) -
    toNumber(preview.agiReceived);

  return {
    pageIsPrimary,
    dayDates,
    days,
    mealTotal,
    hotelTotal,
    fuelTotal,
    otherTotal,
    pageExpenseTotal,
    cash,
    senet,
    cek,
    mailOrder,
    posYkb,
    posTeb,
    havale,
    genelToplam,
    primMatrah,
    prim,
    masraf,
    kalanNakit,
    cekAdet: (preview.collectionRows || []).filter((row) => row.cekTutar != null)
      .length,
    senetAdet: (preview.collectionRows || []).filter(
      (row) => row.senetTutar != null
    ).length,
  };
}
