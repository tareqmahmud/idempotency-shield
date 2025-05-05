import { db } from "../database/db.js";
import { idempotencyKeys } from "../database/schema.js";
import { eq } from "drizzle-orm";

export async function checkIdempotencyKey(key) {
  const result = await db
    .select()
    .from(idempotencyKeys)
    .where(eq(idempotencyKeys.key, key))
    .execute();
  return result.length > 0 ? result[0] : null;
}

export async function storeIdempotencyKey(key) {
  return db
    .insert(idempotencyKeys)
    .values({key})
    .execute();
}