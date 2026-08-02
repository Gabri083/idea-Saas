import { z } from "zod";

/**
 * Postgres' uuid type accepts any properly-shaped 8-4-4-4-12 hex string,
 * regardless of RFC4122 version/variant nibbles. zod's built-in `.uuid()` is
 * stricter than that (it rejects our own fixed demo id), so validate against
 * the same shape Postgres actually accepts instead.
 */
export const uuidSchema = z
  .string()
  .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, "ID inválido");
