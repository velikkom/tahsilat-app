import Swal from "sweetalert2";

import { createTrip, updateTrip } from "@/services/tripService";
import { buildTripPayload } from "@/components/trips/tripFormUtils";

export async function persistTrip({ isEditMode, tripId, payload }) {
  if (isEditMode) {
    await updateTrip(tripId, payload);
  } else {
    await createTrip(payload);
  }
}

export async function showTripSaveSuccess(isEditMode) {
  await Swal.fire({
    icon: "success",
    title: "Başarılı",
    text: isEditMode ? "Tur güncellendi." : "Tur oluşturuldu.",
    confirmButtonText: "Tamam",
    allowOutsideClick: false,
    allowEscapeKey: false,
  });
}

export async function showTripSaveError(error) {
  console.error(error);

  await Swal.fire({
    icon: "error",
    title: "Hata",
    text: error.message || "Tur kaydedilirken hata oluştu.",
  });
}

export async function runTripFormSubmit({
  event,
  submitting,
  submitLockRef,
  rangeTooLong,
  dayCount,
  setValidated,
  setSubmitting,
  isEditMode,
  trip,
  form,
  router,
}) {
  event.preventDefault();

  if (submitting || submitLockRef.current) {
    return;
  }

  if (!event.currentTarget.checkValidity() || rangeTooLong || dayCount === 0) {
    event.stopPropagation();
    setValidated(true);
    return;
  }

  submitLockRef.current = true;
  setSubmitting(true);

  try {
    await persistTrip({
      isEditMode,
      tripId: trip?.id,
      payload: buildTripPayload(form),
    });
    await showTripSaveSuccess(isEditMode);
    router.push("/trips");
  } catch (error) {
    await showTripSaveError(error);
  } finally {
    submitLockRef.current = false;
    setSubmitting(false);
  }
}
