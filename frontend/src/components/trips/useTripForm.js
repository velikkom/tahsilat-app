import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  applyDailyExpenseChange,
  applyDateChange,
  applyFieldChange,
} from "@/components/trips/tripFormHandlers";
import { runTripFormSubmit } from "@/components/trips/tripFormSubmit";
import { toFormState } from "@/components/trips/tripFormUtils";
import { MAX_TRIP_DAYS } from "@/utils/tripUtils";

export default function useTripForm({ mode = "create", trip = null }) {
  const router = useRouter();
  const isEditMode = mode === "edit";
  const [form, setForm] = useState(() => toFormState(trip));
  const [validated, setValidated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submitLockRef = useRef(false);

  useEffect(() => {
    if (trip) {
      setForm(toFormState(trip));
    }
  }, [trip?.id]);

  const dayCount = form.dailyExpenses.length;
  const rangeTooLong = dayCount > MAX_TRIP_DAYS;

  async function handleSubmit(e) {
    await runTripFormSubmit({
      event: e,
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
    });
  }

  return {
    form,
    validated,
    submitting,
    dayCount,
    rangeTooLong,
    handleFieldChange: (e) => applyFieldChange(setForm, e),
    handleDateChange: (e) => applyDateChange(setForm, e),
    handleDailyExpenseChange: (expenseDate, field, value) =>
      applyDailyExpenseChange(setForm, expenseDate, field, value),
    handleSubmit,
    router,
  };
}
