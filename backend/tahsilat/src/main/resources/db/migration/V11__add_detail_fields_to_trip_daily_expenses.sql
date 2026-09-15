ALTER TABLE trip_daily_expenses
    ADD COLUMN hotel_detail VARCHAR(200);

ALTER TABLE trip_daily_expenses
    ADD COLUMN fuel_detail VARCHAR(200);

ALTER TABLE trip_daily_expenses
    ADD COLUMN other_detail VARCHAR(200);
