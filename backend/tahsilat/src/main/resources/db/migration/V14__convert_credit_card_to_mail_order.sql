-- Card collections are Mail Order only. Convert leftover CREDIT_CARD rows
-- in place: row count and amounts stay the same; only payment_type changes.
-- mail_order_company is left as-is (usually null for former CREDIT_CARD rows).

UPDATE collections
SET payment_type = 'MAIL_ORDER'
WHERE payment_type = 'CREDIT_CARD';
