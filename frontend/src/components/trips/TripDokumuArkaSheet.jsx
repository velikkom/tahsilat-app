import buildTripDokumuArkaModel from "@/components/trips/buildTripDokumuArkaModel";
import TripDokumuArkaBodyRows from "@/components/trips/TripDokumuArkaBodyRows";
import TripDokumuArkaColgroup from "@/components/trips/TripDokumuArkaColgroup";
import TripDokumuArkaHeadRows from "@/components/trips/TripDokumuArkaHeadRows";
import TripDokumuArkaMeta from "@/components/trips/TripDokumuArkaMeta";
import TripDokumuArkaTotalRow from "@/components/trips/TripDokumuArkaTotalRow";

export default function TripDokumuArkaSheet({ preview, pageIndex = 0 }) {
  const model = buildTripDokumuArkaModel(preview, pageIndex);

  return (
    <div className="dokumu-paper dokumu-paper--arka">
      <table className="dokumu-table dokumu-table--arka">
        <TripDokumuArkaColgroup />
        <tbody>
          <TripDokumuArkaMeta preview={preview} />
          <TripDokumuArkaHeadRows />
          <TripDokumuArkaBodyRows lines={model.lines} />
          <TripDokumuArkaTotalRow
            cash={model.cash}
            senet={model.senet}
            cek={model.cek}
            mailOrder={model.mailOrder}
            havale={model.havale}
            posYkb={model.posYkb}
            posTeb={model.posTeb}
          />
        </tbody>
      </table>
    </div>
  );
}
