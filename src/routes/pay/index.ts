import { checkout, checkoutStripe, getInvoice } from "controllers/pay";
import { Router } from "express";
import { validateToken } from "middleware/validate";

const router = Router();

const isUser = [validateToken];

// pay routes
router.post("/get_invoice", isUser, getInvoice);
router.post("/", isUser, checkout);
router.post("/stripe", isUser, checkoutStripe);

export default router;
