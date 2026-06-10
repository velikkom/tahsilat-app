-- Bu versiyonda tum tahsilatlar olusturuldugu anda tahsil edilmis kabul edilir.
-- Mevcut PENDING kayitlar PAID'e cekilir.
UPDATE collections
SET status = 'PAID'
WHERE status = 'PENDING';
