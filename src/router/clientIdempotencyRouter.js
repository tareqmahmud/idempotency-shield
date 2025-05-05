import { Router } from "express";
import { clientBasedPayment } from "../controller/clientIdempotencyController.js";

const router = Router();

router.post('/client-payment', clientBasedPayment);

export default router;