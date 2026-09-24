import TripDokumuOnDateMealRows from "@/components/trips/TripDokumuOnDateMealRows";
import TripDokumuOnDayTotalRows from "@/components/trips/TripDokumuOnDayTotalRows";
import TripDokumuOnSplitExpenseRows from "@/components/trips/TripDokumuOnSplitExpenseRows";

export default function TripDokumuOnExpenseRows({
  dayDates,
  days,
  mealTotal,
  hotelTotal,
  fuelTotal,
  otherTotal,
  pageExpenseTotal,
}) {
  return (
    <>
      <TripDokumuOnDateMealRows
        dayDates={dayDates}
        days={days}
        mealTotal={mealTotal}
      />
      <TripDokumuOnSplitExpenseRows
        labelTop="TUTAR"
        labelBottom="OTEL İSMİ / FATURA NO"
        days={days}
        amountKey="hotelAmount"
        detailKey="hotelDetail"
        amountKeyPrefix="hotel-amt"
        detailKeyPrefix="hotel-det"
        total={hotelTotal}
      />
      <TripDokumuOnSplitExpenseRows
        labelTop="TUTAR"
        labelBottom="AL.FİRMA / FATURA NO"
        days={days}
        amountKey="fuelInvoiceAmount"
        detailKey="fuelDetail"
        amountKeyPrefix="fuel-amt"
        detailKeyPrefix="fuel-det"
        total={fuelTotal}
      />
      <TripDokumuOnSplitExpenseRows
        labelTop="TUTAR"
        labelBottom="FİRMA / AÇIKLAMA"
        days={days}
        amountKey="otherAmount"
        detailKey="otherDetail"
        amountKeyPrefix="other-amt"
        detailKeyPrefix="other-det"
        total={otherTotal}
      />
      <TripDokumuOnDayTotalRows days={days} pageExpenseTotal={pageExpenseTotal} />
    </>
  );
}
