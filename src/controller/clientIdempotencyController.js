import { idempotencyKeys, payments } from "../database/schema.js";
import { and, eq } from "drizzle-orm";
import { db } from "../database/db.js";

export const clientBasedPayment = async (req, res) => {
  try {
    // Validate idempotency key
    const idempotencyKey = req.get('Idempotency-Key');
    console.log(idempotencyKey);

    if (!idempotencyKey) {
      return res.status(400).json({
        message: 'Idempotency key is required in the header'
      });
    }

    // Validate request body
    const {amount, orderId} = req.body;
    if (!amount || !orderId) {
      return res.status(400).json({
        message: 'Amount and orderId are required'
      });
    }

    // Check for idempotency key reuse
    const existingKey = await checkIdempotencyKey(idempotencyKey);
    if (existingKey) {
      return res.status(409).json({
        message: 'Payment is being processed. Please check again later'
      });
    }

    // Check if order is already paid
    const isPaid = await isOrderAlreadyPaid(orderId);
    if (isPaid) {
      return res.status(409).json({
        message: 'Payment for this order already paid'
      });
    }

    // Store idempotency key to prevent duplicate processing
    await storeIdempotencyKey(idempotencyKey);

    // TODO: Process the actual payment with a payment provider
    // TODO: Update payment status based on payment provider response

    // Check for pending payment and update if found
    const pendingPayment = await getPendingPayment(orderId);
    if (pendingPayment) {
      await updatePaymentToPaid(orderId);
      return res.status(200).json({
        message: 'Payment already exists, updated to paid', payment: pendingPayment
      });
    }

    // Create new payment record
    const newPayment = await createPayment(amount, orderId);
    return res.status(201).json({
      message: 'Payment created successfully', payment: newPayment
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    return res.status(500).json({
      message: 'Failed to process payment', error: error.message
    });
  }
}

// Helper functions for database operations
async function checkIdempotencyKey(key) {
  const result = await db
    .select()
    .from(idempotencyKeys)
    .where(eq(idempotencyKeys.key, key))
    .execute();
  return result.length > 0 ? result[0] : null;
}

async function isOrderAlreadyPaid(orderId) {
  const result = await db
    .select()
    .from(payments)
    .where(and(eq(payments.orderId, orderId), eq(payments.status, 'paid')))
    .execute();
  return result.length > 0;
}

async function storeIdempotencyKey(key) {
  return db
    .insert(idempotencyKeys)
    .values({key})
    .execute();
}

async function getPendingPayment(orderId) {
  const result = await db
    .select()
    .from(payments)
    .where(and(eq(payments.orderId, orderId), eq(payments.status, 'pending')))
    .execute();
  return result.length > 0 ? result[0] : null;
}

async function updatePaymentToPaid(orderId) {
  return db
    .update(payments)
    .set({status: 'paid'})
    .where(and(eq(payments.orderId, orderId), eq(payments.status, 'pending')))
    .execute();
}

async function createPayment(amount, orderId) {
  const result = await db
    .insert(payments)
    .values({
      amount, orderId, status: 'paid'
    })
    .returning()
    .execute();
  return result[0];
}