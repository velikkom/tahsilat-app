-- Hibernate ddl-auto leftovers (CHECK / native ENUM) still reject MAIL_ORDER
-- after V10 collapsed MAIL_ORDER_KARLAND / MAIL_ORDER_OTOKOC. Drop those
-- constraints and store payment_type as VARCHAR(50), matching V3.

DO $$
DECLARE
    constraint_name text;
BEGIN
    FOR constraint_name IN
        SELECT con.conname
        FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
        WHERE nsp.nspname = current_schema()
          AND rel.relname = 'collections'
          AND con.contype = 'c'
          AND pg_get_constraintdef(con.oid) ILIKE '%payment_type%'
    LOOP
        EXECUTE format('ALTER TABLE collections DROP CONSTRAINT %I', constraint_name);
    END LOOP;
END
$$;

ALTER TABLE collections
    ALTER COLUMN payment_type TYPE VARCHAR(50)
    USING payment_type::text;
