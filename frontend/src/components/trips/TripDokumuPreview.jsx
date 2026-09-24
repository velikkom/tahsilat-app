"use client";

import TripDokumuArkaSheet from "@/components/trips/TripDokumuArkaSheet";
import TripDokumuOnSheet from "@/components/trips/TripDokumuOnSheet";
import TripDokumuPreviewActions from "@/components/trips/TripDokumuPreviewActions";
import TripDokumuPreviewNav from "@/components/trips/TripDokumuPreviewNav";
import {
  TripDokumuPreviewLoading,
  TripDokumuPreviewMissing,
} from "@/components/trips/TripDokumuPreviewStatus";
import useTripDokumuPreview from "@/components/trips/useTripDokumuPreview";
import useTripDokumuShareActions from "@/components/trips/useTripDokumuShareActions";

export default function TripDokumuPreview() {
  const view = useTripDokumuPreview();
  const share = useTripDokumuShareActions(view.tripId, view.preview);

  if (view.loading) {
    return <TripDokumuPreviewLoading />;
  }

  if (view.error || !view.preview) {
    return <TripDokumuPreviewMissing tripId={view.tripId} />;
  }

  return (
    <div className="trip-print-page">
      <div className="trip-print-page__toolbar">
        <TripDokumuPreviewNav
          side={view.side}
          pageCount={view.pageCount}
          pageIndex={view.pageIndex}
          onShowSide={view.showSide}
          onPageIndexChange={view.setPageIndex}
        />
        <TripDokumuPreviewActions
          tripId={view.tripId}
          sharing={share.sharing}
          downloading={share.downloading}
          onShare={share.handleShare}
          onDownload={share.handleDownload}
        />
      </div>
      {view.side === "on" ? (
        <TripDokumuOnSheet preview={view.preview} pageIndex={view.pageIndex} />
      ) : (
        <TripDokumuArkaSheet preview={view.preview} pageIndex={view.pageIndex} />
      )}
    </div>
  );
}
