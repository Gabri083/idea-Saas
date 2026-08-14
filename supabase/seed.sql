-- Demo data for local development / product demos.
-- Safe to re-run: it upserts a single fixed-id demo business.

insert into businesses (id, name, slug, contact_email, plan, monthly_review_cap, category, business_description)
values (
  '11111111-1111-1111-1111-111111111111',
  'Aurora Studio',
  'aurora-studio',
  'hola@aurorastudio.demo',
  'growth',
  null,
  'moda_calzado',
  'Tienda online de ropa y accesorios de diseño independiente.'
)
on conflict (id) do nothing;

insert into widget_configs (business_id, theme_mode, accent_color, border_radius, font_family, layout, show_breakdown)
values (
  '11111111-1111-1111-1111-111111111111',
  'light',
  '#4f7cff',
  'lg',
  'inter',
  'carousel',
  true
)
on conflict (business_id) do nothing;

insert into recurring_issues (id, business_id, issue_key, issue_label, occurrences, status, penalty_factor, first_detected_at, resolution_deadline)
values
  ('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111',
   'envio_agencia_x', 'Retrasos recurrentes con la agencia de envíos X', 4, 'open', 0.3,
   now() - interval '34 days', now() - interval '4 days'),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111',
   'empaque_dañado', 'Empaques dañados en tránsito', 2, 'acknowledged', 0.3,
   now() - interval '10 days', now() + interval '20 days')
on conflict (business_id, issue_key) do nothing;

insert into reviews (
  id, business_id, customer_name, customer_email, review_text,
  customer_star_rating, product_score, service_score, delivery_score,
  detected_issues, ai_summary, overall_ai_rating, penalty_applied, status, created_at
) values
  ('33333333-3333-3333-3333-333333333331', '11111111-1111-1111-1111-111111111111',
   'Camila R.', 'camila@example.com',
   'El producto en sí es hermoso y de muy buena calidad, superó mis expectativas. Pero el envío tardó 3 días más de lo prometido y nadie me avisó, así que le doy 1 estrella porque llegó tarde para el regalo que necesitaba.',
   1, 5, 4, 2,
   array['demora en envío', 'falta de comunicación de envío'],
   'Producto excelente y atención correcta; la única falla real es el tiempo de entrega.',
   3.8, 0, 'published', now() - interval '2 days'),
  ('33333333-3333-3333-3333-333333333332', '11111111-1111-1111-1111-111111111111',
   'Martín G.', 'martin@example.com',
   'Pésimo, llegó todo roto por dentro de la caja, mal embalado. La atención al cliente sí respondió rápido y me ofreció reposición.',
   1, 2, 5, 4,
   array['packaging roto'],
   'Falla puntual de empaque; el servicio de atención respondió con rapidez y eficacia.',
   3.5, 0, 'in_appeal', now() - interval '6 days'),
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111',
   'Sofía P.', 'sofia@example.com',
   'Todo perfecto, tal cual lo pedí, llegó antes de lo esperado y el equipo de soporte fue muy amable resolviendo mi duda sobre la talla.',
   5, 5, 5, 5,
   array[]::text[],
   'Experiencia sobresaliente en las tres dimensiones evaluadas.',
   5.0, 0, 'published', now() - interval '10 days'),
  ('33333333-3333-3333-3333-333333333334', '11111111-1111-1111-1111-111111111111',
   'Diego F.', 'diego@example.com',
   'De nuevo la agencia de envíos X entregó con retraso, ya es la cuarta vez que veo esta queja en reseñas de esta tienda. El producto en sí está bien.',
   2, 4, 3, 2,
   array['demora en envío', 'agencia de envíos recurrente'],
   'Producto adecuado, pero se confirma un patrón recurrente y no resuelto de retrasos con la misma agencia de envíos.',
   2.7, 0.3, 'published', now() - interval '1 days')
on conflict (id) do nothing;

insert into appeals (review_id, business_id, reason, evidence_urls, status)
values (
  '33333333-3333-3333-3333-333333333332',
  '11111111-1111-1111-1111-111111111111',
  'Tenemos capturas del chat de soporte y la guía de reposición enviada el mismo día; el daño fue responsabilidad del transportista, no del empaque original.',
  array[]::text[],
  'pending'
);
