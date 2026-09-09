CREATE TABLE trips
(

    id UUID PRIMARY KEY,

    salesman_id UUID NOT NULL,

    start_date DATE NOT NULL,

    end_date DATE NOT NULL,

    vehicle_plate VARCHAR(20),

    denizli_exit_km INTEGER,

    denizli_entry_km INTEGER,

    exit_fuel_amount NUMERIC(19,2),

    trip_fuel_amount NUMERIC(19,2),

    weekly_allowance NUMERIC(19,2),

    commission_received NUMERIC(19,2),

    extra_received NUMERIC(19,2),

    agi_received NUMERIC(19,2),

    receiver_name VARCHAR(255),

    active BOOLEAN NOT NULL,

    created_at TIMESTAMP NOT NULL,

    updated_at TIMESTAMP NOT NULL,

    CONSTRAINT fk_trip_salesman
        FOREIGN KEY (salesman_id)
            REFERENCES users(id)
);

CREATE INDEX idx_trips_salesman_id
    ON trips (salesman_id);

CREATE TABLE trip_daily_expenses
(

    id UUID PRIMARY KEY,

    trip_id UUID NOT NULL,

    expense_date DATE NOT NULL,

    meal_amount NUMERIC(19,2),

    hotel_amount NUMERIC(19,2),

    fuel_invoice_amount NUMERIC(19,2),

    other_amount NUMERIC(19,2),

    evening_hotel_km INTEGER,

    CONSTRAINT fk_trip_daily_expense_trip
        FOREIGN KEY (trip_id)
            REFERENCES trips(id),

    CONSTRAINT uq_trip_daily_expense_trip_date
        UNIQUE (trip_id, expense_date)
);

CREATE INDEX idx_trip_daily_expenses_trip_id
    ON trip_daily_expenses (trip_id);
