# Video Tracker

Panel interno para trackear grandes volúmenes de reels: qué editor está
haciendo cada video, cuáles ya entregó, a quién le tienes que pagar y a
quién ya le pagaste.

Es un proyecto **separado** del resto del repositorio (no comparte código
ni base de datos con Kelsira) — vive en `video-tracker/` con su propio
`package.json`, sus propias dependencias y su propio esquema de Supabase.

## Qué incluye

- **Resumen** (`/dashboard`) — reels creados este mes, cuántos están
  completados, cuánto le debes en total a tus editores y cuánto pagaste
  este mes.
- **Reels** (`/dashboard/videos`) — tabla de todos los reels con filtros
  por editor, estado, estado de pago y mes; búsqueda por referencia o
  cliente. Crear/editar/eliminar reels, cambiar estado y estado de pago
  en línea, y selección múltiple para **marcar varios reels como
  pagados de una sola vez** (agrupa el pago por editor automáticamente).
- **Editores** (`/dashboard/editors`) — alta de editores con su tarifa
  por reel, y por cada uno cuántos reels tiene, cuántos completó, cuánto
  se le debe y cuánto se le ha pagado.
- **Detalle de editor** (`/dashboard/editors/[id]`) — todos los reels de
  ese editor y registro de pagos.

Cada vez que marcas reels como pagados se crea un registro en la tabla
`payments`, así queda un historial de qué se pagó y cuándo.

## Cómo correrlo

```bash
cd video-tracker
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Copia `.env.example` a `.env.local` y completa las llaves desde
   Project Settings → API:

   ```bash
   cp .env.example .env.local
   ```

3. Corre `supabase/schema.sql` en el SQL Editor del proyecto (crea las
   tablas `editors`, `videos`, `payments` y las políticas de RLS). Si
   quieres datos de ejemplo, corre después `supabase/seed.sql`.
4. Crea a los usuarios que van a entrar al panel desde
   **Authentication → Users → Add user** en el dashboard de Supabase
   (este proyecto no tiene registro público; es una herramienta interna).

## Estructura

```
src/
  app/
    login/                página de acceso
    dashboard/             resumen, reels, editores (protegidos por middleware)
  components/
    dashboard/              sidebar, tarjetas de resumen
    videos/                 tabla de reels, filtros, modal de reel, modal de pago
    editors/                lista de editores, modal de editor
    ui/                     botón, input, badge, tarjeta (primitivas)
  lib/
    actions/                server actions: videos.ts, editors.ts, auth.ts
    data.ts                 consultas a Supabase + cálculo de totales
    supabase/               clientes browser / server / middleware
supabase/
  schema.sql                tablas + RLS
  seed.sql                  datos de ejemplo
```

## Modelo de datos

- `editors`: nombre, contacto, tarifa por reel, método de pago.
- `videos`: referencia, cliente, plataforma, editor asignado, estado
  (`pendiente → en_edicion → en_revision → aprobado → publicado`),
  precio (si no se define, se usa la tarifa del editor), estado de pago
  (`no_pagado / pendiente / pagado`), link al video, fecha límite.
- `payments`: un pago hecho a un editor; cada reel pagado queda
  vinculado a su `payment_id`.

## Qué falta para producción

- Registro de usuarios/roles (hoy cualquier usuario autenticado en el
  proyecto de Supabase ve todos los datos — pensado para un solo equipo).
- Notificaciones (recordatorio de fecha límite, aviso al editor cuando
  se le asigna un reel).
- Exportar a CSV/Excel para contabilidad.
