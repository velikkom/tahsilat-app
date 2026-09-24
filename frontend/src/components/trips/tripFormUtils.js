import {
  buildDateRange,
  mergeDailyExpensesForRange,
} from "@/utils/tripUtils";

function todayIso() {
  return new Date().toISOString().split("T")[0];
}

export function toFormState(trip) {
  const startDate = trip?.startDate || todayIso();
  const endDate = trip?.endDate || startDate;
  const days = buildDateRange(startDate, endDate);

  return {
    startDate,
    endDate,
    vehiclePlate: trip?.vehiclePlate || "",
    denizliExitKm: trip?.denizliExitKm ?? "",
    denizliEntryKm: trip?.denizliEntryKm ?? "",
    exitFuelAmount: trip?.exitFuelAmount ?? "",
    tripFuelAmount: trip?.tripFuelAmount ?? "",
    weeklyAllowance: trip?.weeklyAllowance ?? "",
    commissionExcludedAmount: trip?.commissionExcludedAmount ?? "",
    commissionReceived: trip?.commissionReceived ?? "",
    extraReceived: trip?.extraReceived ?? "",
    agiReceived: trip?.agiReceived ?? "",
    receiverName: trip?.receiverName || "",
    dailyExpenses: mergeDailyExpensesForRange(days, trip?.dailyExpenses),
  };
}

export function toNumberOrNull(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export function buildTripPayload(form) {
  return {
    startDate: form.startDate,
    endDate: form.endDate,
    vehiclePlate: form.vehiclePlate || null,
    denizliExitKm: toNumberOrNull(form.denizliExitKm),
    denizliEntryKm: toNumberOrNull(form.denizliEntryKm),
    exitFuelAmount: toNumberOrNull(form.exitFuelAmount),
    tripFuelAmount: toNumberOrNull(form.tripFuelAmount),
    weeklyAllowance: toNumberOrNull(form.weeklyAllowance),
    commissionExcludedAmount: toNumberOrNull(form.commissionExcludedAmount),
    commissionReceived: toNumberOrNull(form.commissionReceived),
    extraReceived: toNumberOrNull(form.extraReceived),
    agiReceived: toNumberOrNull(form.agiReceived),
    receiverName: form.receiverName || null,
    dailyExpenses: form.dailyExpenses.map((row) => ({
      expenseDate: row.expenseDate,
      mealAmount: toNumberOrNull(row.mealAmount),
      hotelAmount: toNumberOrNull(row.hotelAmount),
      hotelDetail: row.hotelDetail || null,
      fuelInvoiceAmount: toNumberOrNull(row.fuelInvoiceAmount),
      fuelDetail: row.fuelDetail || null,
      otherAmount: toNumberOrNull(row.otherAmount),
      otherDetail: row.otherDetail || null,
      eveningHotelKm: toNumberOrNull(row.eveningHotelKm),
    })),
  };
}
