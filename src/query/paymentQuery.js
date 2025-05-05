import { db } from "../database/db.js";
import { payments } from "../database/schema.js";
import { and, eq } from "drizzle-orm";

export async function getPendingPayment(orderId) {
  const result = await db
    .select()
    .from(payments)
    .where(and(eq(payments.orderId, orderId), eq(payments.status, 'pending')))
    .execute();
  return result.length > 0 ? result[0] : null;
}

export async function updatePaymentToPaid(orderId) {
  return db
    .update(payments)
    .set({status: 'paid'})
    .where(and(eq(payments.orderId, orderId), eq(payments.status, 'pending')))
    .execute();
}

export async function createPayment(amount, orderId) {
  const result = await db
    .insert(payments)
    .values({
      amount, orderId, status: 'paid'
    })
    .returning()
    .execute();
  return result[0];
}

export async function isOrderAlreadyPaid(orderId) {
  const result = await db
    .select()
    .from(payments)
    .where(and(eq(payments.orderId, orderId), eq(payments.status, 'paid')))
    .execute();
  return result.length > 0;
}