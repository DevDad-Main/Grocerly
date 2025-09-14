import { Router } from "express";
import { isAuthenticated } from "../middleware/authentication.middleware.js";
import {
  getStripeSession,
  postConfirmPayment,
} from "../controllers/stripe.controllers.js";

const router = Router();

router.get("/session/:sessionId", isAuthenticated, getStripeSession);
router.post("/confirm", isAuthenticated, postConfirmPayment);

export default router;
