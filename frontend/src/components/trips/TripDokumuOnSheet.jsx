import buildTripDokumuOnModel from "@/components/trips/buildTripDokumuOnModel";
import TripDokumuOnCollectionRows from "@/components/trips/TripDokumuOnCollectionRows";
import TripDokumuOnExpenseRows from "@/components/trips/TripDokumuOnExpenseRows";
import TripDokumuOnHeader from "@/components/trips/TripDokumuOnHeader";
import TripDokumuOnSettlementRows from "@/components/trips/TripDokumuOnSettlementRows";
import TripDokumuOnStaffRow from "@/components/trips/TripDokumuOnStaffRow";

export default function TripDokumuOnSheet({ preview, pageIndex = 0 }) {
  const model = buildTripDokumuOnModel(preview, pageIndex);

  return (
    <div className="dokumu-paper dokumu-paper--on">
      <table className="dokumu-table dokumu-table--on">
        <colgroup>
          <col className="dokumu-col-label" />
          <col span={6} />
          <col className="dokumu-col-total" />
        </colgroup>
        <tbody>
          <TripDokumuOnHeader
            preview={preview}
            pageIsPrimary={model.pageIsPrimary}
          />
          <TripDokumuOnExpenseRows
            dayDates={model.dayDates}
            days={model.days}
            mealTotal={model.mealTotal}
            hotelTotal={model.hotelTotal}
            fuelTotal={model.fuelTotal}
            otherTotal={model.otherTotal}
            pageExpenseTotal={model.pageExpenseTotal}
          />
          <TripDokumuOnStaffRow preview={preview} />
          <TripDokumuOnCollectionRows
            preview={preview}
            cash={model.cash}
            senet={model.senet}
            cek={model.cek}
            mailOrder={model.mailOrder}
            posYkb={model.posYkb}
            posTeb={model.posTeb}
            havale={model.havale}
            masraf={model.masraf}
            prim={model.prim}
            kalanNakit={model.kalanNakit}
          />
          <TripDokumuOnSettlementRows
            genelToplam={model.genelToplam}
            primMatrah={model.primMatrah}
            prim={model.prim}
            kalanNakit={model.kalanNakit}
            cek={model.cek}
            senet={model.senet}
            cekAdet={model.cekAdet}
            senetAdet={model.senetAdet}
          />
        </tbody>
      </table>
    </div>
  );
}
