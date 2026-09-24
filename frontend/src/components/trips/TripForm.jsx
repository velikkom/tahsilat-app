"use client";

import { Form } from "react-bootstrap";

import TripFormActions from "@/components/trips/TripFormActions";
import TripFormDailyExpenses from "@/components/trips/TripFormDailyExpenses";
import TripFormInfoCard from "@/components/trips/TripFormInfoCard";
import useTripForm from "@/components/trips/useTripForm";

export default function TripForm({ mode = "create", trip = null }) {
  const {
    form,
    validated,
    submitting,
    dayCount,
    rangeTooLong,
    handleFieldChange,
    handleDateChange,
    handleDailyExpenseChange,
    handleSubmit,
    router,
  } = useTripForm({ mode, trip });

  return (
    <Form
      noValidate
      validated={validated}
      onSubmit={handleSubmit}
      className="trip-form d-flex flex-column gap-3 gap-md-4"
    >
      <TripFormInfoCard
        form={form}
        submitting={submitting}
        rangeTooLong={rangeTooLong}
        dayCount={dayCount}
        onDateChange={handleDateChange}
        onFieldChange={handleFieldChange}
      />
      <TripFormDailyExpenses
        dailyExpenses={form.dailyExpenses}
        submitting={submitting}
        onDailyExpenseChange={handleDailyExpenseChange}
      />
      <TripFormActions
        submitting={submitting}
        rangeTooLong={rangeTooLong}
        dayCount={dayCount}
        onCancel={() => router.push("/trips")}
      />
    </Form>
  );
}
