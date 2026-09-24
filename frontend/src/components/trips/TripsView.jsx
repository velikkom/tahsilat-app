"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import ImportTripModal from "@/components/trips/ImportTripModal";
import TripsFilterForm from "@/components/trips/TripsFilterForm";
import TripsListBody from "@/components/trips/TripsListBody";
import TripsViewHeader from "@/components/trips/TripsViewHeader";
import useTripDateFilters from "@/components/trips/useTripDateFilters";
import useTripDelete from "@/components/trips/useTripDelete";
import FloatingAddButton from "@/components/ui/FloatingAddButton";
import useTrips from "@/hooks/useTrips";

export default function TripsView() {
  const router = useRouter();
  const filters = useTripDateFilters();
  const { trips, loading, refresh } = useTrips(filters.appliedFilters);
  const { isBusy, deletingId, handleDelete } = useTripDelete(refresh);
  const [showImportModal, setShowImportModal] = useState(false);

  return (
    <div className="trips-page ui-page-with-fab">
      <TripsViewHeader onOpenImport={() => setShowImportModal(true)} />
      <TripsFilterForm
        draftFilters={filters.draftFilters}
        isRangeInvalid={filters.isRangeInvalid}
        onFieldChange={filters.handleFilterFieldChange}
        onApply={filters.handleApplyFilters}
        onClear={filters.handleClearFilters}
      />
      <TripsListBody
        loading={loading}
        hasTrips={trips.length > 0}
        appliedFilters={filters.appliedFilters}
        trips={trips}
        onDelete={handleDelete}
        isBusy={isBusy}
        deletingId={deletingId}
      />
      <FloatingAddButton
        onClick={() => router.push("/trips/new")}
        ariaLabel="Yeni tur ekle"
      />
      <ImportTripModal
        show={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImported={async (result) => {
          if (result?.importedRows > 0) {
            await refresh();
          }
        }}
      />
    </div>
  );
}
