"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Col, Form, Row, Spinner, Table } from "react-bootstrap";
import Swal from "sweetalert2";

import { createTrip, updateTrip } from "@/services/tripService";
import { formatDate } from "@/utils/collectionUtils";
import {
  DAILY_EXPENSE_FIELDS,
  MAX_TRIP_DAYS,
  buildDateRange,
  mergeDailyExpensesForRange,
} from "@/utils/tripUtils";

function todayIso() {
  return new Date().toISOString().split("T")[0];
}

function toFormState(trip) {
  const startDate = trip?.startDate || todayIso();
  const endDate = trip?.endDate || startDate;
  const days = buildDateRange(startDate, endDate);

  return {
    startDate,
    endDate,
    vehiclePlate: trip?.vehiclePlate || "",
    denizliExitKm: trip?.denizliExitKm ?? "",
    denizliEntryKm: trip?.denizliEntryKm ?? "",
    exitFuelAmount: trip?.exitFuelAmount ?? "",
    tripFuelAmount: trip?.tripFuelAmount ?? "",
    weeklyAllowance: trip?.weeklyAllowance ?? "",
    commissionReceived: trip?.commissionReceived ?? "",
    extraReceived: trip?.extraReceived ?? "",
    agiReceived: trip?.agiReceived ?? "",
    receiverName: trip?.receiverName || "",
    dailyExpenses: mergeDailyExpensesForRange(days, trip?.dailyExpenses),
  };
}

function toNumberOrNull(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export default function TripForm({ mode = "create", trip = null }) {
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

  function handleFieldChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleDateChange(e) {
    const { name, value } = e.target;

    setForm((prev) => {
      const next = { ...prev, [name]: value };
      const days = buildDateRange(next.startDate, next.endDate);
      next.dailyExpenses = mergeDailyExpensesForRange(
        days,
        prev.dailyExpenses
      );
      return next;
    });
  }

  function handleDailyExpenseChange(expenseDate, field, value) {
    setForm((prev) => ({
      ...prev,
      dailyExpenses: prev.dailyExpenses.map((row) =>
        row.expenseDate === expenseDate ? { ...row, [field]: value } : row
      ),
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (submitting || submitLockRef.current) {
      return;
    }

    const formElement = e.currentTarget;

    if (!formElement.checkValidity() || rangeTooLong || dayCount === 0) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    submitLockRef.current = true;
    setSubmitting(true);

    const payload = {
      startDate: form.startDate,
      endDate: form.endDate,
      vehiclePlate: form.vehiclePlate || null,
      denizliExitKm: toNumberOrNull(form.denizliExitKm),
      denizliEntryKm: toNumberOrNull(form.denizliEntryKm),
      exitFuelAmount: toNumberOrNull(form.exitFuelAmount),
      tripFuelAmount: toNumberOrNull(form.tripFuelAmount),
      weeklyAllowance: toNumberOrNull(form.weeklyAllowance),
      commissionReceived: toNumberOrNull(form.commissionReceived),
      extraReceived: toNumberOrNull(form.extraReceived),
      agiReceived: toNumberOrNull(form.agiReceived),
      receiverName: form.receiverName || null,
      dailyExpenses: form.dailyExpenses.map((row) => ({
        expenseDate: row.expenseDate,
        mealAmount: toNumberOrNull(row.mealAmount),
        hotelAmount: toNumberOrNull(row.hotelAmount),
        fuelInvoiceAmount: toNumberOrNull(row.fuelInvoiceAmount),
        otherAmount: toNumberOrNull(row.otherAmount),
        eveningHotelKm: toNumberOrNull(row.eveningHotelKm),
      })),
    };

    try {
      if (isEditMode) {
        await updateTrip(trip.id, payload);
      } else {
        await createTrip(payload);
      }

      await Swal.fire({
        icon: "success",
        title: "Başarılı",
        text: isEditMode ? "Tur güncellendi." : "Tur oluşturuldu.",
        confirmButtonText: "Tamam",
        allowOutsideClick: false,
        allowEscapeKey: false,
      });

      router.push("/trips");
    } catch (error) {
      console.error(error);

      await Swal.fire({
        icon: "error",
        title: "Hata",
        text: error.message || "Tur kaydedilirken hata oluştu.",
      });
    } finally {
      submitLockRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <Form
      noValidate
      validated={validated}
      onSubmit={handleSubmit}
      className="trip-form d-flex flex-column gap-3 gap-md-4"
    >
      <Card className="border-0 shadow-sm ui-panel-card">
        <Card.Body>
          <h5 className="fw-bold mb-3">Tur Bilgileri</h5>

          <Row className="g-3">
            <Col xs={6} md={3}>
              <Form.Group>
                <Form.Label>Başlangıç Tarihi</Form.Label>
                <Form.Control
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleDateChange}
                  required
                  disabled={submitting}
                />
              </Form.Group>
            </Col>

            <Col xs={6} md={3}>
              <Form.Group>
                <Form.Label>Bitiş Tarihi</Form.Label>
                <Form.Control
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleDateChange}
                  min={form.startDate}
                  required
                  disabled={submitting}
                />
              </Form.Group>
            </Col>

            <Col xs={6} md={3}>
              <Form.Group>
                <Form.Label>Araç Plakası</Form.Label>
                <Form.Control
                  type="text"
                  name="vehiclePlate"
                  value={form.vehiclePlate}
                  onChange={handleFieldChange}
                  disabled={submitting}
                />
              </Form.Group>
            </Col>

            <Col xs={6} md={3}>
              <Form.Group>
                <Form.Label>Teslim Alan</Form.Label>
                <Form.Control
                  type="text"
                  name="receiverName"
                  value={form.receiverName}
                  onChange={handleFieldChange}
                  disabled={submitting}
                />
              </Form.Group>
            </Col>
          </Row>

          {(rangeTooLong || dayCount === 0) && (
            <div className="alert alert-danger mt-3 mb-0">
              {rangeTooLong
                ? `Tur süresi en fazla ${MAX_TRIP_DAYS} gün olabilir. Şu an ${dayCount} gün seçili.`
                : "Bitiş tarihi başlangıç tarihinden önce olamaz."}
            </div>
          )}

          <Row className="g-3 mt-1">
            <Col xs={6} md={3}>
              <Form.Group>
                <Form.Label>Denizli Çıkış KM</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  name="denizliExitKm"
                  value={form.denizliExitKm}
                  onChange={handleFieldChange}
                  disabled={submitting}
                />
              </Form.Group>
            </Col>

            <Col xs={6} md={3}>
              <Form.Group>
                <Form.Label>Denizli Giriş KM</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  name="denizliEntryKm"
                  value={form.denizliEntryKm}
                  onChange={handleFieldChange}
                  disabled={submitting}
                />
              </Form.Group>
            </Col>

            <Col xs={6} md={3}>
              <Form.Group>
                <Form.Label>Çıkış Yakıt Tutarı</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  step="0.01"
                  name="exitFuelAmount"
                  value={form.exitFuelAmount}
                  onChange={handleFieldChange}
                  disabled={submitting}
                />
              </Form.Group>
            </Col>

            <Col xs={6} md={3}>
              <Form.Group>
                <Form.Label>Yol Yakıt Tutarı</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  step="0.01"
                  name="tripFuelAmount"
                  value={form.tripFuelAmount}
                  onChange={handleFieldChange}
                  disabled={submitting}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="g-3 mt-1">
            <Col xs={6} md={3}>
              <Form.Group>
                <Form.Label>Aldığı Haftalık</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  step="0.01"
                  name="weeklyAllowance"
                  value={form.weeklyAllowance}
                  onChange={handleFieldChange}
                  disabled={submitting}
                />
              </Form.Group>
            </Col>

            <Col xs={6} md={3}>
              <Form.Group>
                <Form.Label>Aldığı Prim</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  step="0.01"
                  name="commissionReceived"
                  value={form.commissionReceived}
                  onChange={handleFieldChange}
                  disabled={submitting}
                />
              </Form.Group>
            </Col>

            <Col xs={6} md={3}>
              <Form.Group>
                <Form.Label>Fazladan Alınan</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  step="0.01"
                  name="extraReceived"
                  value={form.extraReceived}
                  onChange={handleFieldChange}
                  disabled={submitting}
                />
              </Form.Group>
            </Col>

            <Col xs={6} md={3}>
              <Form.Group>
                <Form.Label>Aldığı AGİ</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  step="0.01"
                  name="agiReceived"
                  value={form.agiReceived}
                  onChange={handleFieldChange}
                  disabled={submitting}
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm ui-panel-card">
        <Card.Body>
          <h5 className="fw-bold mb-3">Günlük Harcamalar</h5>

          {form.dailyExpenses.length === 0 ? (
            <p className="text-muted mb-0">
              Önce geçerli bir tarih aralığı seçin.
            </p>
          ) : (
            <div className="table-responsive">
              <Table
                bordered
                size="sm"
                className="trip-daily-expense-table align-middle mb-0"
              >
                <thead>
                  <tr>
                    <th style={{ minWidth: 170 }}>Tarih</th>
                    {form.dailyExpenses.map((row) => (
                      <th
                        key={row.expenseDate}
                        className="text-center text-nowrap"
                        style={{ minWidth: 110 }}
                      >
                        {formatDate(row.expenseDate)}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {DAILY_EXPENSE_FIELDS.map((field) => (
                    <tr key={field.key}>
                      <th className="text-nowrap">{field.label}</th>

                      {form.dailyExpenses.map((row) => (
                        <td key={row.expenseDate}>
                          <Form.Control
                            type="number"
                            min="0"
                            step={field.step}
                            value={row[field.key]}
                            onChange={(e) =>
                              handleDailyExpenseChange(
                                row.expenseDate,
                                field.key,
                                e.target.value
                              )
                            }
                            disabled={submitting}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      <div className="d-flex justify-content-end gap-2">
        <Button
          variant="secondary"
          onClick={() => router.push("/trips")}
          disabled={submitting}
        >
          İptal
        </Button>

        <Button
          variant="primary"
          type="submit"
          disabled={submitting || rangeTooLong || dayCount === 0}
        >
          {submitting ? (
            <>
              <Spinner size="sm" className="me-2" />
              Kaydediliyor...
            </>
          ) : (
            "Kaydet"
          )}
        </Button>
      </div>
    </Form>
  );
}
