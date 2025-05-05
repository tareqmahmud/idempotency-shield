import { Router } from "express";
import { getNewIdempotencyKey, serverBasedPayment } from "../controller/serverIdempotencyController.js";

const router = Router();

router.post('/server-payment', serverBasedPayment);
router.get('/idempotency-key', getNewIdempotencyKey);

export default router;