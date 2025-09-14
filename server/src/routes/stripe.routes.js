import { Router } from "express";
import { isAuthenticated } from "../middleware/authentication.middleware.js";
import { postConfirmPayment } from "../controllers/stripe.controllers.js";

const router = Router();

router.post("/confirm", isAuthenticated, postConfirmPayment);

export default router;
