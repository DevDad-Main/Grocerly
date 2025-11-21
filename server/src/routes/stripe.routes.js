import express, { Router } from "express";
import { isAuthenticated } from "../middleware/authentication.middleware.js";
import {
  postConfirmPayment,
  stripePaymentWebhookHandler,
} from "../controllers/stripe.controllers.js";

const router = Router();

router.post("/confirm", isAuthenticated, postConfirmPayment);
router.post(
  "/payment",
  express.raw({ type: "application/json" }),
  stripePaymentWebhookHandler,
);

export default router;
