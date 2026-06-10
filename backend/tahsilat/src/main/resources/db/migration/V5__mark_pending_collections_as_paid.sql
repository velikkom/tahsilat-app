-- Bu surumde tum tahsilatlar olusturuldugu anda PAID kabul edilir.
-- Mevcut PENDING kayitlar da ayni kurala cekilir.
UPDATE collections
SET status = 'PAID'
WHERE status = 'PENDING';
