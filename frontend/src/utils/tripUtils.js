export { buildDateRange } from "./tripDates";
export { mergeDailyExpensesForRange } from "./tripDailyExpenses";

export const MAX_TRIP_DAYS = 14;

export const DAILY_EXPENSE_FIELDS = [
  { key: "mealAmount", label: "Yemek", step: "0.01" },
  { key: "hotelAmount", label: "Otel", step: "0.01" },
  { key: "hotelDetail", label: "Otel İsmi / Fatura No", inputType: "text" },
  { key: "fuelInvoiceAmount", label: "Yakıt Faturaları", step: "0.01" },
  { key: "fuelDetail", label: "Yakıt Alınan Firma / Fatura No", inputType: "text" },
  { key: "otherAmount", label: "Diğer", step: "0.01" },
  { key: "otherDetail", label: "Diğer Firma / Açıklama", inputType: "text" },
  { key: "eveningHotelKm", label: "Akşam Otele Giriş KM", step: "1" },
];
