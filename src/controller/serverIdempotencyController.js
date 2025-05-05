import { v4 as uuid } from "uuid";
import { checkIdempotencyKey, storeIdempotencyKey } from "../query/idempotencyQuery.js";
import { createPayment, getPendingPayment, isOrderAlreadyPaid, updatePaymentToPaid } from "../query/paymentQuery.js";

export const getNewIdempotencyKey = async (req, res) => {
  try {
    // At first generate a new idempotency key
    const newIdempotencyKey = uuid();

    // Insert the new idempotency key into the database
    await storeIdempotencyKey(newIdempotencyKey);

    // Return the new idempotency key to the client
    res.status(201).json(newIdempotencyKey);
  } catch (error) {
    console.log('Error generating new idempotency key:', error);
    res.status(500).json({
      message: 'Error generating new idempotency key', error: error.message
    });
  }
}

export const serverBasedPayment = async (req, res) => {
  try {
    // Validate idempotency key
    const idempotencyKey = req.get('Idempotency-Key');

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
    // ? This is the main difference between client and server idempotency
    const keyExists = await checkIdempotencyKey(idempotencyKey);
    if (!keyExists) {
      return res.status(409).json({
        message: 'Sorry idempotency key is not valid. Please generate a new one'
      });
    }

    // Check if order is already paid
    const isPaid = await isOrderAlreadyPaid(orderId);
    if (isPaid) {
      return res.status(409).json({
        message: 'Payment for this order already paid'
      });
    }

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