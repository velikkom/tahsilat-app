ALTER TABLE collections
    ADD COLUMN receipt_number VARCHAR(50);

ALTER TABLE collections
    ADD COLUMN mikro_sr VARCHAR(20);

ALTER TABLE collections
    ADD COLUMN mikro_no VARCHAR(20);

ALTER TABLE collections
    ADD COLUMN bank_name VARCHAR(100);
