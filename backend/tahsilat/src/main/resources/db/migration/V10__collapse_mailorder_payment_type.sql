ALTER TABLE collections
    ADD COLUMN mail_order_company VARCHAR(100);

UPDATE collections
    SET mail_order_company = 'Karland'
    WHERE payment_type = 'MAIL_ORDER_KARLAND';

UPDATE collections
    SET mail_order_company = 'Otokoç'
    WHERE payment_type = 'MAIL_ORDER_OTOKOC';

UPDATE collections
    SET payment_type = 'MAIL_ORDER'
    WHERE payment_type IN ('MAIL_ORDER_KARLAND', 'MAIL_ORDER_OTOKOC');
