-- Promote studio account to admin (required for /admin/* access).
-- Adjust the email if your admin account is different.

UPDATE public.profiles
SET role = 'admin'
WHERE email IN (
  'produccion.33films@gmail.com',
  'fabriciohernanbs@gmail.com'
);
