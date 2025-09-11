import { Router } from "express";
import {
  placeOrderWithCOD,
  getUserOrders,
  getAllOrders,
  placeOrderWithStripe,
} from "../controllers/order.controllers.js";
import { isAuthenticated } from "../middleware/authentication.middleware.js";

const router = Router();

router.get("/orders", isAuthenticated, getUserOrders);
router.get("/admin", isAuthenticated, getAllOrders);
router.post("/place-order", isAuthenticated, placeOrderWithCOD);
router.post("/place-stripe", isAuthenticated, placeOrderWithStripe);

export default router;
