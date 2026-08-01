# Veris — Reputación Justa y Reseñas Asistidas por IA

SaaS para e-commerce (Shopify, WooCommerce, marcas independientes) que deja
que el cliente escriba su reseña sin censura, mientras una IA analiza el
texto de forma imparcial y calcula una calificación en estrellas (1–5)
alineada con los hechos, no con el tono emocional.

## Módulos incluidos

1. **Landing page** (`/`) — hero, problema vs. solución, cómo funciona,
   calculadora de impacto interactiva y precios.
2. **Formulario público de reseña** (`/review/[businessId]`, probar en
   `/review/demo`) — el cliente escribe libremente y ve al instante su
   Puntaje Objetivo IA con desglose por categoría.
3. **Dashboard del negocio** (`/dashboard`) — métricas (Promedio IA vs.
   Cliente), tablero de reseñas, Consultor IA de Mejora Operativa (fallas
   recurrentes con temporizador de 30 días), Gestor de Apelaciones y Centro
   de Calibración e Histórico.
4. **Generador de widget embebible** (`/dashboard/widget`) — configura
   colores, modo claro/oscuro, bordes y diseño; copia el `<script>` para tu
   tienda. `public/widget.js` es el script real que se embebe.

## Motor de IA (`POST /api/reviews`)

1. Envía el texto de la reseña a OpenAI (`gpt-4o-mini` por defecto, JSON
   mode) y obtiene `product_score`, `service_score`, `delivery_score` y
   `detected_issues`.
2. Calcula el puntaje ponderado: 40% producto + 30% atención + 30% envíos.
3. Si algún problema detectado coincide con una fila de `recurring_issues`
   que lleva más de 30 días abierta, resta su `penalty_factor` (inacción
   operativa) antes de publicar la nota final.

## Cómo correrlo

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). **Sin configurar nada**,
el dashboard y el formulario de reseña ya funcionan en **modo demo**: los
datos vienen de `src/lib/mock-data.ts` (verás un badge "Modo demo" en el
dashboard). Esto te deja explorar toda la interfaz de inmediato.

## Conectar los servicios reales

Copia `.env.example` a `.env.local` y completa:

```bash
cp .env.example .env.local
```

- **Supabase**: crea un proyecto en [supabase.com](https://supabase.com),
  copia la URL y las llaves (`anon` y `service_role`) desde
  Project Settings → API. Luego corre `supabase/schema.sql` en el SQL
  Editor del proyecto (crea las tablas y las políticas de RLS) y, si
  quieres los mismos datos de ejemplo que ves en modo demo,
  `supabase/seed.sql` a continuación.
- **OpenAI**: genera una API key en
  [platform.openai.com](https://platform.openai.com/api-keys).

Con las variables presentes, `/api/reviews` empieza a analizar reseñas de
verdad con OpenAI y todo el dashboard lee y escribe en Supabase en lugar de
los datos de ejemplo.

## Estructura del proyecto

```
src/
  app/                    rutas (App Router): landing, /review, /dashboard, /api
  components/
    landing/              secciones de la landing page
    review/                formulario público + tarjeta de puntaje IA
    dashboard/             sidebar, métricas, tablero de reseñas, consultor,
                           apelaciones, calibración, configurador de widget
    ui/                    botón, tarjeta, badge, estrellas (primitivas)
  lib/
    ai/                    scoring.ts (OpenAI) y recurring-issues.ts (penalización)
    supabase/               clientes browser / server / admin (service role)
    data.ts                 lecturas con fallback automático a datos demo
    mock-data.ts            datos de ejemplo (espejo de supabase/seed.sql)
supabase/
  schema.sql                tablas + RLS
  seed.sql                  datos de ejemplo para un proyecto Supabase real
public/
  widget.js                 script embebible que consume /api/widget/[businessId]
```

## Qué falta para producción

Este proyecto entrega los 4 módulos funcionales sobre datos demo + el motor
de IA real. Antes de lanzarlo con clientes reales todavía falta:

- Autenticación real de dueños de tienda (Supabase Auth) — hoy el dashboard
  siempre muestra el negocio demo fijo.
- Cobro/planes (Stripe) para Starter/Growth/Enterprise.
- Subida real de evidencia de apelaciones a Supabase Storage (el input de
  archivos hoy solo registra los nombres).
- Revisión/aprobación de apelaciones y solicitudes de calibración desde el
  lado de la plataforma (hoy quedan en estado "pendiente").
