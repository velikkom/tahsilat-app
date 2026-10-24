import {
  ON_DAY_CAPACITY,
  addDaysIso,
  dayTotal,
  toNumber,
} from "@/utils/tripDokumuFormat";

function emptyExcluded() {
  return {
    cash: 0,
    senet: 0,
    cek: 0,
    mailOrder: 0,
    posYkb: 0,
    posTeb: 0,
    havale: 0,
  };
}

function sumParts(parts) {
  return (
    parts.cash +
    parts.senet +
    parts.cek +
    parts.mailOrder +
    parts.posYkb +
    parts.posTeb +
    parts.havale
  );
}

function fromByType(byType) {
  return {
    cash: toNumber(byType.cash),
    senet: toNumber(byType.promissoryNote),
    cek: toNumber(byType.check),
    mailOrder: toNumber(byType.mailOrder),
    posYkb: toNumber(byType.posYkb),
    posTeb: toNumber(byType.posTeb),
    havale: toNumber(byType.bankTransfer),
  };
}

function sumFlaggedRows(rows = []) {
  const totals = emptyExcluded();

  for (const row of rows) {
    if (!row?.excludeFromCommission) {
      continue;
    }

    if (row.nakitTutari != null) {
      totals.cash += toNumber(row.nakitTutari);
    } else if (row.senetTutar != null) {
      totals.senet += toNumber(row.senetTutar);
    } else if (row.cekTutar != null) {
      totals.cek += toNumber(row.cekTutar);
    } else if (row.mailorder != null) {
      totals.mailOrder += toNumber(row.mailorder);
    } else if (row.havaleTutar != null) {
      totals.havale += toNumber(row.havaleTutar);
    } else if (row.posYkb != null) {
      totals.posYkb += toNumber(row.posYkb);
    } else if (row.posTeb != null) {
      totals.posTeb += toNumber(row.posTeb);
    }
  }

  return totals;
}

function excludedAmounts(preview) {
  const fromRows = sumFlaggedRows(preview.collectionRows);
  const rowTotal = sumParts(fromRows);
  const statedTotal = toNumber(preview.commissionExcludedAmount);

  if (rowTotal > 0) {
    const manualOnCash = Math.max(0, statedTotal - rowTotal);

    return {
      ...fromRows,
      cash: fromRows.cash + manualOnCash,
    };
  }

  const byType = preview.commissionExcludedByType;

  if (byType && sumParts(fromByType(byType)) > 0) {
    return fromByType(byType);
  }

  return {
    ...emptyExcluded(),
    cash: statedTotal,
  };
}

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
  const excludedByType = excludedAmounts(preview);
  const excluded =
    excludedByType.cash +
    excludedByType.senet +
    excludedByType.cek +
    excludedByType.mailOrder +
    excludedByType.posYkb +
    excludedByType.posTeb +
    excludedByType.havale;
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
    excludedByType,
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
