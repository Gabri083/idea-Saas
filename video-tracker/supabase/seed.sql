-- Sample data to try out the dashboard. Optional — run after schema.sql.

insert into editors (id, name, email, rate_per_video, payment_method) values
  ('11111111-1111-1111-1111-111111111111', 'Camila Torres', 'camila@example.com', 15.00, 'Transferencia'),
  ('22222222-2222-2222-2222-222222222222', 'Diego Fernandez', 'diego@example.com', 18.00, 'PayPal'),
  ('33333333-3333-3333-3333-333333333333', 'Valentina Ruiz', 'valentina@example.com', 15.00, 'Transferencia')
on conflict (id) do nothing;

insert into videos (reference, client_name, platform, status, editor_id, price, payment_status, due_date) values
  ('Reel #001', 'Cliente A', 'instagram', 'publicado', '11111111-1111-1111-1111-111111111111', 15.00, 'pagado', current_date - 20),
  ('Reel #002', 'Cliente A', 'instagram', 'publicado', '11111111-1111-1111-1111-111111111111', 15.00, 'pagado', current_date - 18),
  ('Reel #003', 'Cliente B', 'tiktok', 'aprobado', '22222222-2222-2222-2222-222222222222', 18.00, 'pendiente', current_date - 5),
  ('Reel #004', 'Cliente B', 'tiktok', 'en_revision', '22222222-2222-2222-2222-222222222222', 18.00, 'no_pagado', current_date - 2),
  ('Reel #005', 'Cliente C', 'youtube', 'en_edicion', '33333333-3333-3333-3333-333333333333', 15.00, 'no_pagado', current_date + 2),
  ('Reel #006', 'Cliente C', 'instagram', 'pendiente', null, null, 'no_pagado', current_date + 5);
