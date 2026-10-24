ALTER TABLE collections
    ADD COLUMN exclude_from_commission BOOLEAN NOT NULL DEFAULT FALSE;
