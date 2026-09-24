import { useEffect, useState } from "react";

import runDokumuDownload from "@/components/trips/runDokumuDownload";
import runDokumuShare from "@/components/trips/runDokumuShare";
import { getTripTahsilatDokumuFile } from "@/services/tripService";

export default function useTripDokumuShareActions(tripId, preview) {
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareFile, setShareFile] = useState(null);

  useEffect(() => {
    if (!tripId || !preview) {
      return undefined;
    }

    let cancelled = false;

    getTripTahsilatDokumuFile(tripId)
      .then((file) => {
        if (!cancelled) {
          setShareFile(file);
        }
      })
      .catch((prefetchError) => {
        console.error(prefetchError);
      });

    return () => {
      cancelled = true;
    };
  }, [tripId, preview]);

  return {
    downloading,
    sharing,
    handleDownload: () =>
      runDokumuDownload({ tripId, downloading, setDownloading }),
    handleShare: () =>
      runDokumuShare({
        tripId,
        preview,
        shareFile,
        sharing,
        setSharing,
      }),
  };
}
